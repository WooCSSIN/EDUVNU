import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function MockMoMo() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const amount = params.get('amount') || '0';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Directly bypass waiting and call the real endpoint
  const handleConfirm = async () => {
    setLoading(true);
    // Since we mock backend, just confirm the transaction by simulating IPN or Success Return
    try {
      await api.post(`/orders/${orderId}/confirm_payment/`, { transaction_id: `MOMO_${Date.now()}` });
      setTimeout(() => {
        window.location.href = `/payment-return?mock=success&order_id=${orderId}`;
      }, 800);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f8', padding: '20px'}}>
      <div style={{background: 'white', width: '100%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden'}}>
        
        {/* MoMo Header */}
        <div style={{background: '#a50064', padding: '24px 20px', textAlign: 'center', color: 'white'}}>
          <div style={{fontSize: 28, fontWeight: 800, letterSpacing: '-1px'}}>MoMo Pay</div>
          <div style={{fontSize: 14, opacity: 0.9, marginTop: 4}}>Cổng thanh toán điện tử</div>
        </div>

        <div style={{padding: '30px 20px'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{fontSize: 14, color: '#64748b'}}>Số tiền thanh toán</div>
            <div style={{fontSize: 32, fontWeight: 800, color: '#a50064', margin: '4px 0'}}>
              {parseInt(amount).toLocaleString('vi-VN')} ₫
            </div>
            <div style={{fontSize: 13, background: '#fdf4ff', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', color: '#86198f', marginTop: '8px'}}>
              Đơn hàng: #{orderId}
            </div>
          </div>

          <div style={{background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
            <div style={{fontSize: 60, marginBottom: 12}}>📱</div>
            <div style={{fontWeight: 600, color: '#0f172a'}}>Quét mã QR bằng ứng dụng MoMo</div>
            <p style={{fontSize: 13, color: '#64748b', marginTop: 8}}>
              Trong môi trường Demo, bạn có thể ấn XÁC NHẬN để thực thi thanh toán ngay.
            </p>
          </div>

          <button 
            onClick={handleConfirm}
            style={{
              width: '100%', padding: '16px', background: '#a50064', color: 'white', 
              fontSize: 16, fontWeight: 700, borderRadius: '12px', border: 'none', 
              cursor: 'pointer', transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đã quét QR - Xác nhận thanh toán'}
          </button>
          
          <button 
            onClick={() => navigate('/checkout')}
            style={{
              width: '100%', padding: '14px', background: 'transparent', color: '#64748b', 
              fontSize: 15, fontWeight: 600, borderRadius: '12px', border: 'none', 
              cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px'
            }}
          >
            Huỷ giao dịch
          </button>
        </div>
        
        <div style={{padding: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #f1f5f9'}}>
          Powered by MoMo Sandbox API
        </div>
      </div>
    </div>
  );
}
