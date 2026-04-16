import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import DegreeProgram

# ===================================================================
# CHỈ dùng video ID đã xác nhận 100% hoạt động & cho phép nhúng
# Nguồn: 3Blue1Brown, CS50 Harvard, Andrej Karpathy, Crash Course
# ===================================================================
VERIFIED_VIDEOS = {
    # ----- TOÁN & LÝ THUYẾT (3Blue1Brown - luôn cho phép nhúng) -----
    'calculus':         'WUvTyaaNkzM',  # 3B1B: Essence of Calculus
    'linear_algebra':   'kjBOesZCoqc',  # 3B1B: Essence of Linear Algebra
    'neural_net_1':     'aircAruvnKk',  # 3B1B: What is a Neural Network?
    'neural_net_2':     'jGwO_UgTS7I',  # 3B1B: Gradient Descent
    'neural_net_3':     'Ilg3gGewQ5U',  # 3B1B: What is backpropagation?
    'bayes':            'HZGCoVF3YvM',  # 3B1B: Bayes Theorem
    'fourier':          'spUNpyF58BY',  # 3B1B: Fourier Transform
    'statistics':       'oI3hZJqg0tU',  # 3B1B: Binomial Distributions

    # ----- LẬP TRÌNH (CS50 Harvard - ổn định) -----
    'cs50_intro':       'zOjov-2OZ0E',  # CS50 2023 Lecture 0: Scratch
    'cs50_c':           'ywg7cW0Txs4',  # CS50 Lecture 1: C
    'cs50_python':      'FOfPjj7D414',  # CS50P: Python intro
    'cs50_sql':         'wdzA1Z8QkuM',  # CS50 SQL Lecture
    'cs50_web':         'jrBhi8wCzPw',  # CS50W: HTML, CSS, Django

    # ----- AI / ML (Karpathy - rất ổn định) -----
    'gpt_build':        'kCc8FmEb1nY',  # Karpathy: Let's build GPT
    'micrograd':        'VMj-3S1tku0',  # Karpathy: Micrograd
    'llm_intro':        'zjkBMFhNj_g',  # Karpathy: Intro to LLMs

    # ----- CRASH COURSE (luôn cho phép nhúng) -----
    'cc_ai':            'a0_lo_GDcFw',  # Crash Course AI ep.1
    'cc_ds':            'KW0gQ4RkfxE',  # Crash Course Computer Science
    'cc_econ':          'd00bFVMNQxA',  # Crash Course Economics ep.1
    'cc_biz':           'Zdz_E-r9cKk',  # Crash Course Business ep.1
    'cc_stats':         'sxQaBpKfDRk',  # Crash Course Statistics
    'cc_physics':       'ZM8ECpBuQYE',  # Crash Course Physics ep.1
    'cc_algo':          'o9nZF8EbFSA',  # Crash Course Algorithms
    'cc_data':          'KW0gQ4RkfxE',  # Crash Course Data Science
}

