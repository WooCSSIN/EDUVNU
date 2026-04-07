import { useState } from 'react';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';

export default function Contact() {
  usePageSEO({ title: 'Liên hệ', description: 'Liên hệ với EduVNU để nhận hỗ trợ' });
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
      setStatus({ loading: false, message: '🎉 Cảm ơn bạn! Lời nhắn đã được gửi thành công.', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ loading: false, message: '❌ Có lỗi xảy ra, vui lòng thử lại sau.', type: 'error' });
    }
  };

  return (
    <div className="crs-contact-container">
      <div className="crs-contact-form-side">
        <h1 className="crs-contact-title">Liên hệ với chúng tôi</h1>
        <p className="crs-contact-subtitle">Bạn có câu hỏi, đề xuất hoặc phản hồi đơn hàng? Hãy điền vào biểu mẫu bên dưới và chúng tôi sẽ hỗ trợ bạn ngay.</p>
        
        {status.message && (
          <div className={`crs-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="crs-form-grid">
          <div className="crs-field">
            <label>Họ và tên</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nguyễn Văn A" />
          </div>
          <div className="crs-field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
          </div>
          <div className="crs-field">
            <label>Chủ đề</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Ví dụ: Báo lỗi thanh toán..." />
          </div>
          <div className="crs-field">
            <label>Nội dung chi tiết</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." />
          </div>
          <button type="submit" className="crs-btn-solid crs-submit-btn" disabled={status.loading}>
            {status.loading ? '⏳ Đang gửi...' : 'Gửi lời nhắn'}
          </button>
        </form>
      </div>
      
      <div className="crs-contact-info-side">
        <h2 className="crs-contact-subtitle" style={{margin:0, color:'#1f1f1f', fontWeight:700}}>Trụ sở văn phòng</h2>
        <div className="crs-contact-address">📍 144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội</div>
        <div className="crs-map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9242961448834!2d105.78044731493264!3d21.035712585994246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4a40871ccf%3A0xcb030fac4fe18d96!2sVNU%20University%20of%20Engineering%20and%20Technology%20(UET)!5e0!3m2!1sen!2s!4v1689230559902!5m2!1sen!2s" 
            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map">
          </iframe>
        </div>
      </div>
    </div>
  );
}
