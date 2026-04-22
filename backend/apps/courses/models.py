from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, help_text="Giảng viên tạo danh mục này (theo SRS)")

    def __str__(self):
        return self.name

class Course(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('pending', 'Chờ phê duyệt'),
        ('published', 'Đang xuất bản'),
        ('rejected', 'Bị từ chối'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to='courses/', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    rejection_reason = models.TextField(null=True, blank=True)
    
    # --- THỜI GIAN VÀ TRẠNG THÁI (SRS ĐẶC TẢ) ---
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    visibility_status = models.CharField(max_length=20, choices=[('Public', 'Public'), ('Private', 'Private')], default='Public')
    # ---------------------------------------------
    
    # --- CÁC TRƯỜNG MỚI ĐỂ PHÙ HỢP VỚI DATASET VÀ PHONG CÁCH UDEMY ---
    level = models.CharField(max_length=50, null=True, blank=True) # Beginner, Intermediate...
    rating_avg = models.FloatField(default=0.0) # Điểm trung bình (VD: 4.8)
    num_reviews = models.IntegerField(default=0) # Tổng lượt đánh giá
    skills = models.TextField(null=True, blank=True) # "Python, SQL, Django"
    duration = models.CharField(max_length=100, null=True, blank=True) # "12 hours"
    partner_name = models.CharField(max_length=255, null=True, blank=True) # VD: Google, Stanford
    objective = models.TextField(null=True, blank=True) # Những gì sẽ học được
    # ----------------------------------------------------------------
    
    # --- VNU LOCALIZATION (GIAI ĐOẠN 2) ---
    subject_code = models.CharField(max_length=20, null=True, blank=True, help_text="Mã môn học VNU (VD: INT3117)")
    faculty = models.CharField(max_length=255, null=True, blank=True, help_text="Khoa/Trường đào tạo (VD: Trường Đại học Công nghệ)")
    # ----------------------------------------------------------------

    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Quiz(models.Model):
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    passing_score = models.IntegerField(default=70) # Điểm đạt (%)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz: {self.title} - {self.chapter.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Q: {self.text[:50]}"

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    draft_answers = models.JSONField(null=True, blank=True, help_text="Lưu URL JSON mảng ID các answer đã chọn tạm thời.")
    is_submitted = models.BooleanField(default=True, help_text="Bài làm đã nộp hay mới lưu nháp")
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {'Submitted' if self.is_submitted else 'Draft'}"

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='lessons', null=True, blank=True)
    title = models.CharField(max_length=255)
    order_number = models.PositiveIntegerField(default=1)
    video_url = models.URLField(max_length=255, null=True, blank=True)
    video_file = models.FileField(upload_to='lessons/videos/', null=True, blank=True, help_text="Upload file video bài giảng")
    document_file = models.FileField(upload_to='lessons/documents/', null=True, blank=True, help_text="Tài liệu đính kèm (PDF/Slide)")
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_number']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class LessonComment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    degree_program = models.ForeignKey('DegreeProgram', on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress_data = models.JSONField(default=dict, help_text="Lưu tiến độ học bằng cấp (JSON)")

    class Meta:
        unique_together = ('user', 'course', 'degree_program')

    def __str__(self):
        target = self.course.title if self.course else self.degree_program.title
        return f"{self.user} -> {target}"

class UserProgress(models.Model):
    STATUS_CHOICES = (
        ('learning', 'Learning'),
        ('completed', 'Completed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='learning')
    time_spent = models.PositiveIntegerField(default=0, help_text="Thời gian học tính bằng giây")
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user} - {self.lesson} - {self.status}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    instructor_reply = models.TextField(null=True, blank=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.course} ({self.rating}/5)"

import uuid

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"

class Certificate(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    certificate_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.enrollment.user.username}"

class InstructorWallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_wallet')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    account_number = models.CharField(max_length=50, null=True, blank=True)
    account_holder = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Wallet - {self.user.username} - {self.balance}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('earning', 'Thu nhập từ khóa học'),
        ('withdrawal', 'Rút tiền'),
        ('refund', 'Hoàn tiền'),
    )
    wallet = models.ForeignKey(InstructorWallet, on_delete=models.CASCADE, related_name='transactions_ledger')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField(null=True, blank=True)
    order_item = models.ForeignKey('orders.OrderItem', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.created_at.date()}"

class WithdrawalRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Đang xử lý'),
        ('approved', 'Đã chuyển tiền'),
        ('rejected', 'Từ chối'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Withdraw {self.amount} - {self.user.username}"

class CourseAnnouncement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif for {self.user.username}: {self.title}"

class News(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question

class DegreeProgram(models.Model):
    level = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    school = models.CharField(max_length=200)
    title = models.CharField(max_length=255)
    deadline = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    tuition = models.CharField(max_length=100)
    logo = models.CharField(max_length=50, help_text="Tên viết tắt trường để frontend dựa vào render màu (VD: 'BK')")
    instructor = models.CharField(max_length=200, null=True, blank=True)
    instructor_title = models.CharField(max_length=200, null=True, blank=True)
    skills = models.JSONField(default=list, help_text="Danh sách kỹ năng (JSON array of strings)")
    curriculum = models.JSONField(default=list, help_text="Chương trình học (JSON array of objects: {title, lessons})")
    videos = models.JSONField(default=list, help_text="Video liên quan (JSON array of strings)")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.school}"


class Wishlist(models.Model):
    """Danh sách yêu thích của học viên."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user.username} → {self.course.title}"


