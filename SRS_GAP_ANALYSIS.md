# SRS Gap Analysis - EduVNU Project (Cập nhật 13/04/2026)

Tài liệu này tổng hợp các điểm **sai lệch (Mismatch)** và **thiếu hụt (Missing)** của hệ thống EduVNU hiện tại so với đặc tả yêu cầu trong file `SRS Phát triển hệ thống E-learning.pdf`.

---

## 1. Các Module hoàn toàn thiếu hụt (Missing Modules)
Đây là các tính năng SRS yêu cầu nhưng mã nguồn hiện tại chưa triển khai:

*   **Module Tin tức (News):** SRS yêu cầu Admin quản lý tin tức hệ thống (Thêm/Sửa/Xóa). Hiện tại Backend chưa có App này.
*   **Module FAQ (Câu hỏi thường gặp):** SRS yêu cầu module giải đáp thắc mắc cho người dùng. Hiện tại chưa có.
*   **Hệ thống Bình luận bài giảng (Lesson Comments):** SRS yêu cầu hỗ trợ thảo luận trực tiếp dưới từng `Lesson`. Hiện tại chỉ có `Review` chung cho cả khóa học.
*   **Xác thực Email (Email Verification):** SRS yêu cầu tài khoản phải được xác thực để chuyển từ trạng thái `Locked` sang `Unlocked`. Hiện tại hệ thống cho phép dùng ngay sau khi Đăng ký.
*   **Tài liệu đính kèm (Attachments):** Thiếu khả năng tải lên và xem tài liệu (PDF, slides) cho từng bài học.

---

## 2. Sai lệch Logic nghiệp vụ (Logic Mismatches)

| Nghiệp vụ | Đặc tả SRS | Thực tế hiện tại |
|-----------|------------|-------------------|
| **Thời gian hiệu lực** | Khóa học có Start Date/End Date. Không hiện bài giảng nếu chưa đến ngày học. | Chỉ có ngày tạo. Học viên có thể xem toàn bộ bài giảng ngay sau khi mua. |
| **Đăng ký học** | Khóa học 0đ được ghi danh thẳng (Join Free). | Luôn phải qua quy trình `Checkout/Payment` bất kể giá tiền. |
| **Quản lý Thể loại** | Giảng viên có quyền quản lý và tạo Subject/Category do họ phụ trách. | Mặc định là Global (chỉ Admin quản lý), không có phân quyền cho GV. |
| **Tìm kiếm khóa học** | Filter theo: Khoảng giá, Khoảng ngày, Trạng thái (Public/Private/Null). | Chỉ filter đơn giản theo: Tiêu đề (Title) và Mô tả (Description). |
| **Trạng tài tài khoản** | Chặn đăng ký khóa học nếu tài khoản bị `Locked` (chưa verify hoặc bị Admin khóa). | Chưa kiểm tra trạng thái tài khoản khi gọi API Checkout/Enroll. |
| **Bài tập (Quiz)** | Cho phép "Lưu tạm" đáp án (Draft) để thực hiện tiếp sau. | Chỉ lưu điểm số cuối cùng, mất toàn bộ dữ liệu nếu trình duyệt bị đóng. |

---

## 3. Thiếu hụt về Cấu trúc dữ liệu (Model Gaps)

*   **Model User:** Thiếu các trường bắt buộc theo SRS trang 24: `birthday`, `phone`, `gender`. Thiếu trạng thái `is_email_verified`.
*   **Model Course:** Thiếu trường `start_date`, `end_date` và `visibility_status` (Private/Public).
*   **Model Lesson:** Thiếu trường `document_file` (FileField) và quan hệ với Model `Comment`.
*   **Model QuizAttempt:** Thiếu trường `current_progress` hoặc `draft_answers` (JSON) để lưu nháp.

---

## 4. Kế hoạch khắc phục đề xuất (Fixing Roadmap)

### Giai đoạn 1: Sửa lỗi Logic Cốt lõi & Dữ liệu
*   Thêm `birthday`, `phone`, `gender` vào Model User.
*   Tách biệt luồng `Join Free` (không qua Payment) cho khóa học 0đ.
*   Thêm Middleware hoặc Permission class để kiểm tra tài khoản `is_active/is_locked`.

### Giai đoạn 2: Quản lý tính thời điểm (Scheduling)
*   Bổ sung `start_date`, `end_date` cho Course.
*   Update API `LessonViewSet` để ẩn bài học nếu thời gian hiện tại nằm ngoài range cho phép.

### Giai đoạn 3: Tương tác & Content
*   Phát triển module `LessonComment` thay vì dùng chung với `Review`.
*   Nâng cấp Model `Lesson` hỗ trợ upload tài liệu PDF/Slide.
*   Triển khai ghi nhận `Draft` cho Quiz.

### Giai đoạn 4: Mở rộng quản trị (Dashboard)
*   Xây dựng App `News` và `FAQ`.
*   Cập nhật giao diện Giảng viên để quản lý `Subject/Category` theo phân quyền.

---
**Ghi chú:** Việc bám sát SRS không chỉ giúp hệ thống chạy đúng logic mà còn tăng tính chuyên nghiệp (Premium) của một nền tảng học tập thực thụ (LMS).
