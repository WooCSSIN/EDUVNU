# 📱 EduVNU Frontend — Quick Reference Index

## 🎯 Quick Navigation

### **Pages by Feature**
| Feature | Files | Status |
|---------|-------|--------|
| **Home & Browse** | Home.jsx, NotFound.jsx | ✅ Full |
| **Course Details** | CourseDetail.jsx, Contact.jsx | ✅ Full |
| **Shopping** | Cart.jsx, Checkout.jsx | ✅ Full |
| **Payment** | PaymentReturn.jsx, MockVNPay.jsx, MockMoMo.jsx, SePayCheckout.jsx, StripeCheckout.jsx | ✅ Full |
| **Learning** | Learn.jsx, MyLearning.jsx, Schedule.jsx, Documents.jsx | 🟨 Partial |
| **Student Profile** | Profile.jsx, Settings.jsx, Orders.jsx, Transactions.jsx, Accomplishments.jsx | 🟨 Partial |
| **Instructor Dashboard** | InstructorDashboard.jsx, InstructorCreateCourse.jsx, InstructorCourseCurriculum.jsx | ✅ Full |
| **Manage Courses** | InstructorCourseList.jsx, InstructorFinance.jsx | ✅ Full |
| **Instructor Profile** | InstructorSettings.jsx, InstructorReviews.jsx, InstructorAnalytics.jsx, InstructorHelp.jsx | 🟨 Partial |
| **Student Management** | InstructorStudents.jsx | ✅ Full |
| **Admin** | AdminDashboard.jsx | ✅ Full |
| **Auth** | Auth.jsx, InstructorLogin.jsx | ✅ Full |
| **Degrees** | Degrees.jsx | 🟨 Static |

---

## 🔑 Most Important Endpoints

### **Authentication**
```
POST   /accounts/login/                    → {access, refresh, user}
POST   /accounts/register/                 → {access, refresh, user}
GET    /accounts/users/me/                 → {user_data}
PATCH  /accounts/users/me/                 → {updated_user}
POST   /accounts/token/refresh/            → {access} ← Auto-called by interceptor
```

### **Courses**
```
GET    /courses/courses/                   → paginated course list
GET    /courses/courses/{id}/              → single course detail
GET    /courses/courses/{id}/lessons/      → course chapters+lessons
GET    /courses/courses/{id}/reviews/      → course reviews
GET    /courses/courses/my_courses/        → enrolled courses
POST   /courses/courses/                   → [Admin] create course
```

### **Instructor Courses**
```
GET    /courses/instructor-courses/        → my courses (instructor only)
GET    /courses/instructor-courses/statistics/  → stats
GET    /courses/instructor-courses/my_students/ → my enrollments
POST   /courses/instructor-courses/        → create new course
PATCH  /courses/instructor-courses/{id}/   → update course
```

### **Shopping Cart**
```
GET    /cart/my_cart/                      → {items: [...]}
POST   /cart/add_item/                     → {course_id}
DELETE /cart/remove_item/                  → {course_id}
```

### **Orders & Checkout**
```
GET    /orders/                            → order history
POST   /orders/checkout/                   → {payment_method}
GET    /orders/vnpay_return/?vnp_...       → payment callback (VNPAY)
GET    /orders/momo_return/?resultCode=... → payment callback (MoMo)
```

### **Learning Progress**
```
GET    /courses/progress/my_progress/      → progress list
POST   /courses/progress/update_progress/  → {lesson_id, status}
POST   /courses/quizzes/{id}/submit/       → quiz answers
```

### **Notifications**
```
GET    /courses/notifications/             → unread notifications
POST   /courses/notifications/{id}/mark_as_read/ → mark read
```

### **Admin**
```
GET    /courses/admin-courses/             → pending courses
POST   /courses/admin-courses/{id}/approve/ → approve course
POST   /courses/admin-courses/{id}/reject/  → reject course
```

---

## 🎛️ Component Files (Reusable)

### **InstructorSidebar.jsx**
```jsx
import InstructorSidebar from '../components/InstructorSidebar';

// Renders sidebr with links to:
// - Dashboard, Courses, Students, Reviews, Analytics
// - Finance, Settings, Help, Logout
```

### **LoadingUI.jsx**
```jsx
import { Loading, SkeletonCard, SkeletonList } from '../components/LoadingUI';

<Loading message="Loading..." />
<SkeletonCard />
<SkeletonList />
```

