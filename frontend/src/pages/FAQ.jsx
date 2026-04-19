import { useState, useEffect } from 'react';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);

  usePageSEO({ title: 'Câu hỏi thường gặp (FAQ)', description: 'Giải đáp các thắc mắc chung về EduVNU.' });

  useEffect(() => {
    api.get('/courses/faqs/')
      .then(res => setFaqs(res.data?.results || res.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const defaultFaqs = [
    { question: 'Làm thế nào để đăng ký khóa học?', answer: 'Bạn cần tạo tài khoản, sau đó truy cập vào khóa học mong muốn và bấm "Thêm vào giỏ hàng" hoặc "Đăng ký miễn phí" nếu khóa học không tính phí.' },
    { question: 'Tôi có thể dùng chứng chỉ EduVNU ở đâu?', answer: 'Chứng chỉ của EduVNU có thể được thêm trực tiếp vào hồ sơ LinkedIn của bạn hoặc đính kèm vào CV để nộp cho các nhà tuyển dụng.' },
    { question: 'Có hỗ trợ hoàn tiền không?', answer: 'Có, EduVNU hỗ trợ hoàn tiền trong vòng 30 ngày nếu bạn chưa học quá 20% nội dung khóa học. Vui lòng xem chi tiết tại trang Chính sách.' },
    { question: 'Tôi có phải sinh viên VNU mới được học?', answer: 'Không, EduVNU mở cửa cho tất cả mọi người. Tuy nhiên sinh viên VNU đăng nhập bằng email nhà trường có thể nhận được thêm các ưu đãi riêng.' }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div style={{ background: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero */}
      <div style={{ background: '#0056D2', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Câu hỏi thường gặp (FAQ)</h1>
        <p style={{ fontSize: 16, color: '#bfdbfe', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Tìm hiểu cách EduVNU hoạt động và tìm câu trả lời cho các thắc mắc chung của học viên.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '-40px auto 40px auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>Đang tải câu hỏi...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {displayFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} style={{ border: '1px solid', borderColor: isOpen ? '#0056D2' : '#e5e7eb', borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s', background: isOpen ? '#f0f9ff' : '#fff' }}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      style={{ width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isOpen ? '#0056D2' : '#111' }}>{faq.question}</span>
                      <span style={{ fontSize: 24, color: isOpen ? '#0056D2' : '#9ca3af', lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 20px 20px', fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>Bạn vẫn còn thắc mắc?</h3>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giúp đỡ bạn.</p>
            <a href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: '#0056D2', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700 }}>
              Liên hệ ngay
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
