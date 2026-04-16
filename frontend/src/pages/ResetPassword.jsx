import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';

export default function ResetPassword() {
  usePageSEO({
    title: 'Đặt lại mật khẩu | EduVNU',
    description: 'Tạo mật khẩu mới cho tài khoản EduVNU của bạn.'
  });

  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/accounts/password-reset-confirm/', {
        uidb64,
        token,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Mật khẩu mới</h2>
          <p>Tạo mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
        </div>
      </div>

      <div className="crs-auth-right">
        <div className="crs-auth-card">
          {success ? (
            <div className="crs-forgot-success">
              <div className="crs-forgot-success-icon">✅</div>
              <h2>Đặt lại thành công!</h2>
              <p className="crs-auth-sub">Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...</p>
              <Link to="/login" className="crs-auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '20px' }}>
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <h2>Đặt lại mật khẩu</h2>
              <p className="crs-auth-sub">Tạo mật khẩu mới cho tài khoản của bạn.</p>
              {error && <div className="crs-auth-error">{error}</div>}
              <form className="crs-auth-form" onSubmit={onSubmit}>
                <div className="crs-field">
                  <label htmlFor="new_password">Mật khẩu mới</label>
                  <div className="crs-password-wrapper">
                    <input
                      id="new_password"
                      type={showPassword ? 'text' : 'password'}
                      name="new_password"
                      value={form.new_password}
                      onChange={onChange}
                      placeholder="Ít nhất 8 ký tự"
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
                <div className="crs-field">
                  <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
                  <div className="crs-password-wrapper">
                    <input
                      id="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={onChange}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="crs-eye-btn"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <EyeIcon show={showConfirm} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="crs-auth-submit" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
