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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const filtered = schedule.filter(item => {
    if (tab === 'Đang học') return item.percent < 100;
    if (tab === 'Hoàn thành') return item.percent === 100;
    return true;
  });

  if (loading) return <div className="crs-loading">Đang tải...</div>;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      {/* Lớp nền Spline 3D (Bản đồ) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <iframe 
          src="https://my.spline.design/earth-ioVfVKnUbg0yrx8WVxPZmIrd/" 
          frameBorder="0" 
          title="Bản đồ Học tập 3D"
          style={{ width: '100%', height: 'calc(100% + 80px)', border: 'none', display: 'block', opacity: 0.8 }}
        ></iframe>
      </div>
      
      {/* Overlay gradient tối màu để dễ đọc text */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.9) 100%)', pointerEvents: 'none', zIndex: 1 }}></div>

      <div className="crs-my-learning" style={{ position: 'relative', zIndex: 2, paddingTop: '40px', maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        
        {/* Bản đồ định vị & Header */}
        <div style={{ background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bản đồ Học tập VNU
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>Định vị tiến độ học tập của bạn. Hoàn thành các khóa học để mở khóa chứng chỉ và kiến thức chuyên sâu.</p>
        </div>

        {/* TABS */}
        <div className="crs-tabs" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', display: 'inline-flex', marginBottom: '32px' }}>
          {TABS.map(t => {
             const count = t === 'Đang học' ? schedule.filter(i => i.percent < 100).length : t === 'Hoàn thành' ? schedule.filter(i => i.percent === 100).length : schedule.length;
             return (
              <button key={t} 
                      className={`crs-tab ${tab === t ? 'active' : ''}`} 
                      onClick={() => setTab(t)}
                      style={{ background: tab === t ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: tab === t ? '#60a5fa' : '#9ca3af', border: tab === t ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent', borderRadius: '6px', transition: 'all 0.3s' }}>
                {t}
                <span className="crs-tab-count" style={{ background: tab === t ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="crs-empty-state centered" style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <div className="crs-empty-icon" style={{ fontSize: '48px', filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}>📚</div>
            <h3 style={{ color: '#e5e7eb' }}>Chưa có khóa học nào</h3>
            <p style={{ color: '#9ca3af' }}>Hãy khám phá và đăng ký khóa học đầu tiên của bạn.</p>
            <button className="crs-btn-solid" onClick={() => navigate('/')} style={{ background: '#3b82f6', marginTop: '16px' }}>Khám phá khóa học</button>
          </div>
        ) : (
          <div className="crs-learning-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filtered.map(item => {
              const isDone = item.percent === 100;
              return (
                <div key={item.id} className="crs-learning-card" style={{ background: 'rgba(30, 30, 30, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.2)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div className="crs-lc-thumb" style={{ background: isDone ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #1e3a8a, #3b82f6)', height: '140px', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Hiệu ứng mờ */}
                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(10px)' }}></div>
                    <span style={{ position: 'absolute', bottom: '16px', left: '16px', fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      {item.course.subject_code ? `[${item.course.subject_code}]` : fixText(item.course.title)[0]}
                    </span>
                  </div>
                  
                  <div className="crs-lc-body" style={{ padding: '24px', background: 'transparent' }}>
                    <p className="crs-lc-org" style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>
                      {item.course.faculty || fixText(item.course.instructor?.first_name || item.course.instructor?.username || 'VNU')}
                    </p>
                    <h4 className="crs-lc-title" style={{ color: '#f3f4f6', fontSize: '18px', fontWeight: '700', marginTop: '4px', marginBottom: '16px', height: '48px', overflow: 'hidden' }}>
                      {fixText(item.course.title)}
                    </h4>
                    
                    <div className="crs-lc-progress" style={{ background: 'transparent', padding: 0, margin: '0 0 16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: '#9ca3af' }}>{item.completed_lessons}/{item.total_lessons} bài học</span>
                        <span style={{ color: isDone ? '#10b981' : '#60a5fa', fontWeight: '700' }}>{item.percent}%</span>
                      </div>
                      <div className="crs-progress-bar" style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div className="crs-progress-fill" style={{ width: `${item.percent}%`, background: isDone ? '#10b981' : '#3b82f6', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      {isDone && (
                        <button onClick={() => {
                          import('../api/axios').then(({ default: api }) => {
                            api.get(`/courses/courses/${item.course.id}/certificate/`, { responseType: 'blob' })
                              .then(res => {
                                const file = new Blob([res.data], { type: 'application/pdf' });
                                const fileURL = window.URL.createObjectURL(file);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = fileURL;
                                a.download = `Chứng-Chỉ-VNU-${item.course.id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(fileURL);
                                document.body.removeChild(a);
                              })
                              // eslint-disable-next-line no-unused-vars
                              .catch(err => alert('Không thể tải chứng chỉ lúc này. Vui lòng thử lại sau.'));
                          });
                        }}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.4)'; }}>
                          🏆 Nhận Chứng Chỉ
                        </button>
                      )}
                      
                      <button onClick={() => navigate(`/learn/${item.course.id}`)}
                              style={{ flex: isDone ? 1 : '1 1 100%', padding: '12px', borderRadius: '8px', background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)', color: isDone ? '#34d399' : '#60a5fa', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = isDone ? '#10b981' : '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = isDone ? '#34d399' : '#60a5fa'; }}>
                        {isDone ? 'Xem lại bài học' : item.percent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
