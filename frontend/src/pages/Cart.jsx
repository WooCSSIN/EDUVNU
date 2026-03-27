import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import { Loading, SkeletonList } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

const GRADS = [
  'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
  'linear-gradient(135deg,#dc2626,#f87171)',
  'linear-gradient(135deg,#7c3aed,#c084fc)',
];

export default function Cart() {
  usePageSEO({ title: 'Giỏ hàng', description: 'Xem và quản lý giỏ hàng khóa học của bạn tại EduVNU. Thanh toán an toàn, bảo mật SSL.' });
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [tab, setTab] = useState('cart');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [toast, setToast] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user, authLoading]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cartRes, orderRes] = await Promise.all([
        api.get('/cart/my_cart/').catch(() => ({ data: { items: [] } })),
        api.get('/orders/').catch(() => ({ data: [] })),
      ]);
      setItems(cartRes.data.items || []);
      setOrders(orderRes.data.results || orderRes.data || []);
    } catch (err) {
      console.error('Cart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (courseId) => {
    setRemoving(courseId);
    try {
      await api.delete('/cart/remove_item/', { data: { course_id: courseId } });
      setItems(p => p.filter(i => i.course?.id !== courseId));
      setToast('Đã xóa khỏi giỏ hàng');
    } catch {
      setToast('Không thể xóa sản phẩm');
    } finally {
      setRemoving(null);
    }
  };

  const subtotal = items.reduce((s, i) => s + parseFloat(i.course?.price || 0), 0);
  const discount = 0;
  const total = subtotal - discount;

  if (loading) return <Loading message="Đang tải giỏ hàng..." />;

  return (
    <div className="crs-cart-page">
      {/* Breadcrumb */}
      <div className="crs-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span>Giỏ hàng</span>
      </div>

      <h1 className="crs-page-header" style={{fontSize:'28px',fontWeight:800,marginBottom:0}}>Giỏ hàng</h1>
      <p style={{color:'var(--muted)',fontSize:14,marginBottom:28}}>{items.length} khóa học trong giỏ hàng</p>

      {/* Tabs */}
      <div className="crs-cart-tabs">
        <button className={`crs-cart-tab ${tab==='cart'?'active':''}`} onClick={()=>setTab('cart')}>
          🛒 Giỏ hàng ({items.length})
        </button>
        <button className={`crs-cart-tab ${tab==='orders'?'active':''}`} onClick={()=>setTab('orders')}>
          📦 Lịch sử mua hàng ({orders.length})
        </button>
      </div>

      {/* ═══ TAB: GIỎ HÀNG ═══ */}
      {tab === 'cart' && (
        items.length === 0 ? (
          <div className="crs-cart-empty" style={{padding:'80px 20px'}}>
            <div style={{fontSize:72,marginBottom:16}}>🛒</div>
            <h3>Giỏ hàng trống</h3>
            <p style={{marginBottom:24,color:'var(--muted)'}}>Khám phá hàng trăm khóa học chất lượng và bắt đầu hành trình học tập của bạn.</p>
            <button className="crs-btn-solid" onClick={()=>navigate('/')} style={{padding:'14px 40px',fontSize:16}}>Khám phá khóa học</button>
          </div>
        ) : (
          <div className="crs-cart-layout">
            {/* LEFT: Cart Items */}
            <div className="crs-cart-items">
              {items.map((item, idx) => (
                <div key={item.id} className="crs-cart-item">
                  <div className="crs-cart-thumb" style={{background: GRADS[idx % GRADS.length]}}>
                    {fixText(item.course?.title)?.[0] || '?'}
                  </div>
                  <div className="crs-cart-info">
                    <div className="crs-cart-title">{fixText(item.course?.title)}</div>
                    <div className="crs-cart-org">{item.course?.partner_name || 'EduVNU Partner'}</div>
                    <div style={{display:'flex',gap:6,marginBottom:4}}>
                      <span className="badge">Bestseller</span>
                      <span style={{fontSize:12,color:'var(--muted)'}}>⭐ 4.7 (2,340 đánh giá)</span>
                    </div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>5 bài giảng • Tất cả trình độ</div>
                    <div style={{display:'flex', gap:16, marginTop:10}}>
                      <button
                        onClick={() => removeItem(item.course?.id)}
                        className="crs-cart-remove"
                        disabled={removing === item.course?.id}>
                        {removing === item.course?.id ? 'Đang xóa...' : '🗑 Xóa'}
                      </button>
                      <button style={{background:'none',border:'none',color:'var(--blue)',cursor:'pointer',fontSize:13,padding:0}}>
                        💾 Lưu để sau
                      </button>
                      <button onClick={()=>navigate(`/course/${item.course?.id}`)} style={{background:'none',border:'none',color:'var(--blue)',cursor:'pointer',fontSize:13,padding:0}}>
                        👁 Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="crs-cart-price">
                    {parseFloat(item.course?.price || 0) === 0 ? (
                      <span className="free-tag" style={{fontSize:16,padding:'4px 14px'}}>Miễn phí</span>
                    ) : (
                      <>
                        <div>{parseFloat(item.course?.price || 0).toLocaleString('vi-VN')} ₫</div>
                        <div style={{fontSize:13,color:'var(--muted)',textDecoration:'line-through'}}>
                          {(parseFloat(item.course?.price || 0) * 1.5).toLocaleString('vi-VN')} ₫
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="crs-cart-sidebar">
              <div className="crs-cart-summary">
                <h3>Tóm tắt đơn hàng</h3>
                <div className="crs-summary-row">
                  <span>Tạm tính ({items.length} khóa):</span>
                  <strong>{subtotal.toLocaleString('vi-VN')} ₫</strong>
                </div>
                {discount > 0 && (
                  <div className="crs-summary-row" style={{color:'var(--success)'}}>
                    <span>Giảm giá:</span>
                    <strong>-{discount.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                )}
                <div className="crs-summary-total">
                  <span>Tổng cộng:</span>
                  <span className="crs-summary-total-price">{total.toLocaleString('vi-VN')} ₫</span>
                </div>

                <button className="crs-checkout-btn" onClick={()=>navigate('/checkout')}>
                  Thanh toán ngay
                </button>

                {/* Coupon */}
                <div style={{marginTop:16}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:8,color:'var(--text)'}}>Mã giảm giá</div>
                  <div style={{display:'flex',gap:8}}>
                    <input
                      value={coupon}
                      onChange={e=>setCoupon(e.target.value)}
                      placeholder="Nhập mã coupon"
                      style={{flex:1,padding:'10px 14px',border:'1.5px solid var(--border)',borderRadius:4,fontSize:14,outline:'none'}}
                    />
                    <button className="crs-btn-outline" style={{padding:'10px 16px',whiteSpace:'nowrap'}}>Áp dụng</button>
                  </div>
                </div>

                <div className="crs-secure">🔒 Thanh toán an toàn & bảo mật SSL</div>

                {/* Trust Badges */}
                <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:14,flexWrap:'wrap'}}>
                  {['💳 Visa','💳 MC','📱 MoMo','🏦 Bank'].map(b => (
                    <span key={b} style={{fontSize:11,color:'var(--muted)',background:'var(--bg)',padding:'4px 8px',borderRadius:4}}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ═══ TAB: LỊCH SỬ MUA HÀNG ═══ */}
      {tab === 'orders' && (
        orders.length === 0 ? (
          <div className="crs-cart-empty" style={{padding:'80px 20px'}}>
            <div style={{fontSize:72,marginBottom:16}}>📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p style={{color:'var(--muted)',marginBottom:20}}>Bắt đầu học để tạo đơn hàng đầu tiên.</p>
            <button className="crs-btn-solid" onClick={()=>navigate('/')}>Khám phá khóa học</button>
          </div>
        ) : (
          <div className="crs-orders-list" style={{marginTop:4}}>
            {orders.map((order, idx) => {
              const isPaid = order.status === 'paid';
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="crs-order-row">
                  <div className="crs-order-head" onClick={()=>setExpandedOrder(isExpanded?null:order.id)}>
                    <div className="crs-order-left">
                      <span className="crs-order-id">#{order.id}</span>
                      <span className="crs-order-date">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="crs-order-right">
                      <span className={`crs-status-badge ${isPaid ? 'paid' : 'pending'}`}>
                        {isPaid ? '✓ Đã thanh toán' : '⏳ Chờ xử lý'}
                      </span>
                      <span className="crs-order-price">{parseFloat(order.total_price||0).toLocaleString('vi-VN')} ₫</span>
                      <span className="crs-expand">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="crs-order-detail">
                      {order.items?.map((item, i) => (
                        <div key={item.id} className="crs-order-item">
                          <div className="crs-oi-thumb" style={{background: GRADS[i % GRADS.length]}}>
                            {item.course?.title?.[0] || '?'}
                          </div>
                          <div className="crs-oi-info">
                            <div className="crs-oi-title">{fixText(item.course?.title || 'Khóa học')}</div>
                            <div className="crs-oi-org">{item.course?.partner_name || 'EduVNU'}</div>
                          </div>
                          <span className="crs-oi-price">{parseFloat(item.price||0).toLocaleString('vi-VN')} ₫</span>
                          {isPaid && (
                            <button className="crs-paid-learn-btn" onClick={()=>navigate(`/learn/${item.course?.id}`)}>
                              Vào học →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
