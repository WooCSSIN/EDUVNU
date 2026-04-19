import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';

const MailIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M22 4L12 13 2 4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

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
          <div className="crs-reset-icon-wrap">
            <MailIcon />
          </div>
          <h2>Quên mật khẩu?</h2>
          <p className="crs-auth-sub">Nhập email đã đăng ký để xác thực và đặt lại mật khẩu ngay.</p>

          {error && (
            <div className="crs-auth-error crs-fade-in">
              <span className="crs-auth-error-icon">⚠</span>
              {error}
            </div>
          )}

          <form className="crs-auth-form" onSubmit={onSubmit}>
            <div className="crs-field">
              <label htmlFor="forgot-email">Địa chỉ Email</label>
              <div className="crs-input-icon-wrap">
                <svg className="crs-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 4L12 13 2 4"/>
                </svg>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@vnu.edu.vn"
                  className="crs-input-with-icon"
                  required
                />
              </div>
            </div>

            <button type="submit" className="crs-auth-submit" disabled={loading}>
              {loading ? (
                <span className="crs-btn-loading">
                  <span className="crs-btn-spinner"></span>
                  Đang xác thực...
                </span>
              ) : 'Xác nhận & Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="crs-reset-security-note">
            <ShieldIcon />
            <span>Thông tin của bạn được bảo mật tuyệt đối</span>
          </div>

          <div className="crs-reset-back-link">
            <Link to="/login" className="crs-auth-forgot">← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
