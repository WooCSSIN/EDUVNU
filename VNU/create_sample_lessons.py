"""
Script tao lessons mau cho cac khoa hoc tu data Kaggle.
Moi khoa hoc se co 5-8 bai hoc duoc tao tu danh sach skills.

Cach chay:
    python create_sample_lessons.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from courses.models import Course, Lesson

# Template bai hoc chung
BASE_LESSONS = [
    ('Gioi thieu khoa hoc', 'Tong quan ve noi dung va muc tieu khoa hoc. Ban se hoc duoc gi sau khi hoan thanh.'),
    ('Cai dat moi truong', 'Huong dan cai dat cac cong cu can thiet de bat dau hoc.'),
    ('Kien thuc nen tang', 'Cac khai niem co ban can nam vung truoc khi di sau vao noi dung chinh.'),
    ('Thuc hanh co ban', 'Bai tap thuc hanh dau tien de lam quen voi cong cu va ky nang.'),
    ('Nang cao ky nang', 'Di sau vao cac tinh nang nang cao va ung dung thuc te.'),
    ('Du an thuc te', 'Xay dung du an thuc te ap dung kien thuc da hoc.'),
    ('Kiem tra va danh gia', 'Bai kiem tra cuoi khoa va huong dan nhan chung chi.'),
]

def create_lessons_for_course(course):
    """Tao lessons cho 1 khoa hoc dua tren skills."""
    existing = Lesson.objects.filter(course=course).count()
    if existing > 0:
        return 0

    skills = [s.strip() for s in (course.skills or '').split(',') if s.strip()][:5]
    lessons_data = list(BASE_LESSONS[:3])  # 3 bai dau co dinh

    # Them bai hoc theo skills
    for i, skill in enumerate(skills, 1):
        lessons_data.append((
            f'Hoc ve {skill}',
            f'Kien thuc va ky nang ve {skill}. Bai hoc nay se giup ban hieu ro va ap dung {skill} trong thuc te.'
        ))

    lessons_data.extend(BASE_LESSONS[-2:])  # 2 bai cuoi co dinh

    created = 0
    for order, (title, content) in enumerate(lessons_data, 1):
        Lesson.objects.create(
            course=course,
            title=title,
            order_number=order,
            content=content,
            video_url='',
            is_active=True,
        )
        created += 1

    return created


def main():
    courses = Course.objects.filter(is_active=True)
    total_courses = courses.count()
    print(f'Tong so khoa hoc: {total_courses}')

    total_created = 0
    for i, course in enumerate(courses, 1):
        n = create_lessons_for_course(course)
        if n > 0:
            print(f'[{i}/{total_courses}] {course.title[:50]} -> Tao {n} bai hoc')
            total_created += n

    print(f'\nHoan tat! Da tao {total_created} bai hoc moi.')
    print(f'Tong so bai hoc trong DB: {Lesson.objects.count()}')


if __name__ == '__main__':
    main()
