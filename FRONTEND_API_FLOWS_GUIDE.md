# 🔌 EduVNU Frontend — API Flows & Error Handling Deep Dive

## 📖 Table of Contents
1. [API Client Setup](#api-client-setup)
2. [Error Handling Patterns](#error-handling-patterns)
3. [Response Format Matching](#response-format-matching)
4. [Try/Catch Examples](#trycatch-examples)
5. [Request/Response Flow Diagrams](#requestresponse-flow-diagrams)
6. [Common API Issues & Solutions](#common-api-issues--solutions)

---

## 🔌 API Client Setup

### **File**: `api/axios.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// ━━━ INTERCEPTOR 1: Add JWT to every request ━━━
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ━━━ INTERCEPTOR 2: Handle 401 + Auto-refresh ━━━
api.interceptors.response.use(
  (response) => response,  // ✅ Success: return as-is
  
  async (error) => {
    const original = error.config;
    
    // Only auto-refresh once per request
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          // Attempt to refresh token
          const res = await axios.post(
            'http://127.0.0.1:8000/api/v1/accounts/token/refresh/',
            { refresh }
          );
          
          // Store new access token
          localStorage.setItem('access_token', res.data.access);
          
          // Retry original request with new token
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          // Refresh failed → user must login again
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);  // Let caller handle other errors
  }
);

export default api;
```

### **Key Behavior**
| Scenario | Backend Response | Interceptor Behavior | Result |
|----------|-----------------|----------------------|--------|
| Valid access token | Any endpoint | Add `Authorization: Bearer {token}` | ✅ Request succeeds |
| Expired access token | API returns 401 | Try to refresh | ✅ Succeeds (new token saved) |
| Refresh token expired | 401 + refresh fails | Clear tokens → Redirect to /login | ❌ User must re-auth |
| Valid refresh token | 401 → POST /token/refresh | Get new access token → Retry request | ✅ Succeeds |
| Network error | No response | Reject with error | ❌ Caller gets error |

---

## ✅ Error Handling Patterns

### **Pattern 1: Try/Catch with Toast (Most Common)**
**Used in**: Home, CourseDetail, Cart, Checkout, Profile, etc.

```jsx
const [toast, setToast] = useState('');

const addToCart = async (courseId) => {
  if (!user) { navigate('/login'); return; }  // Guard: require login
  
  setAddingId(courseId);  // Show loading on button
  try {
    await api.post('/cart/add_item/', { course_id: courseId });
    setToast('✅ Đã thêm vào giỏ hàng!');  // Success message
    setTimeout(() => setToast(''), 3000);   // Auto-hide after 3s
  } catch (err) {
    // Attempt to extract error message from:
    //   1. err.response.data.message (backend custom)
    //   2. err.response.data.error (generic)
    //   3. Fallback string
    const errMsg = err.response?.data?.message || 
                   err.response?.data?.error || 
                   '❌ Không thể thêm.';
    setToast(errMsg);
    setTimeout(() => setToast(''), 3000);
  } finally {
    setAddingId(null);  // Clear loading state
  }
};
```

**Error Message Hierarchy**:
```
1. err.response?.data?.message (backend-provided custom message)
2. err.response?.data?.error (backend error key)
3. err.response?.data?.non_field_errors?.[0] (DRF generic)
4. Fallback generic message
```

---

### **Pattern 2: Promise.all for Parallel Requests**
**Used in**: Cart, Learn, InstructorDashboard

```jsx
const loadData = async () => {
  setLoading(true);
  try {
    const [cartRes, orderRes] = await Promise.all([
      // Endpoint 1: Get cart items
      api.get('/cart/my_cart/').catch(() => ({ data: { items: [] } })),
      
      // Endpoint 2: Get order history
      api.get('/orders/').catch(() => ({ data: [] })),
      
      // Endpoint 3: Get notifications
      api.get('/courses/notifications/').catch(() => ({ data: [] })),
    ]);
    
    setItems(cartRes.data.items || []);
    setOrders(orderRes.data.results || orderRes.data || []);
    setNotifications(notifRes.data.results || notifRes.data || []);
  } catch (err) {
    console.error('Critical load error:', err);
    // Decide: show error toast or silently use defaults
  } finally {
    setLoading(false);
  }
};
```

**Key Technique**: Each `.catch()` returns a default structure so `Promise.all` doesn't fail if one endpoint fails.

---

### **Pattern 3: Chaining with .then().catch()**
**Used in**: Header (notifications), Home (categories)

```jsx
// Minimal error handling - used for non-critical data
api.get('/courses/categories/')
  .then(res => {
    setCategories(res.data.results || res.data || []);
  })
  .catch(() => {
    // Silently fail - page works without categories
  });

// Another example: fetch & auto-hide
api.get('/cart/my_cart/')
  .then(r => setCartCount(r.data.items?.length || 0))
  .catch(() => {});  // Do nothing on error
```

**Good for**: Non-blocking features (categories, notifications feed)
**Bad for**: Critical flows (checkout, payment verification)

---

### **Pattern 4: Controlled Form Submission**
**Used in**: Profile, InstructorSettings, Auth

```jsx
const [form, setForm] = useState({ 
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  email: user?.email || ''
});
const [msg, setMsg] = useState('');
const [saving, setSaving] = useState(false);

const save = async (e) => {
  e.preventDefault();
  setSaving(true);
  setMsg('');  // Clear previous message
  
  try {
    await api.patch('/accounts/users/me/', form);
    setMsg('✅ Đã lưu thành công!');
    setEditing(false);  // Exit edit mode
  } catch (err) {
    // Extract field-level errors (DRF format)
    const serverError = err.response?.data;
    if (serverError?.first_name) {
      setMsg(`❌ ${serverError.first_name[0]}`);
    } else if (serverError?.email) {
      setMsg(`❌ ${serverError.email[0]}`);
    } else {
      setMsg('❌ Lưu thất bại. Vui lòng thử lại.');
    }
  } finally {
    setSaving(false);
  }
};

// Usage in JSX:
<form onSubmit={save}>
  <input 
    value={form.first_name}
    onChange={e => setForm(p => ({...p, first_name: e.target.value}))}
  />
  <button type="submit" disabled={saving}>
    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
  </button>
  {msg && <div className={`crs-alert ${msg.includes('✅') ? 'success' : 'error'}`}>{msg}</div>}
</form>
```

---

### **Pattern 5: Fetch with Default Value**
**Used in**: Cart (order history), Checkout

```jsx
const removeItem = async (courseId) => {
  setRemoving(courseId);
  try {
    await api.delete('/cart/remove_item/', { 
      data: { course_id: courseId } 
    });
    setItems(p => p.filter(i => i.course?.id !== courseId));  // Optimistic update
    setToast('✅ Đã xóa khỏi giỏ hàng');
  } catch {
    setToast('❌ Không thể xóa sản phẩm');
    // Don't remove from UI on error - refresh instead
    loadData();
  } finally {
    setRemoving(null);
  }
};
```

**Key Technique**: Optimistic UI update (remove from UI immediately), then:
- On error → refresh data from backend to get true state

---

## 📊 Response Format Matching

### **Issue 1: Paginated vs Direct Array**

**Problem**: Different endpoints return different formats

```javascript
// Format A: DRF Paginated
GET /courses/courses/
{
  "count": 100,
  "next": "http://...",
  "previous": null,
  "results": [ { id, title, ... } ]
}

// Format B: Direct Array
GET /courses/courses/my_courses/
[ { id, title, ... } ]

// Format C: List with results wrapper
GET /orders/
{
  "results": [ ... ]
}
// OR just:
[ ... ]
```

**Solution: Universal Handler**
```javascript
// Works for all 3 formats above:
const courses = r.data.results || r.data || [];

// Even more defensive:
const items = Array.isArray(r.data) 
  ? r.data 
  : (r.data?.results || r.data?.items || []);
```

---

### **Issue 2: Nested Objects**

**Problem**: Related data structure varies

```javascript
// Cart item structure:
{
  id: 1,
  course: {        // 👈 nested object
    id: 10,
    title: "Python Basics",
    price: 450000
  }
}

// Access safely:
items.map(item => ({
  courseId: item.course?.id,     // Optional chaining for safety
  title: item.course?.title || 'Unknown',
  price: item.course?.price || 0
}))
```

---

### **Issue 3: Enum/Status Values**

**Problem**: Backend returns status strings, frontend needs consistency

```javascript
// Order status enum:
{
  id: 1,
  status: "paid"  // Can be: "paid", "pending", "cancelled"
}

// Handle it:
const statusDisplay = {
  paid: { label: '✓ Đã thanh toán', color: '#10b981' },
  pending: { label: 'Chờ xử lý', color: '#f59e0b' },
  cancelled: { label: 'Đã hủy', color: '#ef4444' }
};

<span className={`status-${order.status}`}>
  {statusDisplay[order.status]?.label || 'Unknown'}
</span>
```

---

## 🔄 Try/Catch Examples by Feature

### **Example 1: Add to Cart (Defensive)**
```jsx
// ❌ BAD - No error handling
const addToCart = async () => {
  await api.post('/cart/add_item/', { course_id: 123 });  // Crashes if fails
};

// ✅ GOOD - Full error handling
const addToCart = async () => {
  if (!user) { navigate('/login'); return; }  // Guard
  setLoading(true);
  try {
    const res = await api.post('/cart/add_item/', { course_id: 123 });
    if (res.data?.success === false) {
      setError(res.data.message);
      return;
    }
    setSuccess('Added to cart!');
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to add to cart';
    setError(msg);
  } finally {
    setLoading(false);
  }
};
```

---

### **Example 2: Checkout Payment**
```jsx
const handleCheckout = async (paymentMethod) => {
  setProcessing(true);
  setError('');
  
  try {
    // 1. Validate cart not empty
    if (!items.length) {
      setError('Cart is empty');
      return;
    }
    
    // 2. Call checkout endpoint
    const res = await api.post('/orders/checkout/', {
      payment_method: paymentMethod
    });
    
    // 3. Handle different response types
    if (res.data.status === 'requires_action') {
      // Requires 3D Secure or customer action
      window.location.href = res.data.payment_url;
    } else if (res.data.status === 'success') {
      // Payment succeeded
      setSuccess('Payment successful!');
      setTimeout(() => navigate('/orders'), 2000);
    } else {
      // Unexpected response
      setError(res.data.error || 'Payment processing failed');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    
    if (err.response?.status === 400) {
      // Bad request - invalid data
      setError(err.response.data.message || 'Invalid payment data');
    } else if (err.response?.status === 401) {
      // Unauthorized - user not authenticated
      navigate('/login');
    } else if (err.response?.status === 429) {
      // Rate limited
      setError('Too many requests, please wait');
    } else {
      // Network or server error
      setError('Payment gateway error. Please try again.');
    }
  } finally {
    setProcessing(false);
  }
};
```

---

### **Example 3: Load Data on Mount**
```jsx
useEffect(() => {
  if (authLoading) return;  // Wait for auth check
  if (!user) { navigate('/login'); return; }  // Redirect if not logged in
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/courses/${courseId}/`),
        api.get(`/courses/progress/my_progress/?course_id=${courseId}`)
          .catch(() => ({ data: [] }))  // Default on fail
      ]);
      
      setCourse(courseRes.data);
      setProgress(progressRes.data);
      
      if (courseRes.data.chapters?.length > 0) {
        setActiveChapter(courseRes.data.chapters[0]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/');  // Course not found
      } else {
        setError('Failed to load course');
      }
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [courseId, user, authLoading]);
```

---

## 📈 Request/Response Flow Diagrams

### **Flow 1: Login → Get User Profile → Auto-refresh**

```
User enters username + password
        ↓
POST /accounts/login/ {username, password}
        ↓
Backend: Verify credentials
        ↓
Response: {
  access_token: "eyJ0...",      ← Store in localStorage
  refresh_token: "eyJ1...",     ← Store in localStorage
  user: {
    id: 1,
    username: "john",
    first_name: "John",
    email: "john@example.com",
    is_instructor: false
  }
}
        ↓
Frontend: setUser(response.user) → AuthContext
        ↓
Next API call:
  GET /courses/courses/    (with Authorization: Bearer eyJ0...)
        ↓
Backend: Validate token
  ├─ If valid: return data ✅
  └─ If expired: return 401 ❌
        ↓
If 401 interceptor triggers:
  POST /accounts/token/refresh/ {refresh: "eyJ1..."}
        ↓
Backend: Validate refresh token
  ├─ If valid: return {access: "eyJ0_new..."}
  │                      ↓
  │           Set in localStorage + retry original request
  │                      ↓
  │           GET /courses/courses/ (with new token) ✅
  │
  └─ If invalid: return 400 ❌
                       ↓
              Clear localStorage + redirect to /login
```

---

### **Flow 2: Add to Cart → Optimistic UI Update**

```
User clicks "Add to Cart"
        ↓
Frontend: 
  1. Check if user logged in
     ├─ No: navigate to /login ⛔
     └─ Yes: continue
  2. setAddingId(courseId)  ← Show loading spinner
        ↓
POST /cart/add_item/ {course_id: 123}
  (with Authorization: Bearer token)
        ↓
Backend:
  1. Verify user authenticated ✅
  2. Check course exists ✅
  3. Check not already in cart ✓
  4. Create/update CartItem
  5. Return: {success: true, items_count: 5}
        ↓
Frontend: try block
  1. setToast('✅ Added to cart!');
  2. setTimeout(() => setToast(''), 3000);
  3. setAddingId(null);
        ↓
User sees: Toast message + loading cleared


--- ERROR SCENARIO ---

Backend check fails (e.g., user banned):
  Return: 403 Forbidden {message: "Banned users cannot purchase"}
        ↓
Frontend: catch block
  1. err.response.status = 403
  2. err.response.data.message = "Banned users cannot purchase"
  3. setToast('❌ Banned users cannot purchase');
  4. setTimeout(() => setToast(''), 3000);
  5. setAddingId(null);
        ↓
User sees: Error toast message
```

---

## 🛠️ Common API Issues & Solutions

### **Issue 1: "Unexpected token < in JSON at position 0"**
**Cause**: Backend returning HTML error page (500) instead of JSON
**Solution**: Check backend logs, ensure API endpoint exists and returns JSON

```javascript
try {
  await api.post('/wrong-endpoint/');  // ❌ Returns HTML 404 page
} catch (err) {
  console.log(err);  // JSON.parse error
}
```

**Fix**:
```javascript
// Check backend is running
// Check endpoint path is exact: /api/v1/correct-endpoint/
// Verify POST method (not GET)
```

---

### **Issue 2: CORS Error ("Access to XMLHttpRequest blocked")**
**Cause**: CORS not configured in Django backend
**Solution**: Ensure `django-cors-headers` installed + configured

**Backend** (Django settings.py):
```python
INSTALLED_APPS = [
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be near top
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:5173',  # Vite dev server
    'http://localhost:5173',
]
```

---

### **Issue 3: Token Expires During Long Request**
**Cause**: User idle > token expiry time, then makes request
**Solution**: Auto-refresh handled by interceptor, but shows delay

```javascript
// ✅ Interceptor handles this:
// Request fails with 401 → auto-refresh → retry
// User might see brief loading delay

// ⚠️ If user closes browser immediately after refresh:
// Token lost + must re-login
```

---

### **Issue 4: Cart becomes out of sync (frontend vs backend)**
**Cause**: User adds to cart in Tab1, same session in Tab2
**Solution**: Load cart data on every route change or use polling

```jsx
// Good: Load cart in Header useEffect (runs on mount)
useEffect(() => {
  api.get('/cart/my_cart/').then(r => setCart(r.data));
}, [user]);  // Rerun when user changes

// Better: Setup polling (if backend doesn't support WebSocket)
useEffect(() => {
  const interval = setInterval(() => {
    api.get('/cart/my_cart/').then(r => setCart(r.data));
  }, 30000);  // Refresh every 30s
  return () => clearInterval(interval);
}, [user]);
```

---

### **Issue 5: Payment Success but Cart Not Cleared**
**Cause**: Payment endpoint confuses order creation with cart clearing
**Solution**: Ensure backend only clears cart on order.status='paid'

**Backend** (orders/models.py or signals.py):
```python
# ✅ GOOD: Clear cart AFTER payment succeeds
@receiver(post_save, sender=Order)
def order_paid_signal(sender, instance, **kwargs):
    if instance.status == 'paid':
        instance.user.cart.items.all().delete()  # ← Clear cart

# ❌ BAD: Clear cart on order creation
# Cart cleared even if payment fails!
```

**Frontend**: After payment, refresh cart:
```jsx
useEffect(() => {
  if (paymentSuccess) {
    api.get('/cart/my_cart/').then(r => setCart(r.data));  // Verify cleared
  }
}, [paymentSuccess]);
```

---

### **Issue 6: Form Validation Errors Not Displayed**
**Cause**: Not checking for field-specific errors in response
**Solution**: Extract and display field-level errors

```jsx
// ❌ BAD: Only shows generic error
catch (err) {
  setError('Save failed');
}

// ✅ GOOD: Shows field-specific errors
catch (err) {
  const serverError = err.response?.data;
  if (serverError?.email) {
    setFieldError('email', serverError.email[0]);  // "Email already exists"
  } else if (serverError?.first_name) {
    setFieldError('first_name', serverError.first_name[0]);
  } else {
    setError('Save failed');
  }
}
```

**Expected DRF error format**:
```json
{
  "email": ["Email already exists"],
  "first_name": ["This field may not be blank"]
}
```

---

### **Issue 7: Race Condition (User browses while checkout)**
**Cause**: User starts multiple checkout processes simultaneously
**Solution**: Disable checkout button while processing

```jsx
const [processing, setProcessing] = useState(false);

const handleCheckout = async () => {
  if (processing) return;  // ← Guard against double-click
  
  setProcessing(true);
  try {
    await api.post('/orders/checkout/', { ... });
  } finally {
    setProcessing(false);
  }
};

// In JSX:
<button disabled={processing}>
  {processing ? 'Processing...' : 'Checkout'}
</button>
```

---

### **Issue 8: Silent Failures in Non-Critical Data**
**Cause**: Notifications fail to load → Header hidden
**Solution**: Always provide defaults in catch

```jsx
// ❌ BAD: No fallback
const [notifications, setNotifications] = useState([]);
api.get('/courses/notifications/')
  .then(r => setNotifications(r.data.results));
// If API fails: notifications stay [], but might crash rendering

// ✅ GOOD: Safe default
api.get('/courses/notifications/')
  .then(r => setNotifications(r.data?.results || []))
  .catch(() => setNotifications([]));
```

---

## 📋 Debugging Checklist

- [ ] Is base URL correct? (`http://127.0.0.1:8000/api/v1`)
- [ ] Is token in localStorage after login?
- [ ] Check Network tab: are headers including `Authorization: Bearer {token}`?
- [ ] Is endpoint path exact? (No trailing slash mismatches)
- [ ] Are request/response headers correct Content-Type?
- [ ] Check backend logs for errors
- [ ] Is CORS configured in Django?
- [ ] Try the API with Postman/cURL
- [ ] Check response format matches code expectations
- [ ] Is function wrapped in try/catch?
- [ ] Are loading states properly managed?

---

**Last Updated**: April 13, 2026
