# 🔧 Kế Hoạch Sửa Lỗi & Hoàn Thiện EduVNU — Phiên Tối 10/04/2026

> **Mục tiêu:** Fix 6 vấn đề xuyên suốt 3 vai trò: User, Giảng viên, Hệ thống Thông báo.

---

## Tổng quan 6 vấn đề cần xử lý

| # | Vấn đề | Phía | Mức độ | Nguyên nhân gốc (Sơ bộ) |
|---|--------|------|--------|--------------------------|
| 1 | Bảng "Quản lý Học viên" của giảng viên trống | Backend + Frontend | 🔴 Cao | API `my_students` đã có nhưng có thể bị lỗi MS SQL `distinct()` hoặc chưa có Enrollment data thực tế |
| 2 | "Khóa học của tôi" (Giảng viên) chưa hiện | Backend | 🔴 Cao | `InstructorCourseViewSet` lọc `instructor=request.user` — nếu khóa học gốc import từ dataset không có trường `instructor` thì sẽ trống |
| 3 | Cài đặt hồ sơ giảng viên không chỉnh sửa được | Frontend | 🟡 Trung bình | Các input thiếu `onChange` handler (3 ô: expertise, bio, bank fields) → React controlled input "đóng cứng" |
| 4 | Thông báo (User side) hoạt động thế nào | Frontend + Backend | 🟡 Trung bình | API `NotificationViewSet` đã sẵn sàng, cần kiểm tra xem Header Bell đã kết nối đúng chưa |
| 5 | Chỉnh sửa hồ sơ User → "Lưu thất bại" | Backend | 🔴 Cao | API `PATCH /accounts/users/me/` trả 4xx — có thể do `UserSerializer` thiếu writable fields hoặc validation lỗi |
| 6 | Lịch sử giao dịch User không hiển thị | Backend + Frontend | 🔴 Cao | API `/orders/` trả data nhưng Frontend không render — cần kiểm tra format response (paginated vs list) |

---

## Chi tiết từng Giai đoạn

### 🔵 Giai đoạn 1: Fix Backend API (Ưu tiên cao nhất)

