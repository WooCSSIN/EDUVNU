from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from courses.models import Category, Course, Lesson, UserProgress
from courses.heartbeat_buffer import _buffer, flush_to_db
import uuid

User = get_user_model()

class ArchitectureOptimizationTests(APITestCase):
    """
    Test suite để kiểm tra các phần tối ưu hóa kiến trúc:
    1. SQL Dedup (Category, Instructor Analytics)
    2. Heartbeat In-memory Buffer
    3. QR Rate-Limiting Anti Brute-force
    """

    def setUp(self):
        # 1. Tạo data mẫu cho User
        self.instructor = User.objects.create_user(
            username='instructor_test', 
            password='password123',
            is_instructor=True
        )
        self.student = User.objects.create_user(
            username='student_test',
            password='password123'
        )
        
        # 2. Tạo data mẫu cho Course
        self.category = Category.objects.create(name='Test Category', is_active=True)
        self.course = Course.objects.create(
            title='Test Course', 
            instructor=self.instructor, 
            category=self.category,
            price=0,
            is_active=True
        )
        self.lesson = Lesson.objects.create(
            title='Test Lesson',
            course=self.course,
            is_active=True,
            order_number=1
        )

    def test_01_sql_dedup_endpoints_load_faster(self):
        """Kiểm tra các endpoint đã được tối ưu hóa SQL chạy ổn định không lỗi."""
        self.client.force_authenticate(user=self.instructor)
        
        # Test GET Categories (Fixed Exists subquery)
        res_cat = self.client.get('/api/v1/courses/categories/')
        self.assertEqual(res_cat.status_code, 200, "Categories API gọi thất bại")
            
        # Test my_students (Fixed N+1 loops)
        res_students = self.client.get('/api/v1/courses/instructor-courses/my_students/')
        self.assertEqual(res_students.status_code, 200, "My Students API gọi thất bại")
        
        # Test detailed_analytics (Fixed Subquery annotate)
        res_analytics = self.client.get('/api/v1/courses/instructor-courses/detailed_analytics/')
        self.assertEqual(res_analytics.status_code, 200, "Analytics API gọi thất bại")

    def test_02_heartbeat_buffer_batches_writes(self):
        """Kiểm tra logic Heartbeat chỉ ghi Memory, không ghi thẳng xuống Database."""
        self.client.force_authenticate(user=self.student)
        
        # Xoá buffer rác (nếu có từ test trước)
        _buffer.clear()
        
        # 1. Gửi 3 requests (tổng cộng 90 giây)
        for i in range(3):
            self.client.post('/api/v1/courses/progress/heartbeat/', {
                'lesson_id': self.lesson.id, 
                'seconds': 30
            }, format='json')
            
        # 2. Database lúc này phải là 0 vì dữ liệu bị kẹt lại ở Buffer
        time_spent_db = UserProgress.objects.filter(user=self.student, lesson=self.lesson).values_list('time_spent', flat=True).first()
        self.assertEqual(time_spent_db or 0, 0, "Dữ liệu lọt xuống DB sai quy trình!")
        
        # 3. Memory Buffer phải vừa vặn giữ giá trị 90 giây
        key = (self.student.id, self.lesson.id)
        self.assertEqual(_buffer.get(key, 0), 90, "Buffer không lưu đủ thời gian cộng dồn")
        
        # 4. Giả lập Background thread gọi flush
        flush_to_db()
        
        # 5. Database phải được cập nhật thành 90 sau khi flush
        time_spent_db_after = UserProgress.objects.filter(user=self.student, lesson=self.lesson).values_list('time_spent', flat=True).first()
        self.assertEqual(time_spent_db_after, 90, "Sau khi Flush, dữ liệu không đẩy xuống DB thành công")

    def test_03_qr_verify_rate_limit(self):
        """Kiểm tra Endpoint Verify Chứng chỉ sẽ trả về HTTP 429 nếu cố tình spam."""
        fake_uuid = str(uuid.uuid4())
        
        status_codes = []
        # Gửi liên tục 12 lượt gọi
        for i in range(12):
            res = self.client.get(f'/api/v1/courses/certificates/verify/{fake_uuid}/')
            status_codes.append(res.status_code)
            
        # 10 request đầu tiên phải chạy bình thường (Nhận mã 404 vì UUID fake)
        self.assertEqual(status_codes[0], 404)
        self.assertEqual(status_codes[9], 404)
        
        # Request thứ 11 và 12 vượt quá giới hạn 10/phút -> Phải nhận HTTP 429 Too Many Requests
        self.assertEqual(status_codes[10], 429, "Rate limiter không hoạt động, request thứ 11 bị lọt")
        self.assertEqual(status_codes[11], 429)
