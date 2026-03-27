import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  usePageSEO({
    title: 'Đăng nhập & Đăng ký',
    description: 'Đăng nhập hoặc tạo tài khoản EduVNU để bắt đầu hành trình học tập trực tuyến của bạn. Tham gia cộng đồng hàng triệu học viên.'
  });
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onChange = e => { setForm(p => ({...p, [e.target.name]: e.target.value})); setError(''); };

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
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} required />
              </div>
            )}
            <div className="crs-field">
              <label>{isLogin ? 'Tên đăng nhập' : 'Tên đăng nhập'}</label>
              <input type="text" name="username" value={form.username} onChange={onChange} required />
            </div>
            <div className="crs-field">
              <label>Mật khẩu</label>
              <input type="password" name="password" value={form.password} onChange={onChange} required />
            </div>
            {!isLogin && (
              <div className="crs-field">
                <label>Nhập lại mật khẩu</label>
                <input type="password" name="password2" value={form.password2} onChange={onChange} required />
              </div>
            )}
            <button type="submit" className="crs-auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
            </button>
            <button type="button" className="crs-auth-switch" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
            {isLogin && <a href="#" className="crs-auth-forgot">Quên mật khẩu?</a>}
          </form>
        </div>
      </div>
    </div>
  );
}
