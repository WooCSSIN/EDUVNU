# 🌐 EduVNU Frontend — Cấu Trúc Chi Tiết

## 📋 Tóm Tắt Tổng Quát
- **Tech Stack**: React 19 (Vite) + React Router v7 + Axios + Vanilla CSS
- **Deps Chính**: `@stripe/react-stripe-js`, `axios`, `react-router-dom`
- **Entry Point**: `main.jsx` → `App.jsx` → `AuthProvider`
- **Routing**: BrowserRouter + dynamic imports
- **API Base**: `http://127.0.0.1:8000/api/v1` (JWT Bearer Token Auth)
- **Design System**: Coursera-inspired (Primary: #0056D2, Font: Inter, Radius: 4px-8px)

---

## 🗂️ Cấu Trúc Thư Mục

```
frontend/src/
├── pages/              ← Main pages (34 JSX files)
├── components/         ← Reusable components (InstructorSidebar, LoadingUI)
├── context/            ← AuthContext (Auth state management)
├── api/                ← axios.js (API client + interceptors)
├── hooks/              ← usePageSEO (SEO meta tags)
├── utils/              ← fixEncoding.js, courseImages.js
├── assets/             ← CSS files (instructor-dashboard.css)
├── App.jsx             ← Main app routing + Header
├── index.css           ← Global styles
└── main.jsx            ← Entry point
```

---

## 📄 Danh Sách Tất Cả Pages (34 files)

### **1. Student Flows**
| Page | File | Purpose | API Calls |
|------|------|---------|-----------|
| Home / Browse | `Home.jsx` | Course discovery, search, filter | `GET /courses/categories/`, `/courses/courses/` |
| Course Detail | `CourseDetail.jsx` | View course info, chapters, reviews, enroll | `GET /courses/courses/{id}`, `/progress/my_progress/`, `POST /cart/add_item/` |
| Cart | `Cart.jsx` | View & manage cart, history orders | `GET /cart/my_cart/`, `/orders/`, `DELETE /cart/remove_item/` |
| Checkout | `Checkout.jsx` | Payment gateway selection (VNPAY, MoMo, Stripe, SePay) | `POST /orders/checkout/` |
| Payment Return | `PaymentReturn.jsx` | Handle payment callbacks (VNPAY, MoMo) | `GET /orders/vnpay_return/`, `/momo_return/` |
| Mock VNPAY | `MockVNPay.jsx` | Testing VNPAY flow (dev only) | — |
| Mock MoMo | `MockMoMo.jsx` | Testing MoMo flow (dev only) | — |
| SePay Checkout | `SePayCheckout.jsx` | SePay integration (QR code payment) | — |
| Stripe Checkout | `StripeCheckout.jsx` | Stripe card payment integration | — |
| Learn / Study | `Learn.jsx` | Watch lessons, mark progress, take quizzes | `GET /courses/courses/{id}/`, `/progress/my_progress/`, `POST /progress/update_progress/` |
| My Learning | `MyLearning.jsx` | Tab view: In Progress / Completed / Archived (STUB) | — |
| Orders / Transactions | `Orders.jsx` | Transaction history (tab: orders list) | `GET /orders/` |
| Transactions Page | `Transactions.jsx` | Transaction history mockup (alternative page) | — |
| Profile | `Profile.jsx` | User info, enrolled courses, edit fields | `GET /courses/courses/my_courses/`, `PATCH /accounts/users/me/` |
| Settings | `Settings.jsx` | Account settings, avatar, bio, security (STUB) | — |
| Auth | `Auth.jsx` | Login / Register form | `POST /accounts/login/`, `/accounts/register/` |

### **2. Instructor Flows**
| Page | File | Purpose | API Calls |
|------|------|---------|-----------|
| Instructor Dashboard | `InstructorDashboard.jsx` | Overview stats (students, revenue, courses) | `GET /courses/instructor-courses/`, `/statistics/` |
| Create Course | `InstructorCreateCourse.jsx` | Multi-step course creation (3 steps) | `POST /courses/instructor-courses/`, `GET /categories/` |
| Course Curriculum | `InstructorCourseCurriculum.jsx` | Add chapters & lessons to course | `GET /courses/courses/{id}/chapters/`, `POST /chapters/`, `/lessons/` |
| Course List | `InstructorCourseList.jsx` | Manage existing courses (edit, delete, publish) | `GET /courses/instructor-courses/` |
| Students | `InstructorStudents.jsx` | View students enrolled, progress tracking | `GET /courses/instructor-courses/my_students/` |
| Reviews | `InstructorReviews.jsx` | View student reviews & ratings | `GET /courses/courses/{id}/reviews/` |
| Analytics | `InstructorAnalytics.jsx` | Stats graphs (views, enrollments, revenue) | — |
| Finance | `InstructorFinance.jsx` | Track earnings, payouts, bank details | `GET /finance_data/`, `PATCH /update_finance_data/` |
| Settings | `InstructorSettings.jsx` | Profile, bio, expertise, bank account info | `PATCH /accounts/users/me/`, `/instructor-courses/update_finance_data/` |
| Help | `InstructorHelp.jsx` | FAQ, support resources | — |
| Login | `InstructorLogin.jsx` | Instructor-specific login (or redirect to Auth) | — |

### **3. Admin Flows**
| Page | File | Purpose | API Calls |
|------|------|---------|-----------|
| Admin Dashboard | `AdminDashboard.jsx` | Approve/Reject pending courses, manage content | `GET /courses/admin-courses/`, `POST /admin-courses/{id}/approve/`, `/reject/` |

### **4. Other Pages**
| Page | File | Purpose |
|------|------|---------|
| Schedule | `Schedule.jsx` | Student learning schedule / calendar |
| Documents | `Documents.jsx` | Certificates, course materials download |
| Degrees | `Degrees.jsx` | Educational paths / degree programs |
| Contact | `Contact.jsx` | Contact form for support |
| Accomplishments | `Accomplishments.jsx` | Certificate / badge showcase |
| NotFound | `NotFound.jsx` | 404 error page |

**Total: 34 pages, ~25 fully functional, ~9 stubs/WIP**

---

## 🔄 Luồng Chính (Main Flows)

### **Flow 1: Browse → Add to Cart → Checkout → Pay → Learn**

```
┌─────────────────────────────────────────────────────────┐
│ HOME.JSX (Course Discovery)                             │
│ - GET /courses/categories/  (fetch categories)          │
│ - GET /courses/courses/?q={search}&category={id}        │
│ - Filter: searchQuery, activeCategory, ordering        │
└──────────────────────────┬──────────────────────────────┘
                           │ User clicks "Add to Cart"
                           ↓
┌─────────────────────────────────────────────────────────┐
│ COURSEDETAIL.JSX (Detailed View)                        │
│ - GET /courses/courses/{courseId}/  (course data)       │
│ - GET /courses/progress/my_progress/?course_id={id}    │
│ - GET /courses/courses/{id}/lessons/ (if not enrolled) │
│ - GET /courses/courses/{id}/reviews/ (testimonials)    │
│ - POST /cart/add_item/ {course_id: {id}}               │
│ - Show: chapters, skills, instructor, reviews          │
└──────────────────────────┬──────────────────────────────┘
                           │ User clicks cart icon
                           ↓
┌─────────────────────────────────────────────────────────┐
│ CART.JSX (Review Shopping Cart)                         │
│ - GET /cart/my_cart/  (items: [{ course, price }])     │
│ - GET /orders/  (show past orders)                      │
│ - DELETE /cart/remove_item/ {course_id}                │
│ - Show: subtotal, discount, total                       │
│ - Tabs: Cart | Order History                            │
└──────────────────────────┬──────────────────────────────┘
                           │ User clicks "Checkout"
                           ↓
┌─────────────────────────────────────────────────────────┐
│ CHECKOUT.JSX (Payment Gateway Selection)                │
│ - GET /cart/my_cart/  (recalc total)                    │
│ - Show: VNPAY, MoMo, Stripe Card, SePay options        │
│ - User selects payment method                           │
└──────────────────────────┬──────────────────────────────┘
                           │ User selects method (e.g., VNPAY)
                           ↓
┌─────────────────────────────────────────────────────────┐
│ POST /orders/checkout/ { payment_method: "vnpay" }      │
│ Backend: Creates order (status='pending')              │
│ Returns: payment_url (redirect to VNPAY gateway)       │
└──────────────────────────┬──────────────────────────────┘
                           │ Payment gateway processes
                           ↓
┌─────────────────────────────────────────────────────────┐
│ PAYMENTRETURN.JSX (Handle Callback)                     │
│ - Parse: ?vnp_ResponseCode=... (VNPAY)                 │
│ - Or: ?resultCode=... (MoMo)                           │
│ - GET /orders/vnpay_return/?vnp_ResponseCode=00... (👈 verify)
│ - GET /orders/momo_return/?resultCode=0...            │
│ - Backend: Update order status='paid', auto-enroll     │
│ - Send: Notification to user                           │
│ - Show: Success/Error message                          │
└──────────────────────────┬──────────────────────────────┘
                           │ User clicks "Start Learning"
                           ↓
┌─────────────────────────────────────────────────────────┐
│ LEARN.JSX (Study Interface)                             │
│ - GET /courses/courses/{courseId}/  (chapters/lessons) │
│ - GET /courses/progress/my_progress/?course_id={id}   │
│ - Show: video player, lesson sidebar, progress bar     │
│ - POST /progress/update_progress/ { lesson_id, status │
│ - Every 30-60s: POST heartbeat to buffer               │
│ - Quiz submission: POST /courses/quizzes/{id}/submit/  │
└─────────────────────────────────────────────────────────┘
```

---

### **Flow 2: Instructor Course Creation & Approval**

```
┌─────────────────────────────────────────────────────────┐
│ INSTRUCTORDASHBOARD.JSX (Overview)                      │
│ - GET /courses/instructor-courses/  (my courses)        │
│ - GET /courses/instructor-courses/statistics/           │
│ - Stats: total_students, my_earnings, total_revenue    │
│ - Button: "+ Create Course"                            │
└──────────────────────────┬──────────────────────────────┘
                           │ Click "Create Course"
                           ↓
┌─────────────────────────────────────────────────────────┐
│ INSTRUCTORCREATECOURSE.JSX (3-Step Form)                │
│ - Step 1: Basic Info (title, category, price, level)  │
│ - Step 2: Description, objectives, skills, duration   │
│ - Step 3: Upload image, confirm                        │
│ - GET /courses/categories/ (for dropdown)              │
│ - POST /courses/instructor-courses/ {formData + image} │
│ - Backend: Create course (status='draft')              │
└──────────────────────────┬──────────────────────────────┘
                           │ Course created
                           ↓
┌─────────────────────────────────────────────────────────┐
│ INSTRUCTORCOURSECURRICULUM.JSX (Add Content)            │
│ - Add chapters, lessons, videos, quizzes               │
│ - POST /chapters/ {course_id, title, order}            │
│ - POST /lessons/ {chapter_id, title, video_url}        │
│ - Submit form → status='submitted' → Auto-notify admin │
└──────────────────────────┬──────────────────────────────┘
                           │ Admin reviews
                           ↓
┌─────────────────────────────────────────────────────────┐
│ ADMINDASHBOARD.JSX (Approval Queue)                     │
│ - GET /courses/admin-courses/ (pending courses)         │
│ - POST /admin-courses/{id}/approve/  → status='active' │
│ - POST /admin-courses/{id}/reject/ {reason}            │
│ - On approve: Auto-send notification to instructor     │
│ - Course appears on Home page for students             │
└─────────────────────────────────────────────────────────┘
```

---

### **Flow 3: Profile & Settings**

```
┌─────────────────────────────────────────────────────────┐
│ PROFILE.JSX (Student Profile View)                      │
│ - GET /accounts/users/me/  (logged-in user data)       │
│ - GET /courses/courses/my_courses/ (enrolled courses)  │
│ - Show: avatar, name, email, role, enrollments         │
│ - Edit mode: PATCH /accounts/users/me/                 │
│ - Tabs: Profile | My Learning | Transactions | Docs   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ INSTRUCTORSETTINGS.JSX (Instructor Profile)             │
│ - GET /accounts/users/me/  (for first_name, last_name) │
│ - GET /instructor-courses/finance_data/ (bank info)    │
│ - PATCH /accounts/users/me/ {first_name, last_name}   │
│ - PATCH /instructor-courses/update_finance_data/      │
│ - Sections: Personal | Expertise | Bank Wallet        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎣 Context & Hooks

### **AuthContext** (`context/AuthContext.jsx`)
```javascript
// State:
//   - user: { username, email, first_name, last_name, is_instructor }
//   - loading: boolean
// Methods:
//   - login(username, password) → stored JWT tokens
//   - register(username, email, password, password2)
//   - logout() → clear tokens & user state
// Auto-checks token on app startup
```

**Usage**:
```jsx
const { user, loading, login, logout } = useAuth();
if (!user) navigate('/login');
```

### **usePageSEO Hook** (`hooks/usePageSEO.js`)
- Sets `<title>`, `<meta description>`, OG tags dynamically per page
- Called in every page's `useEffect`
- Example: `usePageSEO({ title: 'Giỏ hàng', description: '...' })`

---

## 🔌 API Setup

### **axios.js** (`api/axios.js`)
```javascript
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// Interceptor 1: Auto-attach JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor 2: Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      // Attempt to refresh token...
      // If fails → logout & redirect to /login
    }
    return Promise.reject(error);
  }
);
```

**Key Feature**: Silent JWT refresh on expiration (no UI logout unless refresh token invalid)

---

## ✅ Error Handling & Validation Patterns

### **Pattern 1: Try/Catch with Toast Messages** (Most Common)
```jsx
const addToCart = async (courseId) => {
  if (!user) { navigate('/login'); return; }
  try {
    await api.post('/cart/add_item/', { course_id: courseId });
    setToast('✅ Đã thêm vào giỏ hàng!');
  } catch (err) {
    setToast(err.response?.data?.message || '❌ Không thể thêm.');
  } finally { setAddingId(null); }
};
```

### **Pattern 2: Promise.all for Parallel Requests**
```jsx
const [cartRes, orderRes] = await Promise.all([
  api.get('/cart/my_cart/').catch(() => ({ data: { items: [] } })),
  api.get('/orders/').catch(() => ({ data: [] })),
]);
```

### **Pattern 3: Chaining with .then().catch()**
```jsx
api.get('/courses/categories/')
  .then(res => setCategories(res.data.results || res.data))
  .catch(() => {});  // Silent fail
