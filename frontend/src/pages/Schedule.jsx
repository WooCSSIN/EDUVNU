import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import usePageSEO from '../hooks/usePageSEO';

const TABS = ['Đang học', 'Hoàn thành', 'Tất cả'];

export default function Schedule() {
  usePageSEO({ title: 'Lịch trình học', description: 'Quản lý lịch trình, thời gian học tập và theo dõi tiến độ các khóa học của bạn.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Đang học');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/courses/courses/my_schedule/')
      .then(r => setSchedule(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const filtered = schedule.filter(item => {
    if (tab === 'Đang học') return item.percent < 100;
    if (tab === 'Hoàn thành') return item.percent === 100;
    return true;
  });

  if (loading) return <div className="crs-loading">Đang tải...</div>;

  return (
    <div className="crs-my-learning">
      <div className="crs-page-header">
        <h1>Việc học của tôi</h1>
      </div>

      {/* TABS */}
      <div className="crs-tabs">
        {TABS.map(t => (
          <button key={t} className={`crs-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
            <span className="crs-tab-count">
              {t === 'Đang học' ? schedule.filter(i => i.percent < 100).length
               : t === 'Hoàn thành' ? schedule.filter(i => i.percent === 100).length
               : schedule.length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="crs-empty-state centered">
          <div className="crs-empty-icon">📚</div>
          <h3>Chưa có khóa học nào</h3>
          <p>Hãy khám phá và đăng ký khóa học đầu tiên của bạn</p>
          <button className="crs-btn-solid" onClick={() => navigate('/')}>Khám phá khóa học</button>
        </div>
      ) : (
        <div className="crs-learning-grid">
          {filtered.map(item => (
            <div key={item.id} className="crs-learning-card">
              <div className="crs-lc-thumb" style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)'}}>
                <span>{fixText(item.course.title)[0]}</span>
              </div>
              <div className="crs-lc-body">
                <p className="crs-lc-org">{fixText(item.course.instructor?.first_name || item.course.instructor?.username || '')}</p>
                <h4 className="crs-lc-title">{fixText(item.course.title)}</h4>
                <div className="crs-lc-progress">
                  <div className="crs-progress-bar">
                    <div className="crs-progress-fill" style={{width: `${item.percent}%`}} />
                  </div>
                  <span className="crs-progress-label">{item.percent}% hoàn thành</span>
                </div>
                <div className="crs-lc-meta">
                  <span>{item.completed_lessons}/{item.total_lessons} bài học</span>
                  <span>Đăng ký: {new Date(item.enrolled_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <button className="crs-btn-solid sm" onClick={() => navigate(`/learn/${item.course.id}`)}>
                  {item.percent === 100 ? 'Xem lại' : item.percent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
