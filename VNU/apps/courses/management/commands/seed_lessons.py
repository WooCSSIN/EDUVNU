from django.core.management.base import BaseCommand
from courses.models import Course, Lesson

class Command(BaseCommand):
    help = 'Seed 5 professional lessons for each course'

    def handle(self, *args, **kwargs):
        courses = Course.objects.all()
        if not courses.exists():
            self.stdout.write(self.style.ERROR('Chưa có khóa học nào để nạp bài giảng.'))
            return

        videos = [
            "https://www.youtube.com/embed/dQw4w9WgXcQ", # Rickroll (Demo)
            "https://www.youtube.com/embed/z8p_n6-LIsM",
            "https://www.youtube.com/embed/7S_6DzhqXWc",
            "https://www.youtube.com/embed/aircAruvnKk",
            "https://www.youtube.com/embed/y881t8ilMyc",
        ]

        lesson_titles = [
            "1. Chào mừng và Giới thiệu lộ trình học",
            "2. Các khái niệm cốt lõi cần nắm vững",
            "3. Hướng dẫn cài đặt môi trường và công cụ",
            "4. Thực hành dự án đầu tay (Phần 1)",
            "5. Tổng kết chương và Bài tập về nhà",
        ]

        count = 0
        for course in courses:
            # Xóa bài giảng cũ nếu có để tránh trùng lặp khi chạy lại
            course.lessons.all().delete()
            
            for i in range(5):
                Lesson.objects.create(
                    course=course,
                    title=lesson_titles[i],
                    video_url=videos[i],
                    content=f"Chào mừng bạn đến với bài giảng {i+1} của khóa học {course.title}. Trong bài này chúng ta sẽ đi sâu vào thực hành các kiến thức chuyên môn.",
                    order_number=i+1
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Đã nạp thành công {count} bài giảng cho {courses.count()} khóa học!'))
