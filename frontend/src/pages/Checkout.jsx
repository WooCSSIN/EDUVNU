import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const METHODS = [
  { id: 'momo',  label: 'Ví MoMo',                 icon: '💜' },
  { id: 'vnpay', label: 'VNPay',                    icon: '🔵' },
  { id: 'bank',  label: 'Chuyển khoản ngân hàng',   icon: '🏦' },
  { id: 'cod',   label: 'Thanh toán sau',            icon: '💵' },
];

const GRADS = ['linear-gradient(135deg,#0369a1,#0ea5e9)','linear-gradient(135deg,#7c3aed,#a78bfa)','linear-gradient(135deg,#059669,#34d399)','linear-gradient(135deg,#b45309,#f59e0b)'];

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/cart/my_cart/').then(r => setItems(r.data.items || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  const total = items.reduce((s, i) => s + parseFloat(i.course.price || 0), 0);

  const confirm = async () => {
    if (!items.length) return;
    setProcessing(true); setError('');
    try {
      await api.post('/orders/orders/checkout/', { payment_method: method });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally { setProcessing(false); }
  };

  if (authLoading || loading) return <div className="crs-loading">Đang tải...</div>;

  /* SUCCESS */
  if (done) return (
    <div className="crs-checkout-done">
      <div className="crs-done-card">
        <div className="crs-done-icon">🎉</div>
        <h2>Thanh toán thành công!</h2>
        <p>Khóa học đã được kích hoạt trong tài khoản của bạn.</p>
        <div className="crs-done-amount">{total === 0 ? 'Miễn phí' : `${total.toLocaleString('vi-VN')} đ`}</div>
        <div className="crs-done-actions">
          <button className="crs-btn-solid" onClick={() => navigate('/schedule')}>📚 Xem việc học của tôi</button>
          <button className="crs-btn-outline" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="crs-checkout-page">
      {/* BREADCRUMB */}
      <div className="crs-breadcrumb">
        <Link to="/">Trang chủ</Link><span>/</span>
        <Link to="/cart">Giỏ hàng</Link><span>/</span>
        <span>Thanh toán</span>
      </div>

      {/* STEPS */}
      <div className="crs-steps">
        {['Giỏ hàng','Thanh toán','Hoàn tất'].map((s, i) => (
          <div key={s} className={`crs-step ${i <= 1 ? 'active' : ''} ${i === 0 ? 'done' : ''}`}>
            <div className="crs-step-circle">{i === 0 ? '✓' : i + 1}</div>
            <span>{s}</span>
            {i < 2 && <div className={`crs-step-line ${i === 0 ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="crs-checkout-layout">
        {/* LEFT */}
        <div>
          {/* PAYMENT METHODS */}
          <div className="crs-checkout-card">
            <h3>Phương thức thanh toán</h3>
            <div className="crs-payment-options">
              {METHODS.map(m => (
                <label key={m.id} className={`crs-payment-opt ${method === m.id ? 'selected' : ''}`}>
                  <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span className="crs-payment-icon">{m.icon}</span>
                  <span className="crs-payment-label">{m.label}</span>
                  <div className={`crs-payment-radio ${method === m.id ? 'checked' : ''}`} />
                </label>
              ))}
            </div>

            {method === 'bank' && (
              <div className="crs-bank-info">
                <div className="crs-bank-row"><span>Ngân hàng</span><strong>Vietcombank</strong></div>
                <div className="crs-bank-row"><span>Số tài khoản</span><strong>1234 5678 9012</strong></div>
                <div className="crs-bank-row"><span>Chủ tài khoản</span><strong>NGUYEN VAN A</strong></div>
                <div className="crs-bank-row"><span>Nội dung CK</span><strong>TT {user?.username}</strong></div>
              </div>
            )}
          </div>

          {/* BILLING INFO */}
          <div className="crs-checkout-card">
            <h3>Thông tin thanh toán</h3>
            <div className="crs-billing-grid">
              <div className="crs-field"><label>Họ tên</label><input defaultValue={user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username} /></div>
              <div className="crs-field"><label>Email</label><input type="email" defaultValue={user?.email} /></div>
            </div>
          </div>

          {error && <div className="crs-auth-error" style={{marginBottom:16}}>{error}</div>}

          <button className="crs-confirm-btn" onClick={confirm} disabled={processing || !items.length}>
            {processing ? 'Đang xử lý...' : `🔒 Xác nhận thanh toán — ${total === 0 ? 'Miễn phí' : total.toLocaleString('vi-VN') + ' đ'}`}
          </button>
          <button className="crs-back-btn" onClick={() => navigate('/cart')}>← Quay lại giỏ hàng</button>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="crs-order-summary-card">
          <h3>Đơn hàng ({items.length} khóa học)</h3>
          {items.length === 0 ? (
            <p style={{color:'#636363',textAlign:'center',padding:'20px'}}>Giỏ hàng trống</p>
          ) : (
            <>
              {items.map((item, idx) => (
                <div key={item.id} className="crs-osi">
                  <div className="crs-osi-thumb" style={{background: GRADS[idx % GRADS.length]}}>{item.course.title[0]}</div>
                  <div className="crs-osi-title">{item.course.title}</div>
                  <span className="crs-osi-price">
                    {parseFloat(item.course.price) === 0
                      ? <span className="free-tag">Miễn phí</span>
                      : `${parseFloat(item.course.price).toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
              ))}
              <div className="crs-divider" />
              <div className="crs-total-rows">
                <div className="crs-total-row"><span>Tạm tính</span><span>{total.toLocaleString('vi-VN')} đ</span></div>
                <div className="crs-total-row"><span>Giảm giá</span><span style={{color:'#1a7f37'}}>0 đ</span></div>
                <div className="crs-total-row grand">
                  <span>Tổng thanh toán</span>
                  <span className="crs-grand-price">{total === 0 ? 'Miễn phí' : `${total.toLocaleString('vi-VN')} đ`}</span>
                </div>
              </div>
              <div className="crs-ssl-note"><span>🔒</span><span>Thanh toán được mã hóa SSL</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
