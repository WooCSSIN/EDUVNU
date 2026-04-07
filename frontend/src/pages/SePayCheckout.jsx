import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SePayCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');

  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const qrUrl = searchParams.get('qr_url');
  const qrContent = searchParams.get('content');

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      api.get(`/orders/`).then((res) => {
        const orderList = Array.isArray(res.data) ? res.data : (res.data.results || []);
        const order = orderList.find(o => o.id === parseInt(orderId));
        if (order && order.status === 'paid') {
          setStatus('paid');
          clearInterval(interval);
          setTimeout(() => navigate('/schedule'), 3000);
        }
      }).catch(err => console.error(err));
    }, 5000); // Check moi 5 giay
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  return (
    <div style={{ padding: '60px 20px', minHeight: '80vh', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056d2', marginBottom: '20px' }}>Thanh Toán Qua Chuyển Khoản / VietQR</h2>
        
        {status === 'pending' ? (
          <>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn. Hệ thống sẽ tự động xác nhận ngay khi nhận được tiền.
            </p>
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'inline-block', marginBottom: '24px' }}>
              <img src={qrUrl} alt="Trợ lý VietQR" style={{ width: '100%', maxWidth: '350px', display: 'block', margin: '0 auto' }} />
            </div>
            
            <div style={{ backgroundColor: '#f0f7ff', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px' }}>
              <p><strong>Số tiền:</strong> {parseInt(amount).toLocaleString()} VNĐ</p>
              <p><strong>Nội dung bắt buộc:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{qrContent}</span></p>
            </div>
            
            <p style={{ fontSize: '14px', color: '#888' }}>
              Đang chờ thanh toán... vui lòng không đóng trình duyệt lúc này.
            </p>
            {/* Hieu ung loading don gian */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0056d2', animation: 'bounce 1s infinite' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0056d2', animation: 'bounce 1s infinite 0.2s' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0056d2', animation: 'bounce 1s infinite 0.4s' }}></div>
            </div>
          </>
        ) : (
          <div style={{ padding: '50px 0', animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#10b981', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '50px', margin: '0 auto 24px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' 
            }}>
              ✓
            </div>
            <h3 style={{ color: '#10b981', fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
              Thanh Toán Thành Công!
            </h3>
            <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
              Tuyệt vời! Giao dịch <strong>{parseInt(amount).toLocaleString()} VNĐ</strong> của bạn đã được xác nhận.<br/>
              Khóa học đã được thêm vào tài khoản của bạn.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/schedule')}
                style={{
                  padding: '12px 24px', backgroundColor: '#0056d2', color: 'white', 
                  border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', 
                  cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(0, 86, 210, 0.2)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0043a8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#0056d2'}
              >
                Vào Lớp Học Ngay 🚀
              </button>
              
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', 
                  border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', 
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        )}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
