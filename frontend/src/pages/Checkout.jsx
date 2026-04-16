import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import { Loading } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

const stripePromise = loadStripe('pk_test_51TJ6jYCXDledMR05jGelboBqOpunHDDIB1tv63hrPBjtMsT0agZOLb1ssY2YQDR6GUht4ZR2QusKLcBjS2px798N008DFMTXT9');

const METHODS = [
  { id: 'vnpay', icon: '🛡️', label: 'Cổng thanh toán VNPAY', desc: 'ATM nội địa, Internet Banking' },
  { id: 'momo',  icon: '📱', label: 'Ví điện tử MoMo',       desc: 'Quét mã MoMo để thanh toán' },
  { id: 'card',  icon: '💳', label: 'Thẻ Visa / Mastercard', desc: 'Thanh toán an toàn qua Stripe' },
  { id: 'chuyen_khoan', icon: '🏦', label: 'Chuyển khoản QR', desc: 'Quét VietQR, xác nhận tự động' },
];

const GRADS = [
  'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
];

const STRIPE_ELEM_STYLE = {
  style: {
    base: { fontSize: '15px', color: '#1e293b', fontFamily: '"Inter", sans-serif', '::placeholder': { color: '#94a3b8' } },
    invalid: { color: '#ef4444' },
  },
};

const StripeCardForm = forwardRef(function StripeCardForm({ onSuccess, onError }, ref) {
  const stripe = useStripe();
  const elements = useElements();
  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!stripe || !elements) return false;
      onError('');
      const cardNumberEl = elements.getElement(CardNumberElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberEl,
      });
      if (pmError) {
        onError(pmError.message);
        return false;
      }
      try {
        const res = await api.post('/orders/checkout/', {
          payment_method: 'card',
          stripe_payment_method_id: paymentMethod.id,
        });
        if (res.data.status === 'success') {
          onSuccess(res.data.order_id);
          return true;
        }
        if (res.data.status === 'requires_action') {
          const { error } = await stripe.handleNextAction({ clientSecret: res.data.client_secret });
          if (error) { onError(error.message); return false; }
          onSuccess(res.data.order_id);
          return true;
        }
        onError(res.data.error || 'Thanh toán thất bại');
        return false;
      } catch (e) {
        onError(e.response?.data?.error || 'Lỗi kết nối server');
        return false;
      }
    },
  }));

  return (
    <div style={{ marginTop: 8 }}>
      <div className="crs-field" style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Số thẻ</label>
        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '13px 14px', background: '#f8fafc', transition: '0.2s' }}>
          <CardNumberElement options={STRIPE_ELEM_STYLE} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {['VISA', 'MASTERCARD', 'AMEX', 'JCB'].map(b => (
            <span key={b} style={{ fontSize: 9, background: '#e2e8f0', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>{b}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="crs-field">
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Hết hạn</label>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '13px 14px', background: '#f8fafc' }}>
            <CardExpiryElement options={STRIPE_ELEM_STYLE} />
          </div>
        </div>
        <div className="crs-field">
          <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>CVV</label>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '13px 14px', background: '#f8fafc' }}>
            <CardCvcElement options={STRIPE_ELEM_STYLE} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
        🔐 Số thẻ được mã hóa bởi Stripe, EduVNU không lưu thông tin thẻ của bạn.
      </div>
    </div>
  );
});

