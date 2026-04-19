import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course

course = Course.objects.filter(title__icontains='ReactJS').first()
if course:
    course.price = 1000
    course.save()
    print(f" Đã giảm giá khóa học '{course.title}' xuống còn {course.price} VND thành công!")
else:
    print(" Không tìm thấy khóa học.")
