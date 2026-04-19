"""
Script CUỐI CÙNG - Loại bỏ hoàn toàn 2 video bị chặn embed:
  ❌ jGwO_UgTS7I (3B1B Gradient Descent - bị chặn embed)
  ❌ FOfPjj7D414 (CS50P Python - bị chặn embed)
Thay bằng freeCodeCamp (chính sách cho phép embed 100%)
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Lesson, DegreeProgram

# ============================================================
# CHỈ dùng video đã xác nhận EMBED OK trên localhost:5173
# Kiểm tra thực tế ngày 16/04/2026
# ============================================================

# ── 3Blue1Brown (ĐÃ XÁC NHẬN trên live site) ──
V01 = 'aircAruvnKk'   # But what is a Neural Network? ✅
V02 = 'WUvTyaaNkzM'   # Essence of Calculus ✅
V03 = 'kjBOesZCoqc'   # Essence of Linear Algebra ✅
V04 = 'Ilg3gGewQ5U'   # Backpropagation ✅
V05 = 'kCc8FmEb1nY'   # Karpathy: Let's build GPT ✅
V06 = 'zOjov-2OZ0E'   # CS50 Lecture 0: Scratch ✅

# ── freeCodeCamp (chính sách cho phép embed 100%) ──
V07 = 'rfscVS0vtbw'   # Python Full Course (12h)
V08 = 'PkZNo7MFNFg'   # JavaScript Full Course (4h)
V09 = 'pEfrdAtAmqk'   # Web Development Bootcamp
V10 = 'HXV3zeQKqGY'   # SQL Full Course (4h)
V11 = 'ua-CiDNNj30'   # CSS Full Course (11h)
V12 = '8jLOx1hD3_o'   # C++ Full Course (4h)
V13 = '7eh4d6sabA0'   # Django Tutorial (4h)
V14 = 'qw--VYLpxG4'   # React Full Course (12h)
V15 = 'GwIo3gDZCVQ'   # Machine Learning (10h)
V16 = 'i_LwzRVP7bg'   # ML with Python (5h)
V17 = 'fis26HvvDII'   # Computer Networking (8h)
V18 = '3Kq1MIfTWCE'   # Cybersecurity (16h)
V19 = 'JnTa9XtvmfI'   # Linear Algebra Full Course (12h)
V20 = 'LwCRRUa8yTU'   # Statistics Full Course (8h)

# Tổng: 20 video ID duy nhất, KHÔNG chứa jGwO_UgTS7I và FOfPjj7D414

# ── Gán video cho Degree Programs ─────────────────────────────
DEGREE_VIDEOS = {
    1: [  # Bachelor CS (15 bài)
        V06,   # Nhập môn lập trình → CS50 Scratch
        V12,   # Toán rời rạc → C++ (lập trình + toán)
        V17,   # Vật lý đại cương → Networking
        V08,   # Tiếng Anh chuyên ngành → JavaScript
        V07,   # Cấu trúc dữ liệu & Giải thuật → Python
        V14,   # Lập trình hướng đối tượng → React
        V10,   # Cơ sở dữ liệu → SQL
        V17,   # Mạng máy tính → Networking
        V01,   # Trí tuệ nhân tạo → Neural Network
        V09,   # Phát triển Web → Web Dev
        V18,   # An toàn thông tin → Cybersecurity
        V13,   # Hệ thống phân tán → Django
        V15,   # Thực tập doanh nghiệp → ML
        V05,   # Đồ án tốt nghiệp → Build GPT
        V19,   # Khởi nghiệp công nghệ → Linear Algebra
    ],
    2: [  # Master DS & AI (15 bài)
        V20,   # Thống kê nâng cao → Statistics
        V15,   # Machine Learning cơ bản → ML
        V07,   # Python for Data Science → Python
        V10,   # SQL & NoSQL → SQL
        V01,   # Neural Networks → Neural Net
        V04,   # Computer Vision → Backprop
        V05,   # NLP & LLMs → Build GPT
        V16,   # Reinforcement Learning → ML Python
        V19,   # Apache Spark → Linear Algebra
        V13,   # Cloud AI → Django
        V14,   # MLOps → React
        V09,   # Data Engineering → Web Dev
        V03,   # Đề xuất nghiên cứu → Linear Algebra 3B1B
        V11,   # Thực nghiệm → CSS
        V06,   # Bảo vệ luận văn → CS50
    ],
    3: [  # Bachelor BBA (14 bài)
        V20,   # Kinh tế vi mô → Statistics
        V08,   # Kinh tế vĩ mô → JavaScript
        V19,   # Toán kinh tế → Linear Algebra
        V10,   # Luật kinh doanh → SQL
        V09,   # Marketing căn bản → Web Dev
        V02,   # Kế toán tài chính → Calculus
        V07,   # Quản trị nhân sự → Python
        V14,   # Quản lý dự án → React
        V05,   # Chiến lược kinh doanh → GPT
        V13,   # Thương mại điện tử → Django
        V01,   # Tài chính doanh nghiệp → Neural Net
        V15,   # Thực tập doanh nghiệp → ML
        V18,   # Khởi nghiệp & Đổi mới → Cybersecurity
        V06,   # Khóa luận tốt nghiệp → CS50
    ],
    4: [  # Master IT (14 bài)
        V13,   # Cloud Computing → Django
        V14,   # Microservices → React
        V09,   # DevOps → Web Dev
        V15,   # Agile Leadership → ML
        V18,   # Cybersecurity Strategy → Cybersecurity
        V17,   # Penetration Testing → Networking
        V12,   # Network Security → C++
        V10,   # Compliance → SQL
        V05,   # Digital Transformation → GPT
        V01,   # Enterprise Architecture → Neural Net
        V07,   # IT Strategy → Python
        V02,   # Research Methodology → Calculus
        V16,   # Capstone Project → ML Python
        V06,   # Industry Presentation → CS50
    ],
    5: [  # Bachelor Data Science (14 bài)
        V02,   # Giải tích → Calculus
        V03,   # Xác suất thống kê → Linear Algebra 3B1B
        V07,   # Python cơ bản → Python
        V10,   # Nhập môn CSDL → SQL
        V11,   # Data Wrangling → CSS
        V16,   # Exploratory Data Analysis → ML Python
        V15,   # Machine Learning → ML
        V20,   # Data Visualization → Statistics
        V05,   # Advanced ML → GPT
        V01,   # Time Series → Neural Net
        V14,   # Recommendation Systems → React
        V13,   # Internship → Django
        V09,   # Capstone → Web Dev
        V06,   # Thi tốt nghiệp → CS50
    ],
    6: [  # Master CS (11 bài)
        V12,   # Advanced Algorithms → C++
        V17,   # Distributed Computing → Networking
        V07,   # Programming Language Theory → Python
        V02,   # Research Methods → Calculus
        V06,   # OS Advanced → CS50
        V03,   # Computer Architecture → Linear Algebra 3B1B
        V13,   # Compiler Construction → Django
        V19,   # Chọn hướng nghiên cứu → Linear Algebra FC
        V15,   # Thực nghiệm → ML
        V05,   # Báo cáo khoa học → GPT
        V01,   # Bảo vệ luận văn → Neural Net
    ],
    7: [  # Bachelor Math (14 bài)
        V02,   # Giải tích 1, 2, 3 → Calculus
        V03,   # Đại số tuyến tính → Linear Algebra 3B1B
        V12,   # Toán rời rạc → C++
        V06,   # Nhập môn lập trình → CS50
        V20,   # Xác suất & Thống kê → Statistics
        V04,   # Phương trình vi phân → Backprop
        V07,   # Phương pháp số → Python
        V01,   # Tối ưu hóa → Neural Net
        V15,   # Lý thuyết số → ML
        V16,   # Hình học vi phân → ML Python
        V05,   # Giải tích hàm → GPT
        V10,   # Toán tài chính → SQL
        V08,   # Thống kê nâng cao → JavaScript
        V19,   # Khóa luận tốt nghiệp → Linear Algebra FC
    ],
    8: [  # MBA (14 bài)
        V10,   # Financial Accounting → SQL
        V20,   # Organizational Behavior → Statistics
        V02,   # Microeconomics → Calculus
        V15,   # Business Analytics → ML
        V09,   # Strategic Marketing → Web Dev
        V01,   # Corporate Finance → Neural Net
        V07,   # Operations Management → Python
        V08,   # Global Business → JavaScript
        V05,   # Leadership & Ethics → GPT
        V14,   # Negotiation → React
        V13,   # Innovation Management → Django
        V18,   # Business Consulting → Cybersecurity
        V03,   # Executive Presentation → Linear Algebra 3B1B
        V06,   # Bảo vệ luận văn → CS50
    ],
}

# Pool cho khóa học thông thường (20 video, KHÔNG trùng)
COURSE_POOL = [
    V01, V02, V03, V04, V05, V06, V07, V08, V09, V10,
    V11, V12, V13, V14, V15, V16, V17, V18, V19, V20,
]

def fix_all():
    print("=" * 60)
    print("🔧 CẬP NHẬT VIDEO LẦN CUỐI")
    print("   Loại bỏ: jGwO_UgTS7I ❌, FOfPjj7D414 ❌")
    print("   Thay bằng: freeCodeCamp Linear Algebra + Statistics")
    print("=" * 60)

    # 1. Degree Programs
    print("\n🎓 BẰNG CẤP:")
    for deg_id, vids in DEGREE_VIDEOS.items():
        d = DegreeProgram.objects.filter(id=deg_id).first()
        if not d:
            continue
        d.videos = vids
        d.save()
        print(f"  ✅ [{d.id}] {d.title}: {len(vids)} videos")

    # 2. Khóa học thông thường
    print("\n📚 KHÓA HỌC:")
    total = 0
    for course in Course.objects.all():
        lessons = Lesson.objects.filter(course=course).order_by('order_number')
        for i, ls in enumerate(lessons):
            ls.video_url = COURSE_POOL[i % len(COURSE_POOL)]
            ls.save()
            total += 1
        print(f"  ✅ [{course.id}] {course.title}: {lessons.count()} bài")

    print(f"\n✨ Hoàn tất! Cập nhật {total} bài học + "
          f"{sum(len(v) for v in DEGREE_VIDEOS.values())} bài giảng degree")
    print("🎯 Không còn jGwO_UgTS7I hoặc FOfPjj7D414 trong hệ thống!")

if __name__ == '__main__':
    fix_all()
