import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

export default function Profile() {
  usePageSEO({ title: 'Hồ sơ của tôi', description: 'Quản lý thông tin cá nhân, xem các khóa học đã đăng ký và theo dõi tiến độ học tập của bạn tại EduVNU.' });
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setTimeout(() => setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' }), 0);
    api.get('/courses/courses/my_courses/').then(r => setEnrollments(r.data)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/accounts/users/me/', form);
      await refreshUser();
      setMsg('Đã lưu thành công!');
      setEditing(false);
    }
    catch(err) { setMsg('Lưu thất bại.'); }
  };

  if (!user) return null;

  return (
    <div className="crs-page">
      {/* SIDEBAR */}
      <aside className="crs-profile-sidebar">
        <div className="crs-profile-avatar-wrap">
          <div className="crs-profile-avatar-lg">{(user.username || 'U')[0].toUpperCase()}</div>
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
              {enrollments.slice(0, 6).map(e => {
                const isDegree = !!(e.degree || e.degree_detail);
                const item = isDegree
                  ? (e.degree_detail || e.degree || {})
                  : (e.course || e);
                const title = item.title || 'Khóa học';
                const navId = isDegree ? `deg_${item.id || e.degree_id || e.id}` : (item.id || e.id);
                const gradient = isDegree
                  ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                  : 'linear-gradient(135deg,#0369a1,#0ea5e9)';
                return (
                  <div key={e.id} className="crs-enrolled-card" onClick={() => navigate(`/learn/${navId}`)}>
                    <div className="crs-enrolled-thumb" style={{background: gradient}}>
                      {title[0]}
                    </div>
                    <div className="crs-enrolled-info">
                      <p className="crs-enrolled-title">{title}</p>
                      <p className="crs-enrolled-org">
                        {isDegree ? '🎓 Bằng cấp' : (item.instructor?.first_name || item.instructor?.username || '')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
