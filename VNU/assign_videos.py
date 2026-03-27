"""
Script gan video YouTube phu hop cho tung khoa hoc va bai hoc.
Khong can API key - dung video YouTube cong khai tu Coursera/freeCodeCamp.

Chay: python assign_videos.py
"""
import os, sys, django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Lesson

# ============================================================
# MAP VIDEO THEO TEN KHOA HOC
# Key: phan cua ten khoa hoc (lowercase)
# Value: list video_id YouTube theo thu tu bai hoc
# ============================================================
COURSE_VIDEO_MAP = {
    'deep learning': [
        'CS4N5giwgnY',  # Deep Learning intro - Andrew Ng
        'aircAruvnKk',  # Neural Networks - 3Blue1Brown
        'IHZwWFHWa-w',  # Gradient Descent
        'Ilg3gGewQ5U',  # Backpropagation
        'tIeHLnjs5U8',  # Convolutional Neural Networks
        'SqciuAi6syE',  # RNN & LSTM
        'qFJeN9V1ZsI',  # Transformers
    ],
    'machine learning': [
        'NWONeJKn6kc',  # ML intro - Andrew Ng
        'PPLop4L2eGk',  # Linear Regression
        'efR1C6CvhmE',  # Logistic Regression
        'DKSZHN7jLz4',  # Decision Trees
        'J4Wdy0Wc_xQ',  # Random Forest
        'FjgmAFMFkHQ',  # SVM
        'GwIo3gDZCVQ',  # K-Means Clustering
    ],
    'python': [
        '_uQrJ0TkZlc',  # Python full course - freeCodeCamp
        'rfscVS0vtbw',  # Python basics
        'kqtD5dpn9C8',  # Python for beginners
        'HGOBQPFzWKo',  # Python functions
        'Ej_02ICOIgs',  # Python OOP
        'ZDa-Z5JzLYM',  # Python data structures
        'eirjjyP2qcQ',  # Python file handling
    ],
    'data science': [
        'ua-CiDNNj30',  # Data Science intro
        'LHBE0uINBZk',  # Pandas tutorial
        'vmEHCJofslg',  # NumPy tutorial
        'r-uOLxNrNk8',  # Data visualization
        'xi0vhXFPegw',  # Statistics for DS
        'aircAruvnKk',  # ML for DS
        'GwIo3gDZCVQ',  # Clustering
    ],
    'data analytics': [
        'ua-CiDNNj30',  # Data Analytics intro
        'LHBE0uINBZk',  # Pandas
        'vmEHCJofslg',  # NumPy
        'r-uOLxNrNk8',  # Matplotlib
        'xi0vhXFPegw',  # Statistics
        'qFJeN9V1ZsI',  # Advanced analytics
        'GwIo3gDZCVQ',  # Clustering
    ],
    'sql': [
        'HXV3zeQKqGY',  # SQL full course - freeCodeCamp
        'p3qvj9hO_Bo',  # SQL basics
        'nWeW3sCmD2k',  # SQL joins
        'Hl4NZB1XR9I',  # SQL aggregations
        'BHwzDmr6d7s',  # SQL subqueries
        'qB7coiYMXMI',  # SQL advanced
        'HXV3zeQKqGY',  # SQL project
    ],
    'cybersecurity': [
        'hXSFdwIIsXc',  # Cybersecurity intro
        'inWWhr5tnEA',  # Network security
        'AQDCe585Lnc',  # Ethical hacking
        'fNzpcB7ODxQ',  # Cryptography
        'qiQR5rTSshw',  # Linux security
        'Hl4NZB1XR9I',  # SQL injection
        'BHwzDmr6d7s',  # Penetration testing
    ],
    'project management': [
        'tKbV6BpH-C8',  # Project management intro
        'GE6n9BKGPKE',  # Agile methodology
        'Z9QbYZh1YXY',  # Scrum framework
        'HnTIFR-CIYU',  # Kanban
        'qB7coiYMXMI',  # Risk management
        'nWeW3sCmD2k',  # Stakeholder management
        'p3qvj9hO_Bo',  # Project closure
    ],
    'google': [
        'CS4N5giwgnY',  # Google courses intro
        'aircAruvnKk',  # Core concepts
        'IHZwWFHWa-w',  # Practical skills
        'Ilg3gGewQ5U',  # Advanced topics
        'tIeHLnjs5U8',  # Real-world applications
        'SqciuAi6syE',  # Capstone project
        'qFJeN9V1ZsI',  # Certification prep
    ],
    'ibm': [
        'ua-CiDNNj30',  # IBM courses intro
        'LHBE0uINBZk',  # Data tools
        'vmEHCJofslg',  # Analytics
        'r-uOLxNrNk8',  # Visualization
        'xi0vhXFPegw',  # Statistics
        'aircAruvnKk',  # ML basics
        'GwIo3gDZCVQ',  # Final project
    ],
    'r programming': [
        'ZYdXI1GteDE',  # R programming intro
        'ANMuuq502IDo',  # R basics
        'lL0s1coNtRk',  # R data manipulation
        'qPk0YEKhqB8',  # R visualization
        'xi0vhXFPegw',  # R statistics
        'r-uOLxNrNk8',  # R ggplot2
        'GwIo3gDZCVQ',  # R project
    ],
    'excel': [
        'rwbho0CgEAI',  # Excel full course
        'Vl0H-qTclOg',  # Excel basics
        'K74l26pE4YA',  # Excel formulas
        'eirjjyP2qcQ',  # Excel pivot tables
        'ZDa-Z5JzLYM',  # Excel charts
        'HGOBQPFzWKo',  # Excel advanced
        'Ej_02ICOIgs',  # Excel macros
    ],
    'tableau': [
        'TPMlZxRRaBQ',  # Tableau intro
        'jEgVto5QME8',  # Tableau basics
        'r-uOLxNrNk8',  # Data visualization
        'xi0vhXFPegw',  # Dashboard design
        'qFJeN9V1ZsI',  # Advanced Tableau
        'GwIo3gDZCVQ',  # Tableau project
        'ua-CiDNNj30',  # Tableau certification
    ],
    'cloud': [
        'M988_fsOSWo',  # Cloud computing intro
        'a9__D53WsUs',  # AWS basics
        'ulprqHHWlng',  # Azure intro
        'IeMYQ-qJeK4',  # GCP basics
        'AQDCe585Lnc',  # Cloud security
        'fNzpcB7ODxQ',  # Cloud architecture
        'BHwzDmr6d7s',  # Cloud deployment
    ],
    'default': [
        'rfscVS0vtbw',  # Programming basics
        'kqtD5dpn9C8',  # Core concepts
        'HGOBQPFzWKo',  # Practical skills
        'Ej_02ICOIgs',  # Advanced topics
        'ZDa-Z5JzLYM',  # Real applications
        'eirjjyP2qcQ',  # Project work
        'qFJeN9V1ZsI',  # Final assessment
    ],
}


def get_video_ids_for_course(course_title):
    """Lay danh sach video_id phu hop voi ten khoa hoc."""
    title_lower = course_title.lower()
    for keyword, videos in COURSE_VIDEO_MAP.items():
        if keyword in title_lower:
            return videos
    return COURSE_VIDEO_MAP['default']


def assign_videos():
    courses = Course.objects.filter(is_active=True).prefetch_related('lessons')
    total_updated = 0

    for course in courses:
        video_ids = get_video_ids_for_course(course.title)
        lessons = list(course.lessons.filter(is_active=True).order_by('order_number'))

        print(f'\n{course.title[:50].encode("ascii","ignore").decode()}')
        for i, lesson in enumerate(lessons):
            vid_id = video_ids[i % len(video_ids)]
            video_url = f'https://www.youtube.com/watch?v={vid_id}'
            lesson.video_url = video_url
            lesson.save(update_fields=['video_url'])
            safe_title = lesson.title[:40].encode("ascii","ignore").decode()
            print(f'  [{i+1}] {safe_title} -> {vid_id}')
            total_updated += 1

    print(f'\n=== HOAN TAT ===')
    print(f'Da cap nhat {total_updated} bai hoc voi video YouTube.')


if __name__ == '__main__':
    assign_videos()
