import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';

const METHODS = [
  { id: 'cash', label: 'Tiền mặt', color: '#16a34a', desc: 'Thanh toán trực tiếp tại văn phòng' },
  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', color: '#0369a1', desc: 'Chuyển khoản qua tài khoản ngân hàng' },
  { id: 'card', label: 'Thẻ tín dụng', color: '#7c3aed', desc: 'Visa, Mastercard, JCB, Napas' },
  { id: 'momo', label: 'Ví MoMo', color: '#a21caf', desc: 'Thanh toán qua ví điện tử MoMo' },
];

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/cart/my_cart/').then(r => setItems(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  // SỬA LỖI: Thêm kiểm tra i.course an toàn
  const total = items.reduce((s, i) => s + parseFloat(i.course?.price || 0), 0);
  const cur = METHODS.find(m => m.id === method);

  const handleConfirm = async () => {
    if (!items.length) return;
    setProcessing(true); setError('');
    try {
      // SỬA LỖI: Sửa đường dẫn API (xóa bỏ /orders/ thừa nếu cần)
      const res = await api.post('/orders/checkout/', { payment_method: method });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Thanh toán thất bại.');
    } finally { setProcessing(false); }
  };

  if (authLoading || loading) return <div className="crs-loading">Đang tải...</div>;

  if (result) {
    const isPaid = result.status === 'paid';
    return (
      <div className="checkout-success-page">
        <div className="checkout-success-card">
          <div className="success-checkmark" style={{background: isPaid ? '#dcfce7' : '#dbeafe', color: isPaid ? '#16a34a' : '#0369a1'}}>
            {isPaid ? 'OK' : '...'}
          </div>
          <h2 style={{color: isPaid ? '#16a34a' : '#0369a1'}}>{isPaid ? 'Thanh toán thành công!' : 'Đơn hàng đã được tạo!'}</h2>
          <p style={{color:'#636363',marginBottom:20}}>{result.message || 'Cảm ơn bạn đã tin tưởng EduVNU.'}</p>
          {!isPaid && (
            <div className="pending-info-box">
              <div className="pending-info-title">Thông tin đơn hàng</div>
              <div className="pending-info-row"><span>Mã giao dịch</span><strong>{result.transaction_id || 'Chưa có'}</strong></div>
              <div className="pending-info-row"><span>Số tiền</span><strong>{total.toLocaleString('vi-VN')} đ</strong></div>
              <div className="pending-note">Vui lòng hoàn tất thanh toán để bắt đầu học.</div>
            </div>
          )}
          <div className="success-method-badge">{cur?.label}</div>
          <div className="success-actions">
            <button className="crs-btn-solid" style={{flex:1,padding:'13px'}} onClick={() => navigate('/orders')}>Xem đơn hàng</button>
            <button className="crs-btn-outline" style={{flex:1,padding:'13px'}} onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-v3">
      <div className="container" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div className="crs-breadcrumb" style={{padding: '20px 0'}}>
          <Link to="/">Trang chủ</Link><span> / </span><Link to="/cart">Giỏ hàng</Link><span> / </span><span>Thanh toán</span>
        </div>
        <div className="checkout-layout-v3" style={{display: 'flex', gap: '32px'}}>
          <div className="checkout-left-v3" style={{flex: 1}}>
            <div className="checkout-card-v3" style={{background: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '24px'}}>
              <h3 className="checkout-card-title-v3" style={{marginBottom: '24px'}}>1. Chọn phương thức thanh toán</h3>
              <div className="payment-methods-v3" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                {METHODS.map(m => (
                  <label key={m.id} className={method === m.id ? 'payment-method-v3 selected' : 'payment-method-v3'}
                    style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', borderColor: method === m.id ? m.color : '#ddd', background: method === m.id ? m.color + '05' : 'white'}}>
                    <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <div className="pm-info-v3">
                      <div style={{fontWeight: 700}}>{m.label}</div>
                      <div style={{fontSize: '12px', color: '#666'}}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* CHI TIẾT THEO PHƯƠNG THỨC */}
              <div style={{marginTop: '24px', padding: '24px', background: '#f8f9fa', borderRadius: '8px'}}>
                  {method === 'bank_transfer' && (
                    <div className="bank-details-v3">
                      <p><strong>Ngân hàng:</strong> Vietcombank</p>
                      <p><strong>Số tài khoản:</strong> 1234 5678 9012 3456</p>
                      <p><strong>Nội dung:</strong> EDUVNU {user?.username?.toUpperCase()}</p>
                    </div>
                  )}
                  {method === 'momo' && <p>Quét mã QR MoMo để thanh toán ngay.</p>}
                  {method === 'card' && <p>Nhập thông tin thẻ Visa/Mastercard của bạn.</p>}
                  {method === 'cash' && <p>Vui lòng đến văn phòng EduVNU để nộp tiền mặt.</p>}
              </div>
            </div>

            <div className="checkout-card-v3" style={{background: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #ddd'}}>
               <h3 style={{marginBottom: '24px'}}>2. Thông tin cá nhân</h3>
               <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="crs-field"><label style={{display:'block',fontSize:12,marginBottom:4}}>Họ tên</label><input style={{width:'100%',padding:10}} defaultValue={user?.username} /></div>
                  <div className="crs-field"><label style={{display:'block',fontSize:12,marginBottom:4}}>Email</label><input style={{width:'100%',padding:10}} defaultValue={user?.email} /></div>
               </div>
            </div>
          </div>

          <div className="checkout-right-v3" style={{width: '400px'}}>
             <div style={{background: '#f8f9fa', padding: '32px', borderRadius: '8px', border: '1px solid #eee'}}>
                <h3 style={{marginBottom: '20px'}}>Tóm tắt đơn hàng</h3>
                {items.map((item, idx) => (
                  <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px'}}>
                    <span style={{maxWidth: '220px'}}>{fixText(item.course?.title || 'KH')}</span>
                    <strong>{parseFloat(item.course?.price || 0).toLocaleString()} đ</strong>
                  </div>
                ))}
                <div style={{borderTop: '1px solid #ddd', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800}}>
                   <span>Tổng tiền:</span>
                   <span style={{color: '#0056d2'}}>{total.toLocaleString()} đ</span>
                </div>
                <button 
                  onClick={handleConfirm}
                  disabled={processing || !items.length}
                  style={{width: '100%', marginTop: '24px', padding: '16px', background: '#0056d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer'}}>
                  {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}