from django.core.management.base import BaseCommand
from courses.models import Course, Lesson

class Command(BaseCommand):
    help = 'Crawl and seed professional content for EVERY category in the app'

    def handle(self, *args, **kwargs):
        # MẢNG DỮ LIỆU NỘI DUNG CHUYÊN BIỆT (Professional API-style Content Map)
        CONTENT_REPOSITORY = {
            'design': [ # Dành cho UX, UI, Figma, Product Design
                ("1. Tổng quan về UX/UI chuyên nghiệp", "https://player.vimeo.com/video/342938837"),
                ("2. Tư duy thiết kế Sản phẩm (Product Thinking)", "https://www.youtube.com/embed/gHGN6hs2gZ0"),
                ("3. Thành thạo Figma căn bản", "https://www.youtube.com/embed/4yKq0A2882c"),
                ("4. Nghiên cứu hành vi người dùng (UX Research)", "https://www.youtube.com/embed/aircAruvnKk"),
                ("5. Portfolio và Sự nghiệp Designer", "https://www.youtube.com/embed/V6Wv_jM_FpE"),
            ],
            'data': [ # Dành cho Data Analyst, SQL, Excel, AI, Deep Learning
                ("1. Chân dung một Data Analyst thực tế", "https://www.youtube.com/embed/uDgn5SguPps"),
                ("2. Phân tích dữ liệu với SQL căn bản", "https://www.youtube.com/embed/7S_6DzhqXWc"),
                ("3. Làm sạch dữ liệu với Python chuyên sâu", "https://www.youtube.com/embed/gpS7p2-2Fic"),
                ("4. Kể chuyện bằng dữ liệu (Visualization)", "https://www.youtube.com/embed/Z0oYV57J3zM"),
                ("5. Dự án thực hành: Phân tích kinh doanh", "https://www.youtube.com/embed/y881t8ilMyc"),
            ],
            'cloud': [ # Dành cho AWS, Google Cloud, Network, Security
                ("1. Cloud Computing là gì? (Toàn tập)", "https://www.youtube.com/embed/3hLmDS179YE"),
                ("2. Các dịch vụ cốt lõi của AWS (EC2/S3)", "https://www.youtube.com/embed/W_V8G08-K1Y"),
                ("3. Bảo mật và Định danh trong Cloud", "https://www.youtube.com/embed/Z_m4q7Q6uPk"),
                ("4. Quản lý chi phí trên Đám mây", "https://www.youtube.com/embed/2_mF0e_vE88"),
                ("5. Luyện thi chứng chỉ Cloud Practitioner", "https://www.youtube.com/embed/3hLmDS179YE"),
            ],
            'it': [ # Dành cho Lập trình Web, Python, IT cơ bản
                ("1. Nhập môn Khoa học máy tính (Harvard CS50)", "https://www.youtube.com/embed/Ssh71heS26Y"),
                ("2. Thuật toán và Cấu trúc dữ liệu", "https://www.youtube.com/embed/8hly31xKli0"),
                ("3. Phát triển Web Frontend (HTML/CSS/JS)", "https://www.youtube.com/embed/mU6anWqZJcc"),
                ("4. Xây dựng Backend với Python/Django", "https://www.youtube.com/embed/jBzwzrDvZ18"),
                ("5. Deploy ứng dụng lên Heroku/AWS", "https://www.youtube.com/embed/6M5VXA8wJls"),
            ]
        }

        courses = Course.objects.all()
        processed_count = 0
        
        for course in courses:
            # Làm sạch bài giảng cũ để tránh rác
            course.lessons.all().delete()
            
            # PHÂN LOẠI TỰ ĐỘNG (Auto-Matching Logic)
            title_lower = course.title.lower()
            if any(x in title_lower for x in ['ux', 'design', 'figma', 'product']):
                pool = CONTENT_REPOSITORY['design']
            elif any(x in title_lower for x in ['data', 'analytics', 'sql', 'excel', 'ai', 'neural', 'learning']):
                pool = CONTENT_REPOSITORY['data']
            elif any(x in title_lower for x in ['cloud', 'aws', 'network', 'security', 'server']):
                pool = CONTENT_REPOSITORY['cloud']
            else:
                pool = CONTENT_REPOSITORY['it'] # Mặc định là nhóm IT tổng quát
            
            # Nạp bộ bài giảng chuyên biệt
            for idx, (l_title, l_url) in enumerate(pool):
                Lesson.objects.create(
                    course=course,
                    title=l_title,
                    video_url=l_url,
                    content=f"Chào mừng bạn đến với khóa học chuyên nghiệp: {course.title}. Bài học '{l_title}' được chắt lọc từ các chương trình đào tạo uy tín nhất toàn cầu, giúp bạn nắm vững kiến thức thực tiễn.",
                    order_number=idx + 1
                )
            processed_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'EduVNU Global: Đã nạp thành công nội dung CHUYÊN BIỆT cho TOÀN BỘ {processed_count} khóa học!'))
