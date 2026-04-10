import os
import random
from django.core.management.base import BaseCommand
from courses.models import Course, Category
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Do du lieu mau sieu xin cho EduVNU'

    def handle(self, *args, **kwargs):
        self.stdout.write('Dang chuan bi do du lieu khung... 🚀')
        
        # 1. Lay admin mac dinh
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

        # 2. Tao Categories
        categories_data = ['Công nghệ thông tin', 'Khoa học dữ liệu', 'Kinh doanh', 'Thiết kế', 'Ngoại ngữ', 'Marketing', 'Phát triển cá nhân']
        category_objs = {}
        for cat_name in categories_data:
            cat, created = Category.objects.get_or_create(name=cat_name)
            category_objs[cat_name] = cat

        # 3. Danh sach 20+ khoa hoc thuc te
        courses_data = [
            # IT & AI
            {'title': 'Deep Learning Specialization', 'partner': 'DeepLearning.AI', 'cat': 'Công nghệ thông tin', 'level': 'Trung cấp', 'rating': 4.9, 'rev': 150000, 'skills': 'Neural Networks, CNN, RNN', 'price': 1200000},
            {'title': 'AWS Cloud Practitioner Essentials', 'partner': 'Amazon Web Services', 'cat': 'Công nghệ thông tin', 'level': 'Người mới', 'rating': 4.8, 'rev': 45000, 'skills': 'Cloud Computing, AWS Services', 'price': 0},
            {'title': 'Cybersecurity Analyst Certificate', 'partner': 'IBM', 'cat': 'Công nghệ thông tin', 'level': 'Người mới', 'rating': 4.7, 'rev': 22000, 'skills': 'Network Security, Pentesting', 'price': 899000},
            {'title': 'Full-Stack Web Development', 'partner': 'Johns Hopkins University', 'cat': 'Công nghệ thông tin', 'level': 'Trung cấp', 'rating': 4.6, 'rev': 31000, 'skills': 'HTML, CSS, JS, Node.js', 'price': 1500000},
            
            # Data Science
            {'title': 'Google Data Analytics Certificate', 'partner': 'Google', 'cat': 'Khoa học dữ liệu', 'level': 'Người mới', 'rating': 4.8, 'rev': 210000, 'skills': 'SQL, Tableau, R', 'price': 0},
            {'title': 'Excel Skills for Business', 'partner': 'Macquarie University', 'cat': 'Khoa học dữ liệu', 'level': 'Người mới', 'rating': 4.9, 'rev': 78000, 'skills': 'Excel Formulas, VLOOKUP, Pivot', 'price': 450000},
            {'title': 'Applied Data Science with Python', 'partner': 'University of Michigan', 'cat': 'Khoa học dữ liệu', 'level': 'Trung cấp', 'rating': 4.7, 'rev': 52000, 'skills': 'Pandas, Matplotlib, Regex', 'price': 950000},
            
            # Business
            {'title': 'Google Project Management', 'partner': 'Google', 'cat': 'Kinh doanh', 'level': 'Người mới', 'rating': 4.8, 'rev': 82000, 'skills': 'Agile, Scrum, Stakeholders', 'price': 499000},
            {'title': 'Business Foundations Specialization', 'partner': 'UPenn Wharton', 'cat': 'Kinh doanh', 'level': 'Người mới', 'rating': 4.7, 'rev': 18000, 'skills': 'Marketing, Finance, Accounting', 'price': 2200000},
            {'title': 'Successful Negotiation', 'partner': 'University of Michigan', 'cat': 'Kinh doanh', 'level': 'Tất cả trình độ', 'rating': 4.9, 'rev': 67000, 'skills': 'Negotiation Tactics, Strategy', 'price': 0},
            
            # Design
            {'title': 'Google UX Design Certificate', 'partner': 'Google', 'cat': 'Thiết kế', 'level': 'Người mới', 'rating': 4.8, 'rev': 91000, 'skills': 'Figma, Prototyping, User Research', 'price': 599000},
            {'title': 'Graphic Design Specialization', 'partner': 'CalArts', 'cat': 'Thiết kế', 'level': 'Người mới', 'rating': 4.7, 'rev': 25000, 'skills': 'Typography, Logo, Branding', 'price': 850000},
            {'title': 'UI/UX Design for Real World', 'partner': 'EduVNU Academy', 'cat': 'Thiết kế', 'level': 'Người mới', 'rating': 4.8, 'rev': 5400, 'skills': 'UI Kits, Design Systems', 'price': 350000},
            
            # Marketing
            {'title': 'Digital Marketing & E-commerce', 'partner': 'Google', 'cat': 'Marketing', 'level': 'Người mới', 'rating': 4.8, 'rev': 55000, 'skills': 'SEO, SEM, Social Media', 'price': 0},
            {'title': 'Foundations of Marketing Analytics', 'partner': 'Emory University', 'cat': 'Marketing', 'level': 'Trung cấp', 'rating': 4.6, 'rev': 8900, 'skills': 'Customer Analytics, ROI', 'price': 780000},
            
            # Languages
            {'title': 'English for Career Development', 'partner': 'UPenn', 'cat': 'Ngoại ngữ', 'level': 'Trung cấp', 'rating': 4.8, 'rev': 120000, 'skills': 'Business English, Interview', 'price': 0},
            {'title': 'First Step Korean', 'partner': 'Yonsei University', 'cat': 'Ngoại ngữ', 'level': 'Người mới', 'rating': 4.9, 'rev': 230000, 'skills': 'Hangul, Korean Basic', 'price': 299000},
            {'title': 'Chinese for Beginners', 'partner': 'Peking University', 'cat': 'Ngoại ngữ', 'level': 'Người mới', 'rating': 4.7, 'rev': 48000, 'skills': 'Pinyin, Basic Chinese', 'price': 150000},

            # Personal Dev
            {'title': 'The Science of Well-Being', 'partner': 'Yale University', 'cat': 'Phát triển cá nhân', 'level': 'Tất cả trình độ', 'rating': 4.9, 'rev': 540000, 'skills': 'Happiness, Gratitude, Habits', 'price': 0},
            {'title': 'Learning How to Learn', 'partner': 'DeepTeaching', 'cat': 'Phát triển cá nhân', 'level': 'Người mới', 'rating': 4.8, 'rev': 320000, 'skills': 'Memory, Focused Mode, Pomodoro', 'price': 0},
            {'title': 'Public Speaking', 'partner': 'University of Washington', 'cat': 'Phát triển cá nhân', 'level': 'Người mới', 'rating': 4.7, 'rev': 12000, 'skills': 'Presentation, Storytelling', 'price': 450000},
        ]

        # Xoa du lieu cu
        Course.objects.all().delete()

        # 4. Tao du lieu
        img_placeholders = [
           'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600',
           'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600',
           'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600',
           'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600',
           'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600'
        ]

        for data in courses_data:
            Course.objects.create(
                title=data['title'],
                partner_name=data['partner'],
                description=f"Khóa học chất lượng cao từ {data['partner']} giúp bạn nâng cao kỹ năng {data['cat']}.",
                category=category_objs.get(data['cat']),
                level=data['level'],
                rating_avg=data['rating'],
                num_reviews=data['rev'],
                skills=data['skills'],
                duration=f"{random.randint(10, 80)} giờ học",
                price=data['price'],
                objective="Làm chủ các công cụ và kỹ năng thực tế nhất trong nghành."
            )
            self.stdout.write(self.style.SUCCESS(f"Da tao: {data['title']}"))

        self.stdout.write(self.style.SUCCESS(f'--- DA DO XONG {len(courses_data)} KHOA HOC! ---'))
