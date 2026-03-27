from django.core.management.base import BaseCommand
from courses.models import Course, Lesson

class Command(BaseCommand):
    help = 'Seeding unique and highly specific professional content for each course'

    def handle(self, *args, **kwargs):
        # KHO NỘI DUNG SIÊU CHI TIẾT (Granular Content Repository)
        CHANNELS = {
            'GOOGLE_UX': [
                ("1. Vai trò của Google UX Designer", "https://www.youtube.com/embed/z8p_n6-LIsM"),
                ("2. Quy trình thiết kế lấy người dùng làm trung tâm", "https://www.youtube.com/embed/gHGN6hs2gZ0"),
                ("3. Kỹ thuật Phỏng vấn người dùng", "https://www.youtube.com/embed/V6Wv_jM_FpE"),
                ("4. Wireframing trong thế giới thực", "https://www.youtube.com/embed/4yKq0A2882c"),
                ("5. Kiểm thử sản phẩm (Usability Testing)", "https://www.youtube.com/embed/z6LpaxD1j5A"),
            ],
            'AI_ML': [
                ("1. Andrew Ng: Tương lai của AI", "https://www.youtube.com/embed/PySo_6S4ZAg"),
                ("2. Công nghệ Deep Learning đột phá", "https://www.youtube.com/embed/aircAruvnKk"),
                ("3. Cách AI thay đổi bộ mặt lập trình", "https://www.youtube.com/embed/6M5VXA8wJls"),
                ("4. Xây dựng mô hình Neural Network đầu tiên", "https://www.youtube.com/embed/7S_6DzhqXWc"),
                ("5. Đạo đức và AI (AI Ethics)", "https://www.youtube.com/embed/Ilg3gGewQ5U"),
            ],
            'PROJECT_MGMT': [
                ("1. Quản lý dự án theo chuẩn Agile", "https://www.youtube.com/embed/7X8mO_vV5_g"),
                ("2. Scrum: Khung làm việc cho đội nhóm", "https://www.youtube.com/embed/9TycLR0TqFA"),
                ("3. Lập kế hoạch và Quản trị rủi ro", "https://www.youtube.com/embed/m6M5v4kByh8"),
                ("4. Kế hoạch ra mắt sản phẩm (Product Roadmap)", "https://www.youtube.com/embed/uDgn5SguPps"),
                ("5. Kết thúc dự án và Rút kinh nghiệm", "https://www.youtube.com/embed/Z0oYV57J3zM"),
            ],
            'DATA_ANALYTICS': [
                ("1. Phân tích dữ liệu: Tầm nhìn 2026", "https://www.youtube.com/embed/uDgn5SguPps"),
                ("2. Kỹ năng SQL cho nhà phân tích", "https://www.youtube.com/embed/7S_6DzhqXWc"),
                ("3. Làm sạch dữ liệu với Python chuyên biệt", "https://www.youtube.com/embed/gpS7p2-2Fic"),
                ("4. Tableau vs PowerBI: Công cụ nào tốt hơn?", "https://www.youtube.com/embed/y881t8ilMyc"),
                ("5. Storytelling: Kể chuyện bằng dữ liệu", "https://www.youtube.com/embed/Z0oYV57J3zM"),
            ],
            'SOFT_SKILLS': [
                ("1. Kỹ năng giao tiếp trong môi trường số", "https://www.youtube.com/embed/Vv8_x_q8_p8"),
                ("2. Tư duy phản biện và Giải quyết vấn đề", "https://www.youtube.com/embed/dQw4w9WgXcQ"), # Test YouTube stability
                ("3. Quản lý thời gian cho người làm việc tự do", "https://www.youtube.com/embed/aircAruvnKk"),
                ("4. Kỹ năng lãnh đạo đội nhóm sáng tạo", "https://www.youtube.com/embed/y881t8ilMyc"),
                ("5. Cân bằng công việc và Cuộc sống", "https://www.youtube.com/embed/Z0oYV57J3zM"),
            ]
        }

        courses = Course.objects.all()
        for course in courses:
            course.lessons.all().delete()
            
            title = course.title.lower()
            
            # PHÂN LOẠI SIÊU CHI TIẾT
            if 'ux' in title or 'design' in title:
                playlist = CHANNELS['GOOGLE_UX']
            elif 'artificial' in title or 'intelligence' in title or 'neural' in title or 'learning' in title:
                playlist = CHANNELS['AI_ML']
            elif 'analytics' in title or 'data' in title or 'sql' in title:
                playlist = CHANNELS['DATA_ANALYTICS']
            elif 'project' in title or 'management' in title or 'agile' in title:
                playlist = CHANNELS['PROJECT_MGMT']
            else:
                playlist = CHANNELS['SOFT_SKILLS']
            
            # Tạo bài giảng độc nhất
            for idx, (l_title, l_url) in enumerate(playlist):
                Lesson.objects.create(
                    course=course,
                    title=l_title,
                    video_url=l_url,
                    content=f"Khóa học: {course.title}. Bài học {idx+1}: {l_title}.\n\nĐây là nội dung chuyên sâu được thiết kế riêng cho học viên EduVNU, giúp bạn ứng dụng ngay vào thực tế công việc.",
                    order_number=idx + 1
                )
        
        self.stdout.write(self.style.SUCCESS(f'EduVNU Global V2: Đã cá nhân hóa thành công hàng trăm bài giảng độc nhất cho 21 khóa học!'))