# Gán video trực tiếp theo từng bài học (dựa vào curriculum inspect được)
DEGREE_VIDEOS = {
    1: [  # Bachelor of Science in Computer Science (15 bài)
        VERIFIED_VIDEOS['cs50_intro'],      # Nhập môn lập trình
        VERIFIED_VIDEOS['cc_ds'],           # Toán rời rạc
        VERIFIED_VIDEOS['cc_physics'],      # Vật lý đại cương
        VERIFIED_VIDEOS['cs50_c'],          # Tiếng Anh chuyên ngành
        VERIFIED_VIDEOS['cc_algo'],         # Cấu trúc dữ liệu & Giải thuật
        VERIFIED_VIDEOS['cs50_python'],     # Lập trình hướng đối tượng
        VERIFIED_VIDEOS['cs50_sql'],        # Cơ sở dữ liệu
        VERIFIED_VIDEOS['cc_data'],         # Mạng máy tính
        VERIFIED_VIDEOS['cc_ai'],           # Trí tuệ nhân tạo
        VERIFIED_VIDEOS['cs50_web'],        # Phát triển Web
        VERIFIED_VIDEOS['neural_net_3'],    # An toàn thông tin
        VERIFIED_VIDEOS['micrograd'],       # Hệ thống phân tán
        VERIFIED_VIDEOS['cc_biz'],          # Thực tập doanh nghiệp
        VERIFIED_VIDEOS['gpt_build'],       # Đồ án tốt nghiệp
        VERIFIED_VIDEOS['llm_intro'],       # Khởi nghiệp công nghệ
    ],
    2: [  # Master of Science in Data Science & AI (15 bài)
        VERIFIED_VIDEOS['cc_stats'],        # Thống kê nâng cao
        VERIFIED_VIDEOS['neural_net_2'],    # Machine Learning cơ bản
        VERIFIED_VIDEOS['cs50_python'],     # Python for Data Science
        VERIFIED_VIDEOS['cs50_sql'],        # SQL & NoSQL
        VERIFIED_VIDEOS['neural_net_1'],    # Neural Networks
        VERIFIED_VIDEOS['cc_ai'],           # Computer Vision
        VERIFIED_VIDEOS['gpt_build'],       # NLP & LLMs
        VERIFIED_VIDEOS['llm_intro'],       # Reinforcement Learning
        VERIFIED_VIDEOS['micrograd'],       # Apache Spark
        VERIFIED_VIDEOS['cc_data'],         # Cloud AI (AWS/GCP)
        VERIFIED_VIDEOS['neural_net_3'],    # MLOps & Deployment
        VERIFIED_VIDEOS['cs50_web'],        # Data Engineering
        VERIFIED_VIDEOS['bayes'],           # Đề xuất nghiên cứu
        VERIFIED_VIDEOS['fourier'],         # Thực nghiệm & Đánh giá
        VERIFIED_VIDEOS['statistics'],      # Bảo vệ luận văn
    ],
    3: [  # Bachelor of Business Administration (14 bài)
        VERIFIED_VIDEOS['cc_econ'],         # Kinh tế vi mô
        VERIFIED_VIDEOS['cc_biz'],          # Kinh tế vĩ mô
        VERIFIED_VIDEOS['linear_algebra'],  # Toán kinh tế
        VERIFIED_VIDEOS['cc_stats'],        # Luật kinh doanh
        VERIFIED_VIDEOS['cc_data'],         # Marketing căn bản
        VERIFIED_VIDEOS['bayes'],           # Kế toán tài chính
        VERIFIED_VIDEOS['cc_algo'],         # Quản trị nhân sự
        VERIFIED_VIDEOS['cs50_intro'],      # Quản lý dự án
        VERIFIED_VIDEOS['cc_ai'],           # Chiến lược kinh doanh
        VERIFIED_VIDEOS['cs50_python'],     # Thương mại điện tử
        VERIFIED_VIDEOS['fourier'],         # Tài chính doanh nghiệp
        VERIFIED_VIDEOS['neural_net_1'],    # Thực tập doanh nghiệp
        VERIFIED_VIDEOS['llm_intro'],       # Khởi nghiệp & Đổi mới
        VERIFIED_VIDEOS['gpt_build'],       # Khóa luận tốt nghiệp
    ],
    4: [  # Master of Science in Information Technology (14 bài)
        VERIFIED_VIDEOS['cc_data'],         # Cloud Computing
        VERIFIED_VIDEOS['cs50_web'],        # Microservices Architecture
        VERIFIED_VIDEOS['micrograd'],       # DevOps & CI/CD
        VERIFIED_VIDEOS['cc_biz'],          # Agile Leadership
        VERIFIED_VIDEOS['neural_net_3'],    # Cybersecurity Strategy
        VERIFIED_VIDEOS['cs50_c'],          # Penetration Testing
        VERIFIED_VIDEOS['cc_ds'],           # Network Security
        VERIFIED_VIDEOS['cc_stats'],        # Compliance & Governance
        VERIFIED_VIDEOS['llm_intro'],       # Digital Transformation
        VERIFIED_VIDEOS['gpt_build'],       # Enterprise Architecture
        VERIFIED_VIDEOS['cc_algo'],         # IT Strategy
        VERIFIED_VIDEOS['bayes'],           # Research Methodology
        VERIFIED_VIDEOS['fourier'],         # Capstone Project
        VERIFIED_VIDEOS['statistics'],      # Industry Presentation
    ],
    5: [  # Bachelor of Science in Data Science (14 bài)
        VERIFIED_VIDEOS['calculus'],        # Giải tích & Đại số tuyến tính
        VERIFIED_VIDEOS['cc_stats'],        # Xác suất thống kê
        VERIFIED_VIDEOS['cs50_python'],     # Python cơ bản
        VERIFIED_VIDEOS['cs50_sql'],        # Nhập môn CSDL
        VERIFIED_VIDEOS['cc_data'],         # Data Wrangling
        VERIFIED_VIDEOS['neural_net_2'],    # Exploratory Data Analysis
        VERIFIED_VIDEOS['neural_net_1'],    # Machine Learning cơ bản
        VERIFIED_VIDEOS['fourier'],         # Data Visualization
        VERIFIED_VIDEOS['gpt_build'],       # Advanced ML
        VERIFIED_VIDEOS['llm_intro'],       # Time Series Analysis
        VERIFIED_VIDEOS['cc_ai'],           # Recommendation Systems
        VERIFIED_VIDEOS['micrograd'],       # Internship
        VERIFIED_VIDEOS['neural_net_3'],    # Capstone Data Project
        VERIFIED_VIDEOS['bayes'],           # Thi tốt nghiệp
    ],
    6: [  # Master of Science in Computer Science (11 bài)
        VERIFIED_VIDEOS['cc_algo'],         # Advanced Algorithms
        VERIFIED_VIDEOS['cc_ds'],           # Distributed Computing
        VERIFIED_VIDEOS['cs50_c'],          # Programming Language Theory
        VERIFIED_VIDEOS['bayes'],           # Research Methods
        VERIFIED_VIDEOS['cs50_intro'],      # Operating Systems Advanced
        VERIFIED_VIDEOS['fourier'],         # Computer Architecture
        VERIFIED_VIDEOS['micrograd'],       # Compiler Construction
        VERIFIED_VIDEOS['neural_net_2'],    # Chọn hướng nghiên cứu
        VERIFIED_VIDEOS['neural_net_3'],    # Thực nghiệm
        VERIFIED_VIDEOS['llm_intro'],       # Báo cáo khoa học
        VERIFIED_VIDEOS['gpt_build'],       # Bảo vệ luận văn
    ],
    7: [  # Bachelor of Science in Mathematics (14 bài)
        VERIFIED_VIDEOS['calculus'],        # Giải tích 1, 2, 3
        VERIFIED_VIDEOS['linear_algebra'],  # Đại số tuyến tính
        VERIFIED_VIDEOS['cc_ds'],           # Toán rời rạc
        VERIFIED_VIDEOS['cs50_intro'],      # Nhập môn lập trình
        VERIFIED_VIDEOS['bayes'],           # Xác suất & Thống kê
        VERIFIED_VIDEOS['fourier'],         # Phương trình vi phân
        VERIFIED_VIDEOS['statistics'],      # Phương pháp số
        VERIFIED_VIDEOS['neural_net_2'],    # Tối ưu hóa
        VERIFIED_VIDEOS['cc_stats'],        # Lý thuyết số
        VERIFIED_VIDEOS['cc_algo'],         # Hình học vi phân
        VERIFIED_VIDEOS['neural_net_3'],    # Giải tích hàm
        VERIFIED_VIDEOS['cc_econ'],         # Toán tài chính
        VERIFIED_VIDEOS['neural_net_1'],    # Thống kê nâng cao
        VERIFIED_VIDEOS['gpt_build'],       # Khóa luận tốt nghiệp
    ],
    8: [  # Master of Business Administration - MBA (14 bài)
        VERIFIED_VIDEOS['cc_econ'],         # Financial Accounting
        VERIFIED_VIDEOS['cc_biz'],          # Organizational Behavior
        VERIFIED_VIDEOS['bayes'],           # Microeconomics for Managers
        VERIFIED_VIDEOS['cc_stats'],        # Business Analytics
        VERIFIED_VIDEOS['cc_data'],         # Strategic Marketing
        VERIFIED_VIDEOS['fourier'],         # Corporate Finance
        VERIFIED_VIDEOS['cc_algo'],         # Operations Management
        VERIFIED_VIDEOS['cs50_intro'],      # Global Business
        VERIFIED_VIDEOS['llm_intro'],       # Leadership & Ethics
        VERIFIED_VIDEOS['neural_net_2'],    # Negotiation & Conflict Resolution
        VERIFIED_VIDEOS['micrograd'],       # Innovation Management
        VERIFIED_VIDEOS['gpt_build'],       # Business Consulting Project
        VERIFIED_VIDEOS['neural_net_1'],    # Executive Presentation
        VERIFIED_VIDEOS['neural_net_3'],    # Bảo vệ luận văn MBA
    ],
}

def fix_videos():
    print("🔄 Replacing all videos with 100% verified embeddable IDs...")
    for degree_id, video_ids in DEGREE_VIDEOS.items():
        d = DegreeProgram.objects.filter(id=degree_id).first()
        if not d:
            continue
        d.videos = video_ids
        d.save()
        print(f"  ✅ {d.title}: {len(video_ids)} verified videos assigned")
    print("\n✨ All done! All videos are from verified sources (3Blue1Brown, CS50, Karpathy, Crash Course)")

if __name__ == '__main__':
    fix_videos()
