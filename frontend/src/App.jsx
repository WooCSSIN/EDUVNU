import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Learn from './pages/Learn';
import Schedule from './pages/Schedule';
import Documents from './pages/Documents';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Degrees from './pages/Degrees';
import CourseDetail from './pages/CourseDetail';
import { AuthProvider, useAuth } from './context/AuthContext';

/* ── MEGA MENU DATA ── */
const EXPLORE_COLS = [
  {
    title: 'Khám phá vai trò',
    items: ['Nhà phân tích dữ liệu','Quản lý dự án','Nhà phân tích An ninh Mạng','Nhà khoa học dữ liệu','Kỹ sư học máy','Thiết kế UX/UI','Chuyên gia Marketing số'],
  },
  {
    title: 'Khám phá danh mục',
    items: ['Trí tuệ nhân tạo','Kinh doanh','Khoa học dữ liệu','Công nghệ thông tin','Khoa học máy tính','Chăm sóc sức khỏe','Phát triển cá nhân','Học ngôn ngữ'],
  },
  {
    title: 'Nhận Chứng chỉ Chuyên môn',
    items: ['Kinh doanh','Khoa học máy tính','Khoa học dữ liệu','Công nghệ thông tin'],
  },
  {
    title: 'Kỹ năng thịnh hành',
    items: ['Python','Trí tuệ nhân tạo','Excel','Học máy','SQL','Quản lý dự án','Power BI','Tiếp thị'],
  },
];

function MegaMenu({ onClose }) {
  return (
    <div className="mega-menu" onMouseLeave={onClose}>
      <div className="mega-menu-inner">
        {EXPLORE_COLS.map(col => (
          <div key={col.title} className="mega-col">
            <h4 className="mega-col-title">{col.title}</h4>
            <ul>
              {col.items.map(item => (
                <li key={item}><a href="#" className="mega-item" onClick={onClose}>{item}</a></li>
              ))}
            </ul>
            <a href="#" className="mega-see-all" onClick={onClose}>Xem tất cả</a>
          </div>
        ))}
      </div>
      <div className="mega-footer">
        <span>Không chắc bắt đầu từ đâu?</span>
        <a href="#">Duyệt các khóa học miễn phí</a>
        <span>hoặc</span>
        <a href="#" className="mega-plus-link">Tìm hiểu thêm về EduVNU <span className="plus-badge">PLUS</span></a>
      </div>
    </div>
  );
}

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const megaRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="crs-header">
      <div className="crs-header-inner">
        {/* LEFT */}
        <div className="crs-nav-left">
          <Link to="/" className="crs-logo">EduVNU</Link>

          {/* KHÁM PHÁ BUTTON */}
          <div className="mega-trigger" ref={megaRef} onMouseEnter={() => setShowMega(true)}>
            <button className="crs-explore-btn">
              Khám phá <span className="crs-chevron">▾</span>
            </button>
            {showMega && <MegaMenu onClose={() => setShowMega(false)} />}
          </div>

          {user && <Link to="/schedule" className="crs-nav-link">Việc học của tôi</Link>}
          <Link to="/degrees" className="crs-nav-link">Trình độ</Link>

          <div className="crs-search">
            <span className="crs-search-icon">🔍</span>
            <input type="text" placeholder="Bạn muốn học gì?" />
          </div>
        </div>

        {/* RIGHT */}
        <nav className="crs-nav-right">
          <Link to="/cart" className="crs-cart-icon-btn" title="Giỏ hàng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </Link>

          {user ? (
            <div className="crs-user-menu" ref={userMenuRef}>
              <button className="crs-avatar-btn" onClick={() => setShowUserMenu(v => !v)}>
                <span className="crs-avatar">{user.username[0].toUpperCase()}</span>
              </button>
              {showUserMenu && (
                <div className="crs-dropdown">
                  {/* HEADER */}
                  <div className="crs-dropdown-header">
                    <span className="crs-avatar lg">{user.username[0].toUpperCase()}</span>
                    <div>
                      <p className="crs-dd-name">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</p>
                      <p className="crs-dd-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="crs-dropdown-divider" />

                  {/* MENU ITEMS */}
                  <Link to="/profile" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Hồ sơ</Link>
                  <Link to="/orders" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Mua hàng của tôi</Link>
                  <Link to="/profile" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Cài đặt</Link>
                  <Link to="/schedule" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Cập nhật</Link>
                  <Link to="/schedule" className="crs-dd-item" onClick={() => setShowUserMenu(false)}>Thành tích</Link>
                  <a href="#" className="crs-dd-item">Trung tâm Trợ giúp</a>
                  <div className="crs-dropdown-divider" />
                  <button className="crs-dd-item logout" onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}>
                    Đăng xuất
                  </button>

                  {/* PLUS PROMO */}
                  <div className="crs-dd-plus">
                    <p className="crs-dd-plus-title">Nhận EduVNU <span className="plus-badge">PLUS</span></p>
                    <p className="crs-dd-plus-sub">Truy cập hơn 10.000 khoá học</p>
                  </div>
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

function AppLayout() {
  return (
    <div className="crs-app">
      <Header />
      <main className="crs-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/learn/:courseId" element={<Learn />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/degrees" element={<Degrees />} />
        </Routes>
      </main>
      <footer className="crs-footer">
        <div className="crs-footer-inner">
          <div className="crs-footer-brand">
            <span className="crs-logo white">EduVNU</span>
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
            <a href="#">Hướng dẫn thanh toán</a>
            <a href="#">Chính sách hoàn trả</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
          </div>
          <div className="crs-footer-col">
            <h4>Về chúng tôi</h4>
            <a href="#">Giới thiệu</a>
            <a href="#">Tuyển dụng</a>
            <a href="#">Trợ giúp</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
        <div className="crs-footer-bottom">
          <span>© 2026 EduVNU. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