---

## 🪝 Hooks & Utilities

### **usePageSEO Hook**
```jsx
import usePageSEO from '../hooks/usePageSEO';

usePageSEO({
  title: 'Cart',
  description: 'View shopping cart...',
  keywords: 'cart, shopping',
  ogImage: 'http://...'
});
// Auto-sets <title>, <meta> tags
```

### **fixText() Utility**
```jsx
import { fixText } from '../utils/fixEncoding';

const cleaned = fixText('Google Â· Course');  // → 'Google · Course'
```

### **getCourseThumbnail() Utility**
```jsx
import { getCourseThumbnail } from '../utils/courseImages';

const imageUrl = getCourseThumbnail({
  id: courseId,
  image: courseData.image,
  title: courseData.title
});
```

---

## 🔐 Auth Flow

```
User not logged in
    ↓
useAuth() → user = null
    ↓
Page guards:
  if (!user) navigate('/login')
    ↓
[Auth.jsx] Login form
    ↓
POST /accounts/login/ {username, password}
    ↓
Backend: Validate
    ↓
Response: {access_token, refresh_token, user}
    ↓
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', token)
    ↓
setUser(user_data) in AuthContext
    ↓
Now: user !== null → Page renders
    ↓
Every API request:
  Authorization: Bearer {access_token}
    ↓
If token expires → Auto-refresh by interceptor
    ↓
User never sees logout (seamless)
```

---

## 🎨 CSS Classes Reference

```css
/* Layout */
.crs-header           /* Sticky top bar */
.crs-page             /* Main page container */
.crs-page-header      /* Page title section */
.crs-card             /* Content card */
.crs-form             /* Form container */

/* Buttons */
.crs-btn-solid        /* Primary button (blue) */
.crs-btn-outline      /* Secondary button (border) */
.crs-btn-outline.sm   /* Small button */

/* Forms */
.crs-field            /* Input wrapper */
.crs-form-row         /* Row of fields */

/* User */
.crs-avatar           /* Round user avatar */
.crs-avatar.lg        /* Large avatar */

/* Cart/Shopping */
.crs-cart-page        /* Cart page */
.crs-cart-tabs        /* Cart/Orders tabs */
.crs-cart-item        /* Single item in cart */

/* Learning */
.lrn-player           /* Video player container */
.lrn-sidebar          /* Left chapter list */
.lrn-lesson-item      /* Chapter/lesson item */

/* Instructor */
.instructor-container /* Instructor layout */
.instructor-main      /* Main content area */
.instructor-header    /* Header with title + buttons */
.stats-grid           /* Stats cards grid */
.stat-card            /* Single stat card */
.course-table         /* Course list table */

/* Utils */
.crs-loading          /* Loading spinner */
.crs-empty-state      /* Empty state message */
.crs-alert            /* Alert message */
.crs-toast            /* Toast notification */
```

---

## 📦 Dependencies Summary

```json
{
  "react": "^19.2.4",                       // UI framework
  "react-dom": "^19.2.4",                   // DOM rendering
  "react-router-dom": "^7.13.2",            // Routing
  "axios": "^1.13.6",                       // HTTP client
  "@stripe/react-stripe-js": "^6.1.0",      // Stripe payment UI
  "@stripe/stripe-js": "^9.0.1",            // Stripe payment client
  
  "@vitejs/plugin-react": "^6.0.1",         // Vite React plugin
  "vite": "^8.0.1",                         // Build tool
  "eslint": "^9.39.4",                      // Linting
  "vitest": "^4.1.4"                        // Testing
}
```

**No Tailwind, Bootstrap** — All vanilla CSS with design system variables

---

## 🚀 Dev Commands

```bash
# Start dev server (Vite)
npm run dev
# → Runs on http://localhost:5173

# Build for production
npm run build
# → Output: dist/

# Check for linting errors
npm run lint

# Run tests
npm run test
```

---

