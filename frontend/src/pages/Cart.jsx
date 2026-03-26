import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GRADS = ['linear-gradient(135deg,#0369a1,#0ea5e9)','linear-gradient(135deg,#7c3aed,#a78bfa)','linear-gradient(135deg,#059669,#34d399)','linear-gradient(135deg,#b45309,#f59e0b)'];

export default function Cart() {
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [msg, setMsg] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    load();
  }, [user, authLoading]);

  const load = async () => {
    setLoading(true);
    try {
      const [c, o] = await Promise.all([api.get('/cart/my_cart/'), api.get('/orders/orders/')]);
      setItems(c.data.items || []);
      setOrders(o.data.results || o.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const remove = async (courseId) => {
    setRemoving(courseId);
    try { await api.delete('/cart/remove_item/', { data: { course_id: courseId } }); setItems(p => p.filter(i => i.course.id !== courseId)); }
    catch { setMsg('Không thể xóa.'); }
    finally { setRemoving(null); }
  };

  const total = items.reduce((s, i) => s + parseFloat(i.course.price || 0), 0);

  if (loading) return <div className="crs-loading">Đang tải...</div>;

  return (
    <div className="crs-cart-page">
      <div className="crs-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><span>Giỏ hàng</span></div>
      <h1 style={{fontSize:26,fontWeight:700,marginBottom:24}}>Giỏ hàng</h1>

      <div className="crs-cart-tabs">
        <button className={`crs-cart-tab ${tab==='pending'?'active':''}`} onClick={() => setTab('pending')}>Chờ thanh toán ({items.length})</button>
        <button className={`crs-cart-tab ${tab==='paid'?'active':''}`} onClick={() => setTab('paid')}>Đã thanh toán ({orders.length})</button>
      </div>

      {msg && <div className="crs-auth-error" style={{marginBottom:16}}>{msg}</div>}

      {tab === 'pending' ? (
        items.length === 0 ? (
          <div className="crs-cart-empty">
            <div style={{fontSize:56,marginBottom:12}}>🛒</div>
            <h3>Giỏ hàng trống</h3>
            <p style={{marginBottom:16,color:'#636363'}}>Hãy khám phá và thêm khóa học vào giỏ hàng</p>
            <button className="crs-btn-solid" onClick={() => navigate('/')}>Khám phá khóa học</button>
          </div>
        ) : (
          <div className="crs-cart-layout">
            <div className="crs-cart-items">
              {items.map((item, idx) => (
                <div key={item.id} className="crs-cart-item">
                  <div className="crs-cart-thumb" style={{background: GRADS[idx%GRADS.length]}}>{item.course.title[0]}</div>
                  <div className="crs-cart-info">
                    <p className="crs-cart-title">{item.course.title}</p>
                    <p className="crs-cart-org">{item.course.instructor?.first_name || item.course.instructor?.username}</p>
                    <button className="crs-cart-remove" onClick={() => remove(item.course.id)} disabled={removing === item.course.id}>
                      {removing === item.course.id ? '...' : 'Xóa'}
                    </button>
                  </div>
                  <span className="crs-cart-price">
                    {parseFloat(item.course.price) === 0 ? <span className="free-tag">Miễn phí</span> : `${parseFloat(item.course.price).toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
              ))}
            </div>
            <div className="crs-cart-sidebar">
              <div className="crs-cart-summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div className="crs-summary-row"><span>Số khóa học</span><span>{items.length}</span></div>
                <div className="crs-summary-row"><span>Tạm tính</span><span>{total.toLocaleString('vi-VN')} đ</span></div>
                <div className="crs-summary-total"><span>Tổng cộng</span><span className="crs-summary-total-price">{total === 0 ? 'Miễn phí' : `${total.toLocaleString('vi-VN')} đ`}</span></div>
                <button className="crs-checkout-btn" onClick={() => navigate('/checkout')}>Tiến hành thanh toán</button>
                <p className="crs-secure">🔒 Thanh toán an toàn & bảo mật</p>
              </div>
            </div>
          </div>
        )
      ) : (
        orders.length === 0 ? (
          <div className="crs-cart-empty"><h3>Chưa có đơn hàng nào</h3></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {orders.map((order, oi) => (
              <div key={order.id} className="crs-paid-order">
                <div className="crs-paid-order-head">
                  <div style={{display:'flex',gap:16,alignItems:'center'}}>
                    <span className="crs-paid-order-id">Đơn #{order.id}</span>
                    <span className="crs-paid-order-date">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className="crs-paid-badge">✓ Đã thanh toán</span>
                </div>
                <div className="crs-paid-items">
                  {order.items?.map((item, idx) => (
                    <div key={item.id} className="crs-paid-item">
                      <div className="crs-paid-thumb" style={{background:GRADS[(oi+idx)%GRADS.length]}}>{item.course?.title?.[0]}</div>
                      <span className="crs-paid-title">{item.course?.title}</span>
                      <span className="crs-paid-price">{parseFloat(item.price).toLocaleString('vi-VN')} đ</span>
                      <button className="crs-paid-learn-btn" onClick={() => navigate(`/learn/${item.course?.id}`)}>Vào học</button>
                    </div>
                  ))}
                </div>
                <div className="crs-paid-order-foot">Tổng: <strong>{parseFloat(order.total_price).toLocaleString('vi-VN')} đ</strong></div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