export default function Checkout() {
  usePageSEO({ title: 'Thanh toán an toàn - EduVNU', description: 'Hoàn tất đơn hàng của bạn để bắt đầu học ngay.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTrial = searchParams.get('trial') === 'true';
  const trialProgram = location.state?.program; // We can still try to get the title from state

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('vnpay');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const stripeFormRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    
    if (isTrial) {
       
      setItems([{
        id: 'trial_123',
        course: { title: `${trialProgram?.title || 'Chương trình'} - Dùng thử miễn phí 7 ngày`, price: 0 }
      }]);
      setLoading(false);
      return;
    }

    api.get('/cart/my_cart/')
      .then(r => {
        const cartItems = r.data.items || [];
        if (cartItems.length === 0) { navigate('/cart'); return; }
        setItems(cartItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const subtotal = items.reduce((s, i) => s + parseFloat(i.course?.price || 0), 0);

  const handleConfirm = async () => {
    if (!items.length) return;
    setProcessing(true);
    setError('');
    
    if (isTrial) {
      try {
        const program = location.state?.program;
        if (program) {
          await api.post('/courses/courses/register_degree/', { degree_id: program.id });
        }
        navigate(`/payment-return?method=${method}&order_id=TRIAL_${Date.now()}&trial=true`);
      } catch (err) {
        setError('Không thể kích hoạt dùng thử. Vui lòng thử lại sau.');
        setProcessing(false);
      }
      return;
    }

    if (method === 'card') {
      if (stripeFormRef.current) {
        const ok = await stripeFormRef.current.submit();
        if (!ok) setProcessing(false);
      } else {
        setError('Stripe chưa sẵn sàng, vui lòng chờ giây lát.');
        setProcessing(false);
      }
      return;
    }
    try {
      const res = await api.post('/orders/checkout/', { payment_method: method });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }
      navigate(`/payment-return?method=${method}&order_id=${res.data.id || ''}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Thanh toán thất bại. Vui lòng thử lại.');
      setProcessing(false);
    }
  };

  const handleStripeSuccess = (orderId) => {
    navigate(`/payment-return?method=card&order_id=${orderId}`);
  };

  if (authLoading || loading) return <Loading message="Đang xử lý thông tin..." />;

  return (
    <div className="crs-checkout-page" style={{ backgroundColor: '#f5f7f8', minHeight: '100vh', padding: '40px 0' }}>
      <div className="crs-checkout-layout" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>Thanh toán</h1>
          <div className="crs-checkout-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👤</span> Thông tin tài khoản
            </h3>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{user?.email}</div>
            </div>
          </div>
          <div className="crs-checkout-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
              <h3 style={{ fontSize: 20, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💳</span> Phương thức thanh toán
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(isTrial ? METHODS.filter(m => m.id === 'vnpay' || m.id === 'card') : METHODS).map((m, index, arr) => {
                const isActive = method === m.id;
                return (
                  <div key={m.id} style={{ borderBottom: index < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <label
                      onClick={() => setMethod(m.id)}
                      style={{
                        padding: '20px 24px', display: 'flex', alignItems: 'center', cursor: 'pointer',
                        background: isActive ? '#f0f9ff' : '#fff', transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio" name="method" value={m.id}
                        checked={isActive} onChange={() => setMethod(m.id)}
                        style={{ width: 20, height: 20, accentColor: '#0056d2', marginRight: 16 }}
                      />
                      <span style={{ fontSize: 24, marginRight: 12 }}>{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{m.label}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{m.desc}</div>
                      </div>
                    </label>
                    {isActive && (
                      <div style={{ padding: '0 24px 24px 58px', background: '#f0f9ff' }}>
                        {m.id === 'vnpay' && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: '#fff', borderRadius: 8, border: '1px solid #e0f2fe' }}>
                            <span style={{ fontSize: 28 }}>🛡️</span>
                            <div>
                               <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>Cổng thanh toán VNPAY</div>
                               <p style={{ color: '#64748b', margin: 0, fontSize: 14, lineHeight: 1.6 }}>Thanh toán an toàn qua hệ thống VNPAY.</p>
                            </div>
                          </div>
                        )}
                        {m.id === 'momo' && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: '#fff', borderRadius: 8, border: '1px solid #fae8ff' }}>
                            <span style={{ fontSize: 28 }}>📱</span>
                            <div>
                              <div style={{ fontWeight: 700, color: '#a21caf', marginBottom: 4 }}>Ví điện tử MoMo</div>
                              <p style={{ color: '#64748b', margin: 0, fontSize: 14, lineHeight: 1.6 }}>Thanh toán nhanh chóng qua ứng dụng MoMo.</p>
                            </div>
                          </div>
                        )}
                        {m.id === 'card' && (
                          <Elements stripe={stripePromise}>
                            <StripeCardForm ref={stripeFormRef} onSuccess={handleStripeSuccess} onError={setError} />
                          </Elements>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: 8, borderLeft: '4px solid #ef4444', fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="crs-order-summary-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0056d2, #0041a8)' }}>
              <h3 style={{ fontSize: 17, margin: 0, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>🧾 Tóm tắt đơn hàng</h3>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: GRADS[idx % GRADS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                    {fixText(item.course?.title)?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      {fixText(item.course?.title)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{parseFloat(item.course?.price || 0).toLocaleString('vi-VN')}₫</div>
                </div>
              ))}
              <div style={{ height: 1, background: '#f1f5f9', margin: '14px 0' }} />
              <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '14px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: '#0056d2' }}>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <button
                id="checkout-confirm-btn"
                onClick={handleConfirm}
                disabled={processing}
                style={{
                  width: '100%', padding: '15px 20px',
                  background: processing ? '#94a3b8' : 'linear-gradient(135deg, #0056d2, #0041a8)',
                  color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.25s ease',
                  boxShadow: processing ? 'none' : '0 4px 16px rgba(0,86,210,0.35)',
                }}
              >
                {processing ? '⏳ Đang xử lý...' : '🔒 Hoàn tất thanh toán'}
              </button>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[{icon:'✅', text:'Bảo đảm hoàn tiền 30 ngày'}, {icon:'🔒', text:'Thanh toán bảo mật SSL'}, {icon:'🎓', text:'Truy cập trọn đời'}].map(({icon,text}) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes checkout-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}