```

### **Pattern 4: Controlled Forms (React)**
```jsx
const [form, setForm] = useState({ first_name: '', email: '' });
const save = async (e) => {
  try {
    await api.patch('/accounts/users/me/', form);
    setMsg('✅ Saved!');
  } catch { setMsg('❌ Failed'); }
};
```

---

## 💾 Local Storage Usage

| Key | Value | Used By |
|-----|-------|---------|
| `access_token` | JWT token | All API calls (Interceptor) |
| `refresh_token` | JWT refresh | Auto-refresh on 401 (Interceptor) |

**Behavior**: Tokens persist across page reloads (session survives F5)

---

## 🎨 Design System & CSS

### **Color Palette**
```css
--blue:      #0056D2  (primary)
--blue-dk:   #003d99  (hover)
--blue-lt:   #e8f0fe  (light bg)
--text:      #1f1f1f  (main text)
--muted:     #636363  (secondary text)
--border:    #e0e0e0
--bg:        #f9f9f9  (page bg)
--white:     #ffffff
--success:   #1a7f37
--danger:    #c0392b
--radius:    8px
--shadow:    0 2px 8px rgba(0,0,0,.08)
--shadow-lg: 0 4px 20px rgba(0,0,0,.12)
```

### **CSS Architecture**
- No Tailwind (per AGENTS.md)
- No inline styles (all in CSS modules/App.css)
- BEM-inspired naming: `.crs-cart-tab`, `.crs-btn-solid`
- Smooth transitions: `transition: all .15s`
- Responsive: flex + grid + media queries

### **Key CSS Classes**
```
.crs-header          → Sticky header
.crs-btn-solid       → Primary button (blue)
.crs-btn-outline     → Secondary button (border)
.crs-field           → Form field container
.crs-form            → Form wrapper
.crs-card            → Content card
.crs-dropdown        → Dropdown menu
.crs-avatar          → User avatar (round)
.crs-page-header     → Page title
.crs-loading         → Loading spinner
```

---

## 📊 Response Format Handling

### **Courses List** (Home, Browse)
```javascript
// Expected:
{
  results: [ { id, title, price, category, instructor, rating, ... } ],
  // OR just array:
  [ { id, title, ... } ]
}
// Handle both: r.data.results || r.data || []
```

### **Cart** (GET /cart/my_cart/)
```javascript
{
  items: [
    { id, course: { id, title, price }, quantity }
  ]
}
// Access: cartRes.data.items || []
```

### **Orders** (GET /orders/)
```javascript
{
  results: [
    { id, status: 'paid'|'pending', total_price, items: [...], created_at }
  ]
  // OR just array
}
// Handle: r.data.results || r.data || []
```

### **Notifications** (GET /courses/notifications/)
```javascript
{
  results: [
    { id, message, is_read, created_at }
  ]
  // OR just array
}
```

---

## 📱 Key Components

### **InstructorSidebar** (`components/InstructorSidebar.jsx`)
- Navigation menu for instructor pages
- Links to Dashboard, Courses, Students, Finance, Settings

### **LoadingUI** (`components/LoadingUI.jsx`)
- `<Loading />` — Spinner + message
- `<SkeletonCard />` — Placeholder for courses
- `<SkeletonList />` — Placeholder for lists

---

## 🚀 Important Utilities

### **fixText()** (`utils/fixEncoding.js`)
- Fixes double-encoded UTF-8 from CSV import: `Â·` → `·`
- Used in: CourseDetail, Home

### **parseMetadata()** (`utils/fixEncoding.js`)
- Splits metadata string: "Beginner · Course · 1-4 Weeks"
- Returns: `{ level, type, duration }`

### **getCourseThumbnail()** (`utils/courseImages.js`)
- Returns course image URL (local or fallback gradient)
- Gradients used as fallback for missing images

---

## 🔐 Authentication & Protected Routes

### **Route Protection** (App.jsx)
```javascript
// Not explicit guards in routes, but used in pages:
if (authLoading) return null;
if (!user) { navigate('/login'); return; }
```

**Affected Pages**: Cart, Orders, Profile, Learn, Schedule, etc.

### **Instructor Routes**
- Instructor pages check `user.is_instructor` (implicit)
- Can visit `/instructor/*` if user, but UI shows empty if not instructor

---

## 📝 Response Format Inconsistencies & Handling

### **Issue #1: Paginated vs Direct Array**
**Pattern**: Some endpoints return `results: [...]`, others just `[...]`
```javascript
// Universal handler:
const data = r.data.results || r.data || [];
```

### **Issue #2: Commas in URLs (AVOID)**
**Pattern**: Use query params, not commas
```javascript
// ✅ GOOD:
`/courses/?q=Python&category=2&ordering=-rating`

// ❌ BAD (don't do):
`/courses/?ids=1,2,3`  → Use &id=1&id=2&id=3 or list format
```

### **Issue #3: Success Messages in Response**
**Pattern**: Backend may return `message` or `error` keys
```javascript
catch (err) {
  setMsg(err.response?.data?.message || 
         err.response?.data?.error || 
         'Generic error');
}
```

---

## 🐛 Current Issues & TODOs

### **Implemented ✅**
1. ✅ Home page with search/filter
2. ✅ CourseDetail with chapters, reviews, enroll
3. ✅ Cart management (add/remove)
4. ✅ Checkout with multiple payment methods
5. ✅ Payment callbacks (VNPAY, MoMo, Stripe, SePay)
6. ✅ Learn page with video player + progress tracking
7. ✅ Profile view & edit
8. ✅ Instructor dashboard with stats
9. ✅ Create course (3-step form)
10. ✅ Instructor students view
11. ✅ Admin approval queue
12. ✅ Notifications bell + mark as read

### **Partial/Stub 🔧**
- MyLearning page (tabs shown but functionality limited)
- Settings page (profile photo upload not wired)
- Quiz rendering (endpoint exists but UI incomplete)
- Transactions page (mockup, real data from Orders page)

### **Missing 🚫**
- Email verification flow
- Password reset
- Social login (Google, Facebook)
- Course comments/discussion
- Certificate generation
- Instructor messaging students
- Advanced analytics graphs
- Profile photo upload
- Course wishlist

---

## 🚦 API Call Summary by Page

| Page | GET Calls | POST Calls | PATCH Calls | DELETE Calls |
|------|-----------|-----------|------------|--------------|
| Home | categories, courses | add_item | — | — |
| CourseDetail | courses/{id}, progress, lessons, reviews | add_item | — | — |
| Cart | my_cart, orders | — | — | remove_item |
| Checkout | my_cart | checkout | — | — |
| PaymentReturn | vnpay_return / momo_return | — | — | — |
| Learn | courses/{id}, progress, quizzes | progress_update, quiz_submit | — | — |
| Orders | orders | — | — | — |
| Profile | users/me, courses/my_courses | — | users/me | — |
| InstructorDashboard | instructor-courses, statistics | — | — | — |
| InstructorCreateCourse | categories | instructor-courses | — | — |
| InstructorSettings | users/me, finance_data | — | users/me, finance_data | — |
| InstructorStudents | my_students | — | — | — |
| AdminDashboard | admin-courses | approve, reject | — | — |

---

## 🎯 Key Observations

### ✅ **Strengths**
1. **Consistent API client setup** — Axios interceptors handle JWT refresh automatically
2. **Try/catch everywhere** — Error handling present in most async calls
3. **User feedback** — Toast messages for actions
4. **Responsive design** — CSS flex/grid + mobile-friendly
5. **SEO-ready** — usePageSEO hook on all pages
6. **Context-based auth** — Clean state management with AuthProvider

### ⚠️ **Areas to Monitor**
1. **Silent failures** — Some `.catch(() => {})` with no user feedback
2. **Response format inconsistency** — Mix of `results` wrapper and direct arrays
3. **Loading states** — Not all async operations show loading spinner
4. **Form validation** — Minimal client-side validation before submit
5. **N+1 queries risk** — Some pages may trigger multiple sequential API calls
6. **Instructor role check** — No explicit guard, relies on implicit behavior

---

## 📚 Development Checklist

- [ ] Test all payment methods (VNPAY, MoMo, Stripe, SePay)
- [ ] Verify token refresh works (set short token expiry)
- [ ] Test form validation (empty fields, invalid email)
- [ ] Check 401/403 error handling (permission flow)
- [ ] Verify course enrollment on paid order
- [ ] Test quiz submission & grading
- [ ] Validate instructor course approval notification
- [ ] Check responsive UI on mobile (Cart, Checkout)
- [ ] Profile edit: test first_name, last_name, email PATCH
- [ ] Instructor stats: verify real data from backend

---

**Last Updated**: April 13, 2026
**Chart Generator**: GitHub Copilot Frontend Analysis
