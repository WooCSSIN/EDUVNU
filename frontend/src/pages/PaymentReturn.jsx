import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loading } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

export default function PaymentReturn() {
  usePageSEO({ title: 'Kết quả giao dịch' });
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả giao dịch...');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      
      // 1. Kiểm tra nếu là thanh toán trực tiếp thành công (Stripe card, SePay...)
      if (params.get('mock') || params.get('method') === 'card' || params.get('method') === 'chuyen_khoan') {
        setStatus('success');
        setMessage('Giao dịch đã được ghi nhận hệ thống.');
        setOrderId(params.get('order_id'));
        return;
      }

      // 2. Xác định Endpoint Backend dựa trên tham số trả về
      let endpoint = '';
      if (params.get('vnp_ResponseCode')) {
        endpoint = `/orders/vnpay_return/${location.search}`;
      } else if (params.get('resultCode')) {
        endpoint = `/orders/momo_return/${location.search}`;
      }

      if (!endpoint) {
        setStatus('error');
        setMessage('Tham số trả về không hợp lệ hoặc không xác định được cổng thanh toán.');
        return;
      }

      try {
        const res = await api.get(endpoint);
        setStatus('success');
        setMessage(res.data.message || 'Giao dịch thành công!');
        setOrderId(res.data.order_id);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Xác nhận giao dịch thất bại.');
        setOrderId(err.response?.data?.order_id || null);
      }
    };

    processPayment();
  }, [location]);

  if (status === 'processing') return <Loading message={message} />;

  const isSuccess = status === 'success';

  return (
    <main className="crs-pr-page">
      <div className="crs-pr-card">
        <div className={`crs-pr-icon ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? '✅' : '❌'}
        </div>
        <h2 className={`crs-pr-title ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? 'Giao dịch thành công!' : 'Giao dịch thất bại'}
        </h2>
        <p className="crs-pr-message">
          {message}
        </p>

        {orderId && (
          <div className="crs-pr-order-box">
            <span style={{color: 'var(--crs-text-muted)'}}>Mã đơn hàng: </span>
            <strong>#{orderId}</strong>
          </div>
        )}

        <div className="crs-pr-actions">
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
          <button className="crs-btn-outline" onClick={() => navigate('/contact')}>
            💬 Liên hệ CSKH
          </button>
        </div>
      </div>
    </main>
  );
}
