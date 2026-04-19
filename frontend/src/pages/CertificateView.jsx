import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';
import api from '../api/axios';

/* ── SVG Icons ── */
const SealIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" stroke="#0056d2" strokeWidth="3" fill="none"/>
    <circle cx="50" cy="50" r="38" stroke="#0056d2" strokeWidth="1.5" fill="none"/>
    <path d="M50 20L55 35H70L58 44L62 59L50 50L38 59L42 44L30 35H45Z" fill="#0056d2" opacity=".15"/>
    <text x="50" y="55" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0056d2" fontFamily="Inter, sans-serif">VERIFIED</text>
    <text x="50" y="68" textAnchor="middle" fontSize="7" fill="#0056d2" fontFamily="Inter, sans-serif">CERTIFICATE</text>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export default function CertificateView() {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageSEO({
    title: cert ? `Chứng chỉ: ${cert.course_title} | EduVNU` : 'Chứng chỉ | EduVNU',
    description: 'Xem chứng chỉ hoàn thành khóa học trên EduVNU.'
  });

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.get(`/courses/courses/${courseId}/certificate_data/`);
        setCert(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Không thể tải chứng chỉ.');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [courseId]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/courses/courses/${courseId}/certificate/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Không thể tải PDF. Vui lòng thử lại.');
    }
  };

  if (loading) return (
    <div className="cert-page">
      <div className="crs-courses-loading"><div className="crs-spinner"></div><span>Đang tải chứng chỉ...</span></div>
    </div>
  );

  if (error) return (
    <div className="cert-page">
      <div className="cert-error-state">
        <div className="cert-error-icon">🔒</div>
        <h2>Chưa thể cấp chứng chỉ</h2>
        <p>{error}</p>
        <Link to={`/learn/${courseId}`} className="crs-btn-solid">Quay lại học tiếp</Link>
      </div>
    </div>
  );

  if (!cert) return null;

  const partnerInitial = (cert.partner_name || 'E')[0].toUpperCase();

  return (
    <div className="cert-page">
      {/* Action bar */}
      <div className="cert-actions-bar">
        <Link to="/accomplishments" className="cert-back-link">← Tất cả chứng chỉ</Link>
        <div className="cert-actions-right">
          <button className="cert-action-btn" onClick={handleDownloadPDF}>
            <DownloadIcon /> Tải PDF
          </button>
          <button className="cert-action-btn outline" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép link chứng chỉ!');
          }}>
            <ShareIcon /> Chia sẻ
          </button>
        </div>
      </div>

      {/* Certificate card */}
      <div className="cert-card-wrapper">
        <div className="cert-card">
          {/* Gold border decoration */}
          <div className="cert-border-decor"></div>
          
          <div className="cert-card-inner">
            {/* Top section: Partner logo + Seal */}
            <div className="cert-top-row">
              <div className="cert-partner-logo">
                <div className="cert-partner-avatar">{partnerInitial}</div>
                <span className="cert-partner-name">{cert.partner_name}</span>
              </div>
              <div className="cert-seal-area">
                <div className="cert-type-label">COURSE<br/>CERTIFICATE</div>
                <SealIcon />
              </div>
            </div>

            {/* Date */}
            <p className="cert-date">{cert.issued_at}</p>

            {/* Student name */}
            <h1 className="cert-student-name">{cert.student_name}</h1>

            {/* Completion text */}
            <p className="cert-completion-text">has successfully completed</p>

            {/* Course title */}
            <h2 className="cert-course-title">{cert.course_title}</h2>

            {/* Description */}
            <p className="cert-description">
              an online course authorized by <strong>{cert.partner_name}</strong> and offered through <strong>EduVNU</strong>
            </p>

            {/* Bottom section */}
            <div className="cert-bottom-row">
              <div className="cert-signature">
                <div className="cert-sig-line"></div>
                <p className="cert-sig-name">{cert.partner_name}</p>
                <p className="cert-sig-title">Authorized Partner</p>
              </div>
              <div className="cert-verify-section">
                <p className="cert-verify-label">Verify at:</p>
                <p className="cert-verify-id">{cert.certificate_id}</p>
                <p className="cert-verify-note">EduVNU has confirmed the identity of this individual and their participation in the course.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="cert-disclaimer">
        This certificate does not confer academic credit towards a degree or official qualification. 
        It validates the successful completion of an online course offered through the EduVNU platform.
      </p>
    </div>
  );
}
