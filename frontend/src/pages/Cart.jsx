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

export default function Cart() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [tab, setTab] = useState('cart');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, o] = await Promise.all([api.get('/cart/my_cart/'), api.get('/orders/orders/')]);
      setItems(c.data.items || []);
      setOrders(o.data.results || o.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const removeItem = async (courseId) => {
    setRemoving(courseId);
    try {
      await api.delete('/cart/remove_item/', { data: { course_id: courseId } });
      setItems(p => p.filter(i => i.course.id !== courseId));
      setMsg({ text: 'Da xoa khoi gio hang.', type: 'info' });
    } catch { setMsg({ text: 'Khong the xoa.', type: 'error' }); }
    finally { setRemoving(null); }
  };

  const subtotal = items.reduce((s, i) => s + parseFloat(i.course.price || 0), 0);

  if (loading) return <div className="crs-loading">Dang tai gio hang...</div>;

  return (
    <div className="cart-page-v3">
      <div className="crs-breadcrumb" style={{padding:'16px 0 0'}}>
        <Link to="/">Trang chu</Link><span>/</span><span>Gio hang</span>
      </div>
      <h1 className="cart-page-title">Gio hang cua toi</h1>
      <div className="cart-tabs-v3">
        <button className={tab==='cart'?'cart-tab-v3 active':'cart-tab-v3'} onClick={()=>setTab('cart')}>
          Cho thanh toan <span className="cart-tab-badge">{items.length}</span>
        </button>
        <button className={tab==='orders'?'cart-tab-v3 active':'cart-tab-v3'} onClick={()=>setTab('orders')}>
          Da mua <span className="cart-tab-badge">{orders.length}</span>
        </button>
      </div>
      {msg.text && <div className={`cart-msg-v3 ${msg.type}`}>{msg.text}</div>}

      {tab==='cart' && (items.length===0 ? (
        <div className="cart-empty-v3">
          <div className="cart-empty-icon">🛒</div>
          <h3>Gio hang cua ban dang trong</h3>
          <p>Hay kham pha va them cac khoa hoc yeu thich</p>
          <button className="crs-btn-solid" onClick={()=>navigate('/')}>Kham pha khoa hoc</button>
        </div>
      ) : (
        <div className="cart-layout-v3">
          <div className="cart-items-v3">
            <p className="cart-items-count">{items.length} khoa hoc trong gio hang</p>
            {items.map((item,idx) => (
              <div key={item.id} className="cart-item-v3">
                <div className="cart-item-thumb-v3" style={{background:GRADS[idx%GRADS.length]}} onClick={()=>navigate(`/course/${item.course.id}`)}>
                  {fixText(item.course.title)[0]}
                </div>
                <div className="cart-item-info-v3">
                  <h4 className="cart-item-title-v3" onClick={()=>navigate(`/course/${item.course.id}`)}>{fixText(item.course.title)}</h4>
                  <p className="cart-item-org-v3">{fixText(item.course.instructor?.first_name||item.course.instructor?.username||'')}</p>
                  {item.course.level && <span className="cart-item-level-v3">{item.course.level}</span>}
                  <div className="cart-item-actions-v3">
                    <button className="cart-remove-v3" onClick={()=>removeItem(item.course.id)} disabled={removing===item.course.id}>
                      {removing===item.course.id?'...':'Xoa'}
                    </button>
                    <button className="cart-save-v3" onClick={()=>navigate(`/course/${item.course.id}`)}>Xem chi tiet</button>
                  </div>
                </div>
                <div className="cart-item-price-v3">
                  {parseFloat(item.course.price)===0
                    ? <span className="price-free-v3">Mien phi</span>
                    : <span className="price-paid-v3">{parseFloat(item.course.price).toLocaleString('vi-VN')} d</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary-v3">
            <div className="cart-summary-card-v3">
              <h3>Tom tat don hang</h3>
              <div className="summary-line"><span>So khoa hoc</span><span>{items.length}</span></div>
              <div className="summary-line"><span>Tam tinh</span><span>{subtotal.toLocaleString('vi-VN')} d</span></div>
              <div className="summary-line"><span>Giam gia</span><span className="discount-green">- 0 d</span></div>
              <div className="summary-divider"/>
              <div className="summary-total">
                <span>Tong cong</span>
                <span className="summary-total-price">{subtotal===0?'Mien phi':`${subtotal.toLocaleString('vi-VN')} d`}</span>
              </div>
              <button className="checkout-btn-v3" onClick={()=>navigate('/checkout')}>Tien hanh thanh toan</button>
              <button className="continue-btn-v3" onClick={()=>navigate('/')}>Tiep tuc mua sam</button>
              <div className="secure-note-v3">Thanh toan an toan</div>
            </div>
            <div className="promo-card-v3">
              <h4>Ma giam gia</h4>
              <div className="promo-input-row">
                <input type="text" placeholder="Nhap ma giam gia..."/>
                <button>Ap dung</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {tab==='orders' && (orders.length===0 ? (
        <div className="cart-empty-v3">
          <div className="cart-empty-icon">📦</div>
          <h3>Chua co don hang nao</h3>
          <button className="crs-btn-solid" onClick={()=>navigate('/')}>Mua khoa hoc ngay</button>
        </div>
      ) : (
        <div className="orders-list-v3">
          {orders.map((order,oi) => (
            <div key={order.id} className="order-card-v3">
              <div className="order-card-head-v3">
                <div>
                  <span className="order-id-v3">Don #{order.id}</span>
                  <span className="order-date-v3">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span className="order-total-v3">{parseFloat(order.total_price).toLocaleString('vi-VN')} d</span>
                  <span className="order-status-v3 paid">Da thanh toan</span>
                </div>
              </div>
              <div className="order-items-v3">
                {order.items?.map((item,idx) => (
                  <div key={item.id} className="order-item-v3">
                    <div className="order-item-thumb-v3" style={{background:GRADS[(oi+idx)%GRADS.length]}}>{item.course?.title?.[0]}</div>
                    <div className="order-item-info-v3">
                      <p className="order-item-title-v3">{item.course?.title}</p>
                      <p className="order-item-org-v3">{item.course?.instructor?.username}</p>
                    </div>
                    <span className="order-item-price-v3">{parseFloat(item.price).toLocaleString('vi-VN')} d</span>
                    <button className="go-learn-v3" onClick={()=>navigate(`/learn/${item.course?.id}`)}>Vao hoc</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
