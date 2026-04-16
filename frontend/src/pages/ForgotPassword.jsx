import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';

export default function ForgotPassword() {
  usePageSEO({
    title: 'Quên mật khẩu | EduVNU',
    description: 'Đặt lại mật khẩu tài khoản EduVNU của bạn.'
  });

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/accounts/password-reset/', { email: email.trim() });
      const { uidb64, token } = res.data;
      // Điều hướng ngay đến trang đặt lại mật khẩu
      navigate(`/reset-password/${uidb64}/${token}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Email này chưa được đăng ký trong hệ thống.');
    } finally {
      setLoading(false);
    }
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
          <h2>Đặt lại mật khẩu</h2>
          <p>Nhập email đã đăng ký và hệ thống sẽ cấp quyền cho bạn thay đổi mật khẩu ngay lập tức.</p>
        </div>
      </div>

      <div className="crs-auth-right">
        <div className="crs-auth-card">
          <h2>Quên mật khẩu?</h2>
          <p className="crs-auth-sub">Nhập email đã đăng ký để tiếp tục.</p>
          {error && <div className="crs-auth-error">{error}</div>}
          <form className="crs-auth-form" onSubmit={onSubmit}>
            <div className="crs-field">
              <label htmlFor="forgot-email">Địa chỉ Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <button type="submit" className="crs-auth-submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận & Đặt lại mật khẩu'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" className="crs-auth-forgot">← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
