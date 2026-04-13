import { Link } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function NotFound() {
  usePageSEO({ title: '404 - Không tìm thấy trang', description: 'Trang bạn tìm kiếm không tồn tại tại EduVNU.' });
  return (
    <div style={{
      position: 'relative',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh', 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      overflow: 'hidden'
    }}>
      
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(10, 10, 10, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ 
          fontSize: '180px', 
          fontWeight: 900, 
          margin: 0, 
          lineHeight: 1,
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 10px 30px rgba(59, 130, 246, 0.2))'
        }}>
          404
        </h1>
        
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: '#f8fafc',
          marginTop: '24px',
          marginBottom: '16px'
        }}>
          Lạc lối trong không gian số?
        </h2>
        
        <p style={{ 
          color: '#94a3b8', 
          maxWidth: '500px', 
          lineHeight: 1.6, 
          fontSize: '16px',
          marginBottom: '40px'
        }}>
          Trang bạn đang cố gắng truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống EduVNU. Đừng lo lắng, hãy để chúng tôi đưa bạn trở lại hành trình học tập.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" 
            style={{ 
              padding: '14px 32px', 
              fontSize: '16px', 
              fontWeight: 600,
              textDecoration: 'none',
              background: '#3b82f6',
              color: '#fff',
              borderRadius: '8px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.39)';
            }}
          >
            🏠 Về trang chủ
          </Link>
          
          <Link to="/schedule" 
            style={{ 
              padding: '14px 32px', 
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            📚 Nhịp độ học tập
          </Link>
        </div>
      </div>
    </div>
  );
}
