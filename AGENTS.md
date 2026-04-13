# AGENTS.md

Project: EduVNU / EduHub
Tech stack: React (Vite), Django REST API, MS SQL Server, Vanilla CSS
Package manager: npm / pip 

## Mô tả project
- Tên: EduVNU / EduHub
- Mô tả: Nền tảng học trực tuyến dành cho sinh viên VNU
- Người dùng: sinh viên, giảng viên
- Tính năng cốt lõi: xem khóa học, đăng ký, thanh toán, theo dõi tiến độ

## Design System
- Primary color: #0056d2
- Font: Inter
- Border radius: 4px
- Không dùng inline style, luôn dùng CSS class
- Mọi animation phải smooth, dùng transition/ease-in-out

## API Convention
- Base URL: /api/v1/
- Auth: JWT Bearer token
- Gọi API qua axios, không dùng fetch trực tiếp
- Xử lý lỗi: luôn có try/catch và hiển thị error message cho user

# Tech stack & lệnh
**Frontend (React/Vite):**
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

**Backend (Django):**
- Dev: Chạy qua Docker hoặc `python manage.py runserver`
- Database: `python manage.py makemigrations` và `python manage.py migrate`

# Cấu trúc thư mục
frontend/
  src/
    pages/      → React pages (các trang giao diện chính)
    components/ → Shared components (tái sử dụng)
    assets/     → Assets và Vanilla CSS
VNU/
  apps/         → Các app logic của Django (courses, orders,...)
  core/         → Cấu hình chính của project

# Code style
- Frontend: JavaScript (React), ưu tiên dùng Vanilla CSS để dễ tinh chỉnh (không dùng Tailwind trừ khi yêu cầu cụ thể).
- Giao diện (UI/UX): Bắt buộc hướng tới Rich Aesthetics, Premium UI (kết hợp micro-animations, glassmorphism). Không làm giao diện kiểu "cho có" (MVP).
- Naming convention: Component dùng `PascalCase`, file dùng `kebab-case`.
- HTML/SEO: Dùng semantic HTML5, chỉ 1 thẻ `<h1>` duy nhất mỗi trang học.

# Workflow của tôi
1. Tạo spec/plan trước khi code
2. Làm từng feature nhỏ, test xong mới sang cái khác
3. Commit sau mỗi feature hoàn chỉnh

# AI KHÔNG được làm
- Không tự xóa file có sẵn
- Không sửa test để pass thay vì fix bug
- Không cài thêm package khi chưa hỏi
- Không tự thay đổi màu sắc hoặc design đã có
- Không dùng Tailwind, Bootstrap, hay UI library trừ khi được yêu cầu
- Không chia nhỏ component khi chưa được yêu cầu refactor
- Không tự động tạo mock data nếu đã có API thật

# Tình trạng dự án & Thành tựu (Cập nhật 13/04/2026)
- **✅ Đã Fix 6/6 Bug chính trong bugfix_plan.md**: 
  1. Bảng học viên giảng viên: Đã tối ưu SQL Aggregate/Prefetch để vượt lỗi MSSQL.
  2. Khóa học của giảng viên: Đã map instructor cho các khóa học mock.
  3. Cài đặt hồ sơ: Đã fix React Controlled Inputs và API Patch.
  4. Hệ thống thông báo: Tích hợp Bell Header và tự động gửi thông báo duyệt khóa học.
  5. Profile User: Fix Serializer writable fields (first_name, last_name, etc).
  6. Lịch sử giao dịch: Fix rendering cho cả paginated và list response.
- **✅ Tối ưu Backend**: Triển khai heartbeat buffer lưu thời gian học vào RAM trước khi flush vào DB.
- **✅ Content Automation**: Hoàn thiện script `seed_mock_lessons.py` mapping YouTube video chất lượng cao.

# Technical Gotchas & Lưu ý (Quan trọng nhất)
- **Cơ sở dữ liệu MS SQL Server**: Hệ quản trị này cực kỳ nhạy cảm với `.distinct()` + JOIN. 
  * *Giải pháp*: Dùng `Exists()` subquery cho filter và `aggregate()` cho statistics. Tránh loop Python nếu có thể xử lý ở SQL. 
- **Optimization pattern**: Khi lấy danh sách học viên hoặc analytics, hãy tính toán tổng hợp tại SQL. Luôn sử dụng `select_related` và `prefetch_related` để giảm N+1 queries.
- **Giao diện Spline 3D**: Ẩn watermark Spline bằng `overflow: hidden` ở div cha và `height: calc(100% + 80px)` ở iframe.
- **Mẹo thu phóng logo**: Dùng CSS `transform: scale(...)` để xử lý ảnh logo có nhiều khoảng trắng mà không hỏng layout.
- **Quản lý Video Khóa học (YouTube)**: Dùng script `seed_mock_lessons.py` để map videoID. Tuyệt đối không gọi YouTube API trực tiếp phí quota.
- **Luồng Xóa Giỏ Hàng**: Chỉ xóa cart khi có xác nhận thành công thanh toán (`status='paid'`). Không xóa ở bước khởi tạo đơn hàng.
- **Notification Flow**: Mọi hành động quan trọng (Approved, Rejected, Paid) đều phải lưu vào model `Notification`.
