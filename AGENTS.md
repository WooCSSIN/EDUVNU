# AGENTS.md

Project: EduVNU / EduHub
Tech stack: React (Vite), Django REST API, MS SQL Server, Vanilla CSS
Package manager: npm / pip (kết hợp Docker)

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
