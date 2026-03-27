import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

/* ── DATA ── */
const DEGREE_LEVELS = ['Bằng cử nhân', 'Bằng thạc sĩ'];
const SUBJECTS = [
  'Arts and Humanities', 'Business', 'Computer Science',
  'Data Science', 'Information Technology', 'Math and Logic',
  'Physical Science and Engineering', 'Social Sciences',
];

const PROGRAMS = [
  { id: 1, level: 'Bằng cử nhân', subject: 'Computer Science', school: 'Đại học Bách Khoa Hà Nội', title: 'Bachelor of Science in Computer Science', deadline: '30 tháng 4 năm 2026', duration: '4 năm', tuition: '15.000.000 đ/năm', logo: 'BK' },
  { id: 2, level: 'Bằng thạc sĩ', subject: 'Data Science', school: 'Đại học Quốc gia TP.HCM', title: 'Master of Science in Data Science & AI', deadline: '17 tháng 4 năm 2026', duration: '2 năm', tuition: '25.000.000 đ/năm', logo: 'QG' },
  { id: 3, level: 'Bằng cử nhân', subject: 'Business', school: 'Đại học Kinh tế Quốc dân', title: 'Bachelor of Business Administration', deadline: '15 tháng 5 năm 2026', duration: '4 năm', tuition: '12.000.000 đ/năm', logo: 'KT' },
  { id: 4, level: 'Bằng thạc sĩ', subject: 'Information Technology', school: 'Đại học FPT', title: 'Master of Science in Information Technology', deadline: '1 tháng 6 năm 2026', duration: '2 năm', tuition: '30.000.000 đ/năm', logo: 'FP' },
  { id: 5, level: 'Bằng cử nhân', subject: 'Data Science', school: 'Đại học Công nghệ - ĐHQGHN', title: 'Bachelor of Science in Data Science', deadline: '20 tháng 4 năm 2026', duration: '4 năm', tuition: '14.000.000 đ/năm', logo: 'CN' },
  { id: 6, level: 'Bằng thạc sĩ', subject: 'Computer Science', school: 'Đại học Bách Khoa TP.HCM', title: 'Master of Science in Computer Science', deadline: '10 tháng 5 năm 2026', duration: '2 năm', tuition: '28.000.000 đ/năm', logo: 'BK' },
  { id: 7, level: 'Bằng cử nhân', subject: 'Math and Logic', school: 'Đại học Khoa học Tự nhiên', title: 'Bachelor of Science in Mathematics', deadline: '25 tháng 4 năm 2026', duration: '4 năm', tuition: '11.000.000 đ/năm', logo: 'KH' },
  { id: 8, level: 'Bằng thạc sĩ', subject: 'Business', school: 'Đại học Ngoại thương', title: 'Master of Business Administration (MBA)', deadline: '30 tháng 5 năm 2026', duration: '2 năm', tuition: '35.000.000 đ/năm', logo: 'NT' },
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

/* ── DEGREE DETAIL MODAL ── */
function DegreeDetail({ program, onClose }) {
  return (
    <div className="deg-modal-overlay" onClick={onClose}>
      <div className="deg-modal" onClick={e => e.stopPropagation()}>
        <button className="deg-modal-close" onClick={onClose}>✕</button>
        <div className="deg-modal-header" style={{ background: GRAD_MAP[program.logo] || 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
          <div className="deg-modal-logo">{program.logo}</div>
          <div>
            <p className="deg-modal-school">{program.school}</p>
            <h2 className="deg-modal-title">{program.title}</h2>
          </div>
        </div>
        <div className="deg-modal-body">
          <div className="deg-modal-info-grid">
            <div className="deg-modal-info-item">
              <span className="deg-modal-info-label">Cấp độ</span>
              <strong>{program.level}</strong>
            </div>
            <div className="deg-modal-info-item">
              <span className="deg-modal-info-label">Môn học</span>
              <strong>{program.subject}</strong>
            </div>
            <div className="deg-modal-info-item">
              <span className="deg-modal-info-label">Thời gian</span>
              <strong>{program.duration}</strong>
            </div>
            <div className="deg-modal-info-item">
              <span className="deg-modal-info-label">Học phí</span>
              <strong>{program.tuition}</strong>
            </div>
          </div>
          <div className="deg-modal-deadline">
            <span>📅</span> Hạn nộp hồ sơ: <strong>{program.deadline}</strong>
          </div>
          <p className="deg-modal-desc">
            Chương trình {program.title} tại {program.school} được thiết kế để trang bị cho sinh viên kiến thức chuyên sâu và kỹ năng thực tiễn trong lĩnh vực {program.subject}. Chương trình học hoàn toàn trực tuyến, linh hoạt về thời gian.
          </p>
          <div className="deg-modal-btns">
            <button className="crs-btn-solid" style={{ flex: 1, padding: '13px' }}>Đăng ký ngay</button>
            <button className="crs-btn-outline" style={{ flex: 1, padding: '13px' }} onClick={onClose}>Tìm hiểu thêm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function Degrees() {
  usePageSEO({ title: 'Bằng cấp & Chứng chỉ chuyên nghiệp' });
  const [levelFilter, setLevelFilter] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const filtered = PROGRAMS.filter(p => {
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
