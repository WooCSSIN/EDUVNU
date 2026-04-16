import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import { useAuth } from '../context/AuthContext';

const EyeIcon = ({ show }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {show ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    )}
  </svg>
);

export default function Auth() {
  usePageSEO({
    title: 'Đăng nhập & Đăng ký',
    description: 'Đăng nhập hoặc tạo tài khoản EduVNU để bắt đầu hành trình học tập trực tuyến của bạn. Tham gia cộng đồng hàng triệu học viên.'
  });

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isLogin) { await login(form.username, form.password); }
      else {
        if (form.password !== form.password2) { setError('Mật khẩu không khớp.'); setLoading(false); return; }
        await register(form.username, form.email, form.password, form.password2);
      }
      navigate('/');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.error || d?.username?.[0] || d?.email?.[0] || d?.password?.[0] || 'Đã có lỗi xảy ra.');
    } finally { setLoading(false); }
  };

  return (
    <div className="crs-auth-page">
      <div className="crs-auth-left">
        <div className="crs-spline-container">
          <iframe
            src="https://my.spline.design/animatedshapeblend-Xyfv75Xnj63kq18pxYYCVAbJ/"
            frameBorder="0"
            width="100%"
            height="100%"
            title="Spline 3D Design"
          ></iframe>
        </div>
        <div className="crs-auth-left-content">
          <h2>Học không giới hạn</h2>
          <p>Phát triển kỹ năng của bạn với các khóa học từ Google, IBM, Meta và hàng trăm tổ chức hàng đầu.</p>
        </div>
      </div>

      <div className="crs-auth-right">
        <div className="crs-auth-card">
          <h2>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
          <p className="crs-auth-sub">{isLogin ? 'Chào mừng trở lại!' : 'Tham gia cùng hàng triệu học viên'}</p>
          {error && <div className="crs-auth-error">{error}</div>}
          <form className="crs-auth-form" onSubmit={onSubmit}>
            {!isLogin && (
              <div className="crs-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" value={form.email} onChange={onChange} required />
              </div>
            )}
            <div className="crs-field">
              <label htmlFor="username">Tên đăng nhập</label>
              <input id="username" type="text" name="username" value={form.username} onChange={onChange} required />
            </div>

            {/* Mật khẩu với icon mắt */}
            <div className="crs-field">
              <label htmlFor="password">Mật khẩu</label>
              <div className="crs-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                />
                <button
                  type="button"
                  className="crs-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="crs-field">
                <label htmlFor="password2">Nhập lại mật khẩu</label>
                <div className="crs-password-wrapper">
                  <input
                    id="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    name="password2"
                    value={form.password2}
                    onChange={onChange}
                    required
                  />
                  <button
                    type="button"
                    className="crs-eye-btn"
                    onClick={() => setShowPassword2(v => !v)}
                    aria-label={showPassword2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <EyeIcon show={showPassword2} />
                  </button>
                </div>
              </div>
            )}

            {/* Link quên mật khẩu */}
            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <Link to="/forgot-password" className="crs-auth-forgot">Quên mật khẩu?</Link>
              </div>
            )}

            <button type="submit" className="crs-auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
            </button>
            <button type="button" className="crs-auth-switch" onClick={() => { setIsLogin(!isLogin); setError(''); setShowPassword(false); setShowPassword2(false); }}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>

            {isLogin && (
              <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>Dành cho Đối tác</p>
                <Link to="/instructor/login" style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: '20px',
                  border: '1px solid #0056d2', color: '#0056d2', fontWeight: 600,
                  fontSize: '0.85rem', textDecoration: 'none'
                }}>Đăng nhập Giảng viên</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
