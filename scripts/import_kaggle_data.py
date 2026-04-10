"""
Script import dữ liệu từ Kaggle CSV vào Django database.
Chạy: python import_kaggle_data.py
"""
import os
import sys
import django
import csv
import re

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Category, Course
from accounts.models import User

# Path tương đối từ thư mục VNU
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'DATA_KAGGLE', 'datakg_khoahoc.csv')


def fix_encoding(text):
    """Fix lỗi encoding Â· → · và các ký tự lỗi tương tự."""
    if not text:
        return text
    # Fix Â· thành dấu · (bullet separator)
    text = text.replace('Â·', '·')
    text = text.replace('Â ', '')
    text = text.replace('\u00c2', '')
    return text.strip()


def parse_metadata(metadata):
    """
    Parse chuỗi như: 'Beginner · Professional Certificate · 3 - 6 Months'
    Trả về: (level, course_type, duration)
    """
    metadata = fix_encoding(metadata)
    parts = [p.strip() for p in metadata.split('·')]
    level = parts[0] if len(parts) > 0 else 'Beginner'
    course_type = parts[1] if len(parts) > 1 else 'Course'
    duration = parts[2] if len(parts) > 2 else ''
    return level, course_type, duration


def parse_price(rating_str, course_type):
    """Tạo giá dựa trên loại khóa học."""
    price_map = {
        'Professional Certificate': 1299000,
        'Specialization': 899000,
        'Course': 499000,
        'MasterTrack Certificate': 1999000,
        'Degree': 4999000,
    }
    for key, price in price_map.items():
        if key.lower() in course_type.lower():
            return price
    return 499000


def get_or_create_instructor(org_name):
    """Lấy hoặc tạo user instructor từ tên tổ chức."""
    username = re.sub(r'[^a-zA-Z0-9]', '_', org_name.lower())[:30]
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f'{username}@edu.vn',
            'first_name': org_name[:50],
            'is_instructor': True,
            'is_student': False,
        }
    )
    if created:
        user.set_unusable_password()
        user.save()
    return user


def get_or_create_category(course_type):
    """Tạo category từ loại khóa học."""
    cat_map = {
        'Professional Certificate': 'Chứng chỉ Chuyên nghiệp',
        'Specialization': 'Chuyên ngành',
        'Course': 'Khóa học',
        'MasterTrack': 'MasterTrack',
        'Degree': 'Bằng cấp',
    }
    name = 'Khóa học'
    for key, val in cat_map.items():
        if key.lower() in course_type.lower():
            name = val
            break
    cat, _ = Category.objects.get_or_create(
        name=name,
        defaults={'description': name, 'is_active': True}
    )
    return cat


def main():
    print("Bắt đầu import dữ liệu Kaggle...")

    # Đọc CSV
    rows = []
    with open(CSV_PATH, encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    print(f"Tổng số dòng: {len(rows)}")

    created_count = 0
    skipped_count = 0

    for i, row in enumerate(rows[:200]):  # Import tối đa 200 khóa học
        title = fix_encoding(row.get('Title', '').strip())
        org = fix_encoding(row.get('Organization', '').strip())
        skills = fix_encoding(row.get('Skills', '').strip())
        rating_str = row.get('Ratings', '0').strip()
        review_str = fix_encoding(row.get('Review counts', '').strip())
        metadata = fix_encoding(row.get('Metadata', '').strip())

        if not title or not org:
            skipped_count += 1
            continue

        # Skip nếu đã tồn tại
        if Course.objects.filter(title=title).exists():
            skipped_count += 1
            continue

        level, course_type, duration = parse_metadata(metadata)
        price = parse_price(rating_str, course_type)
        instructor = get_or_create_instructor(org)
        category = get_or_create_category(course_type)

        # Tạo description từ skills
        description = f"Khóa học {course_type} từ {org}.\n\n"
        description += f"Cấp độ: {level} | Thời gian: {duration}\n\n"
        if skills:
            description += f"Kỹ năng học được:\n{skills}"

        try:
            Course.objects.create(
                title=title,
                instructor=instructor,
                description=f"Khóa học {course_type} từ {org}. Cấp độ: {level} | Thời gian: {duration}",
                skills=skills,
                level=level,
                duration=duration,
                rating=float(rating_str) if rating_str else 0,
                review_count=review_str,
                price=price,
                category=category,
                is_active=True,
            )
            created_count += 1
            if created_count % 20 == 0:
                print(f"  Đã tạo {created_count} khóa học...")
        except Exception as e:
            print(f"  Lỗi tạo '{title}': {e}")
            skipped_count += 1

    print(f"\nHoàn tất!")
    print(f"  Đã tạo: {created_count} khóa học")
    print(f"  Bỏ qua: {skipped_count} dòng")
    print(f"  Categories: {Category.objects.count()}")
    print(f"  Instructors: {User.objects.filter(is_instructor=True).count()}")


if __name__ == '__main__':
    main()
