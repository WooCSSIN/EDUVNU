import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function NotFound() {
  usePageSEO({ title: '404 - Không tìm thấy trang', description: 'Trang bạn tìm kiếm không tồn tại tại EduVNU.' });
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '70vh', gap: 20, padding: 40, textAlign: 'center'
    }}>
      <div style={{ fontSize: 100, lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1f1f1f' }}>404</h1>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: '#636363' }}>Trang bạn tìm kiếm không tồn tại</h2>
      <p style={{ color: '#94a3b8', maxWidth: 480, lineHeight: 1.6 }}>
        Có vẻ trang này đã bị xóa hoặc URL không chính xác. Hãy quay về trang chủ để tiếp tục học tập.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link to="/" className="crs-btn-solid" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none' }}>
          🏠 Về trang chủ
        </Link>
        <Link to="/cart" className="crs-btn-outline" style={{ padding: '14px 24px', textDecoration: 'none' }}>
          🛒 Giỏ hàng
        </Link>
      </div>
    </div>
  );
}
