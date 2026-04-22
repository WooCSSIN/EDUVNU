import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Learn from './pages/Learn';
import Schedule from './pages/Schedule';
import Documents from './pages/Documents';
import Checkout from './pages/Checkout';
import PaymentReturn from './pages/PaymentReturn';
import Orders from './pages/Orders';
import Degrees from './pages/Degrees';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import MockVNPay from './pages/MockVNPay';
import StripeCheckout from './pages/StripeCheckout';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCreateCourse from './pages/InstructorCreateCourse';
import InstructorCourseCurriculum from './pages/InstructorCourseCurriculum';
import InstructorStudents from './pages/InstructorStudents';
import InstructorReviews from './pages/InstructorReviews';
import InstructorFinance from './pages/InstructorFinance';
import InstructorHelp from './pages/InstructorHelp';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorSettings from './pages/InstructorSettings';
import InstructorLogin from './pages/InstructorLogin';
import InstructorCourseList from './pages/InstructorCourseList';
import AdminDashboard from './pages/AdminDashboard';
import CertificateView from './pages/CertificateView';
import Accomplishments from './pages/Accomplishments';
import Wishlist from './pages/Wishlist';
import FAQ from './pages/FAQ';
import Policies from './pages/Policies';
import About from './pages/About';
import Careers from './pages/Careers';
import EduVNUPlus from './pages/EduVNUPlus';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/axios';

/* ── MEGA MENU DATA (Dynamic) ── */

