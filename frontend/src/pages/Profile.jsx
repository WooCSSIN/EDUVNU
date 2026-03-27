import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

export default function Profile() {
  usePageSEO({ title: 'Hồ sơ của tôi', description: 'Quản lý thông tin cá nhân, xem các khóa học đã đăng ký và theo dõi tiến độ học tập của bạn tại EduVNU.' });
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' });
    api.get('/courses/courses/my_courses/').then(r => setEnrollments(r.data)).catch(() => {});
  }, [user, authLoading]);

  const save = async (e) => {
    e.preventDefault();
    try { await api.patch('/accounts/users/me/', form); setMsg('Đã lưu thành công!'); setEditing(false); }
    catch { setMsg('Lưu thất bại.'); }
  };

  if (!user) return null;

  return (
    <div className="crs-page">
      {/* SIDEBAR */}
      <aside className="crs-profile-sidebar">
        <div className="crs-profile-avatar-wrap">
          <div className="crs-profile-avatar-lg">{user.username[0].toUpperCase()}</div>
          <h2>{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</h2>
          <p className="crs-muted">{user.email}</p>
          <span className="crs-role-badge">{user.is_instructor ? 'Giảng viên' : 'Học viên'}</span>
        </div>
        <nav className="crs-profile-nav">
          <Link to="/profile" className="crs-profile-nav-item active">Hồ sơ của tôi</Link>
          <Link to="/schedule" className="crs-profile-nav-item">Việc học của tôi</Link>
          <Link to="/orders" className="crs-profile-nav-item">Lịch sử giao dịch</Link>
          <Link to="/documents" className="crs-profile-nav-item">Tài liệu</Link>
          <button className="crs-profile-nav-item danger" onClick={() => { logout(); navigate('/'); }}>Đăng xuất</button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="crs-profile-main">
        <div className="crs-card">
          <div className="crs-card-header">
            <h3>Thông tin cá nhân</h3>
            {!editing && <button className="crs-btn-outline sm" onClick={() => setEditing(true)}>Chỉnh sửa</button>}
          </div>
          {msg && <div className={`crs-alert ${msg.includes('thành') ? 'success' : 'error'}`}>{msg}</div>}
          {editing ? (
            <form onSubmit={save} className="crs-form">
              <div className="crs-form-row">
                <div className="crs-field"><label>Họ</label><input value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} /></div>
                <div className="crs-field"><label>Tên</label><input value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} /></div>
              </div>
              <div className="crs-field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} /></div>
              <div className="crs-form-actions">
                <button type="submit" className="crs-btn-solid">Lưu thay đổi</button>
                <button type="button" className="crs-btn-outline" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </form>
          ) : (
            <div className="crs-info-grid">
              <div className="crs-info-item"><span>Tên đăng nhập</span><strong>{user.username}</strong></div>
              <div className="crs-info-item"><span>Họ tên</span><strong>{user.first_name ? `${user.first_name} ${user.last_name}` : '—'}</strong></div>
              <div className="crs-info-item"><span>Email</span><strong>{user.email || '—'}</strong></div>
              <div className="crs-info-item"><span>Vai trò</span><strong>{user.is_instructor ? 'Giảng viên' : 'Học viên'}</strong></div>
            </div>
          )}
        </div>

        {/* ENROLLED COURSES */}
        <div className="crs-card">
          <div className="crs-card-header">
            <h3>Khóa học đã đăng ký ({enrollments.length})</h3>
            <Link to="/schedule" className="crs-link">Xem tất cả →</Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="crs-empty-state">
              <p>Bạn chưa đăng ký khóa học nào.</p>
              <Link to="/" className="crs-btn-solid">Khám phá khóa học</Link>
            </div>
          ) : (
            <div className="crs-enrolled-grid">
              {enrollments.slice(0, 4).map(e => (
                <div key={e.id} className="crs-enrolled-card" onClick={() => navigate(`/learn/${e.course.id}`)}>
                  <div className="crs-enrolled-thumb" style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)'}}>
                    {e.course.title[0]}
                  </div>
                  <div className="crs-enrolled-info">
                    <p className="crs-enrolled-title">{e.course.title}</p>
                    <p className="crs-enrolled-org">{e.course.instructor?.first_name || e.course.instructor?.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
