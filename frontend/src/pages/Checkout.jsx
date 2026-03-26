import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart/my_cart/');
      console.log('Dữ liệu giỏ hàng nhận được:', res.data); // <-- QUAN TRỌNG: Kiểm tra tại Console (F12)
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi tải giỏ hàng', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    // Chấp nhận cả dữ liệu chuỗi hoặc số từ Backend
    const priceStr = item.course?.price || '0';
    return acc + parseFloat(priceStr);
  }, 0);

  const handleCreateOrder = async () => {
    setPaying(true);
    try {
      console.log('Đang thực hiện checkout với phương thức:', paymentMethod);
      const res = await api.post('/orders/checkout/', { payment_method: paymentMethod });
      setOrderId(res.data.id);
      
      if (['bank_transfer', 'momo', 'card'].includes(paymentMethod)) {
        setShowQR(true);
      } else {
        alert('Đơn hàng đã được tạo. Vui lòng thanh toán.');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Lỗi tạo đơn hàng cụ thể:', err.response?.data);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmPaid = async () => {
    setPaying(true);
    try {
      await api.post(`/orders/${orderId}/confirm_payment/`, { transaction_id: 'WEB_PAY_'+Date.now() });
      alert('Thanh toán thành công! Chúc mừng bạn đã sở hữu khóa học.');
      navigate('/my-learning');
    } catch (err) {
      alert('Không thể xác thực thanh toán. Vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Đang tải chi tiết đơn hàng...</div>;

  return (
    <div className="container" style={{maxWidth: '1200px', margin: '40px auto', display: 'flex', gap: '48px'}}>
      
      {/* ── CỘT PHƯƠNG THỨC THANH TOÁN ── */}
      <div style={{flexGrow: 1}}>
        <h1 style={{fontSize: '32px', marginBottom: '32px', fontWeight: 800}}>Tiến hành thanh toán</h1>
        
        <div style={{background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '32px', marginBottom: '24px'}}>
           <h3 style={{marginBottom: '20px'}}>Chọn phương thức học hỏi</h3>
           <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {['bank_transfer', 'momo', 'card'].map((method) => (
                <label key={method} style={{display: 'flex', gap: '12px', cursor: 'pointer', padding: '16px', border: paymentMethod === method ? '2px solid #0056d2' : '1px solid #eee', borderRadius: '4px', background: paymentMethod === method ? '#f0f7ff' : '#fff'}}>
                  <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{marginTop: '4px'}} />
                  <div>
                    <strong style={{textTransform: 'uppercase'}}>{method.replace('_', ' ')}</strong>
                    <br/><small style={{color: '#666'}}>Phương thức thanh toán bảo mật dành cho EduVNU.</small>
                  </div>
                </label>
              ))}
           </div>
        </div>
      </div>

      {/* ── TÓM TẮT ĐƠN HÀNG ── */}
      <div style={{width: '400px'}}>
        <div style={{background: '#f8f9fa', padding: '32px', border: '1px solid #eee', borderRadius: '8px', position: 'sticky', top: '100px'}}>
           <h3 style={{marginBottom: '24px'}}>Tóm tắt đơn hàng</h3>
           <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
              {cartItems.length > 0 ? cartItems.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
                   <span style={{maxWidth: '220px', fontWeight: 500}}>{item.course.title}</span>
                   <span style={{fontWeight: 700}}>{parseFloat(item.course.price || 0).toLocaleString()} đ</span>
                </div>
              )) : <p style={{color: '#666'}}>Giỏ hàng của bạn đang trống.</p>}
           </div>
           
           <div style={{borderTop: '2px solid #ddd', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px'}}>
              <span>Tổng cộng</span>
              <span style={{color: '#0056d2'}}>{totalPrice.toLocaleString()} đ</span>
           </div>
           
           <button 
             onClick={handleCreateOrder} 
             disabled={paying || cartItems.length === 0}
             style={{width: '100%', padding: '16px', marginTop: '32px', background: (paying || cartItems.length === 0) ? '#ddd' : '#0056d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '16px', cursor: 'pointer'}}>
             {paying ? 'Đang tạo đơn hàng...' : 'Xác nhận Đặt hàng'}
           </button>
        </div>
      </div>

      {/* ── QR MODAL ── */}
      {showQR && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000}}>
           <div style={{background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)'}}>
              <h2 style={{marginBottom: '12px', color: '#0056d2'}}>Hoàn tất thanh toán</h2>
              <p style={{fontSize: '15px', color: '#444', marginBottom: '24px'}}>Số tiền: <strong>{totalPrice.toLocaleString()} đ</strong></p>
              
              <div style={{width: '220px', height: '220px', background: '#fff', border: '1px solid #ddd', padding: '10px', margin: '0 auto 24px auto'}}>
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY_ORDER_${orderId}_AMT_${totalPrice}`} style={{width: '100%'}} alt="QR" />
              </div>
              
              <p style={{fontSize: '13px', color: '#666', marginBottom: '32px', fontStyle: 'italic'}}>Quét mã QR để tự động thanh toán qua ứng dụng Ngân hàng của bạn.</p>
              
              <div style={{display: 'flex', gap: '16px'}}>
                <button onClick={() => setShowQR(false)} style={{flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer'}}>Quay lại</button>
                <button onClick={handleConfirmPaid} style={{flex: 1, padding: '12px', background: '#0056d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer'}}>Tôi đã thanh toán</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
