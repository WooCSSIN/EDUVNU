import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';

const GRADS = [
  'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
];

const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Tiền mặt',
    icon: '💵',
    desc: 'Thanh toán trực tiếp tại văn phòng',
    color: '#16a34a',
  },
  {
    id: 'bank_transfer',
    label: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    desc: 'Chuyển khoản qua tài khoản ngân hàng',
    color: '#0369a1',
  },
  {
    id: 'card',
    label: 'Thẻ tín dụng / Ghi nợ',
    icon: '💳',
    desc: 'Visa, Mastercard, JCB, Napas',
    color: '#7c3aed',
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    icon: '📱',
    desc: 'Thanh toán qua ví điện tử MoMo',
    color: '#a21caf',
  },
];

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [step, setStep] = useState(1); // 1=method, 2=confirm

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/cart/my_cart/')
      .then(r => setItems(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const total = items.reduce((s, i) => s + parseFloat(i.course.price || 0), 0);

  const handleConfirm = async () => {
    if (!items.length) return;
    setProcessing(true); setError('');
    try {
      await api.post('/orders/orders/checkout/', { payment_method: method });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Thanh toan that bai. Vui long thu lai.');
    } finally { setProcessing(false); }
  };

  if (authLoading || loading) return <div className="crs-loading">Dang tai...</div>;

  /* SUCCESS SCREEN */
  if (done) return (
    <div className="checkout-success-page">
      <div className="checkout-success-card">
        <div className="success-checkmark">✓</div>
        <h2>Thanh toan thanh cong!</h2>
        <p>Cam on ban da tin tuong EduVNU. Khoa hoc da duoc kich hoat.</p>
        <div className="success-method-badge">
          {PAYMENT_METHODS.find(m => m.id === method)?.icon} {PAYMENT_METHODS.find(m => m.id === method)?.label}
        </div>
        <div className="success-amount">
          {total === 0 ? 'Mien phi' : `${total.toLocaleString('vi-VN')} d`}
        </div>
        <div className="success-actions">
          <button className="crs-btn-solid" style={{flex:1,padding:'13px'}} onClick={() => navigate('/schedule')}>
            Xem viec hoc cua toi
          </button>
          <button className="crs-btn-outline" style={{flex:1,padding:'13px'}} onClick={() => navigate('/')}>
            Tiep tuc mua sam
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="checkout-page-v3">
      {/* BREADCRUMB */}
      <div className="crs-breadcrumb">
        <Link to="/">Trang chu</Link><span>/</span>
        <Link to="/cart">Gio hang</Link><span>/</span>
        <span>Thanh toan</span>
      </div>

      {/* STEP INDICATOR */}
      <div className="checkout-steps-v3">
        <div className={`checkout-step-v3 ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle-v3">{step > 1 ? '✓' : '1'}</div>
          <span>Phuong thuc thanh toan</span>
        </div>
        <div className="step-line-v3" />
        <div className={`checkout-step-v3 ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle-v3">2</div>
          <span>Xac nhan</span>
        </div>
        <div className="step-line-v3" />
        <div className="checkout-step-v3">
          <div className="step-circle-v3">3</div>
          <span>Hoan tat</span>
        </div>
      </div>

      <div className="checkout-layout-v3">
        {/* LEFT */}
        <div className="checkout-left-v3">

          {/* STEP 1: PAYMENT METHOD */}
          <div className="checkout-card-v3">
            <h3 className="checkout-card-title-v3">
              <span className="step-num-v3">1</span> Chon phuong thuc thanh toan
            </h3>
            <div className="payment-methods-v3">
              {PAYMENT_METHODS.map(m => (
                <label
                  key={m.id}
                  className={`payment-method-v3 ${method === m.id ? 'selected' : ''}`}
                  style={method === m.id ? { borderColor: m.color, background: `${m.color}08` } : {}}
                >
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <div className="pm-icon-v3" style={{ background: `${m.color}15`, color: m.color }}>{m.icon}</div>
                  <div className="pm-info-v3">
                    <span className="pm-label-v3">{m.label}</span>
                    <span className="pm-desc-v3">{m.desc}</span>
                  </div>
                  <div className={`pm-radio-v3 ${method === m.id ? 'checked' : ''}`}
                    style={method === m.id ? { borderColor: m.color, background: m.color } : {}} />
                </label>
              ))}
            </div>

            {/* BANK TRANSFER DETAILS */}
            {method === 'bank_transfer' && (
              <div className="bank-details-v3">
                <div className="bank-details-title-v3">Thong tin chuyen khoan</div>
                <div className="bank-row-v3"><span>Ngan hang</span><strong>Vietcombank</strong></div>
                <div className="bank-row-v3"><span>So tai khoan</span><strong>1234 5678 9012 3456</strong></div>
                <div className="bank-row-v3"><span>Chu tai khoan</span><strong>NGUYEN VAN A</strong></div>
                <div className="bank-row-v3"><span>Noi dung CK</span><strong>EDUVNU {user?.username?.toUpperCase()} {Date.now().toString().slice(-6)}</strong></div>
                <div className="bank-note-v3">Vui long chuyen dung noi dung de he thong xac nhan tu dong trong 5 phut.</div>
              </div>
            )}

            {/* CARD DETAILS */}
            {method === 'card' && (
              <div className="card-form-v3">
                <div className="card-form-title-v3">Thong tin the</div>
                <div className="card-logos-v3">
                  <span>VISA</span><span>MC</span><span>JCB</span><span>NAPAS</span>
                </div>
                <div className="crs-field">
                  <label>So the</label>
                  <input
                    type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={cardInfo.number}
                    onChange={e => setCardInfo(p => ({...p, number: e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim()}))}
                  />
                </div>
                <div className="crs-field">
                  <label>Ten chu the</label>
                  <input type="text" placeholder="NGUYEN VAN A" value={cardInfo.name} onChange={e => setCardInfo(p => ({...p, name: e.target.value.toUpperCase()}))} />
                </div>
                <div className="card-form-row-v3">
                  <div className="crs-field">
                    <label>Ngay het han</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo(p => ({...p, expiry: e.target.value}))} />
                  </div>
                  <div className="crs-field">
                    <label>CVV</label>
                    <input type="password" placeholder="***" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo(p => ({...p, cvv: e.target.value}))} />
                  </div>
                </div>
              </div>
            )}

            {/* CASH DETAILS */}
            {method === 'cash' && (
              <div className="cash-info-v3">
                <div className="cash-icon-v3">🏢</div>
                <p>Vui long den van phong EduVNU de thanh toan truc tiep.</p>
                <p><strong>Dia chi:</strong> 144 Xuan Thuy, Cau Giay, Ha Noi</p>
                <p><strong>Gio lam viec:</strong> 8:00 - 17:30, Thu 2 - Thu 6</p>
                <p><strong>Hotline:</strong> 1800 1234</p>
              </div>
            )}

            {/* MOMO */}
            {method === 'momo' && (
              <div className="momo-info-v3">
                <div className="momo-qr-v3">
                  <div className="momo-qr-placeholder-v3">QR</div>
                </div>
                <p>Quet ma QR bang app MoMo de thanh toan</p>
                <p className="momo-amount-v3">{total === 0 ? 'Mien phi' : `${total.toLocaleString('vi-VN')} d`}</p>
              </div>
            )}
          </div>

          {/* BILLING INFO */}
          <div className="checkout-card-v3">
            <h3 className="checkout-card-title-v3">
              <span className="step-num-v3">2</span> Thong tin thanh toan
            </h3>
            <div className="billing-grid-v3">
              <div className="crs-field">
                <label>Ho ten</label>
                <input defaultValue={user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username} />
              </div>
              <div className="crs-field">
                <label>Email</label>
                <input type="email" defaultValue={user?.email} />
              </div>
              <div className="crs-field">
                <label>So dien thoai</label>
                <input type="tel" placeholder="0912 345 678" />
              </div>
              <div className="crs-field">
                <label>Dia chi</label>
                <input placeholder="So nha, duong, quan, thanh pho" />
              </div>
            </div>
          </div>

          {error && <div className="crs-auth-error" style={{marginBottom:16}}>{error}</div>}

          <button
            className="confirm-btn-v3"
            onClick={handleConfirm}
            disabled={processing || !items.length}
          >
            {processing
              ? <><span className="btn-spin-v3" /> Dang xu ly...</>
              : `Xac nhan thanh toan — ${total === 0 ? 'Mien phi' : total.toLocaleString('vi-VN') + ' d'}`}
          </button>
          <button className="back-btn-v3" onClick={() => navigate('/cart')}>Quay lai gio hang</button>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="checkout-right-v3">
          <div className="order-summary-v3">
            <h3>Don hang ({items.length} khoa hoc)</h3>
            {items.length === 0 ? (
              <p style={{color:'#636363',textAlign:'center',padding:'20px'}}>Gio hang trong</p>
            ) : (
              <>
                <div className="osi-list-v3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="osi-v3">
                      <div className="osi-thumb-v3" style={{background:GRADS[idx%GRADS.length]}}>{fixText(item.course.title)[0]}</div>
                      <div className="osi-info-v3">
                        <p className="osi-title-v3">{fixText(item.course.title)}</p>
                        <p className="osi-org-v3">{fixText(item.course.instructor?.first_name||item.course.instructor?.username||'')}</p>
                      </div>
                      <span className="osi-price-v3">
                        {parseFloat(item.course.price)===0
                          ? <span style={{color:'#16a34a',fontWeight:700}}>Mien phi</span>
                          : `${parseFloat(item.course.price).toLocaleString('vi-VN')} d`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="os-divider-v3"/>
                <div className="os-rows-v3">
                  <div className="os-row-v3"><span>Tam tinh</span><span>{total.toLocaleString('vi-VN')} d</span></div>
                  <div className="os-row-v3"><span>Giam gia</span><span style={{color:'#16a34a'}}>0 d</span></div>
                  <div className="os-row-v3 grand-v3">
                    <span>Tong thanh toan</span>
                    <span className="grand-price-v3">{total===0?'Mien phi':`${total.toLocaleString('vi-VN')} d`}</span>
                  </div>
                </div>
                <div className="os-secure-v3">Thanh toan duoc ma hoa SSL 256-bit</div>
              </>
            )}
          </div>

          {/* SELECTED METHOD BADGE */}
          <div className="selected-method-badge-v3">
            <span>{PAYMENT_METHODS.find(m=>m.id===method)?.icon}</span>
            <span>{PAYMENT_METHODS.find(m=>m.id===method)?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
