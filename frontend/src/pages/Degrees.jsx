import React, { useState, useRef, useEffect } from 'react';
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
  { id: 1, level: 'Bằng cử nhân', subject: 'Computer Science', school: 'Đại học Bách Khoa Hà Nội', title: 'Bachelor of Science in Computer Science', deadline: '30 tháng 4 năm 2026', duration: '4 năm', tuition: '15.000.000 đ/năm', logo: 'BK', instructor: 'GS. TS. Nguyễn Văn Minh', instructorTitle: 'Trưởng khoa CNTT - ĐH Bách Khoa HN', skills: ['Lập trình Python', 'Cấu trúc dữ liệu', 'Giải thuật', 'Hệ điều hành', 'Mạng máy tính', 'Cơ sở dữ liệu'], curriculum: [{ title: 'Năm 1: Nền tảng Khoa học máy tính', lessons: ['Nhập môn lập trình', 'Toán rời rạc', 'Vật lý đại cương', 'Tiếng Anh chuyên ngành'] }, { title: 'Năm 2: Kỹ thuật phần mềm', lessons: ['Cấu trúc dữ liệu & Giải thuật', 'Lập trình hướng đối tượng', 'Cơ sở dữ liệu', 'Mạng máy tính'] }, { title: 'Năm 3: Chuyên sâu', lessons: ['Trí tuệ nhân tạo', 'Phát triển Web', 'An toàn thông tin', 'Hệ thống phân tán'] }, { title: 'Năm 4: Dự án & Thực tập', lessons: ['Thực tập doanh nghiệp', 'Đồ án tốt nghiệp', 'Khởi nghiệp công nghệ'] }], videos: ['Giới thiệu Computer Science - CS50 Harvard', 'Python cho người mới bắt đầu', 'Data Structures & Algorithms Visualized', 'How the Internet Works'] },
  { id: 2, level: 'Bằng thạc sĩ', subject: 'Data Science', school: 'Đại học Quốc gia TP.HCM', title: 'Master of Science in Data Science & AI', deadline: '17 tháng 4 năm 2026', duration: '2 năm', tuition: '25.000.000 đ/năm', logo: 'QG', instructor: 'PGS. TS. Trần Thị Lan', instructorTitle: 'Giám đốc Trung tâm AI - ĐHQG TP.HCM', skills: ['Machine Learning', 'Deep Learning', 'Python/R', 'Big Data', 'Data Visualization', 'NLP'], curriculum: [{ title: 'HK1: Nền tảng Data Science', lessons: ['Thống kê nâng cao', 'Machine Learning cơ bản', 'Python for Data Science', 'SQL & NoSQL'] }, { title: 'HK2: Deep Learning & AI', lessons: ['Neural Networks', 'Computer Vision', 'NLP & LLMs', 'Reinforcement Learning'] }, { title: 'HK3: Big Data & Cloud', lessons: ['Apache Spark', 'Cloud AI (AWS/GCP)', 'MLOps & Deployment', 'Data Engineering'] }, { title: 'HK4: Luận văn nghiên cứu', lessons: ['Đề xuất nghiên cứu', 'Thực nghiệm & Đánh giá', 'Bảo vệ luận văn'] }], videos: ['Introduction to Machine Learning - Andrew Ng', 'Deep Learning Specialization Overview', 'What is Data Science?', 'AI & The Future of Work'] },
  { id: 3, level: 'Bằng cử nhân', subject: 'Business', school: 'Đại học Kinh tế Quốc dân', title: 'Bachelor of Business Administration', deadline: '15 tháng 5 năm 2026', duration: '4 năm', tuition: '12.000.000 đ/năm', logo: 'KT', instructor: 'TS. Lê Minh Tuấn', instructorTitle: 'Trưởng khoa Quản trị Kinh doanh - ĐHKTQD', skills: ['Quản trị kinh doanh', 'Marketing', 'Tài chính', 'Kế toán', 'Quản lý dự án', 'Leadership'], curriculum: [{ title: 'Năm 1: Kinh tế học đại cương', lessons: ['Kinh tế vi mô', 'Kinh tế vĩ mô', 'Toán kinh tế', 'Luật kinh doanh'] }, { title: 'Năm 2: Quản trị cốt lõi', lessons: ['Marketing căn bản', 'Kế toán tài chính', 'Quản trị nhân sự', 'Quản lý dự án'] }, { title: 'Năm 3: Chuyên ngành', lessons: ['Chiến lược kinh doanh', 'Thương mại điện tử', 'Tài chính doanh nghiệp'] }, { title: 'Năm 4: Thực chiến', lessons: ['Thực tập doanh nghiệp', 'Khởi nghiệp & Đổi mới sáng tạo', 'Khóa luận tốt nghiệp'] }], videos: ['What is Business Administration?', 'Marketing Fundamentals - Kotler', 'Financial Management Basics', 'Entrepreneurship & Startup'] },
  { id: 4, level: 'Bằng thạc sĩ', subject: 'Information Technology', school: 'Đại học FPT', title: 'Master of Science in Information Technology', deadline: '1 tháng 6 năm 2026', duration: '2 năm', tuition: '30.000.000 đ/năm', logo: 'FP', instructor: 'TS. Phạm Quốc Hùng', instructorTitle: 'Giám đốc Học thuật - ĐH FPT', skills: ['Cloud Computing', 'DevOps', 'Cybersecurity', 'System Architecture', 'Project Management', 'Agile/Scrum'], curriculum: [{ title: 'HK1: IT Hiện đại', lessons: ['Cloud Computing (AWS/Azure)', 'Microservices Architecture', 'DevOps & CI/CD', 'Agile Leadership'] }, { title: 'HK2: An toàn & Bảo mật', lessons: ['Cybersecurity Strategy', 'Penetration Testing', 'Network Security', 'Compliance & Governance'] }, { title: 'HK3: Chuyển đổi số', lessons: ['Digital Transformation', 'Enterprise Architecture', 'IT Strategy'] }, { title: 'HK4: Dự án cuối khoá', lessons: ['Research Methodology', 'Capstone Project', 'Industry Presentation'] }], videos: ['Cloud Computing Explained', 'DevOps Roadmap 2025', 'Cybersecurity for Beginners', 'Digital Transformation Strategy'] },
  { id: 5, level: 'Bằng cử nhân', subject: 'Data Science', school: 'Đại học Công nghệ - ĐHQGHN', title: 'Bachelor of Science in Data Science', deadline: '20 tháng 4 năm 2026', duration: '4 năm', tuition: '14.000.000 đ/năm', logo: 'CN', instructor: 'GS. Nguyễn Hữu Đức', instructorTitle: 'Phó Giám đốc ĐHQGHN', skills: ['Python', 'Statistics', 'Data Analysis', 'Machine Learning', 'Visualization', 'SQL'], curriculum: [{ title: 'Năm 1: Toán & Lập trình', lessons: ['Giải tích & Đại số tuyến tính', 'Xác suất thống kê', 'Python cơ bản', 'Nhập môn CSDL'] }, { title: 'Năm 2: Phân tích dữ liệu', lessons: ['Data Wrangling', 'Exploratory Data Analysis', 'Machine Learning cơ bản', 'Data Visualization'] }, { title: 'Năm 3: ML & AI ứng dụng', lessons: ['Advanced ML', 'Time Series Analysis', 'Recommendation Systems'] }, { title: 'Năm 4: Đồ án & Thực tập', lessons: ['Internship tại doanh nghiệp', 'Capstone Data Project', 'Thi tốt nghiệp'] }], videos: ['Data Science Full Course', 'Statistics for Data Science', 'Pandas & NumPy Tutorial', 'Matplotlib & Seaborn Visualization'] },
  { id: 6, level: 'Bằng thạc sĩ', subject: 'Computer Science', school: 'Đại học Bách Khoa TP.HCM', title: 'Master of Science in Computer Science', deadline: '10 tháng 5 năm 2026', duration: '2 năm', tuition: '28.000.000 đ/năm', logo: 'BK', instructor: 'PGS. TS. Võ Đình Hiếu', instructorTitle: 'Trưởng khoa KHMT - ĐH Bách Khoa HCM', skills: ['Algorithms', 'Distributed Systems', 'Compiler Design', 'AI/ML Research', 'System Programming'], curriculum: [{ title: 'HK1: CS Nâng cao', lessons: ['Advanced Algorithms', 'Distributed Computing', 'Programming Language Theory', 'Research Methods'] }, { title: 'HK2: Hệ thống', lessons: ['Operating Systems Advanced', 'Computer Architecture', 'Compiler Construction'] }, { title: 'HK3 & 4: Nghiên cứu', lessons: ['Chọn hướng nghiên cứu', 'Thực nghiệm', 'Báo cáo khoa học', 'Bảo vệ luận văn'] }], videos: ['Advanced Algorithms - MIT OCW', 'Distributed Systems Concepts', 'How Compilers Work', 'Research Skills for CS Graduate'] },
  { id: 7, level: 'Bằng cử nhân', subject: 'Math and Logic', school: 'Đại học Khoa học Tự nhiên', title: 'Bachelor of Science in Mathematics', deadline: '25 tháng 4 năm 2026', duration: '4 năm', tuition: '11.000.000 đ/năm', logo: 'KH', instructor: 'GS. TSKH. Đặng Hùng Thắng', instructorTitle: 'Giáo sư Toán học nổi tiếng VN', skills: ['Calculus', 'Linear Algebra', 'Statistics', 'Logic', 'Number Theory', 'Mathematical Modeling'], curriculum: [{ title: 'Năm 1: Toán cơ bản', lessons: ['Giải tích 1, 2, 3', 'Đại số tuyến tính', 'Toán rời rạc', 'Nhập môn lập trình'] }, { title: 'Năm 2: Toán ứng dụng', lessons: ['Xác suất & Thống kê', 'Phương trình vi phân', 'Phương pháp số', 'Tối ưu hóa'] }, { title: 'Năm 3: Chuyên sâu', lessons: ['Lý thuyết số', 'Hình học vi phân', 'Giải tích hàm'] }, { title: 'Năm 4: Nghiên cứu & Ứng dụng', lessons: ['Toán tài chính', 'Thống kê nâng cao', 'Khóa luận tốt nghiệp'] }], videos: ['The Beauty of Mathematics', 'Linear Algebra - 3Blue1Brown', 'Statistics Fundamentals', 'Mathematical Modeling in Real Life'] },
  { id: 8, level: 'Bằng thạc sĩ', subject: 'Business', school: 'Đại học Ngoại thương', title: 'Master of Business Administration (MBA)', deadline: '30 tháng 5 năm 2026', duration: '2 năm', tuition: '35.000.000 đ/năm', logo: 'NT', instructor: 'PGS. TS. Bùi Thị Thanh', instructorTitle: 'Hiệu trưởng - Trường Kinh tế ĐH Ngoại thương', skills: ['Strategic Management', 'Corporate Finance', 'Global Marketing', 'Leadership', 'Negotiation', 'Business Analytics'], curriculum: [{ title: 'HK1: Nền tảng MBA', lessons: ['Financial Accounting', 'Organizational Behavior', 'Microeconomics for Managers', 'Business Analytics'] }, { title: 'HK2: Chức năng kinh doanh', lessons: ['Strategic Marketing', 'Corporate Finance', 'Operations Management', 'Global Business'] }, { title: 'HK3: Lãnh đạo', lessons: ['Leadership & Ethics', 'Negotiation & Conflict Resolution', 'Innovation Management'] }, { title: 'HK4: Capstone', lessons: ['Business Consulting Project', 'Executive Presentation', 'Bảo vệ luận văn MBA'] }], videos: ['MBA vs Masters in Business', 'MBA Program Overview', 'Corporate Finance Basics', 'What CEOs Do Every Day'] },
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

  const grad = GRAD_MAP[program.logo] || 'linear-gradient(135deg,#0369a1,#0ea5e9)';

  return (
    <>
      <div className="deg-modal-overlay" onClick={onClose}>
        <div className="deg-modal" style={{ maxWidth: 780, width: '94%' }} onClick={e => e.stopPropagation()}>
          <button className="deg-modal-close" onClick={onClose}>✕</button>

          {/* HEADER */}
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
                {program.instructor && (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>{program.logo}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1d4ed8' }}>{program.instructor}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{program.instructorTitle}</div>
                    </div>
                  </div>
                )}
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
                      <ul style={{ listStyle: 'none', margin: 0, padding: '4px 18px 14px 66px', background: '#f9fafb' }}>
                        {mod.lessons.map((lesson, li) => (
                          <li key={li} style={{ padding: '8px 0', borderTop: li > 0 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#0056D2', fontSize: 13 }}>▶</span>
                            <span style={{ fontSize: 13, color: '#374151' }}>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

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
  // eslint-disable-next-line no-unused-vars
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

export default function DegreesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Degrees />
    </ErrorBoundary>
  );
}
