import os
from decimal import Decimal
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.db.models import Q, Sum, Avg, Count, Exists, OuterRef, Subquery, F, Value, IntegerField
from .models import (
    Category, Course, Lesson, Enrollment, UserProgress, 
    Review, ContactMessage, Certificate, InstructorWallet, WalletTransaction, WithdrawalRequest, CourseAnnouncement,
    Chapter, Quiz, Question, Choice, QuizAttempt, Notification
)
from .permissions import IsInstructor, IsCourseOwner
from .serializers import (
    CategorySerializer, CourseSerializer, CourseDetailSerializer, ChapterSerializer,
    LessonSerializer, EnrollmentSerializer, UserProgressSerializer, ReviewSerializer, 
    ContactMessageSerializer, QuizSerializer, QuestionSerializer, ChoiceSerializer, NotificationSerializer
)


# ─── Rate Limiter cho QR Verify ─────────────────────────────────
class CertificateVerifyThrottle(AnonRateThrottle):
    """Giới hạn 10 request/phút per IP để chống brute-force UUID."""
    rate = '10/min'


class CertificateVerifyView(APIView):
    """
    Public endpoint: Xác thực chứng chỉ qua UUID từ QR Code.
    GET /api/v1/courses/certificates/verify/<uuid>/
    
    Rate-limited: 10 requests/phút per IP.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [CertificateVerifyThrottle]

    def get(self, request, certificate_uuid):
        try:
            cert = Certificate.objects.select_related(
                'enrollment__user', 'enrollment__course'
            ).get(certificate_id=certificate_uuid)
        except Certificate.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Chứng chỉ không tồn tại hoặc đã bị thu hồi.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = cert.enrollment.user
        course = cert.enrollment.course
        
        return Response({
            'valid': True,
            'certificate_id': str(cert.certificate_id),
            'student_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'course_title': course.title,
            'subject_code': course.subject_code,
            'faculty': course.faculty or 'VNU System',
            'issued_at': cert.issued_at.strftime('%d/%m/%Y'),
        })


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'read'})

class AdminCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(status='pending')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save()
        
        # Gửi thông báo cho giảng viên
        Notification.objects.create(
            user=course.instructor,
            title="Chúc mừng! Khóa học đã được duyệt",
            message=f"Khóa học '{course.title}' của bạn đã được phê duyệt và đang công khai.",
            link=f"/course/{course.id}"
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        course = self.get_object()
        reason = request.data.get('reason', 'Không đạt tiêu chí nội dung.')
        course.status = 'rejected'
        course.rejection_reason = reason
        course.save()
        
        # Gửi thông báo cho giảng viên
        Notification.objects.create(
            user=course.instructor,
            title="Khóa học bị từ chối phê duyệt",
            message=f"Rất tiếc, khóa học '{course.title}' bị từ chối. Lý do: {reason}",
            link=f"/instructor/course/{course.id}/edit"
        )
        return Response({'status': 'rejected'})


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        if course_id:
            return self.queryset.filter(course_id=course_id)
        return self.queryset

    def perform_create(self, serializer):
        # Tự động gán order nếu chưa có
        course_id = self.request.data.get('course')
        if course_id:
            order = Chapter.objects.filter(course_id=course_id).count() + 1
            serializer.save(order=order)
        else:
            serializer.save()

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """Lưu tạm đáp án chưa nộp."""
        quiz = self.get_object()
        answers = request.data.get('answers', [])
        
        attempt, _ = QuizAttempt.objects.update_or_create(
            user=request.user,
            quiz=quiz,
            is_submitted=False,
            defaults={'draft_answers': answers}
        )
        return Response({'message': 'Đã lưu nháp thành công', 'draft_id': attempt.id})

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Chấm điểm bài trắc nghiệm tự động."""
        quiz = self.get_object()
        answers = request.data.get('answers', []) # List of choice IDs
        
        total_questions = quiz.questions.count()
        if total_questions == 0:
            return Response({'error': 'Bài kiểm tra không có câu hỏi.'}, status=400)
            
        correct_count = 0
        results = []
        
        # Kiểm tra từng câu hỏi
        for question in quiz.questions.all():
            correct_choice = question.choices.filter(is_correct=True).first()
            user_choice_id = None
            
            # Kiểm tra xem User có chọn đáp án cho câu này không
            for ans in answers:
                choice = Choice.objects.filter(id=ans, question=question).first()
                if choice:
                    user_choice_id = ans
                    break
            
            is_correct = (user_choice_id == correct_choice.id) if correct_choice else False
            if is_correct:
                correct_count += 1
                
            results.append({
                'question_id': question.id,
                'is_correct': is_correct,
                'correct_choice_id': correct_choice.id if correct_choice else None,
                'user_choice_id': user_choice_id
            })
            
        score_percent = (correct_count / total_questions) * 100
        passed = score_percent >= quiz.passing_score
        
        # Cập nhật hoặc tạo mới bản ghi attempt đã nộp
        attempt_obj = dict(
            score=score_percent,
            passed=passed,
            is_submitted=True,
            draft_answers=answers # Lưu lại snapshot cuối
        )
        # Nếu có bản nháp thì cập nhật nó thành `is_submitted=True`, hoặc tạo mới nếu chưa có
        QuizAttempt.objects.update_or_create(
            user=request.user,
            quiz=quiz,
            is_submitted=False,
            defaults=attempt_obj
        )
        
        return Response({
            'score': score_percent,
            'passed': passed,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'results': results
        })

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