## ✨ Key Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Course browsing | ✅ Done | Search + filter + category |
| Course details | ✅ Done | Chapters, reviews, instructor |
| Add to cart | ✅ Done | Toast feedback |
| Checkout | ✅ Done | 5 payment methods |
| Payment processing | ✅ Done | VNPAY, MoMo, Stripe, SePay |
| Learning player | ✅ Done | Video + progress tracking |
| Quiz system | 🟨 WIP | UI incomplete |
| User profile | ✅ Done | Edit first/last name, email |
| Instructor dashboard | ✅ Done | Stats, course list |
| Course creation | ✅ Done | 3-step form |
| Student roster | ✅ Done | View enrolled students |
| Admin approval | ✅ Done | Approve/reject courses |
| Notifications | ✅ Done | Bell icon + mark as read |
| Certificate download | ❌ Missing | Not started |
| Email verification | ❌ Missing | Not started |
| Password reset | ❌ Missing | Not started |
| Course comments | ❌ Missing | Not started |
| Wishlist | ❌ Missing | Not started |

---

## 🧪 Testing Checklist

Priority order for manual testing:

1. **Auth**
   - [ ] Register new account
   - [ ] Login with existing account
   - [ ] Token refresh on 401
   - [ ] Logout clears state

2. **Shopping**
   - [ ] Browse and search courses
   - [ ] Add to cart
   - [ ] Remove from cart
   - [ ] View cart total

3. **Checkout**
   - [ ] All 5 payment methods available
   - [ ] Form validation (required fields)
   - [ ] Success flow (mock payment)
   - [ ] Error handling (invalid data)

4. **Learning**
   - [ ] Load course lessons
   - [ ] Play video
   - [ ] Mark complete
   - [ ] Progress persists on reload

5. **Instructor**
   - [ ] Create course (3 steps)
   - [ ] View course list
   - [ ] View enrolled students
   - [ ] Check stats

6. **Admin**
   - [ ] See pending courses
   - [ ] Approve/reject course
   - [ ] Course appears on home after approval

---

## 🐛 Known Issues & TODOs

### **High Priority**
- [ ] Footer not implemented (mobile UX)
- [ ] Quiz grading UI incomplete
- [ ] Profile photo upload not wired
- [ ] Responsive on tablets/mobile (Checkout layout)

### **Medium Priority**
- [ ] Lesson comments section
- [ ] Real-time notifications (currently polling)
- [ ] Course reviews pagination
- [ ] Search autocomplete

### **Low Priority**
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Wishlist feature
- [ ] Social sharing buttons

---

## 📚 File Locations Cheat Sheet

```
react
├── App.jsx                              ← Main app + routing
├── index.css                            ← Global styles
│
├── pages/
│   ├── Home.jsx                         ← Course discovery
│   ├── CourseDetail.jsx                 ← Course view
│   ├── Cart.jsx                         ← Shopping cart
│   ├── Checkout.jsx                     ← Payment gateway selection
│   ├── PaymentReturn.jsx                ← Payment callback handler
│   ├── Learn.jsx                        ← Study interface
│   ├── Profile.jsx                      ← User profile
│   ├── Orders.jsx                       ← Transaction history
│   ├── Auth.jsx                         ← Login/Register
│   ├── InstructorDashboard.jsx          ← Instructor overview
│   ├── InstructorCreateCourse.jsx       ← Course creation
│   ├── InstructorSettings.jsx           ← Instructor profile
│   ├── AdminDashboard.jsx               ← Admin approval queue
│   └── ... (26 more pages)
│
├── components/
│   ├── InstructorSidebar.jsx
│   └── LoadingUI.jsx
│
├── context/
│   └── AuthContext.jsx                  ← Auth state + methods
│
├── api/
│   └── axios.js                         ← HTTP client + interceptors
│
├── hooks/
│   └── usePageSEO.js                    ← SEO meta tags
│
├── utils/
│   ├── fixEncoding.js                   ← Text cleanup
│   └── courseImages.js                  ← Image URL utilities
│
└── assets/
    └── *.css                            ← Component styles
```

---

## 💡 Pro Tips for Development

1. **Always check localStorage after login**: `localStorage.getItem('access_token')`
2. **Use Network tab in DevTools**: Verify X-Authorization header on requests
3. **Test with Postman**: Verify API response format before coding frontend
4. **Add console.log on catch blocks**: `console.error('API error:', err)`
5. **Test payment with mock endpoints**: `/mock-vnpay/`, `/mock-momo/`
6. **Check component re-renders**: May cause double API calls in dev mode (React 18+)
7. **Use React DevTools**: Inspect state changes during test

---

**Created**: April 13, 2026
**Frontend Version**: React 19 + Vite
**API Version**: v1 (Django REST)