function MegaMenu({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [degrees, setDegrees] = useState([]);

  useEffect(() => {
    // Fetch Categories
    api.get('/courses/categories/').then(r => setCategories((r.data.results || r.data || []).slice(0, 8))).catch(() => {});
    // Fetch Degree Programs 
    api.get('/courses/degree-programs/').then(r => setDegrees((r.data.results || r.data || []).slice(0, 6))).catch(() => {});
  }, []);

  const levels = [
    { label: 'Người mới bắt đầu', value: 'Người mới' },
    { label: 'Trung cấp', value: 'Trung cấp' },
    { label: 'Tất cả các cấp độ', value: 'Tất cả trình độ' }
  ];

  return (
    <div className="mega-menu" onMouseLeave={onClose}>
      <div className="mega-menu-inner">
        {/* Cột 1: Danh mục thực từ DB */}
        <div className="mega-col">
          <h4 className="mega-col-title">Danh mục khóa học</h4>
          <ul>
            {categories.map(c => (
              <li key={c.id}>
                <Link to={`/?category=${c.id}`} className="mega-item" onClick={onClose}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/" className="mega-see-all" onClick={onClose}>Xem tất cả</Link>
        </div>

        {/* Cột 2: Lọc theo Trình độ */}
        <div className="mega-col">
          <h4 className="mega-col-title">Trình độ học vấn</h4>
          <ul>
            {levels.map(lvl => (
              <li key={lvl.value}>
                <Link to={`/?level=${lvl.value}`} className="mega-item" onClick={onClose}>
                  {lvl.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Chương trình Bằng cấp */}
        <div className="mega-col">
          <h4 className="mega-col-title">Chứng chỉ chuyên môn</h4>
          <ul>
            {degrees.map(d => (
              <li key={d.id}>
                {/* Degrees chưa có API query params cho riêng nó ở trang chủ nên đẩy sang trang degrees chuyên dụng */}
                <Link to="/degrees" className="mega-item" onClick={onClose} style={{ lineHeight: 1.4, marginBottom: 8, display: 'block' }}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mega-footer">
        <span>Không chắc bắt đầu từ đâu?</span>
        <Link to="/?price_max=0" onClick={onClose} style={{color: '#0056D2', fontWeight: 600, textDecoration: 'none', marginLeft: 8, marginRight: 8}}>Duyệt các khóa học miễn phí</Link>
        <span>hoặc</span>
        <Link to="/plus" onClick={onClose} className="mega-plus-link">Tìm hiểu thêm về EduVNU <span className="plus-badge">PLUS</span></Link>
      </div>
    </div>
  );
}

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const megaRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.get('/cart/my_cart/').then(r => setCartCount(r.data.items?.length || 0)).catch(() => {});
      api.get('/courses/notifications/').then(r => setNotifications(r.data.results || r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/set-state-in-effect
    } else { setCartCount(0); }
  }, [user]);

  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await api.post(`/courses/notifications/${id}/mark_as_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch (e) { void e; }
  };

  return (
    <header className="crs-header">
      <div className="crs-header-inner">
        {/* LEFT ... */}
        <div className="crs-nav-left">
          <Link to="/" className="crs-logo" style={{display: 'flex', alignItems: 'center', marginLeft: '30px', marginRight: '30px'}}>
            <img src="/course_images/eduvn.png" alt="EduVNU Logo" style={{height: '90px', objectFit: 'contain', transform: 'scale(2.8)'}} />
          </Link>
          <div className="mega-trigger" ref={megaRef} onMouseEnter={() => setShowMega(true)}>
            <button className="crs-explore-btn">Khám phá ▾</button>
            {showMega && <MegaMenu onClose={() => setShowMega(false)} />}
          </div>
          {user && <Link to="/schedule" className="crs-nav-link">Việc học của tôi</Link>}
          <Link to="/degrees" className="crs-nav-link">Trình độ</Link>
          <div className="crs-search">
            <span className="crs-search-icon">🔍</span>
            <input type="text" placeholder="Bạn muốn học gì?" onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { navigate(`/?q=${encodeURIComponent(e.target.value.trim())}`); e.target.value = ''; } }} />
          </div>
        </div>

        <nav className="crs-nav-right" aria-label="Điều hướng phụ">
          {user && (
            <div className="notif-bell-container" ref={notifRef} style={{position: 'relative', marginRight: '15px'}}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#64748b'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && <span style={{position:'absolute', top:0, right:0, background:'#ef4444', border:'2px solid white', width:12, height:12, borderRadius:'50%'}}></span>}
              </button>
              {showNotifs && (
                <div style={{position:'absolute', top:'100%', right:0, width:320, background:'white', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius:'12px', zIndex:2000, marginTop:10, maxHeight:400, overflowY:'auto'}}>
                  <div style={{padding:'15px', borderBottom:'1px solid #f1f5f9', fontWeight:700}}>Thông báo</div>
                  {notifications.length === 0 ? (
                    <div style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>Không có thông báo nào.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => { markRead(n.id); if(n.link) navigate(n.link); setShowNotifs(false); }} style={{padding:'15px', borderBottom:'1px solid #f1f5f9', cursor:'pointer', background: n.is_read ? 'transparent' : '#f0f9ff'}}>
                        <div style={{fontSize:'0.9rem', fontWeight: n.is_read ? 400 : 700}}>{n.title}</div>
                        <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:4}}>{n.message}</div>
                        <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:8}}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <Link to="/cart" className="crs-cart-icon-btn" title="Giỏ hàng" style={{position:'relative'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {user ? (
            <div className="crs-user-menu" ref={userMenuRef}>
              <button className="crs-avatar-btn" onClick={() => setShowUserMenu(v => !v)}><span className="crs-avatar">{user.username[0].toUpperCase()}</span></button>
              {showUserMenu && (
                <div className="crs-dropdown">
                  <div className="crs-dropdown-header"><span className="crs-avatar lg">{user.username[0].toUpperCase()}</span><div><p className="crs-dd-name">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</p><p className="crs-dd-email">{user.email}</p></div></div>
                  <div className="crs-dropdown-divider" /><Link to="/profile" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Hồ sơ</Link>
                  {(user.is_instructor || user.is_staff) && <Link to="/instructor" className="crs-dd-item" style={{color: '#0056d2', fontWeight: 'bold'}} onClick={() => setShowUserMenu(false)}>Dashboard Giảng viên</Link>}
                  {user.is_staff && <Link to="/admin" className="crs-dd-item" style={{color: '#dc2626', fontWeight: 'bold'}} onClick={() => setShowUserMenu(false)}>Admin Monitoring</Link>}
                  <Link to="/orders" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Mua hàng</Link>
                  <Link to="/wishlist" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Khóa học yêu thích</Link>
                  <Link to="/accomplishments" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Thành tích</Link>
                  <button className="crs-dd-item logout" onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="crs-btn-outline">Đăng nhập</Link>
              <Link to="/login" className="crs-btn-solid">Tham gia miễn phí</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { useLocation } from 'react-router-dom';

function AppLayout() {
  const location = useLocation();
  const isInstructorPage = location.pathname.startsWith('/instructor');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isSpecialPage = isInstructorPage || isAdminPage;

  return (
    <div className="crs-app">
      {!isSpecialPage && <Header />}
      <main className={isSpecialPage ? "" : "crs-main"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/learn/:courseId" element={<Learn />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-return" element={<PaymentReturn />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/degrees" element={<Degrees />} />
          <Route path="/certificate/:courseId" element={<CertificateView />} />
          <Route path="/accomplishments" element={<Accomplishments />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/about" element={<About />} />
          <Route path="/career" element={<Careers />} />
          <Route path="/plus" element={<EduVNUPlus />} />
          <Route path="/mock-vnpay" element={<MockVNPay />} />
          <Route path="/stripe-checkout" element={<StripeCheckout />} />
          <Route path="/instructor/login" element={<InstructorLogin />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<InstructorCourseList />} /> 
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route path="/instructor/reviews" element={<InstructorReviews />} />
          <Route path="/instructor/finance" element={<InstructorFinance />} />
          <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
          <Route path="/instructor/settings" element={<InstructorSettings />} />
          <Route path="/instructor/help" element={<InstructorHelp />} />
          <Route path="/instructor/create-course" element={<InstructorCreateCourse />} />
          <Route path="/instructor/course/:courseId/curriculum" element={<InstructorCourseCurriculum />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isSpecialPage && (
        <footer className="crs-footer">
          <div className="crs-footer-inner">
            <div className="crs-footer-brand">
              <span className="crs-logo white" style={{display: 'inline-flex', alignItems: 'center', marginLeft: '50px', marginBottom: '20px'}}>
                <img src="/course_images/eduvn.png" alt="EduVNU Logo" style={{height: '120px', objectFit: 'contain', transform: 'scale(3.6)'}} />
              </span>
              <p>Nền tảng học trực tuyến hàng đầu Việt Nam</p>
              <div className="crs-footer-socials">
                <span className="social-icon facebook">f</span>
                <span className="social-icon youtube">▶</span>
                <span className="social-icon twitter">𝕏</span>
                <span className="social-icon instagram">📷</span>
              </div>
            </div>
            <div className="crs-footer-col">
              <h4>Học viên</h4>
              <Link to="/schedule">Việc học của tôi</Link>
              <Link to="/documents">Tài liệu</Link>
              <Link to="/orders">Lịch sử giao dịch</Link>
              <Link to="/cart">Giỏ hàng</Link>
            </div>
            <div className="crs-footer-col">
              <h4>Chăm sóc khách hàng</h4>
              <Link to="/faq">Câu hỏi thường gặp (FAQ)</Link>
              <Link to="/policies">Chính sách hoàn trả</Link>
              <Link to="/policies">Chính sách bảo mật</Link>
              <Link to="/policies">Điều khoản sử dụng</Link>
            </div>
            <div className="crs-footer-col">
              <h4>Về chúng tôi</h4>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/career">Tuyển dụng</Link>
              <Link to="/contact">Trợ giúp & Liên hệ</Link>
            </div>
          </div>
          <div className="crs-footer-bottom">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, width: '100%' }}>
              <span>© 2026 EduVNU. All rights reserved.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', fontSize: '12px', color: '#94a3b8' }}>
                <span> GPKD số: 0102345678 — Sở KH&ĐT TP. Hà Nội cấp ngày 15/01/2024</span>
                <span>|</span>
                <span> MST: 0102345678</span>
                <span>|</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                   Đã đăng ký Bộ Công Thương
                </span>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
              Trụ sở: 144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội • Hotline: 1900 636 595 • Email: support@eduvnu.edu.vn
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