#### Bug #5: User Profile → "Lưu thất bại"
- **File:** [accounts/views.py](file:///d:/Thương mại điện tử/backend/apps/accounts/views.py) + [accounts/serializers.py](file:///d:/Thương mại điện tử/backend/apps/accounts/serializers.py)
- **Nguyên nhân:** `UserSerializer` có `read_only_fields = ['is_student', 'is_instructor']` nhưng `fields` chỉ chứa `['id', 'username', ...]`. Khi Frontend gửi `PATCH` với `first_name`, `last_name`, `email` — **cần xác nhận serializer chấp nhận write cho các trường này**.
- **Fix:**
  1. Kiểm tra `UserSerializer` có cho phép `write` các trường `first_name`, `last_name`, `email` không
  2. Nếu `username` nằm trong `read_only_fields` → thêm vào
  3. Test: `PATCH /api/v1/accounts/users/me/` với body `{"first_name": "Test"}`

#### Bug #6: Lịch sử giao dịch trống
- **File:** [orders/serializers.py](file:///d:/Thương mại điện tử/backend/apps/orders/serializers.py) + [Orders.jsx](file:///d:/Thương mại điện tử/frontend/src/pages/Orders.jsx)
- **Nguyên nhân:** Frontend dùng `r.data.results || r.data || []` — nếu API trả paginated response (`{count, results: [...]}`) thì `results` có thể đúng, nhưng nếu `items` trong `OrderSerializer` không nested đúng thì `order.items` trả `undefined` → bảng rỗng dữ liệu.
- **Fix:**
  1. Kiểm tra API response `/api/v1/orders/` trả đúng cấu trúc `items` chưa
  2. Đảm bảo `OrderItemSerializer` trả được `course` có `title` (nested serializer)

#### Bug #1: Bảng học viên của giảng viên trống
- **File:** [courses/views.py:524-544](file:///d:/Thương mại điện tử/backend/apps/courses/views.py#L524-L544)
- **Nguyên nhân:** `my_students()` action lọc qua `Enrollment.objects.filter(course__in=my_courses)`. Nếu giảng viên không có khóa học (Bug #2) → tất nhiên `my_courses` trống → students cũng trống.
- **Fix:** Fix Bug #2 trước → Bug #1 tự khắc hết.

#### Bug #2: "Khóa học của tôi" giảng viên trống
- **File:** [courses/views.py:449-451](file:///d:/Thương mại điện tử/backend/apps/courses/views.py#L449-L451)
- **Nguyên nhân:** `Course.objects.filter(instructor=self.request.user)` — Nếu các khóa học trong database được import từ dataset gốc (Coursera) mà không có `instructor_id` hoặc `instructor_id` không khớp user đang login → trả về rỗng.
- **Fix:**
  1. Kiểm tra trong DB: `Course.objects.filter(instructor__isnull=False).count()` xem bao nhiêu khóa có giảng viên.
  2. Nếu cần, viết script hoặc Django command gán lại `instructor` cho các khóa học dựa trên `partner_name` (map partner → user account).

---

### 🟢 Giai đoạn 2: Fix Frontend UI

#### Bug #3: Cài đặt hồ sơ giảng viên không chỉnh sửa được
- **File:** [InstructorSettings.jsx](file:///d:/Thương mại điện tử/frontend/src/pages/InstructorSettings.jsx)
- **Nguyên nhân rõ ràng:** Dòng 55, 61, 75, 79, 83 — các `<input>` và `<textarea>` có `value={profile.xxx}` nhưng **KHÔNG có `onChange`** → React biến chúng thành controlled input chỉ đọc.
- **Fix:**
  1. Thêm `onChange` handler cho **TẤT CẢ** input: `expertise`, `bio`, `bankName`, `accountNumber`, `accountHolder`
  2. Kết nối `handleSave()` thực sự gọi API `PATCH /accounts/users/me/` hoặc API riêng cho instructor wallet

#### Bug #4: Thông báo phía User
- **File:** [App.jsx](file:///d:/Thương mại điện tử/frontend/src/App.jsx) — Component Bell đã tích hợp
- **Kiểm tra:**
  1. Icon 🔔 trong Header có fetch `/courses/notifications/` khi user logged in không
  2. Khi Admin approve/reject khóa học → `Notification.objects.create(...)` có trigger không
  3. Hiển thị badge số thông báo chưa đọc

---

### 🟠 Giai đoạn 3: Test & Xác nhận

1. **Test User Flow:** Đăng nhập user `aaa` → Profile → Sửa tên → Lưu → Kiểm tra "Lưu thành công"
2. **Test Orders Flow:** Đăng nhập user có đơn hàng → `/orders` → Kiểm tra danh sách hiện
3. **Test Instructor Flow:** Đăng nhập giảng viên → Khóa học hiện → Quản lý học viên hiện → Settings chỉnh sửa được
4. **Test Notification:** Admin duyệt khóa học → Giảng viên nhận thông báo 🔔

---

## Thứ tự thực thi (Tối ưu nhất)

```
Bug #5 (User Profile save) → Bug #3 (Instructor Settings UI)
        ↓
Bug #2 (Instructor Courses) → Bug #1 (Instructor Students) → Bug #4 (Notifications)
        ↓
Bug #6 (Orders History)
```

> [!IMPORTANT]
> Bug #2 là "gốc rễ" — nếu giảng viên không thấy khóa học của mình thì tất cả các chức năng phụ thuộc (Students, Analytics, Reviews) đều trống theo.

---

## File sẽ chỉnh sửa

| File | Loại sửa |
|------|----------|
| `backend/apps/accounts/serializers.py` | Thêm writable fields cho profile update |
| `backend/apps/accounts/views.py` | Kiểm tra/hoàn thiện `me()` endpoint |
| `frontend/src/pages/InstructorSettings.jsx` | Thêm `onChange` cho tất cả input + gọi API save |
| `frontend/src/pages/Orders.jsx` | Fix parse response data |
| `backend/apps/courses/views.py` | Kiểm tra `my_students` query |
| Có thể: Script gán instructor cho courses | Nếu DB thiếu mapping |
