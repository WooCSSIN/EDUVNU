import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function About() {
  usePageSEO({ title: 'Về chúng tôi | EduVNU', description: 'Tìm hiểu về EduVNU - Nền tảng giáo dục trực tuyến hàng đầu dành cho Đại học Quốc gia Việt Nam.' });

  const stats = [
    { value: '150,000+', label: 'Học viên', icon: '👨‍🎓' },
    { value: '500+', label: 'Khóa học', icon: '📚' },
    { value: '200+', label: 'Giảng viên', icon: '🎓' },
    { value: '50+', label: 'Đối tác', icon: '🤝' },
  ];

  const values = [
    { icon: '🎯', title: 'Chất lượng đào tạo', desc: 'Nội dung được biên soạn bởi giảng viên hàng đầu từ các trường thành viên VNU, đảm bảo chuẩn quốc tế.' },
    { icon: '🌍', title: 'Tiếp cận toàn diện', desc: 'Mọi người đều có quyền tiếp cận giáo dục chất lượng cao, bất kể vị trí địa lý hay hoàn cảnh.' },
    { icon: '💡', title: 'Đổi mới sáng tạo', desc: 'Áp dụng công nghệ tiên tiến nhất vào giảng dạy: AI, video tương tác, hệ thống quiz thông minh.' },
    { icon: '🤝', title: 'Cộng đồng học tập', desc: 'Xây dựng mạng lưới kết nối giữa sinh viên, cựu sinh viên và doanh nghiệp trên toàn quốc.' },
  ];

  const team = [
    { name: 'PGS. TS Nguyễn Văn A', role: 'Giám đốc Nền tảng', school: 'ĐH Công nghệ - VNU' },
    { name: 'TS. Trần Thị B', role: 'Trưởng phòng Đào tạo', school: 'ĐH Khoa học Tự nhiên - VNU' },
    { name: 'ThS. Lê Minh C', role: 'CTO & Phát triển Sản phẩm', school: 'ĐH Công nghệ - VNU' },
    { name: 'CN. Phạm Đức D', role: 'Quản lý Nội dung', school: 'ĐH Kinh tế - VNU' },
  ];

  const timeline = [
    { year: '2022', event: 'Ý tưởng EduVNU được hình thành tại Đại học Quốc gia Hà Nội.' },
    { year: '2023', event: 'Ra mắt phiên bản Beta với 50 khóa học đầu tiên.' },
    { year: '2024', event: 'Đạt 50.000 học viên. Mở rộng hợp tác Google, IBM, Meta.' },
    { year: '2025', event: 'Cán mốc 150.000 học viên, tích hợp chứng chỉ blockchain.' },
    { year: '2026', event: 'Ra mắt hệ thống Bằng cấp trực tuyến & AI tutor cá nhân.' },
  ];

  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <span className="about-badge">🏛️ Đại học Quốc gia Việt Nam</span>
          <h1>Nền tảng giáo dục cho<br />tương lai Việt Nam</h1>
          <p>EduVNU kết hợp sức mạnh của công nghệ và chuyên môn học thuật hàng đầu để mang đến trải nghiệm học tập trực tuyến vượt trội.</p>
          <div className="about-hero-btns">
            <Link to="/" className="about-btn primary">Khám phá khóa học</Link>
            <Link to="/contact" className="about-btn outline">Liên hệ hợp tác</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats">
        {stats.map((s, i) => (
          <div key={i} className="about-stat-item">
            <span className="about-stat-icon">{s.icon}</span>
            <span className="about-stat-value">{s.value}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* MISSION */}
      <section className="about-section">
        <div className="about-section-inner">
          <h2 className="about-section-title">Sứ mệnh của chúng tôi</h2>
          <p className="about-section-desc">
            EduVNU được thành lập với sứ mệnh dân chủ hóa giáo dục chất lượng cao. Chúng tôi tin rằng mọi người Việt Nam
            đều xứng đáng được tiếp cận kiến thức từ các giảng viên và chuyên gia hàng đầu, bất kể họ ở đâu.
            Thông qua công nghệ, chúng tôi phá vỡ rào cản địa lý và tài chính, mang giáo dục đại học chất lượng quốc tế
            đến tận tay người học.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-section alt">
        <div className="about-section-inner">
          <h2 className="about-section-title">Giá trị cốt lõi</h2>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <div key={i} className="about-value-card">
                <span className="about-value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="about-section">
        <div className="about-section-inner">
          <h2 className="about-section-title">Hành trình phát triển</h2>
          <div className="about-timeline">
            {timeline.map((t, i) => (
              <div key={i} className="about-timeline-item">
                <div className="about-timeline-year">{t.year}</div>
                <div className="about-timeline-dot" />
                <div className="about-timeline-text">{t.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="about-section alt">
        <div className="about-section-inner">
          <h2 className="about-section-title">Đội ngũ lãnh đạo</h2>
          <div className="about-team-grid">
            {team.map((m, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">{m.name.split(' ').pop()[0]}</div>
                <h3>{m.name}</h3>
                <p className="about-team-role">{m.role}</p>
                <p className="about-team-school">{m.school}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="about-section">
        <div className="about-section-inner" style={{ textAlign: 'center' }}>
          <h2 className="about-section-title">Đối tác đào tạo</h2>
          <div className="about-partners">
            {['Google', 'IBM', 'Meta', 'Stanford', 'MIT', 'AWS', 'Microsoft', 'Coursera'].map((p, i) => (
              <div key={i} className="about-partner-badge">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Sẵn sàng bắt đầu hành trình học tập?</h2>
        <p>Tham gia cộng đồng 150,000+ học viên trên EduVNU ngay hôm nay.</p>
        <div className="about-hero-btns">
          <Link to="/login" className="about-btn primary lg">Đăng ký miễn phí</Link>
          <Link to="/degrees" className="about-btn outline lg">Xem chương trình đào tạo</Link>
        </div>
      </section>
    </div>
  );
}
