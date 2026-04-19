import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function EduVNUPlus() {
  usePageSEO({
    title: 'EduVNU PLUS | Hệ thống học tập cao cấp',
    description: 'Nâng tầm sự nghiệp với EduVNU PLUS - Quyền truy cập không giới hạn vào toàn bộ hệ sinh thái khóa học và bằng cấp của EduVNU.',
  });

  const features = [
    {
      icon: '🚀',
      title: 'Học không giới hạn',
      desc: 'Truy cập toàn bộ thẻ học, bằng cấp và chuyên mục đào tạo trên nền tảng mà không phải trả thêm phí từng khóa.'
    },
    {
      icon: '🎓',
      title: 'Chứng chỉ danh giá',
      desc: 'Nhận chứng chỉ đối tác doanh nghiệp (Google, IBM, Meta...) và chứng chỉ học thuật do Đại học Quốc gia cấp.'
    },
    {
      icon: '💼',
      title: 'Sẵn sàng việc làm',
      desc: 'Nội dung và giáo trình được thiết kế chuẩn đầu ra kết hợp với bài thực hành dự án thực tế.'
    },
    {
      icon: '⭐',
      title: 'Hỗ trợ ưu tiên',
      desc: 'Được ưu tiên chấm điểm và hỗ trợ 1:1 từ giảng viên và AI Tutor trong quá trình làm đồ án.'
    }
  ];

  return (
    <div className="plus-page" style={{ background: '#f5f7f9', minHeight: '100vh', paddingBottom: 80 }}>
      {/* HERO SECTION */}
      <div style={{ background: '#111', color: '#fff', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(0,86,210,0.2) 0%, rgba(17,17,17,1) 50%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'linear-gradient(90deg, #ff9800, #ff5722)', color: '#fff', borderRadius: 20, fontWeight: 800, fontSize: 13, marginBottom: 24, letterSpacing: 1 }}>
            VƯỢT TRỘI CÙNG PLUS
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Đầu tư một lần,<br />Sở hữu toàn bộ tri thức</h1>
          <p style={{ fontSize: 18, color: '#9ca3af', marginBottom: 40, lineHeight: 1.6 }}>
            Trao quyền cho bản thân với gói đăng ký EduVNU PLUS. Trải nghiệm học tập trọn gói, linh hoạt và không giới hạn cùng hơn 500+ khóa học hàng đầu.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/contact" style={{ padding: '16px 40px', background: '#0056D2', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
              Bắt đầu gói 7 ngày dùng thử
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING (Mock) */}
      <div style={{ maxWidth: 1200, margin: '80px auto 0', padding: '0 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#111', marginBottom: 48 }}>Gói phù hợp cho nhu cầu của bạn</h2>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          
          <div style={{ background: '#fff', padding: 40, borderRadius: 16, border: '1px solid #e5e7eb', flex: '1 1 340px', maxWidth: 400 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Cá nhân</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Cho học viên muốn linh hoạt học tập chuyên sâu.</p>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: 32 }}>1.499.000₫ <span style={{ fontSize: 15, color: '#6b7280', fontWeight: 500 }}>/năm</span></div>
            <Link to="/contact" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#e8f0fe', color: '#0056D2', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Đăng ký ngay</Link>
          </div>

          <div style={{ background: '#111', color: '#fff', padding: 40, borderRadius: 16, border: '2px solid #0056D2', flex: '1 1 340px', maxWidth: 400, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#0056D2', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>PHỔ BIẾN NHẤT</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Doanh nghiệp</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Dành cho nhóm từ 5-100 nhân sự của công ty.</p>
            <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Liên hệ <span style={{ fontSize: 15, color: '#9ca3af', fontWeight: 500 }}>báo giá</span></div>
            <Link to="/contact" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#0056D2', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Nhận tư vấn</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
