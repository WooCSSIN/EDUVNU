import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function Careers() {
  usePageSEO({ title: 'Tuyển dụng | EduVNU', description: 'Gia nhập đội ngũ EduVNU - Nơi bạn góp phần thay đổi nền giáo dục Việt Nam.' });

  const openings = [
    {
      title: 'Senior Frontend Developer (React)',
      dept: 'Engineering',
      type: 'Toàn thời gian',
      location: 'Hà Nội / Remote',
      desc: 'Xây dựng giao diện web hiện đại cho nền tảng học trực tuyến phục vụ hàng trăm nghìn người dùng.',
    },
    {
      title: 'Backend Developer (Django/Python)',
      dept: 'Engineering',
      type: 'Toàn thời gian',
      location: 'Hà Nội',
      desc: 'Thiết kế và phát triển REST API, hệ thống thanh toán, quản lý nội dung khóa học.',
    },
    {
      title: 'UX/UI Designer',
      dept: 'Design',
      type: 'Toàn thời gian',
      location: 'Hà Nội / Remote',
      desc: 'Thiết kế trải nghiệm người dùng xuất sắc cho nền tảng giáo dục hàng đầu Việt Nam.',
    },
    {
      title: 'Content Creator (Giảng viên AI/Data)',
      dept: 'Content',
      type: 'Bán thời gian',
      location: 'Remote',
      desc: 'Sản xuất nội dung khóa học chất lượng cao về AI, Machine Learning, Data Science.',
    },
    {
      title: 'Marketing Executive',
      dept: 'Marketing',
      type: 'Toàn thời gian',
      location: 'Hà Nội',
      desc: 'Xây dựng chiến lược marketing, quản lý kênh truyền thông, tổ chức sự kiện.',
    },
    {
      title: 'Customer Success Manager',
      dept: 'Operations',
      type: 'Toàn thời gian',
      location: 'Hà Nội',
      desc: 'Hỗ trợ học viên và giảng viên, đảm bảo trải nghiệm khách hàng tốt nhất.',
    },
  ];

  const perks = [
    { icon: '💰', title: 'Lương cạnh tranh', desc: 'Top 20% thị trường, review 2 lần/năm' },
    { icon: '🏠', title: 'Hybrid/Remote', desc: 'Linh hoạt làm việc tại văn phòng hoặc từ xa' },
    { icon: '📚', title: 'Học tập không giới hạn', desc: 'Miễn phí tất cả khóa học trên EduVNU' },
    { icon: '🏥', title: 'Bảo hiểm sức khỏe', desc: 'Bảo hiểm premium cho bạn và gia đình' },
    { icon: '🏖️', title: '20+ ngày nghỉ phép', desc: 'Work-life balance là ưu tiên hàng đầu' },
    { icon: '🚀', title: 'Phát triển sự nghiệp', desc: 'Mentoring 1-1, ngân sách đào tạo riêng' },
  ];

  const deptColors = {
    Engineering: '#0056D2',
    Design: '#7c3aed',
    Content: '#059669',
    Marketing: '#b45309',
    Operations: '#0891b2',
  };

  return (
    <div className="careers-page">
      {/* HERO */}
      <section className="careers-hero">
        <div className="careers-hero-inner">
          <span className="careers-badge">🚀 Chúng tôi đang tuyển dụng!</span>
          <h1>Cùng EduVNU thay đổi<br />nền giáo dục Việt Nam</h1>
          <p>Gia nhập đội ngũ đam mê, sáng tạo và kiến tạo nền tảng giáo dục trực tuyến hàng đầu quốc gia.</p>
          <a href="#openings" className="careers-hero-btn">Xem vị trí tuyển dụng ↓</a>
        </div>
      </section>

      {/* PERKS */}
      <section className="careers-section">
        <div className="careers-inner">
          <h2 className="careers-section-title">Tại sao chọn EduVNU?</h2>
          <div className="careers-perks-grid">
            {perks.map((p, i) => (
              <div key={i} className="careers-perk-card">
                <span className="careers-perk-icon">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPENINGS */}
      <section className="careers-section alt" id="openings">
        <div className="careers-inner">
          <h2 className="careers-section-title">Vị trí đang tuyển ({openings.length})</h2>
          <div className="careers-openings">
            {openings.map((job, i) => (
              <div key={i} className="careers-job-card">
                <div className="careers-job-header">
                  <span className="careers-job-dept" style={{ background: deptColors[job.dept] || '#6b7280' }}>{job.dept}</span>
                  <span className="careers-job-type">{job.type}</span>
                </div>
                <h3 className="careers-job-title">{job.title}</h3>
                <p className="careers-job-desc">{job.desc}</p>
                <div className="careers-job-footer">
                  <span className="careers-job-loc">📍 {job.location}</span>
                  <Link to="/contact" className="careers-apply-btn">Ứng tuyển ngay →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="careers-cta">
        <h2>Không tìm thấy vị trí phù hợp?</h2>
        <p>Hãy gửi CV của bạn và chúng tôi sẽ liên hệ khi có vị trí thích hợp.</p>
        <Link to="/contact" className="careers-hero-btn">Gửi CV →</Link>
      </section>
    </div>
  );
}
