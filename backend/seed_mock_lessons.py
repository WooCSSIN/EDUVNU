import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Chapter, Lesson
import random

VIDEO_DB = [
    'https://www.youtube.com/watch?v=rfscVS0vtbw',
    'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    'https://www.youtube.com/watch?v=bMknfKXIFA8',
    'https://www.youtube.com/watch?v=SqcY0GlETPk',
    'https://www.youtube.com/watch?v=jS4aFq5-91M',
    'https://www.youtube.com/watch?v=PkZNo7MFOUg',
    'https://www.youtube.com/watch?v=zOjov-2OZ0E',
]

def seed():
    courses = Course.objects.all()
    count = 0
    for course in courses:
        chapters = list(course.chapters.all())
        if not chapters:
            # Create a mock chapter if none exists
            ch = Chapter.objects.create(course=course, title="Chương 1: Mở đầu", order=1)
            chapters.append(ch)
        
        for idx, chapter in enumerate(chapters):
            if chapter.lessons.count() == 0:
                # Create 3 mock lessons per chapter
                for i in range(3):
                    Lesson.objects.create(
                        course=course,
                        chapter=chapter,
                        title=f"Bài {i+1}: Khái quát về {course.title[:20]}...",
                        order_number=i+1,
                        video_url=random.choice(VIDEO_DB),
                        content=f"Đây là nội dung mô phỏng cho bài học {i+1} trong phần {chapter.title}. Video được lấy từ nguồn Edu cao cấp."
                    )
                    count += 1
    print(f"✅ Đã tạo thành công {count} bài học mẫu cho các khóa học!")

if __name__ == '__main__':
    seed()
