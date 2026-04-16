import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from accounts.models import User
from courses.models import Course, Enrollment

def fix_and_enroll():
    # 1. Sửa Database
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE courses_enrollment ADD CONSTRAINT DF_enrolled_at DEFAULT GETDATE() FOR enrolled_at")
            print("Successfully added default value for enrolled_at")
        except Exception as e:
            print(f"Bỏ qua lỗi SQL (có thể đã tồn tại): {e}")

    # 2. Ghi danh cho lehongdinh
    user = User.objects.filter(username='lehongdinh').first()
    course = Course.objects.first()
    
    if user and course:
        enroll, created = Enrollment.objects.get_or_create(user=user, course=course)
        print(f"SUCCESS: {user.username} has been enrolled in {course.title}")
    else:
        print("User or Course not found")

if __name__ == '__main__':
    fix_and_enroll()