from django.db.models import Count
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import qrcode
from io import BytesIO

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_instructor or self.request.user.is_staff:
            serializer.save(created_by=self.request.user)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ giảng viên hoặc Admin mới có quyền tạo danh mục.")

    def perform_update(self, serializer):
        category = self.get_object()
        if self.request.user.is_staff or category.created_by == self.request.user:
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bạn không có quyền sửa danh mục này.")

    def perform_destroy(self, instance):
        if self.request.user.is_staff or instance.created_by == self.request.user:
            if instance.courses.exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Không thể xóa danh mục đã có khóa học.")
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bạn không có quyền xóa danh mục này.")

    def list(self, request, *args, **kwargs):
        # SQL-level filter: dùng Exists subquery thay vì load toàn bộ data lên Python
        # MS SQL Server xử lý tốt pattern EXISTS (SELECT 1 FROM ...) — không gây lỗi như distinct()
        has_active_courses = Exists(
            Course.objects.filter(category=OuterRef('pk'), is_active=True)
        )
        queryset = self.filter_queryset(
            self.get_queryset().filter(has_active_courses)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True, status='published')
    serializer_class = CourseSerializer

    def get_queryset(self):
        qs = Course.objects.filter(is_active=True, status='published')
        q = self.request.query_params.get('q', '').strip()
        category_id = self.request.query_params.get('category', '')
        ordering_param = self.request.query_params.get('ordering', '')
        
        # --- BỘ LỌC SRS ---
        start_date = self.request.query_params.get('start_date', '')
        end_date = self.request.query_params.get('end_date', '')
        visibility_status = self.request.query_params.get('visibility_status', '')
        
        # --- BỘ LỌC NÂNG CAO (Frontend Advanced Filters) ---
        level = self.request.query_params.get('level', '').strip()
        price_min = self.request.query_params.get('price_min', '').strip()
        price_max = self.request.query_params.get('price_max', '').strip()
        rating_min = self.request.query_params.get('rating_min', '').strip()
        
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        if category_id:
            qs = qs.filter(category_id=category_id)
        if start_date:
            qs = qs.filter(start_date__gte=start_date)
        if end_date:
            qs = qs.filter(end_date__lte=end_date)
        if visibility_status:
            qs = qs.filter(visibility_status__iexact=visibility_status)
        if level:
            qs = qs.filter(level__iexact=level)
        if price_min:
            try: qs = qs.filter(price__gte=float(price_min))
            except ValueError: pass
        if price_max:
            try: qs = qs.filter(price__lte=float(price_max))
            except ValueError: pass
        if rating_min:
            try: qs = qs.filter(rating_avg__gte=float(rating_min))
            except ValueError: pass
            
        if ordering_param:
            qs = qs.order_by(ordering_param)
            
        return qs

    def retrieve(self, request, *args, **kwargs):
        # Trả về chi tiết course kèm lessons nếu user đã enrolled
        instance = self.get_object()
        is_enrolled = False
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(user=request.user, course=instance).exists()
        if is_enrolled:
            serializer = CourseDetailSerializer(instance)
        else:
            serializer = CourseSerializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        """Danh sách khóa học + bằng cấp đã đăng ký."""
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course', 'degree_program')
        result = []
        for e in enrollments:
            if e.course:
                result.append({
                    'id': e.id,
                    'type': 'course',
                    'course': CourseSerializer(e.course).data,
                    'enrolled_at': e.enrolled_at,
                })
            elif e.degree_program:
                result.append({
                    'id': e.id,
                    'type': 'degree',
                    'degree': {
                        'id': e.degree_program.id,
                        'title': e.degree_program.title,
                    },
                    'enrolled_at': e.enrolled_at,
                })
        return Response(result)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join_free(self, request, pk=None):
        """Đăng ký khóa học miễn phí (Bỏ qua giỏ hàng)."""
        course = self.get_object()
        
        if not request.user.is_active:
            return Response({'error': 'Tài khoản của bạn đang bị khóa, không thể đăng ký khóa học.'}, status=status.HTTP_403_FORBIDDEN)
            
        if course.price > 0:
            return Response({'error': 'Khóa học này có phí, vui lòng thanh toán qua giỏ hàng.'}, status=status.HTTP_400_BAD_REQUEST)
            
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if created:
            Notification.objects.create(
                user=request.user,
                title="Đăng ký thành công",
                message=f"Bạn đã đăng ký thành công khóa học miễn phí '{course.title}'.",
                link=f"/learn/{course.id}"
            )
            return Response({'message': 'Đăng ký thành công!'}, status=status.HTTP_201_CREATED)
            
        return Response({'message': 'Bạn đã đăng ký khóa học này rồi.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register_degree(self, request):
        """Đăng ký Bằng cấp (Trial hoặc mua)."""
        degree_id = request.data.get('degree_id')
        try:
            degree = DegreeProgram.objects.get(id=degree_id)
            # Khởi tạo progress_data trống nếu chưa có
            enrollment, created = Enrollment.objects.get_or_create(
                user=request.user, 
                degree_program=degree,
                defaults={'progress_data': {'completed_lessons': []}}
            )
            return Response({'message': f'Đã đăng ký thành công chương trình {degree.title}', 'id': enrollment.id})
        except DegreeProgram.DoesNotExist:
            return Response({'error': 'Không tìm thấy chương trình đào tạo này.'}, status=404)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_degree_progress(self, request):
        """Cập nhật tiến độ của một bài học trong Bằng cấp."""
        degree_id = request.data.get('degree_id')
        lesson_key = request.data.get('lesson_key') # định dạng "module_index-lesson_index"
        is_completed = request.data.get('is_completed', True)
        
        try:
            enrollment = Enrollment.objects.get(user=request.user, degree_program_id=degree_id)
            data = enrollment.progress_data or {'completed_lessons': []}
            completed = set(data.get('completed_lessons', []))
            
            if is_completed:
                completed.add(lesson_key)
            else:
                completed.discard(lesson_key)
                
            data['completed_lessons'] = list(completed)
            enrollment.progress_data = data
            enrollment.save()
            return Response({'success': True, 'completed_count': len(completed)})
        except Enrollment.DoesNotExist:
            return Response({'error': 'Bạn chưa đăng ký chương trình này.'}, status=400)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_schedule(self, request):
        """Lịch học: trả về enrollments (cả Course và Degree) kèm tiến độ."""
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course', 'degree_program')
        result = []
        for e in enrollments:
            if e.course:
                total = Lesson.objects.filter(course=e.course, is_active=True).count()
                completed = UserProgress.objects.filter(
                    user=request.user, lesson__course=e.course, status='completed'
                ).count()
                result.append({
                    'id': e.id,
                    'type': 'course',
                    'course': CourseSerializer(e.course).data,
                    'enrolled_at': e.enrolled_at,
                    'total_lessons': total,
                    'completed_lessons': completed,
                    'percent': round((completed / total * 100) if total > 0 else 0),
                })
            elif e.degree_program:
                curriculum = e.degree_program.curriculum or []
                total_lessons = sum(len(module.get('lessons', [])) for module in curriculum)
                
                # Lấy tiến độ từ progress_data
                prog_data = e.progress_data or {}
                completed_list = prog_data.get('completed_lessons', [])
                completed_count = len(completed_list)
                
                result.append({
                    'id': e.id,
                    'type': 'degree',
                    'degree_id': e.degree_program.id,
                    'course': {
                        'id': f"deg_{e.degree_program.id}",
                        'title': e.degree_program.title,
                        'partner_name': e.degree_program.school,
                        'faculty': e.degree_program.level,
                        'subject_code': e.degree_program.logo,
                    },
                    'enrolled_at': e.enrolled_at,
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_count,
                    'percent': round((completed_count / total_lessons * 100) if total_lessons > 0 else 0),
                    'completed_keys': completed_list # Gửi về để frontend hiển thị checkbox
                })
        return Response(result)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def lessons(self, request, pk=None):
        """Lấy lessons của course — chỉ cho user đã enrolled."""
        course = self.get_object()
        
        # KIỂM TRA THỜI GIAN KHAI GIẢNG THEO SRS
        from django.utils import timezone
        if course.start_date and timezone.now().date() < course.start_date:
            return Response({'error': f'Khóa học này sẽ bắt đầu vào ngày {course.start_date.strftime("%d/%m/%Y")}. Vui lòng quay lại sau.'}, status=status.HTTP_403_FORBIDDEN)

        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({'error': 'Bạn chưa đăng ký khóa học này.'}, status=status.HTTP_403_FORBIDDEN)
        lessons = Lesson.objects.filter(course=course, is_active=True)
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def reviews(self, request, pk=None):
        """Lấy danh sách đánh giá của khóa học."""
        course = self.get_object()
        reviews = Review.objects.filter(course=course).select_related('user').order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_review(self, request, pk=None):
        """Học viên gửi đánh giá — chỉ cho người đã enrolled và chưa review."""
        course = self.get_object()
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({'error': 'Bạn chưa đăng ký khóa học này.'}, status=status.HTTP_403_FORBIDDEN)
        if Review.objects.filter(user=request.user, course=course).exists():
            return Response({'error': 'Bạn đã đánh giá khóa học này rồi.'}, status=status.HTTP_400_BAD_REQUEST)

        rating = request.data.get('rating')
        comment = request.data.get('comment', '').strip()
        if not rating or int(rating) not in range(1, 6):
            return Response({'error': 'Vui lòng chọn điểm từ 1 đến 5.'}, status=status.HTTP_400_BAD_REQUEST)
        if not comment:
            return Response({'error': 'Vui lòng nhập nhận xét.'}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(user=request.user, course=course, rating=int(rating), comment=comment)

        # Cập nhật rating_avg và num_reviews cho Course
        from django.db.models import Avg
        stats = Review.objects.filter(course=course).aggregate(avg=Avg('rating'), cnt=Count('id'))
        course.rating_avg = round(stats['avg'] or 0, 1)
        course.num_reviews = stats['cnt'] or 0
        course.save(update_fields=['rating_avg', 'num_reviews'])

        return Response(ReviewSerializer(review, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def related_courses(self, request, pk=None):
        """Gợi ý khóa học liên quan theo cùng danh mục."""
        course = self.get_object()
        related = Course.objects.filter(
            is_active=True, status='published', category=course.category
        ).exclude(pk=course.pk).order_by('-rating_avg', '-num_reviews')[:6]
        serializer = CourseSerializer(related, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_wishlist(self, request, pk=None):
        """Thêm/xóa khóa học khỏi danh sách yêu thích."""
        from .models import Wishlist
        course = self.get_object()
        obj, created = Wishlist.objects.get_or_create(user=request.user, course=course)
        if not created:
            obj.delete()
            return Response({'wishlisted': False, 'message': 'Đã xóa khỏi yêu thích.'})
        return Response({'wishlisted': True, 'message': 'Đã thêm vào yêu thích.'})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def wishlist_status(self, request, pk=None):
        """Kiểm tra xem khóa học có trong wishlist không."""
        from .models import Wishlist
        course = self.get_object()
        wishlisted = Wishlist.objects.filter(user=request.user, course=course).exists()
        return Response({'wishlisted': wishlisted})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def certificate(self, request, pk=None):
        """Generate premium English-language certificate PDF."""
        import unicodedata, math
        from reportlab.lib.colors import HexColor

        course = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=course)
        except Enrollment.DoesNotExist:
            return Response({"error": "Not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        total = Lesson.objects.filter(course=course, is_active=True).count()
        completed_count = UserProgress.objects.filter(user=request.user, lesson__course=course, status='completed').count()

        if total == 0 or completed_count < total:
            return Response({"error": "Course not yet completed."}, status=status.HTTP_400_BAD_REQUEST)

        cert, _ = Certificate.objects.get_or_create(enrollment=enrollment)

        def to_ascii(text):
            return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('utf-8')

        user = request.user
        student_name  = to_ascii(f"{user.first_name} {user.last_name}".strip() or user.username)
        course_title  = to_ascii(course.title)
        partner       = to_ascii(course.partner_name or 'EduVNU')
        faculty       = to_ascii(course.faculty or 'Vietnam National University')
        issued_date   = cert.issued_at.strftime('%B %d, %Y')
        cert_id_short = str(cert.certificate_id).upper()[:8]
        verify_url    = f"http://localhost:8000/api/v1/courses/certificates/verify/{cert.certificate_id}/"

        # Fonts
        fonts = {'regular': 'Helvetica', 'bold': 'Helvetica-Bold', 'oblique': 'Helvetica-Oblique'}
        for variant, path in [
            ('regular', 'C:/Windows/Fonts/times.ttf'),
            ('bold',    'C:/Windows/Fonts/timesbd.ttf'),
            ('oblique', 'C:/Windows/Fonts/timesi.ttf'),
        ]:
            try:
                if os.path.exists(path):
                    name = f'Times{variant.capitalize()}'
                    pdfmetrics.registerFont(TTFont(name, path))
                    fonts[variant] = name
            except Exception:
                pass

        # Page
        response = HttpResponse(content_type='application/pdf')
        safe_title = to_ascii(course.title).replace(' ', '_')[:40]
        response['Content-Disposition'] = f'attachment; filename="EduVNU_Certificate_{safe_title}.pdf"'
        buffer = BytesIO()
        W, H = landscape(A4)
        c = canvas.Canvas(buffer, pagesize=landscape(A4))

        NAVY    = HexColor('#1A2340')
        GOLD    = HexColor('#C9A84C')
        GOLD_LT = HexColor('#E8D5A3')
        BLUE    = HexColor('#0056D2')
        CREAM   = HexColor('#FDFAF3')
        GRAY    = HexColor('#666666')

        # 1. Cream background
        c.setFillColor(CREAM)
        c.rect(0, 0, W, H, fill=1, stroke=0)

        # 2. Outer navy border
        c.setStrokeColor(NAVY)
        c.setLineWidth(14)
        c.rect(14, 14, W-28, H-28, fill=0, stroke=1)

        # 3. Gold double border
        c.setStrokeColor(GOLD)
        c.setLineWidth(3)
        c.rect(26, 26, W-52, H-52, fill=0, stroke=1)
        c.setLineWidth(1)
        c.rect(31, 31, W-62, H-62, fill=0, stroke=1)

        # 4. Corner diamond ornaments
        def diamond(cx, cy, size=14):
            c.setFillColor(GOLD)
            p = c.beginPath()
            p.moveTo(cx, cy + size)
            p.lineTo(cx + size, cy)
            p.lineTo(cx, cy - size)
            p.lineTo(cx - size, cy)
            p.close()
            c.drawPath(p, fill=1, stroke=0)
        mg = 34
        diamond(mg+6, mg+6); diamond(W-mg-6, mg+6)
        diamond(mg+6, H-mg-6); diamond(W-mg-6, H-mg-6)

        # 5. Diagonal watermark
        c.saveState()
        c.setFillColor(HexColor('#EDE8D8'))
        c.setFont(fonts['bold'], 72)
        c.translate(W/2, H/2)
        c.rotate(30)
        c.drawCentredString(0, 0, 'CERTIFICATE')
        c.restoreState()

        # 6. Navy header band
        c.setFillColor(NAVY)
        c.rect(38, H-100, W-76, 60, fill=1, stroke=0)

        # Logo in band
        logo_path = os.path.normpath(os.path.join(
            os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'eduvn_logo.png'
        ))
        if os.path.exists(logo_path):
            try:
                c.drawImage(ImageReader(logo_path), 55, H-97, width=110, height=54, mask='auto', preserveAspectRatio=True)
            except Exception:
                pass

        c.setFillColor(HexColor('#FFFFFF'))
        c.setFont(fonts['bold'], 11)
        c.drawString(175, H-58, 'EduVNU  |  Online Learning Platform')
        c.setFont(fonts['regular'], 9)
        c.setFillColor(GOLD_LT)
        c.drawRightString(W-55, H-58, 'C O U R S E   C E R T I F I C A T E')

        # Gold divider
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.line(55, H-108, W-55, H-108)

        # 7. Body text
        top = H-130

        c.setFont(fonts['oblique'], 13)
        c.setFillColor(GRAY)
        c.drawCentredString(W/2, top, 'This is to certify that')

        c.setFont(fonts['bold'], 40)
        c.setFillColor(NAVY)
        c.drawCentredString(W/2, top-52, student_name)

        nw = c.stringWidth(student_name, fonts['bold'], 40)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.line(W/2 - nw/2, top-58, W/2 + nw/2, top-58)

        c.setFont(fonts['oblique'], 13)
        c.setFillColor(GRAY)
        c.drawCentredString(W/2, top-82, 'has successfully completed the online course')

        c.setFont(fonts['bold'], 22)
        c.setFillColor(BLUE)
        if len(course_title) > 55:
            mid = course_title[:55].rfind(' ')
            c.drawCentredString(W/2, top-114, course_title[:mid])
            c.drawCentredString(W/2, top-138, course_title[mid+1:])
            title_bot = top-150
        else:
            c.drawCentredString(W/2, top-114, course_title)
            title_bot = top-126

        c.setFont(fonts['oblique'], 11)
        c.setFillColor(GRAY)
        c.drawCentredString(W/2, title_bot-22,
            f'authorized by {partner} and offered through EduVNU — Vietnam National University')

        # 8. Bottom row
        by = 80

        # Left: dates & issuer
        c.setFont(fonts['bold'], 10)
        c.setFillColor(NAVY)
        c.drawString(60, by+30, issued_date)
        c.setStrokeColor(HexColor('#AAAAAA'))
        c.setLineWidth(0.8)
        c.line(60, by+26, 220, by+26)
        c.setFont(fonts['regular'], 9)
        c.setFillColor(GRAY)
        c.drawString(60, by+14, 'Date of Issue')

        c.setFont(fonts['bold'], 10)
        c.setFillColor(NAVY)
        c.drawString(60, by-8, faculty)
        c.line(60, by-12, 250, by-12)
        c.setFont(fonts['regular'], 9)
        c.setFillColor(GRAY)
        c.drawString(60, by-22, 'Issuing Institution')

        # Centre: cert ID
        c.setFont(fonts['regular'], 8); c.setFillColor(HexColor('#999999'))
        c.drawCentredString(W/2, by+22, 'Certificate ID')
        c.setFont(fonts['bold'], 9); c.setFillColor(HexColor('#444444'))
        c.drawCentredString(W/2, by+10, cert_id_short)
        c.setFont(fonts['regular'], 7.5); c.setFillColor(HexColor('#AAAAAA'))
        short_url = verify_url[:52] + '...' if len(verify_url) > 52 else verify_url
        c.drawCentredString(W/2, by-2, f'Verify: {short_url}')

        # Seal circle (right)
        scx = W-90; scy = by+8
        c.setFillColor(HexColor('#F5EFD6')); c.setStrokeColor(NAVY); c.setLineWidth(2)
        c.circle(scx, scy, 38, fill=1, stroke=1)
        c.setStrokeColor(GOLD); c.setLineWidth(1)
        c.circle(scx, scy, 34, fill=0, stroke=1)
        for i in range(12):
            a = math.radians(i * 30)
            c.setStrokeColor(GOLD); c.setLineWidth(0.8)
            c.line(scx+30*math.cos(a), scy+30*math.sin(a),
                   scx+24*math.cos(a), scy+24*math.sin(a))
        c.setFont(fonts['bold'], 8); c.setFillColor(NAVY)
        c.drawCentredString(scx, scy+10, 'EduVNU')
        c.setFont(fonts['regular'], 6.5)
        c.drawCentredString(scx, scy+2, 'VERIFIED')
        c.drawCentredString(scx, scy-6, 'CERTIFICATE')

        # QR Code
        qr = qrcode.QRCode(version=2, box_size=4, border=1)
        qr.add_data(verify_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color='#1A2340', back_color='white')
        qr_buf = BytesIO()
        qr_img.save(qr_buf, format='PNG')
        qr_buf.seek(0)
        c.drawImage(ImageReader(qr_buf), W-185, by-18, width=58, height=58, mask='auto')
        c.setFont(fonts['regular'], 6); c.setFillColor(HexColor('#AAAAAA'))
        c.drawCentredString(W-156, by-26, 'Scan to verify')

        c.showPage()
        c.save()
        response.write(buffer.getvalue())
        buffer.close()
        return response


    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def certificate_data(self, request, pk=None):
        """Return JSON certificate data for the frontend web view."""

        course = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=course)
        except Enrollment.DoesNotExist:
            return Response({"error": "Chưa đăng ký khóa học."}, status=status.HTTP_403_FORBIDDEN)
        
        total = Lesson.objects.filter(course=course, is_active=True).count()
        completed = UserProgress.objects.filter(user=request.user, lesson__course=course, status='completed').count()
        
        if total == 0 or completed < total:
            return Response({
                "error": "Chưa hoàn thành khóa học.",
                "total": total,
                "completed": completed
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cert, _ = Certificate.objects.get_or_create(enrollment=enrollment)
        user = request.user
        student_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        return Response({
            'certificate_id': str(cert.certificate_id),
            'student_name': student_name,
            'course_title': course.title,
            'partner_name': course.partner_name or 'EduVNU',
            'faculty': course.faculty or 'VNU System',
            'subject_code': course.subject_code,
            'issued_at': cert.issued_at.strftime('%B %d, %Y'),
            'issued_at_vi': cert.issued_at.strftime('%d/%m/%Y'),
            'verify_url': f"http://localhost:8000/api/v1/courses/certificates/verify/{cert.certificate_id}/",
            'course_id': course.id,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_certificates(self, request):
        """Lấy tất cả chứng chỉ mà user đã nhận được."""
        certs = Certificate.objects.filter(
            enrollment__user=request.user
        ).select_related('enrollment__course')
        
        result = []
        for cert in certs:
            course = cert.enrollment.course
            if not course:
                continue
            user = request.user
            student_name = f"{user.first_name} {user.last_name}".strip() or user.username
            result.append({
                'certificate_id': str(cert.certificate_id),
                'student_name': student_name,
                'course_title': course.title,
                'partner_name': course.partner_name or 'EduVNU',
                'course_id': course.id,
                'issued_at': cert.issued_at.strftime('%B %d, %Y'),
                'issued_at_vi': cert.issued_at.strftime('%d/%m/%Y'),
            })
        return Response(result)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.filter(is_active=True)
    serializer_class = LessonSerializer

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Lấy danh sách bình luận của bài giảng này."""
        lesson = self.get_object()
        comments = lesson.comments.all().order_by('-created_at')
        from .serializers import LessonCommentSerializer
        return Response(LessonCommentSerializer(comments, many=True).data)

class LessonCommentViewSet(viewsets.ModelViewSet):
    """Quản lý bình luận, thảo luận trong từng bài giảng."""
    from .models import LessonComment
    from .serializers import LessonCommentSerializer
    queryset = LessonComment.objects.all()
    serializer_class = LessonCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        lesson_id = self.request.data.get('lesson')
        lesson = Lesson.objects.get(id=lesson_id)
        serializer.save(user=self.request.user, lesson=lesson)



class UserProgressViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProgressSerializer

    @action(detail=False, methods=['post'])
    def update_progress(self, request):
        """Cập nhật tiến độ học: { lesson_id, status }"""
        lesson_id = request.data.get('lesson_id')
        status_val = request.data.get('status', 'completed')
        if not lesson_id:
            return Response({'error': 'lesson_id là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Bài học không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        # Kiểm tra enrolled
        if not Enrollment.objects.filter(user=request.user, course=lesson.course).exists():
            return Response({'error': 'Bạn chưa đăng ký khóa học này.'}, status=status.HTTP_403_FORBIDDEN)
        progress, _ = UserProgress.objects.update_or_create(
            user=request.user, lesson=lesson,
            defaults={'status': status_val}
        )
        return Response(UserProgressSerializer(progress).data)

    @action(detail=False, methods=['post'])
    def heartbeat(self, request):
        """Cộng dồn thời gian học thực tế: { lesson_id, seconds }
        
        Tối ưu: Ghi vào in-memory buffer thay vì DB trực tiếp.
        Buffer được flush vào DB mỗi 5 phút bởi background thread.
        """
        from .heartbeat_buffer import add_heartbeat, start_flusher
        start_flusher()  # Idempotent: chỉ khởi động 1 lần
        
        lesson_id = request.data.get('lesson_id')
        seconds = int(request.data.get('seconds', 0))
        
        if not lesson_id:
            return Response({'error': 'lesson_id là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate lesson tồn tại (cache-friendly vì Lesson ít thay đổi)
        if not Lesson.objects.filter(id=lesson_id, is_active=True).exists():
            return Response({'error': 'Bài học không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Đẩy vào buffer — KHÔNG ghi DB
        add_heartbeat(request.user.id, lesson_id, seconds)
        
        return Response({'status': 'buffered', 'seconds': seconds})

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Lấy toàn bộ tiến độ học của user."""
        course_id = request.query_params.get('course_id')
        qs = UserProgress.objects.filter(user=request.user)
        if course_id:
            qs = qs.filter(lesson__course_id=course_id)
        return Response(UserProgressSerializer(qs, many=True).data)


from django.utils import timezone

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reply(self, request, pk=None):
        review = self.get_object()
        # Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
        if review.course.instructor != request.user:
            return Response({'error': 'Bạn không có quyền phản hồi đánh giá này.'}, status=403)
            
        reply_content = request.data.get('reply')
        if not reply_content:
            return Response({'error': 'Nội dung phản hồi không được để trống.'}, status=400)
            
        review.instructor_reply = reply_content
        review.replied_at = timezone.now()
        review.save()
        
        return Response({'message': 'Đã gửi phản hồi thành công.'})

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


# --- API DÀNH RIÊNG CHO GIẢNG VIÊN (INSTRUCTOR ONLY) ---
class InstructorCourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet dành riêng cho Giảng viên quản lý khóa học của mình.
    """
    serializer_class = CourseSerializer
    permission_classes = [IsInstructor, IsCourseOwner]

    def get_queryset(self):
        # Nếu user là staff (quản trị viên/con người thật), trả về tất cả khóa học
        if self.request.user.is_staff:
            return Course.objects.all().order_by('-id')
        # Nếu là tổ chức, chỉ trả về khóa học do họ sở hữu
        return Course.objects.filter(instructor=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        # Tự động gán instructor là người dùng hiện tại
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'])
    def submit_review(self, request, pk=None):
        """Giảng viên gửi khóa học đi phê duyệt."""
        course = self.get_object()
        course.status = 'pending'
        course.save()
        return Response({'status': 'submitted for review'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Lấy thống kê tổng quan thực tế cho Dashboard giảng viên."""
        from orders.models import OrderItem
        my_courses = self.get_queryset()
        total_courses = my_courses.count()
        
        # Thống kê học viên thực tế
        total_students = Enrollment.objects.filter(course__in=my_courses).count()
        
        # Thống kê doanh thu thực tế (Tổng giá trị các đơn hàng đã Paid cho các khóa của mình)
        paid_items = OrderItem.objects.filter(course__instructor=request.user, order__status='paid')
        total_revenue = paid_items.aggregate(total=Sum('price'))['total'] or 0
        
        # Doanh thu thực nhận (70%)
        my_earnings = float(total_revenue) * 70 / 100
        
        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'total_revenue': float(total_revenue),
            'my_earnings': my_earnings
        })

    @action(detail=False, methods=['get'])
    def detailed_analytics(self, request):
        """Phân tích chi tiết với dữ liệu thời gian thực (time_spent)."""
        my_courses = self.get_queryset()
        
        # 1. Tổng thời lượng học (giờ) — single aggregate, không loop
        total_seconds = UserProgress.objects.filter(lesson__course__in=my_courses).aggregate(total=Sum('time_spent'))['total'] or 0
        total_hours = round(total_seconds / 3600, 1)
        
        # 2. Tỷ lệ hoàn thành — annotate tại SQL thay vì N+1 loop
        #    Dùng Subquery để đếm lessons và completions cho mỗi course
        lesson_count_sq = Subquery(
            Lesson.objects.filter(course=OuterRef('pk'), is_active=True)
            .values('course').annotate(cnt=Count('id')).values('cnt')[:1],
            output_field=IntegerField()
        )
        completed_count_sq = Subquery(
            UserProgress.objects.filter(lesson__course=OuterRef('pk'), status='completed')
            .values('lesson__course').annotate(cnt=Count('id')).values('cnt')[:1],
            output_field=IntegerField()
        )
        enrolled_count_sq = Subquery(
            Enrollment.objects.filter(course=OuterRef('pk'))
            .values('course').annotate(cnt=Count('id')).values('cnt')[:1],
            output_field=IntegerField()
        )
        
        annotated_courses = my_courses.annotate(
            total_lessons=lesson_count_sq,
            completed_lessons=completed_count_sq,
            total_enrolled=enrolled_count_sq
        )
        
        completion_data = []
        for course in annotated_courses:
            t_lessons = course.total_lessons or 0
            t_enrolled = course.total_enrolled or 0
            c_lessons = course.completed_lessons or 0
            if t_lessons > 0 and t_enrolled > 0:
                rate = round((c_lessons / (t_lessons * t_enrolled)) * 100, 1)
            else:
                rate = 0
            completion_data.append({
                'name': course.title,
                'rate': rate,
                'total_students': t_enrolled
            })
        
        return Response({
            'total_hours': total_hours,
            'completion_data': completion_data,
            'active_students': Enrollment.objects.filter(course__in=my_courses).count(),
        })

    @action(detail=False, methods=['get'])
    def my_students(self, request):
        """Lấy danh sách học viên thật đang học các khóa của mình."""
        my_courses = self.get_queryset()
        enrollments = Enrollment.objects.filter(course__in=my_courses).select_related('user', 'course')
        
        # Pre-fetch: đếm tổng lessons mỗi course 1 lần duy nhất (thay vì query N lần trong loop)
        course_lesson_counts = {}
        for c in my_courses:
            course_lesson_counts[c.id] = Lesson.objects.filter(course=c, is_active=True).count()
        
        # Pre-fetch: đếm completed lessons cho mỗi cặp (user, course) bằng 1 query duy nhất
        completed_qs = (
            UserProgress.objects.filter(
                lesson__course__in=my_courses,
                status='completed'
            )
            .values('user_id', 'lesson__course_id')
            .annotate(done=Count('id'))
        )
        completed_map = {}
        for row in completed_qs:
            completed_map[(row['user_id'], row['lesson__course_id'])] = row['done']
        
        result = []
        for e in enrollments:
            total_lessons = course_lesson_counts.get(e.course_id, 0)
            completed = completed_map.get((e.user_id, e.course_id), 0)
            
            result.append({
                'id': e.id,
                'student_name': f"{e.user.first_name} {e.user.last_name}".strip() or e.user.username,
                'email': e.user.email,
                'course_title': e.course.title,
                'enrolled_at': e.enrolled_at,
                'progress': round((completed / total_lessons * 100) if total_lessons > 0 else 0)
            })
            
        return Response(result)

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Lấy toàn bộ đánh giá của các khóa học thuộc giảng viên này."""
        my_courses = self.get_queryset()
        reviews = Review.objects.filter(course__in=my_courses).order_by('-created_at')
        from .serializers import ReviewSerializer
        return Response(ReviewSerializer(reviews, many=True).data)

    @action(detail=False, methods=['get'])
    def finance_data(self, request):
        """Lấy dữ liệu ví tiền và lịch sử giao dịch từ Sổ cái (Ledger)."""
        wallet, _ = InstructorWallet.objects.get_or_create(user=request.user)
        
        # Lấy lịch sử giao dịch từ sổ cái
        ledger_entries = wallet.transactions_ledger.all().order_by('-created_at')
        transactions = []
        for entry in ledger_entries:
            transactions.append({
                'id': entry.id,
                'amount': float(entry.amount),
                'type': 'Cộng tiền' if entry.transaction_type == 'earning' else 'Rút tiền',
                'description': entry.description,
                'date': entry.created_at.strftime('%Y-%m-%d %H:%M')
            })

        # Doanh thu tháng này
        from django.utils import timezone
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0)
        monthly_earnings = wallet.transactions_ledger.filter(
            transaction_type='earning', 
            created_at__gte=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'balance': float(wallet.balance),
            'monthly_earnings': float(monthly_earnings),
            'bank_info': {
                'bank_name': wallet.bank_name,
                'account_number': wallet.account_number,
                'account_holder': wallet.account_holder,
            },
            'transactions': transactions
        })

    @action(detail=False, methods=['patch'])
    def update_finance_data(self, request):
        """Cập nhật thông tin ngân hàng của giảng viên."""
        wallet, _ = InstructorWallet.objects.get_or_create(user=request.user)
        
        bank_name = request.data.get('bank_name')
        account_number = request.data.get('account_number')
        account_holder = request.data.get('account_holder')
        
        if bank_name: wallet.bank_name = bank_name
        if account_number: wallet.account_number = account_number
        if account_holder: wallet.account_holder = account_holder
        
        wallet.save()
        return Response({
            'bank_name': wallet.bank_name,
            'account_number': wallet.account_number,
            'account_holder': wallet.account_holder,
        })

    @action(detail=False, methods=['post'])
    def request_withdrawal(self, request):
        """Cho phép giảng viên gửi yêu cầu rút tiền."""
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Vui lòng nhập số tiền'}, status=400)
            
        wallet = InstructorWallet.objects.get(user=request.user)
        if float(amount) > float(wallet.balance):
            return Response({'error': 'Số tiền vượt quá số dư'}, status=400)
            
        # Tạo yêu cầu rút tiền
        WithdrawalRequest.objects.create(
            user=request.user,
            amount=amount,
            status='pending'
        )
        
        # Tạm thời trừ tiền trong ví (Logic thực tế có thể trừ sau khi admin duyệt)
        wallet.balance -= Decimal(str(amount))
        wallet.save()
        
        return Response({'message': 'Yêu cầu của bạn đã được gửi.'})

    @action(detail=True, methods=['post'])
    def send_announcement(self, request, pk=None):
        """Cho phép giảng viên gửi thông báo cho 1 khóa học cụ thể."""
        course = self.get_object()
        title = request.data.get('title')
        content = request.data.get('content')
        
        if not title or not content:
            return Response({'error': 'Vui lòng nhập đầy đủ tiêu đề và nội dung'}, status=400)
            
        announcement = CourseAnnouncement.objects.create(
            course=course,
            title=title,
            content=content
        )
        
        return Response({'message': 'Thông báo đã được gửi đến học viên.'})

class NewsViewSet(viewsets.ModelViewSet):
    from .models import News
    from .serializers import NewsSerializer
    queryset = News.objects.filter(is_published=True)
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save(author=self.request.user)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Admin mới có quyền thêm tin tức.")

class FAQViewSet(viewsets.ModelViewSet):
    from .models import FAQ
    from .serializers import FAQSerializer
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Admin mới có quyền thêm FAQ.")
        serializer.save()

from .models import DegreeProgram
from .serializers import DegreeProgramSerializer

class DegreeProgramViewSet(viewsets.ModelViewSet):
    queryset = DegreeProgram.objects.filter(is_active=True).order_by('-id')
    serializer_class = DegreeProgramSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Admin mới có quyền thêm Chương trình đào tạo.")
        serializer.save()

    def perform_update(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Admin mới có quyền sửa Chương trình đào tạo.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Admin mới có quyền xóa Chương trình đào tạo.")
        instance.delete()


class WishlistViewSet(viewsets.GenericViewSet):
    """API quản lý danh sách yêu thích của học viên."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import Wishlist
        return Wishlist.objects.filter(user=self.request.user).select_related('course', 'course__category', 'course__instructor')

    @action(detail=False, methods=['get'])
    def my_wishlist(self, request):
        """GET /courses/wishlist/my_wishlist/ — danh sách khóa học đã yêu thích."""
        from .serializers import WishlistSerializer
        qs = self.get_queryset()
        serializer = WishlistSerializer(qs, many=True)
        return Response(serializer.data)
