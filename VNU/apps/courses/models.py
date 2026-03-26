from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='courses/', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    
    # --- CÁC TRƯỜNG MỚI ĐỂ PHÙ HỢP VỚI DATASET VÀ PHONG CÁCH UDEMY ---
    level = models.CharField(max_length=50, null=True, blank=True) # Beginner, Intermediate...
    rating_avg = models.FloatField(default=0.0) # Điểm trung bình (VD: 4.8)
    num_reviews = models.IntegerField(default=0) # Tổng lượt đánh giá
    skills = models.TextField(null=True, blank=True) # "Python, SQL, Django"
    duration = models.CharField(max_length=100, null=True, blank=True) # "12 hours"
    partner_name = models.CharField(max_length=255, null=True, blank=True) # VD: Google, Stanford
    objective = models.TextField(null=True, blank=True) # Những gì sẽ học được
    # ----------------------------------------------------------------

    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses_taught')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    order_number = models.PositiveIntegerField(default=1)
    video_url = models.URLField(max_length=255, null=True, blank=True)
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_number']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user} -> {self.course}"

class UserProgress(models.Model):
    STATUS_CHOICES = (
        ('learning', 'Learning'),
        ('completed', 'Completed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='learning')
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.course} ({self.rating}/5)"
