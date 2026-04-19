# BÁO CÁO TIẾN ĐỘ DỰ ÁN EDUVNU - 15/4/2026

## ✅ Các lỗi đã sửa
1.  **Ghi danh thất bại**: Sửa lỗi Database SQL Server từ chối lệnh `INSERT` vào bảng `Enrollment` do thiếu giá trị mặc định cho ngày ghi danh. (Đã thêm `DF_enrolled_at`).
2.  **Checkout ảo**: Loại bỏ phần giả lập (mock) trong `Checkout.jsx`, thay bằng lệnh gọi API thật để ghi danh Bằng cấp vào Database.
3.  **Lỗi bảng hệ thống SQL**: Bổ sung các bảng `django_session`, `auth_group`, `django_admin_log m` và các index bị thiếu để Django Admin hoạt động ổn định.

## 🚀 Tính năng mới nâng cấp
1.  **Ghi danh Bằng cấp (Degrees)**: Cho phép người dùng đăng ký học các tấm bằng đại học (Bachelor/Master) và lưu trực tiếp vào bảng `Enrollment`.
2.  **Bản đồ học tập (Learning Map)**:
    *   Hiển thị đồng thời cả Khóa học (Course) và Bằng cấp (Degree).
    *   Tự động nhận diện và tính toán phần trăm hoàn thành riêng cho từng loại.
3.  **Checklist Tiến độ Bằng cấp**:
    *   Hệ thống cho phép người dùng tích chọn (checkbox) từng bài học trong danh sách JSON của Bằng cấp.
    *   Dữ liệu được lưu vào cột `progress_data` (JSON) trong Database để đảm bảo F5 không bị mất.

## 🛠 Thông tin kỹ thuật cho lập trình viên
*   **Database**: Bảng `courses_enrollment` hiện có thêm 2 cột mới là `degree_program_id` và `progress_data`. Cột `course_id` hiện tại là Optional (cho phép NULL).
*   **API mới**:
    *   `POST /api/v1/courses/courses/register_degree/`: Đăng ký bằng cấp.
    *   `POST /api/v1/courses/courses/update_degree_progress/`: Lưu bài học đã hoàn thành.

---
*Tài liệu này được tạo tự động để lưu trữ kiến thức cho các phiên làm việc tiếp theo.*
