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
- **Quản lý Video Khóa học (YouTube)**: Dùng script `fix_all_videos_final.py` với 20 video ID đã xác nhận embed OK. Loại bỏ hoàn toàn `jGwO_UgTS7I` và `FOfPjj7D414` (bị chặn embed). Ưu tiên freeCodeCamp (chính sách cho phép embed 100%).
- **Luồng Xóa Giỏ Hàng**: Chỉ xóa cart khi có xác nhận thành công thanh toán (`status='paid'`). Không xóa ở bước khởi tạo đơn hàng.
- **Notification Flow**: Mọi hành động quan trọng (Approved, Rejected, Paid) đều phải lưu vào model `Notification`.
- **API my_courses trả cả Course + Degree**: API `/courses/courses/my_courses/` giờ trả `type: 'course'` hoặc `type: 'degree'` để frontend phân biệt. Không dùng `EnrollmentSerializer` nữa, trả JSON thủ công.

# Nhật ký phát triển

## 📅 Ngày 16/04/2026 — Sửa Video, Profile & Giáo trình

### 🎬 Sửa lỗi Video Embed (Degree + Course)
- **Vấn đề**: Nhiều video trên trang học hiện "Video không có sẵn" do YouTube chặn embed trên localhost.
- **Nguyên nhân gốc**: 2 video ID bị chủ sở hữu tắt embed:
  - `jGwO_UgTS7I` (3Blue1Brown Gradient Descent) ❌
  - `FOfPjj7D414` (CS50P Harvard) ❌
- **Giải pháp**: 
  - Loại bỏ hoàn toàn 2 ID trên khỏi hệ thống.
  - Thay bằng **20 video ID đã xác nhận embed OK** (freeCodeCamp + 3Blue1Brown + CS50 + Karpathy).
  - Script: `backend/fix_all_videos_final.py` — cập nhật 66 bài học + 111 bài giảng degree.
- **File thay đổi**: 
  - `backend/fix_all_videos_final.py` — script gán video cuối cùng
  - `frontend/src/pages/Learn.jsx` — khôi phục iframe embed (từ bỏ phương án redirect YouTube)

### 👤 Sửa lỗi trang Hồ sơ (Profile)
- **Bug 1 — Màn hình trắng**: `user.username[0]` crash khi username undefined → sửa `(user.username || 'U')[0]`
- **Bug 2 — Họ tên không cập nhật**: Sau khi save, `user` trong AuthContext không refresh → thêm `refreshUser()` vào AuthContext, gọi sau `api.patch()`.
- **Bug 3 — "Khóa học" thay vì tên thật**: API `my_courses` trả degree enrollment có `course: null` → sửa API trả `type: 'degree'` kèm `degree.title`.
- **Bug 4 — 404 khi bấm khóa học**: Navigate dùng sai ID → dùng `course.id` cho course, `deg_${id}` cho degree.
- **File thay đổi**:
  - `frontend/src/context/AuthContext.jsx` — thêm `refreshUser()`
  - `frontend/src/pages/Profile.jsx` — sửa crash + cập nhật name + enrollment display
  - `backend/apps/courses/views.py` — sửa API `my_courses` trả cả course + degree

### 📚 Xây dựng lại trang Giáo trình (Documents)
- **Trước**: Trang Tài liệu đơn giản, CSS bị vỡ layout, crash khi gặp degree enrollment.
- **Sau**: Trang Giáo trình hoàn chỉnh với:
  - Sidebar trái: danh sách khóa học (xanh) + bằng cấp (tím), sticky, hover effect
  - Main phải: header + "Học ngay →", nội dung giáo trình nhóm theo Module (degree) hoặc danh sách bài (course)
  - Inline styles đầy đủ, không phụ thuộc CSS ngoài
- **File thay đổi**: `frontend/src/pages/Documents.jsx` — viết lại hoàn toàn

