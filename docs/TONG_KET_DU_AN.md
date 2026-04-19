# BÁO CÁO RÀ SOÁT & TỔNG KẾT TOÀN BỘ QUÁ TRÌNH DỰ ÁN EDUVNU ĐẾN LÚC ĐÓNG GÓI CHUẨN BỊ BÁO CÁO

---

## 1. THÔNG TIN CHUNG VỀ SẢN PHẨM KHÓA LUẬN (EDUVNU)
- **Tên dự án:** EduVNU / EduHub (Nền tảng học trực tuyến dành riêng cho Khối Đại học Quốc Gia).
- **Tech Stack (Công nghệ làm nòng cốt):**
  - **Frontend:** React + Vite, Vanilla CSS (Thiết lập Rich Aesthetics, Premium UI không lệ thuộc vào các framework thư viện nhạt nhẽo).
  - **Backend:** Django Core + Django REST Framework (DRF) xử lý logic API, SQL Server (MSSQL) Database mạnh mẽ hướng doanh nghiệp.
- **Tình trạng môi trường:** Chạy Localhost qua `venv` + `npm run dev`. Kiến trúc Docker đã được gỡ bỏ hoàn toàn để giảm thiểu sai số khi thiết lập máy demo.

---

## 2. NHỮNG ĐIỂM KHÁC BIỆT CỐT LÕI (USP) SO VỚI UDEMY VÀ COURSERA
*Khi hội đồng đặt câu hỏi "Dự án của em có gì khác so với Udemy/Coursera trên thị trường?", bạn có thể tự tin bảo vệ bằng 3 điểm nhấn kỹ thuật sau đây:*

1. **Bản địa hóa 100% Cổng thanh toán Việt Nam (Không cần thẻ tín dụng nước ngoài):**
   - Udemy/Coursera bắt buộc sử dụng Visa/MasterCard hoặc PayPal. 
   - **EduVNU:** Cung cấp trải nghiệm **thanh toán bằng VNPAY, Chuyển khoản VietQR nội địa**, giúp sinh viên tiếp cận khóa học dễ dàng hơn nhiều. Thanh toán hoàn tất là tự động kích hoạt tài khoản học ngay, không cần xét duyệt tay.
2. **Hệ thống cấp Chứng nhận có mã QR định danh xác thực:**
   - Coursera cấp chứng chỉ PDF dạng link.
   - **EduVNU:** Tự động gen-ra (tạo ra) Chứng Chỉ Đẳng cấp dưới dạng hình ảnh, có dán kèm mã QR Code mang chữ ký của hệ thống để xác thực. Các nhà tuyển dụng chỉ cần đưa điện thoại vào quét QR là trả về Database của VNU báo "Đã xác thực chứng chỉ này của sinh viên X".
3. **Mô hình học Bằng Cấp (Degree Program) cho đối tác trường Đại học:**
   - Udemy chỉ bán khóa lẻ tẻ. Coursera bán khóa lẻ và liên kết trường, nhưng rất đắt đỏ.
   - **EduVNU:** Hỗ trợ tính năng ghép nhóm khóa học nhỏ lại thành "Degree Program" với UI/UX cao cấp mang tên gói "EduVNU PLUS". Phân hệ khóa học được tách bạch: Course (Khóa lẻ kỹ năng) và Degree Program (Chứng chỉ quy mô toàn khóa, có chuyên ngành và module).

---

## 3. TÓM TẮT CÁC LỖI CRITICAL ĐÃ FIX THÀNH CÔNG VÀ CHỐT ỔN ĐỊNH
Dự án đã trải qua nhiều phase fix bug cực kì phức tạp (đặc biệt liên quan tới database MSSQL). Dưới đây là các mốc đã hoàn thành:

