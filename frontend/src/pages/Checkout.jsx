import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import { Loading } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

const METHODS = [
  { id: 'bank_transfer', icon: '🏦', label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua tài khoản ngân hàng nội địa' },
  { id: 'card',          icon: '💳', label: 'Thẻ tín dụng / ghi nợ', desc: 'Visa, Mastercard, JCB, Napas' },
  { id: 'momo',          icon: '📱', label: 'Ví MoMo',               desc: 'Thanh toán nhanh qua ví điện tử MoMo' },
  { id: 'zalopay',       icon: '💙', label: 'ZaloPay',               desc: 'Thanh toán qua ví ZaloPay' },
  { id: 'cash',          icon: '💵', label: 'Tiền mặt',              desc: 'Thanh toán trực tiếp tại văn phòng' },
];

const GRADS = [
  'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
];

export default function Checkout() {
  usePageSEO({ title: 'Thanh toán', description: 'Thanh toán an toàn cho khóa học tại EduVNU. Hỗ trợ thẻ tín dụng, MoMo, ZaloPay, chuyển khoản ngân hàng.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Done

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/cart/my_cart/')
      .then(r => {
        const cartItems = r.data.items || [];
        if (cartItems.length === 0) {
          // Redirect về giỏ hàng nếu trống - tránh hiển thị 0đ
          navigate('/cart');
          return;
        }
        setItems(cartItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const subtotal = items.reduce((s, i) => s + parseFloat(i.course?.price || 0), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleConfirm = async () => {
    if (!items.length) return;
    setProcessing(true);
    setError('');
    try {
      const res = await api.post('/orders/checkout/', { payment_method: method });
      if (res.data.payment_url) {
        // Rediect to VNPAY Sandbox
        window.location.href = res.data.payment_url;
        return;
      }
      setResult(res.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) return <Loading message="Đang tải thông tin thanh toán..." />;

  // ═══ STEP 3: KẾT QUẢ THÀNH CÔNG ═══
  if (result || step === 3) {
    const isPaid = result?.status === 'paid';
    return (
      <div className="crs-checkout-done">
        <div className="crs-done-card">
          <div className="crs-done-icon">{isPaid ? '🎉' : '📋'}</div>
          <h2 style={{color: isPaid ? 'var(--success)' : 'var(--blue)'}}>
            {isPaid ? 'Thanh toán thành công!' : 'Đơn hàng đã được tạo!'}
          </h2>
          <p>{isPaid
            ? 'Chúc mừng! Bạn đã đăng ký thành công. Bắt đầu học ngay bây giờ!'
            : 'Đơn hàng đang chờ xác nhận thanh toán. Bạn sẽ nhận được thông báo khi hoàn tất.'
          }</p>

          {/* Order Details */}
          <div style={{textAlign:'left',margin:'20px 0',padding:20,background:'var(--bg)',borderRadius:8,border:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
              <span style={{color:'var(--muted)'}}>Mã đơn hàng</span>
              <strong>#{result?.id || '---'}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
              <span style={{color:'var(--muted)'}}>Phương thức</span>
              <strong>{METHODS.find(m=>m.id===method)?.label}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
              <span style={{color:'var(--muted)'}}>Trạng thái</span>
              <span className={`crs-status-badge ${isPaid?'paid':'pending'}`}>
                {isPaid ? '✓ Đã thanh toán' : '⏳ Đang xử lý'}
              </span>
            </div>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:10,display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700}}>
              <span>Tổng thanh toán</span>
              <span style={{color:'var(--blue)'}}>{total.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="crs-done-actions">
            {isPaid && (
              <button className="crs-btn-solid" style={{padding:'14px',fontSize:16}} onClick={()=>navigate('/schedule')}>
                🎓 Bắt đầu học ngay
              </button>
            )}
            <button className="crs-btn-outline" style={{padding:'14px'}} onClick={()=>navigate('/orders')}>
              📦 Xem đơn hàng
            </button>
            <button className="crs-back-btn" onClick={()=>navigate('/')}>
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ MAIN CHECKOUT FLOW ═══
  return (
    <div className="crs-checkout-page">
      {/* Breadcrumb */}
      <div className="crs-breadcrumb">
        <Link to="/">Trang chủ</Link><span>/</span>
        <Link to="/cart">Giỏ hàng</Link><span>/</span>
        <span>Thanh toán</span>
      </div>

      {/* Step Indicator */}
      <div className="crs-steps">
        <div className={`crs-step ${step>=1?'active':''} ${step>1?'done':''}`}>
          <span className="crs-step-circle">{step > 1 ? '✓' : '1'}</span>
          <span>Xem lại đơn hàng</span>
        </div>
        <div className={`crs-step-line ${step>1?'done':''}`} />
        <div className={`crs-step ${step>=2?'active':''} ${step>2?'done':''}`}>
          <span className="crs-step-circle">{step > 2 ? '✓' : '2'}</span>
          <span>Thanh toán</span>
        </div>
        <div className={`crs-step-line ${step>2?'done':''}`} />
        <div className={`crs-step ${step>=3?'active':''}`}>
          <span className="crs-step-circle">3</span>
          <span>Hoàn tất</span>
        </div>
      </div>

      <div className="crs-checkout-layout">
        {/* ═══ LEFT COLUMN ═══ */}
        <div>
          {/* STEP 1: Review Order */}
          {step === 1 && (
            <>
              <div className="crs-checkout-card">
                <h3>📋 Xem lại đơn hàng ({items.length} khóa học)</h3>
                {items.map((item, idx) => (
                  <div key={item.id} className="crs-osi">
                    <div className="crs-osi-thumb" style={{background: GRADS[idx % GRADS.length]}}>
                      {fixText(item.course?.title)?.[0] || '?'}
                    </div>
                    <div className="crs-osi-title">{fixText(item.course?.title)}</div>
                    <span className="crs-osi-price">
                      {parseFloat(item.course?.price || 0) === 0
                        ? <span className="free-tag">Miễn phí</span>
                        : `${parseFloat(item.course?.price || 0).toLocaleString('vi-VN')} ₫`
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Personal Info */}
              <div className="crs-checkout-card">
                <h3>👤 Thông tin cá nhân</h3>
                <div className="crs-billing-grid">
                  <div className="crs-field">
                    <label>Họ và tên</label>
                    <input defaultValue={user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username} />
                  </div>
                  <div className="crs-field">
                    <label>Email</label>
                    <input defaultValue={user?.email} type="email" />
                  </div>
                  <div className="crs-field">
                    <label>Số điện thoại</label>
                    <input placeholder="0912 345 678" />
                  </div>
                  <div className="crs-field">
                    <label>Quốc gia</label>
                    <input defaultValue="Việt Nam" />
                  </div>
                </div>
              </div>

              <button className="crs-confirm-btn" onClick={()=>setStep(2)}>
                Tiếp tục thanh toán →
              </button>
            </>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <>
              <div className="crs-checkout-card">
                <h3>💳 Chọn phương thức thanh toán</h3>
                <div className="crs-payment-options">
                  {METHODS.map(m => (
                    <label key={m.id}
                      className={`crs-payment-opt ${method===m.id?'selected':''}`}
                      onClick={()=>setMethod(m.id)}>
                      <input type="radio" name="method" value={m.id} checked={method===m.id} onChange={()=>setMethod(m.id)} />
                      <span className="crs-payment-icon">{m.icon}</span>
                      <div style={{flex:1}}>
                        <div className="crs-payment-label">{m.label}</div>
                        <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{m.desc}</div>
                      </div>
                      <div className={`crs-payment-radio ${method===m.id?'checked':''}`} />
                    </label>
                  ))}
                </div>

                {/* ═══ CHI TIẾT THEO PHƯƠNG THỨC ═══ */}
                {method === 'bank_transfer' && (
                  <div className="crs-bank-info">
                    <div style={{fontWeight:700,marginBottom:10,color:'var(--success)'}}>🏦 Thông tin chuyển khoản</div>
                    <div className="crs-bank-row"><span>Ngân hàng</span><strong>Vietcombank</strong></div>
                    <div className="crs-bank-row"><span>Số tài khoản</span><strong>1234 5678 9012</strong></div>
                    <div className="crs-bank-row"><span>Chủ tài khoản</span><strong>CONG TY EDUVNU</strong></div>
                    <div className="crs-bank-row"><span>Nội dung CK</span><strong style={{color:'var(--blue)'}}>EDUVNU {user?.username?.toUpperCase()}</strong></div>
                    <div style={{marginTop:10,fontSize:13,color:'var(--muted)',fontStyle:'italic'}}>
                      * Đơn hàng sẽ được kích hoạt sau khi xác nhận chuyển khoản (1-5 phút).
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div style={{marginTop:16,padding:20,background:'#f8f9fa',borderRadius:8,border:'1px solid var(--border)'}}>
                    <div style={{fontWeight:700,marginBottom:16}}>💳 Thông tin thẻ</div>
                    <div className="crs-field" style={{marginBottom:14}}>
                      <label>Số thẻ</label>
                      <input value={cardNumber} onChange={e=>setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} />
                    </div>
                    <div className="crs-field" style={{marginBottom:14}}>
                      <label>Tên trên thẻ</label>
                      <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="NGUYEN VAN A" style={{textTransform:'uppercase'}} />
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                      <div className="crs-field">
                        <label>Ngày hết hạn</label>
                        <input value={cardExp} onChange={e=>setCardExp(e.target.value)} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="crs-field">
                        <label>CVV</label>
                        <input value={cardCvv} onChange={e=>setCardCvv(e.target.value)} placeholder="•••" type="password" maxLength={4} />
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,marginTop:14}}>
                      {['Visa','Mastercard','JCB','Napas'].map(b => (
                        <span key={b} style={{fontSize:11,background:'white',border:'1px solid var(--border)',padding:'4px 10px',borderRadius:4,fontWeight:600}}>{b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {method === 'momo' && (
                  <div style={{marginTop:16,padding:20,background:'#fdf4ff',borderRadius:8,border:'1px solid #e879f9',textAlign:'center'}}>
                    <div style={{fontWeight:700,marginBottom:12,color:'#a21caf'}}>📱 Thanh toán qua MoMo</div>
                    <div style={{width:160,height:160,margin:'0 auto 16px',background:'white',border:'2px solid #a21caf',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>
                      📲
                    </div>
                    <div style={{fontSize:14,color:'#86198f'}}>Quét mã QR bằng ứng dụng MoMo để thanh toán</div>
                    <div style={{fontSize:13,color:'var(--muted)',marginTop:8}}>Hoặc chuyển đến số: <strong>0912 345 678</strong></div>
                  </div>
                )}

                {method === 'zalopay' && (
                  <div style={{marginTop:16,padding:20,background:'#eff6ff',borderRadius:8,border:'1px solid #3b82f6',textAlign:'center'}}>
                    <div style={{fontWeight:700,marginBottom:12,color:'#1d4ed8'}}>💙 Thanh toán qua ZaloPay</div>
                    <div style={{width:160,height:160,margin:'0 auto 16px',background:'white',border:'2px solid #3b82f6',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>
                      📲
                    </div>
                    <div style={{fontSize:14,color:'#1e40af'}}>Quét mã QR bằng ứng dụng ZaloPay để thanh toán</div>
                  </div>
                )}

                {method === 'cash' && (
                  <div style={{marginTop:16,padding:20,background:'#f0fdf4',borderRadius:8,border:'1px solid #86efac'}}>
                    <div style={{fontWeight:700,marginBottom:8,color:'var(--success)'}}>💵 Thanh toán tiền mặt</div>
                    <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.6}}>
                      Vui lòng đến văn phòng EduVNU để thanh toán trực tiếp.<br/>
                      📍 Địa chỉ: Tầng 3, Tòa nhà VNU, 144 Xuân Thủy, Cầu Giấy, Hà Nội<br/>
                      🕘 Giờ làm việc: Thứ Hai - Thứ Sáu, 8:00 - 17:00
                    </p>
                  </div>
                )}
              </div>

              {error && <div className="crs-auth-error" style={{marginBottom:16}}>{error}</div>}

              <div style={{display:'flex',gap:12}}>
                <button className="crs-back-btn" onClick={()=>setStep(1)}>
                  ← Quay lại
                </button>
                <button
                  className="crs-confirm-btn"
                  onClick={handleConfirm}
                  disabled={processing || !items.length}
                  style={{flex:1}}>
                  {processing ? '⏳ Đang xử lý...' : `🔒 Xác nhận thanh toán • ${total.toLocaleString('vi-VN')} ₫`}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: Order Summary (sticky) ═══ */}
        <div>
          <div className="crs-order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            {items.map((item, idx) => (
              <div key={item.id} className="crs-osi">
                <div className="crs-osi-thumb" style={{background: GRADS[idx % GRADS.length]}}>
                  {fixText(item.course?.title)?.[0] || '?'}
                </div>
                <span className="crs-osi-title">{fixText(item.course?.title)}</span>
                <span className="crs-osi-price">{parseFloat(item.course?.price||0).toLocaleString('vi-VN')} ₫</span>
              </div>
            ))}

            <div className="crs-divider" />

            <div className="crs-total-rows">
              <div className="crs-total-row">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="crs-total-row">
                <span>Thuế (VAT)</span>
                <span>{tax.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="crs-total-row grand">
                <span>Tổng thanh toán</span>
                <span className="crs-grand-price">{total.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="crs-ssl-note">
              🔒 <span>Được bảo mật bởi SSL 256-bit</span>
            </div>

            {/* Guarantee */}
            <div style={{marginTop:16,padding:14,background:'#f0fdf4',borderRadius:8,border:'1px solid #86efac',fontSize:12,color:'var(--success)',textAlign:'center'}}>
              ✅ Đảm bảo hoàn tiền 30 ngày nếu không hài lòng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}