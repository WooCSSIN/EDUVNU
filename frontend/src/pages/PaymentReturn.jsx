import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loading } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

export default function PaymentReturn() {
  usePageSEO({ title: 'Kết quả thanh toán VNPAY' });
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán từ VNPAY...');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      if (!location.search) {
        setStatus('error');
        setMessage('Không tìm thấy dữ liệu thanh toán.');
        return;
      }

      try {
        const res = await api.get(`/orders/vnpay_return/${location.search}`);
        setStatus('success');
        setMessage(res.data.message || 'Thanh toán thành công! Khóa học đã được kích hoạt.');
        setOrderId(res.data.order_id);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Giao dịch bị hủy hoặc không thành công.');
        setOrderId(err.response?.data?.order_id || null);
      }
    };

    processPayment();
  }, [location]);

  if (status === 'processing') return <Loading message={message} />;

  const isSuccess = status === 'success';

  return (
    <main className="crs-checkout-page" style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="crs-done-card" style={{textAlign:'center', background:'white', padding:'40px', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', maxWidth:'500px', width:'100%'}}>
        <div style={{fontSize:'64px', marginBottom:'16px'}}>
          {isSuccess ? '✅' : '❌'}
        </div>
        <h2 style={{color: isSuccess ? 'var(--success)' : 'var(--danger)', marginBottom:'8px'}}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h2>
        <p style={{color:'var(--muted)', marginBottom:'24px', lineHeight:'1.6'}}>
          {message}
        </p>

        {orderId && (
          <div style={{background:'var(--bg)', padding:'16px', borderRadius:'8px', marginBottom:'24px'}}>
            <span style={{color:'var(--muted)'}}>Mã đơn hàng: </span>
            <strong>#{orderId}</strong>
          </div>
        )}

        <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
          {isSuccess ? (
            <button className="crs-btn-solid" onClick={() => navigate('/schedule')}>
              🎓 Bắt đầu học ngay
            </button>
          ) : (
            <button className="crs-btn-solid" onClick={() => navigate('/checkout')}>
               Thử lại
            </button>
          )}
          <button className="crs-btn-outline" onClick={() => navigate('/orders')}>
            📦 Lịch sử đơn hàng
          </button>
        </div>
      </div>
    </main>
  );
}
