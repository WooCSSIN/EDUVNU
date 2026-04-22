import { useState } from 'react';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';

export default function Contact() {
  usePageSEO({ title: 'Liên hệ & Hỗ trợ mua hàng', description: 'Liên hệ với EduVNU để nhận hỗ trợ mua khóa học, tư vấn lộ trình và giải đáp thắc mắc.' });
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });
    try {
      await api.post('/courses/contact/', formData);
      setStatus({ loading: false, message: '✅ Cảm ơn bạn! Lời nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi trong vòng 24 giờ.', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setStatus({ loading: false, message: '❌ Có lỗi xảy ra, vui lòng thử lại sau.', type: 'error' });
    }
  };

  const contactInfo = [
    { icon: '📞', title: 'Hotline hỗ trợ', value: '1900 636 595', desc: 'Miễn phí cuộc gọi nội mạng', color: '#0056D2' },
    { icon: '📧', title: 'Email', value: 'support@eduvnu.edu.vn', desc: 'Phản hồi trong 24 giờ', color: '#7c3aed' },
    { icon: '💬', title: 'Live Chat', value: 'Chat trực tuyến', desc: 'Hỗ trợ 24/7 qua website', color: '#059669' },
    { icon: '🏢', title: 'Văn phòng', value: '144 Xuân Thủy, Cầu Giấy', desc: 'Thứ 2 - Thứ 6: 8:00 - 17:30', color: '#b45309' },
  ];

  const supportTopics = [
    { icon: '🛒', label: 'Hỗ trợ mua hàng', desc: 'Thanh toán, đơn hàng, hóa đơn' },
    { icon: '📚', label: 'Tư vấn khóa học', desc: 'Lộ trình học, chọn khóa phù hợp' },
    { icon: '🔧', label: 'Hỗ trợ kỹ thuật', desc: 'Lỗi video, truy cập, tài khoản' },
    { icon: '💰', label: 'Hoàn tiền', desc: 'Yêu cầu hoàn trả trong 30 ngày' },
    { icon: '🏆', label: 'Chứng chỉ', desc: 'Xác minh, tải lại chứng chỉ' },
    { icon: '👥', label: 'Doanh nghiệp', desc: 'Mua hàng số lượng lớn, B2B' },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Liên hệ & Hỗ trợ mua hàng</h1>
          <p>Chúng tôi ở đây để giúp bạn. Hãy chọn phương thức liên hệ phù hợp nhất.</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="contact-info-grid">
        {contactInfo.map((item, i) => (
          <div key={i} className="contact-info-card"
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
            <div className="contact-info-icon" style={{ background: `${item.color}15`, color: item.color }}>
              <span>{item.icon}</span>
            </div>
            <div>
              <div className="contact-info-label">{item.title}</div>
              <div className="contact-info-value">{item.value}</div>
              <div className="contact-info-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Form + Map + Topics */}
      <div className="contact-main-grid">
        {/* Left: Form */}
        <div className="contact-form-section">
          <h2>Gửi yêu cầu hỗ trợ</h2>
          <p className="contact-form-subtitle">Mô tả chi tiết vấn đề để chúng tôi hỗ trợ nhanh nhất có thể.</p>
          
          {status.message && (
            <div className={`contact-alert ${status.type}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-row">
              <div className="contact-field">
                <label>Họ và tên <span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nguyễn Văn A" />
              </div>
              <div className="contact-field">
                <label>Email <span className="required">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
              </div>
            </div>
            <div className="contact-field">
              <label>Chủ đề <span className="required">*</span></label>
              <select name="subject" value={formData.subject} onChange={handleChange} required>
                <option value="">— Chọn chủ đề —</option>
                <option value="Hỗ trợ mua hàng">🛒 Hỗ trợ mua hàng & thanh toán</option>
                <option value="Tư vấn khóa học">📚 Tư vấn chọn khóa học</option>
                <option value="Hỗ trợ kỹ thuật">🔧 Hỗ trợ kỹ thuật</option>
                <option value="Yêu cầu hoàn tiền">💰 Yêu cầu hoàn tiền</option>
                <option value="Chứng chỉ">🏆 Vấn đề chứng chỉ</option>
                <option value="Hợp tác doanh nghiệp">👥 Hợp tác doanh nghiệp (B2B)</option>
                <option value="Khác">📝 Khác</option>
              </select>
            </div>
            <div className="contact-field">
              <label>Nội dung chi tiết <span className="required">*</span></label>
              <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải, bao gồm mã đơn hàng (nếu có)..." rows={5} />
            </div>
            <button type="submit" className="contact-submit-btn" disabled={status.loading}>
              {status.loading ? '⏳ Đang gửi...' : '📨 Gửi yêu cầu hỗ trợ'}
            </button>
          </form>
        </div>

        {/* Right: Support Topics + Map */}
        <div className="contact-right-section">
          {/* Support Topics */}
          <div className="contact-topics">
            <h3>Chúng tôi có thể giúp gì?</h3>
            <div className="contact-topics-grid">
              {supportTopics.map((topic, i) => (
                <div key={i} className="contact-topic-card"
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#0056D2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  <span className="contact-topic-icon">{topic.icon}</span>
                  <div>
                    <div className="contact-topic-label">{topic.label}</div>
                    <div className="contact-topic-desc">{topic.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div className="contact-hours">
            <h3>⏰ Giờ làm việc</h3>
            <div className="contact-hours-list">
              <div className="contact-hours-row">
                <span>Thứ 2 - Thứ 6</span>
                <span className="contact-hours-time">08:00 — 17:30</span>
              </div>
              <div className="contact-hours-row">
                <span>Thứ 7</span>
                <span className="contact-hours-time">08:00 — 12:00</span>
              </div>
              <div className="contact-hours-row">
                <span>Chủ nhật</span>
                <span className="contact-hours-closed">Nghỉ</span>
              </div>
              <div className="contact-hours-row" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                <span>💬 Live Chat / Email</span>
                <span className="contact-hours-time" style={{ color: '#059669' }}>24/7</span>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="contact-map-section">
            <h3>📍 Trụ sở chính</h3>
            <p>144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội</p>
            <div className="contact-map-wrapper">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9242961448834!2d105.78044731493264!3d21.035712585994246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4a40871ccf%3A0xcb030fac4fe18d96!2sVNU%20University%20of%20Engineering%20and%20Technology%20(UET)!5e0!3m2!1sen!2s!4v1689230559902!5m2!1sen!2s" 
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map">
              </iframe>
            </div>
          </div>

          {/* Social Links */}
          <div className="contact-social">
            <h3>Kết nối với chúng tôi</h3>
            <div className="contact-social-list">
              <a href="https://facebook.com/eduvnu" target="_blank" rel="noreferrer" className="contact-social-btn facebook">
                <span>f</span> Facebook
              </a>
              <a href="https://youtube.com/eduvnu" target="_blank" rel="noreferrer" className="contact-social-btn youtube">
                <span>▶</span> YouTube
              </a>
              <a href="https://linkedin.com/company/eduvnu" target="_blank" rel="noreferrer" className="contact-social-btn linkedin">
                <span>in</span> LinkedIn
              </a>
              <a href="https://zalo.me/eduvnu" target="_blank" rel="noreferrer" className="contact-social-btn zalo">
                <span>Z</span> Zalo OA
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
