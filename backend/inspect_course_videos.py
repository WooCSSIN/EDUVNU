import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Lesson

print("=== KIỂM TRA VIDEO TRONG CÁC KHÓA HỌC ===\n")
for course in Course.objects.all():
    lessons = Lesson.objects.filter(course=course).order_by('order')
    print(f"[ID={course.id}] {course.title} ({lessons.count()} bài)")
    for ls in lessons[:3]:  # Chỉ hiện 3 bài đầu
        print(f"  - {ls.title[:50]}: {ls.video_url or 'TRỐNG'}")
    if lessons.count() > 3:
        print(f"  ... và {lessons.count() - 3} bài khác")
    print()
