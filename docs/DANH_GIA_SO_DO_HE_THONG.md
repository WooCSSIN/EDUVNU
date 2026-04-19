# BÁO CÁO ĐÁNH GIÁ SƠ ĐỒ LUỒNG HỆ THỐNG (UML) VÀ THỰC TẾ DỰ ÁN

Dựa trên việc đọc 2 file thiết kế `TMĐT_NHÓM 2.drawio.xml` (Các sơ đồ Use Case) và `activ.drawio.xml` (Các sơ đồ Activity), dưới đây là đánh giá sự đồng bộ so với hệ thống code thực tế (EduVNU) mà chúng ta đã xây dựng, cùng những để xuất chỉnh sửa lại trong Draw.io để bạn bảo vệ đồ án chuẩn xác 100%.

## 1. Đánh giá chung về sự đồng bộ (Đạt ~85%)
- **Các Actor (Tác nhân):** Khớp hoàn toàn. Hệ thống thực tế có Admin, Giáo viên (Instructor), Học viên (Student), Khách (Guest).
- **Luồng (Flow) tổng quan:** Các hoạt động Đăng ký, Đăng nhập, Xem khóa học, Thanh toán, Học bài, Tạo khóa học của giảng viên đều khớp với quy trình PM thực tế.
- **Phân tách quyền:** Vẽ đúng chức năng CRUD cho Giảng viên (tự tạo hệ sinh thái khóa học của mình) và Admin (giám sát toàn bộ).

---

## 2. Các điểm SAI LỆCH cần chỉnh sửa trong File Sơ Đồ (Draw.io)

### A. Đối với Sơ đồ Use Case (TMĐT_NHÓM 2.drawio)
**1. Use Case của Quyền Admin (Quản trị viên):**
- ❌ **Đang vẽ:** Admin quản lý Tin tức, Admin quản lý Q&A.
- 💡 **Chính sửa:** Xóa 2 Use Case "Quản lý tin tức" và "Quản lý Q&A". (Lý do: Hiện tại hệ thống không có trang viết báo cáo hay blog tin tức riêng. FAQ được đặt ở trang tĩnh, và Q&A chính là "phần bình luận / review" trong mục khóa học. Chúng ta không có module Tin tức trong code).

**2. Use Case của Quyền Giảng viên:**
- ❌ **Đang vẽ:** "CRUD thông tin thể loại của khóa học".
- 💡 **Chỉnh sửa:** Đổi tên hộp này thành "Chọn danh mục khóa học (Category)". (Lý do: Để đảm bảo cấu trúc dự án không bị loạn, Admin là người tạo ra các Thể loại (IT, Tiếng Anh, Kinh tế,...), giảng viên chỉ có quyền CHỌN thể loại khi tạo khóa học chứ không có quyền Thêm/Xóa thể loại của cả hệ thống).
- ❌ **Đang vẽ:** "Tạo danh sách câu hỏi cho mỗi bài tập từng bài giảng", "Xem danh sách bài tập".
- 💡 **Chỉnh sửa:** Đổi thành "Thêm học liệu (Video, File tài liệu)". (Lý do: Chúng ta xây dựng hệ thống E-learning thiên về Video Playback (tương tự Coursera/Udemy), tài nguyên chủ đạo là Video Youtube và File đính kèm, không có làm phần nộp file bài tập tự luận).

**3. Use Case của Học viên:**
- ❌ **Đang vẽ:** "Nộp bài tập của bài giảng trong khóa học".
- 💡 **Chỉnh sửa:** Đổi thành "Xem video và Đánh dấu hoàn thành bài học". (Lý do: Học viên tương tác bằng cách xem tài liệu/video tương ứng do giảng viên đăng tải).

### B. Đối với Sơ đồ Activity (activ.drawio)
**1. Activity - Học viên sử dụng PM (Học tập):**
- ❌ **Đang vẽ:** Hành động "Trả lời câu hỏi bài giảng".
- 💡 **Chỉnh sửa:** Thay Activity này thành "Tiến trình học liệu (Xem Video/Đọc File)" và "Xác nhận hoàn thành bài giảng (Complete)". 

**2. Activity - Mua khóa học / Thanh toán (Nếu có vẽ chi tiết):**
- ❌ **Đang vẽ (Nếu có):** Các cổng thanh toán MoMo, SePay.
- 💡 **Chỉnh sửa:** Chỉ giữ lại 3 cổng thanh toán đã chốt ở dự án cuối cùng: **VNPAY**, **Thẻ Tín Dụng (Stripe)**, và **Chuyển khoản QR**.

**3. Module EduVNU PLUS / Degree Programs (Cần bổ sung thêm vào hình - RẤT QUAN TRỌNG ĐỂ ĂN ĐIỂM!):**
- 💡 **Đề xuất vẽ thêm:** Hiện tại chúng ta có 1 điểm khác biệt cực lớn so với Udemy thường là "Bằng cấp trực tuyến (Degree Program)" và gói Đăng ký "EduVNU Plus". Hãy vẽ thêm vào sơ đồ Use Case cho Khách/Học viên một nhánh mang tên **"Khám phá Bằng cấp VNU (Degree) và Đăng ký EduVNU Plus"** để làm nổi bật USP này trong báo cáo (Bạn có thể kéo mũi tên từ Đăng ký Khóa học ra làm 2 đường: Đơn lẻ và Gói (EduVNU Plus)).

---

## 3. Tổng kết lời khuyên cho báo cáo tiểu luận
Khi thầy cô xem sơ đồ và đối chiếu với Demo thực tế, họ sẽ soi rất kĩ những chỗ **"Sơ đồ vẽ có mà Demo tìm không ra"**. Vì thế, nguyên tắc là:
1. Xóa các module chưa kịp code khỏi bản vẽ (như Blog Tin Tức, Quiz Trắc Nghiệm Tự Luận).
2. Tôn vinh các module độc đáo đã làm được (EduVNU Plus, Cấp chứng chỉ định dạng PDF có QR Code). 
3. Role nào làm việc Role đấy (Giảng viên cung cấp content, Admin cung cấp cấu trúc danh mục).

*Lưu ý: Các file Draw.io bạn nên tự mở trên `app.diagrams.net` và kéo thả lại text (click đúp vào khung chữ để sửa văn bản như hướng dẫn ở trên) rồi export lại file ảnh nhét vào báo cáo.*
