import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';

const CertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function Accomplishments() {
  usePageSEO({
    title: 'Thành tích của tôi | EduVNU',
    description: 'Xem tất cả chứng chỉ và thành tích bạn đã đạt được trên EduVNU.'
  });

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/courses/courses/my_certificates/');
        setCerts(res.data);
      } catch (err) {
        console.error('Failed to fetch certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleDownloadPDF = async (courseId) => {
    try {
      const res = await api.get(`/courses/courses/${courseId}/certificate/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Không thể tải PDF.');
    }
  };

  // Color palette for certificate thumbnails
  const colors = ['#0056d2', '#1a7f37', '#9333ea', '#dc2626', '#0891b2', '#ca8a04'];
  const getColor = (i) => colors[i % colors.length];

  return (
    <div className="acc-page">
      {/* Hero */}
      <div className="acc-hero">
        <div className="acc-hero-inner">
          <h1>Thành tích của tôi</h1>
          <p>Chia sẻ các kỹ năng và chứng chỉ bạn đã nỗ lực đạt được.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="acc-content">
        <div className="acc-stats-row">
          <div className="acc-stat-box">
            <span className="acc-stat-icon">🏆</span>
            <span className="acc-stat-val">{certs.length}</span>
            <span className="acc-stat-lbl">Chứng chỉ</span>
          </div>
          <div className="acc-stat-box">
            <span className="acc-stat-icon">⭐</span>
            <span className="acc-stat-val">{certs.length > 0 ? certs.length * 100 : 0}</span>
            <span className="acc-stat-lbl">Điểm kinh nghiệm</span>
          </div>
        </div>

        {/* Certificate list */}
        {loading ? (
          <div className="crs-courses-loading"><div className="crs-spinner"></div><span>Đang tải thành tích...</span></div>
        ) : certs.length === 0 ? (
          <div className="acc-empty">
            <div className="acc-empty-icon">📜</div>
            <h3>Chưa có chứng chỉ nào</h3>
            <p>Hoàn thành 100% bài học trong một khóa học để nhận chứng chỉ đầu tiên của bạn.</p>
            <Link to="/" className="crs-btn-solid">Khám phá khóa học</Link>
          </div>
        ) : (
          <div className="acc-cert-list">
            {certs.map((cert, i) => (
              <div key={cert.certificate_id} className="acc-cert-card">
                {/* Mini certificate thumbnail */}
                <div className="acc-cert-thumb" style={{ background: getColor(i) }}>
                  <CertIcon />
                  <span className="acc-cert-thumb-text">{(cert.partner_name || 'E')[0]}</span>
                </div>

                {/* Info */}
                <div className="acc-cert-info">
                  <p className="acc-cert-partner">{cert.partner_name}</p>
                  <h3 className="acc-cert-title">{cert.course_title}</h3>
                  <p className="acc-cert-date">Hoàn thành vào ngày: {cert.issued_at_vi}</p>
                  <p className="acc-cert-id">Mã chứng chỉ: {cert.certificate_id.slice(0, 8).toUpperCase()}</p>

                  <div className="acc-cert-actions">
                    <Link to={`/certificate/${cert.course_id}`} className="acc-cert-btn primary">
                      Xem chứng chỉ
                    </Link>
                    <button className="acc-cert-btn outline" onClick={() => handleDownloadPDF(cert.course_id)}>
                      <DownloadIcon /> Tải PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
