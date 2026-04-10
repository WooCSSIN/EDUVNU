from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Course, Lesson, Enrollment, UserProgress, Review, ContactMessage
from .serializers import (
    CategorySerializer, CourseSerializer, CourseDetailSerializer,
    LessonSerializer, EnrollmentSerializer, UserProgressSerializer, ReviewSerializer, ContactMessageSerializer
)


from django.db.models import Count

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

    def list(self, request, *args, **kwargs):
        # Lọc thủ công bằng Python để tránh lỗi tương thích SQL Server khi dùng JOIN/Count
        queryset = self.filter_queryset(self.get_queryset())
        valid_cats = [cat for cat in queryset if cat.courses.filter(is_active=True).exists()]
        serializer = self.get_serializer(valid_cats, many=True)
        return Response(serializer.data)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer

    def get_queryset(self):
        qs = Course.objects.filter(is_active=True)
        q = self.request.query_params.get('q', '').strip()
        category_id = self.request.query_params.get('category', '')
        ordering_param = self.request.query_params.get('ordering', '')
        
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        if category_id:
            qs = qs.filter(category_id=category_id)
            
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
        """Danh sách khóa học đã đăng ký."""
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_schedule(self, request):
        """Lịch học: trả về enrollments kèm tiến độ từng khóa."""
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
        result = []
        for e in enrollments:
            total = Lesson.objects.filter(course=e.course, is_active=True).count()
            completed = UserProgress.objects.filter(
                user=request.user, lesson__course=e.course, status='completed'
            ).count()
            result.append({
                'id': e.id,
                'course': CourseSerializer(e.course).data,
                'enrolled_at': e.enrolled_at,
                'total_lessons': total,
                'completed_lessons': completed,
                'percent': round((completed / total * 100) if total > 0 else 0),
            })
        return Response(result)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def lessons(self, request, pk=None):
        """Lấy lessons của course — chỉ cho user đã enrolled."""
        course = self.get_object()
        if not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({'error': 'Bạn chưa đăng ký khóa học này.'}, status=status.HTTP_403_FORBIDDEN)
        lessons = Lesson.objects.filter(course=course, is_active=True)
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.filter(is_active=True)
    serializer_class = LessonSerializer


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

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Lấy toàn bộ tiến độ học của user."""
        course_id = request.query_params.get('course_id')
        qs = UserProgress.objects.filter(user=request.user)
        if course_id:
            qs = qs.filter(lesson__course_id=course_id)
        return Response(UserProgressSerializer(qs, many=True).data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
