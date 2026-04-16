import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── DATA ── */
const DEGREE_LEVELS = ['Bằng cử nhân', 'Bằng thạc sĩ'];
const SUBJECTS = [
  'Arts and Humanities', 'Business', 'Computer Science',
  'Data Science', 'Information Technology', 'Math and Logic',
  'Physical Science and Engineering', 'Social Sciences',
];

const GRAD_MAP = {
  'BK': 'linear-gradient(135deg,#c0392b,#e74c3c)',
  'QG': 'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'KT': 'linear-gradient(135deg,#059669,#34d399)',
  'FP': 'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'CN': 'linear-gradient(135deg,#0891b2,#22d3ee)',
  'KH': 'linear-gradient(135deg,#b45309,#f59e0b)',
  'NT': 'linear-gradient(135deg,#be185d,#f472b6)',
};

/* ── DEGREE DETAIL MODAL ── */
function DegreeDetail({ program, onClose }) {
  const navigate = useNavigate();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState(0);

  const TABS = [
    { id: 'overview', label: '📋 Tổng quan' },
    { id: 'curriculum', label: '📚 Chương trình' },
    { id: 'videos', label: '🎥 Video liên quan' },
    { id: 'skills', label: '🏆 Kỹ năng' },
  ];

  const [completedKeys, setCompletedKeys] = useState([]);
  const { user } = useAuth();

  // Lấy tiến độ hiện tại của user cho bằng này
  useEffect(() => {
    if (user) {
      api.get('/courses/courses/my_schedule/').then(res => {
        const myDeg = res.data.find(item => item.degree_id === program.id);
        if (myDeg) setCompletedKeys(myDeg.completed_keys || []);
      }).catch(() => {});
    }
  }, [user, program.id]);

  const toggleLesson = async (mIdx, lIdx) => {
    if (!user) return;
    const key = `${mIdx}-${lIdx}`;
    const isCompleted = !completedKeys.includes(key);
    
    // Cập nhật UI nhanh (Optimistic UI)
    setCompletedKeys(prev => isCompleted ? [...prev, key] : prev.filter(k => k !== key));

    try {
      await api.post('/courses/courses/update_degree_progress/', {
        degree_id: program.id,
        lesson_key: key,
        is_completed: isCompleted
      });
    } catch (e) {
      // Rollback nếu lỗi
      setCompletedKeys(prev => isCompleted ? prev.filter(k => k !== key) : [...prev, key]);
    }
  };

  const grad = GRAD_MAP[program.logo] || 'linear-gradient(135deg,#0369a1,#0ea5e9)';

  return (
    <>
      <div className="deg-modal-overlay" onClick={onClose}>
        <div className="deg-modal" style={{ maxWidth: 780, width: '94%' }} onClick={e => e.stopPropagation()}>
          <button className="deg-modal-close" onClick={onClose}>✕</button>

          {/* ... HEADER ... (giữ nguyên nhưng có thể rút gọn nếu cần) */}
          <div className="deg-modal-header" style={{ background: grad, padding: '28px 32px' }}>
            <div className="deg-modal-logo">{program.logo}</div>
            <div style={{ flex: 1 }}>
              <p className="deg-modal-school">{program.school}</p>
              <h2 className="deg-modal-title" style={{ fontSize: 20 }}>{program.title}</h2>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {[{ icon: '🏛️', text: program.level }, { icon: '⏱', text: program.duration }, { icon: '💰', text: program.tuition }, { icon: '📅', text: `Hạn: ${program.deadline}` }].map((b, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }}>{b.icon} {b.text}</span>
                ))}
              </div>
            </div>
            {completedKeys.length > 0 && (
               <div style={{ textAlign: 'right', color: '#fff' }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{Math.round(completedKeys.length / (program.curriculum || []).reduce((s,c)=>s+c.lessons.length,0) * 100)}%</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>TIẾN ĐỘ</div>
               </div>
            )}
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fafafa', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '14px 18px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '3px solid #0056D2' : '3px solid transparent', color: activeTab === tab.id ? '#0056D2' : '#6b7280', fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="deg-modal-body" style={{ maxHeight: '50vh', overflowY: 'auto', padding: '24px 28px' }}>

            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 14 }}>
                  Chương trình <strong>{program.title}</strong> tại <strong>{program.school}</strong> trang bị kiến thức chuyên sâu và kỹ năng thực tiễn trong lĩnh vực <strong>{program.subject}</strong>. Hoàn toàn trực tuyến, linh hoạt thời gian học.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[{ icon: '📚', value: `${(program.curriculum || []).reduce((s,c) => s + c.lessons.length, 0)}`, label: 'Bài học' }, { icon: '🎥', value: `${(program.videos || []).length}`, label: 'Video' }, { icon: '🏆', value: `${(program.skills || []).length}`, label: 'Kỹ năng' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', background: '#f9fafb', borderRadius: 10, padding: '16px 8px', border: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: '#111' }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(program.curriculum || []).map((mod, mi) => (
                  <div key={mi} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                    <button onClick={() => setExpandedModule(expandedModule === mi ? -1 : mi)}
                      style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expandedModule === mi ? '#eff6ff' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{mi + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{mod.title}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{mod.lessons.length} bài học</div>
                        </div>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: 18, transition: 'transform 0.2s', display: 'inline-block', transform: expandedModule === mi ? 'rotate(90deg)' : 'none' }}>›</span>
                    </button>
                    {expandedModule === mi && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: '4px 18px 14px 18px', background: '#f9fafb' }}>
                        {mod.lessons.map((lesson, li) => {
                          const isDone = completedKeys.includes(`${mi}-${li}`);
                          return (
                            <li key={li} style={{ padding: '10px 0', borderTop: li > 0 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ color: isDone ? '#059669' : '#0056D2', fontSize: 13 }}>{isDone ? '✔' : '▶'}</span>
                                <span style={{ fontSize: 13, color: isDone ? '#9ca3af' : '#374151', textDecoration: isDone ? 'line-through' : 'none' }}>{lesson}</span>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={isDone} 
                                onChange={() => toggleLesson(mi, li)}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* ... giữ nguyên các tab khác ... */}

            {activeTab === 'videos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Video học tập liên quan được chọn lọc phù hợp với chương trình {program.subject}.</p>
                {(program.videos || []).map((video, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, flexShrink: 0 }}>▶</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{video}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Chủ đề: {program.subject} • Dành cho học viên đăng ký</div>
                    </div>
                    <span style={{ background: '#0056D2', color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Xem ngay</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <p style={{ fontSize: 14, color: '#374151', marginBottom: 18, lineHeight: 1.6 }}>Sau khi hoàn thành, bạn sẽ được trang bị các kỹ năng được ngành công nghiệp đánh giá cao:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {(program.skills || []).map((skill, i) => (
                    <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>✓ {skill}</span>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 8 }}>🏆 Chứng chỉ được công nhận</div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>Sau khi hoàn thành, bạn nhận chứng chỉ từ <strong>{program.school}</strong> được công nhận bởi hàng trăm doanh nghiệp hàng đầu. Có thể chia sẻ trực tiếp lên LinkedIn và CV.</p>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="deg-modal-btns" style={{ padding: '16px 28px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
            <button className="crs-btn-solid" style={{ flex: 1, padding: '13px' }} onClick={(e) => { e.stopPropagation(); setShowTrialModal(true); }}>Đăng ký miễn phí</button>
            <button className="crs-btn-outline" style={{ flex: 1, padding: '13px' }} onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>

      {showTrialModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: 640, borderRadius: 8, padding: '40px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'left' }}>
            <button onClick={() => setShowTrialModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#9ca3af', cursor: 'pointer', padding: '0 8px' }}>&times;</button>
            <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 32, color: '#111' }}>Dùng thử miễn phí 7 ngày</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
              {[
                { title: 'Truy cập không giới hạn vào tất cả các khóa học trong Chuyên ngành', desc: 'Xem các bài giảng, làm thử các bài tập, tham gia vào các diễn đàn thảo luận và hơn thế nữa.' },
                { title: 'Hủy bất cứ lúc nào.', desc: 'Không áp phí phạt - chỉ cần hủy trước khi bản dùng thử kết thúc nếu nó không phù hợp với bạn.' },
                { title: '20 US$ USD mỗi tháng để tiếp tục học sau khi bản dùng thử của bạn kết thúc', desc: 'Học càng nhanh càng tốt - bạn học càng nhanh, bạn càng tiết kiệm được nhiều.' },
                { title: 'Chứng chỉ khi bạn hoàn thành sau khi thời hạn dùng thử kết thúc', desc: 'Chia sẻ trên sơ yếu lý lịch, LinkedIn và CV của bạn.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowTrialModal(false); navigate('/checkout?trial=true', { state: { program: program } }); setTimeout(() => onClose(), 100); }}
              style={{ padding: '16px 32px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%' }}>
              Bắt đầu Dùng thử miễn phí
            </button>
          </div>
        </div>
      )}
    </>
  );
}



/* ── FILTER DROPDOWN ── */
function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(selected);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (val) => setTemp(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);
  const apply = () => { onChange(temp); setOpen(false); };
  const clear = () => { setTemp([]); onChange([]); };

  return (
    <div className="deg-filter-wrap" ref={ref}>
      <button className={`deg-filter-btn ${open ? 'open' : ''} ${selected.length ? 'has-value' : ''}`} onClick={() => { setTemp(selected); setOpen(v => !v); }}>
        {label} {selected.length > 0 && <span className="deg-filter-count">{selected.length}</span>}
        <span className="deg-filter-chevron">{open ? '∧' : '∨'}</span>
      </button>

      {open && (
        <div className="deg-filter-dropdown">
          <ul className="deg-filter-list">
            {options.map(opt => (
              <li key={opt} className={`deg-filter-item ${temp.includes(opt) ? 'checked' : ''}`} onClick={() => toggle(opt)}>
                <span className="deg-checkbox">{temp.includes(opt) ? '☑' : '☐'}</span>
                <span>{opt}</span>
              </li>
            ))}
          </ul>
          <div className="deg-filter-actions">
            <button className="deg-apply-btn" onClick={apply}>Áp dụng</button>
            <button className="deg-clear-btn" onClick={clear}>Xóa tất cả</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MAIN PAGE ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Degrees ErrorBoundary caught an error", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#fef2f2', color: '#991b1b', fontFamily: 'monospace' }}>
          <h2>Component Crashed</h2>
          <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          <pre style={{ overflowX: 'auto', background: '#fee2e2', padding: 16 }}>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Degrees() {
  usePageSEO({ title: 'Bằng cấp & Chứng chỉ chuyên nghiệp' });
  const [levelFilter, setLevelFilter] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [selected, setSelected] = useState(null);
  const [programs, setPrograms] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses/degree-programs/')
      .then(res => setPrograms(res.data.results || res.data))
      .catch(err => console.error("Could not fetch degree programs", err));
  }, []);

  const filtered = programs.filter(p => {
    const lvlOk = levelFilter.length === 0 || levelFilter.includes(p.level);
    const subOk = subjectFilter.length === 0 || subjectFilter.includes(p.subject);
    return lvlOk && subOk;
  });

  return (
    <div className="deg-page">
      {/* HERO */}
      <section className="deg-hero">
        <div className="deg-hero-inner">
          <h1>Tìm một chương trình đào tạo trực tuyến phù hợp với mục tiêu của bạn</h1>
          <p>Nhận bằng cấp từ các trường đại học hàng đầu Việt Nam — hoàn toàn trực tuyến</p>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="deg-filter-bar">
        <div className="deg-filter-bar-inner">
          <span className="deg-filter-label">Lọc theo</span>
          <FilterDropdown
            label="Cấp độ chương trình"
            options={DEGREE_LEVELS}
            selected={levelFilter}
            onChange={setLevelFilter}
          />
          <FilterDropdown
            label="Môn học"
            options={SUBJECTS}
            selected={subjectFilter}
            onChange={setSubjectFilter}
          />
          {(levelFilter.length > 0 || subjectFilter.length > 0) && (
            <button className="deg-reset-all" onClick={() => { setLevelFilter([]); setSubjectFilter([]); }}>
              Xóa tất cả bộ lọc
            </button>
          )}
          <span className="deg-result-count">{filtered.length} chương trình</span>
        </div>
      </div>

      {/* PROGRAM GRID */}
      <div className="deg-grid-section">
        <div className="deg-grid">
          {filtered.length === 0 ? (
            <div className="deg-empty">
              <p>Không tìm thấy chương trình phù hợp với bộ lọc đã chọn.</p>
              <button className="crs-btn-outline" onClick={() => { setLevelFilter([]); setSubjectFilter([]); }}>Xóa bộ lọc</button>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="deg-card" onClick={() => setSelected(p)}>
                <div className="deg-card-header">
                  <div className="deg-card-logo" style={{ background: GRAD_MAP[p.logo] || 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
                    {p.logo}
                  </div>
                  <p className="deg-card-school">{p.school}</p>
                </div>
                <div className="deg-card-body">
                  <h3 className="deg-card-title">{p.title}</h3>
                  <div className="deg-card-meta">
                    <span className="deg-level-badge">{p.level}</span>
                    <span className="deg-subject-badge">{p.subject}</span>
                  </div>
                  <div className="deg-card-info">
                    <span>⏱ {p.duration}</span>
                    <span>💰 {p.tuition}</span>
                  </div>
                  <p className="deg-card-deadline">
                    <span>📅</span> Hạn nộp hồ sơ {p.deadline}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && <DegreeDetail program={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function DegreesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Degrees />
    </ErrorBoundary>
  );
}