- **Lỗi N+1 Query & MSSQL Distinct:** Đã khắc phục triệt để lỗi crash API khi thống kê danh sách Học viên Giảng viên (Group By / Exists logic). Chuyển hoàn toàn logic tính tổng từ vòng lặp `for` Python sang Aggregation SQL.
- **Khôi phục tính minh bạch API:** Refactor các cổng API trả khóa học (`/my_courses/`) nay trả rõ ràng cấu trúc dữ liệu `type: 'course'` và `type: 'degree'` phân minh ở Frontend.
- **Vấn đề Media Iframe:** Khắc phục triệt để lỗi "Video Unavailable" trên Localhost. Đã nhúng hệ thống mã code tự map với 20+ video FreeCodeCamp bản quyền sạch.
- **Trang Profile / Document (Giáo trình):** Phục hồi lại code React bị crash trang trắng, xử lý an toàn các Null values khi render UI người dùng.
- **Tính năng Đăng Ký / Phê duyệt:** Tự động gửi thông báo chuông tới Header khi Khóa học mới của giảng viên được Admin Approve (Duyệt) hoặc Reject (Từ chối).

---

## 4. QUÁ TRÌNH TỔNG VỆ SINH MÃ NGUỒN VÀ TÀI LIỆU
Trong bước cuối cùng trước khi đóng gói báo cáo, dự án đã được rà soát và làm sạch hoàn toàn sơ đồ tệp tin để đảm bảo độ chuẩn mực:
1. **Dẹp bỏ công nghệ dư thừa:** Xóa trắng các file khởi tạo môi trường cũ (`Dockerfile`, `docker-compose.yml`, `nginx.conf`). Định nghĩa lại luồng chạy là "Native Localhost".
2. **Dọn dẹp payment API chưa hoạt động:** Xóa code render rác và frontend route đối với các module thanh toán ảo (MoMo, SePay). Giữ lại luồng Stripe, VNPay tinh giản và hoạt động.
3. **Quét tệp kịch bản (Script Cleanup):** 
   - Di chuyển các file khởi tạo tài nguyên DB rác (như `seed_mock_lessons.py`, `seed_degrees.py`, `fix_all_videos.py`) gọn gàng vào mục `/backend/scripts/`.
4. **Docs (Tài liệu báo cáo):** 
   - Gom các Biểu đồ UML (Draw.io), file PDF Figma, các bảng phân tích API và Database SQL Export vào chung mục `/docs/`.

---

## 5. CÁC TÍNH NĂNG CỐT LÕI ĐÃ HOÀN THIỆN ĐỂ DEMO (KỊCH BẢN DEMO)

Bạn có thể mở đồ án test live các màn hình theo kịch bản này:
1. **Phân hệ Khách vãng lai:** Giao diện trang chủ (Mega Menu), Xem chi tiết một gói EduVNU Plus. UX Micro-animation vuốt cuộn mượt mà. Đăng ký & Đăng nhập (với forgot password email).
2. **Phân hệ Học viên:** Chọn 1 khóa mua -> Checkout VNPay/VietQR (ra QR code) -> My Courses -> Vào xem trang Document (Giáo trình Module Bằng cấp) -> Vào Learn Video (Nhấn nút Hoàn thành Bài).
3. **Phân hệ Giảng viên (Instructor):** Đăng nhập cổng GV -> Xem doanh thu (Dashboard) -> Course Management (Xóa thêm sửa Bài học/Khóa học học phí).
4. **Phân hệ Quản Trị Hệ Thống (Django Admin):** Vào bảng điều khiển quản lý Category, Duyệt khóa học từ `Draft` sang `Published`.

---
## KẾT LUẬN: ĐỦ ĐIỀU KIỆN ĐÓNG GÓI DEMO 100% 🚀
Dự án đã đủ hoàn thiện cho báo cáo Khoá luận. Database MSSQL hoạt động tốt, API DRF không lag, Frontend UX cao cấp. Không còn Error 404, không còn treo trang trắng, mã nguồn gọn màng sạch sẽ!
