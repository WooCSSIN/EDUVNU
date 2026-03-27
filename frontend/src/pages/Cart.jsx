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
      // SỬA LỖI: Gọi riêng biệt để tránh lỗi 1 trang làm hỏng cả 2
      const cartRes = await api.get('/cart/my_cart/').catch(() => ({ data: { items: [] } }));
      const orderRes = await api.get('/orders/').catch(() => ({ data: [] })); // <-- Đã sửa đường dẫn đúng
      
      setItems(cartRes.data.items || []);
      setOrders(orderRes.data.results || orderRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu giỏ hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (courseId) => {
    setRemoving(courseId);
    try {
      await api.delete('/cart/remove_item/', { data: { course_id: courseId } });
      setItems(p => p.filter(i => i.course?.id !== courseId));
      setMsg({ text: 'Đã xóa khỏi giỏ hàng.', type: 'info' });
    } catch {
      setMsg({ text: 'Không thể xóa sản phẩm.', type: 'error' });
    } finally {
      setRemoving(null);
    }
  };

  const subtotal = items.reduce((s, i) => s + parseFloat(i.course?.price || 0), 0);

  if (loading) return <div className="crs-loading">Đang tải giỏ hàng của bạn...</div>;

  return (
    <div className="cart-page-v3" style={{padding: '40px 64px', minHeight: '80vh'}}>
      <div className="crs-breadcrumb" style={{marginBottom: '24px'}}>
        <Link to="/" style={{textDecoration:'none', color:'#0056d2'}}>Trang chủ</Link>
        <span style={{margin:'0 8px', color:'#ccc'}}>/</span>
        <span>Giỏ hàng</span>
      </div>

      <h1 style={{fontSize: '32px', fontWeight: 800, marginBottom: '32px'}}>Giỏ hàng của tôi</h1>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '32px', borderBottom: '1px solid #ddd', marginBottom: '32px'}}>
        <button 
          onClick={() => setTab('cart')}
          style={{padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, borderBottom: tab === 'cart' ? '3px solid #0056d2' : 'none', color: tab === 'cart' ? '#0056d2' : '#666'}}>
          Chờ thanh toán ({items.length})
        </button>
        <button 
          onClick={() => setTab('orders')}
          style={{padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, borderBottom: tab === 'orders' ? '3px solid #0056d2' : 'none', color: tab === 'orders' ? '#0056d2' : '#666'}}>
          Đã mua ({orders.length})
        </button>
      </div>

      {tab === 'cart' && (
        items.length === 0 ? (
          <div style={{textAlign: 'center', padding: '100px 0'}}>
            <div style={{fontSize: '64px', marginBottom: '16px'}}>🛒</div>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <button className="crs-btn-solid" onClick={() => navigate('/')} style={{marginTop: '24px'}}>Khám phá khóa học ngay</button>
          </div>
        ) : (
          <div style={{display: 'flex', gap: '48px'}}>
            <div style={{flex: 1}}>
               {items.map((item, idx) => (
                 <div key={item.id} style={{display: 'flex', gap: '20px', padding: '24px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '16px'}}>
                    <div style={{width: '120px', height: '80px', background: GRADS[idx % GRADS.length], borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '24px'}}>
                      {fixText(item.course?.title)[0]}
                    </div>
                    <div style={{flex: 1}}>
                       <h4 style={{fontSize: '18px', fontWeight: 700, marginBottom: '4px'}}>{fixText(item.course?.title)}</h4>
                       <p style={{fontSize: '14px', color: '#666'}}>{item.course?.partner_name || 'EduVNU Partner'}</p>
                       <button 
                         onClick={() => removeItem(item.course?.id)}
                         style={{background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '13px', marginTop: '12px', padding: 0}}>
                         {removing === item.course?.id ? 'Đang xóa...' : 'Xóa khỏi giỏ'}
                       </button>
                    </div>
                    <div style={{fontWeight: 700, fontSize: '18px', color: '#0056d2'}}>
                       {parseFloat(item.course?.price || 0).toLocaleString()} đ
                    </div>
                 </div>
               ))}
            </div>

            <div style={{width: '350px'}}>
               <div style={{padding: '24px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa'}}>
                  <h3 style={{marginBottom: '20px'}}>Tóm tắt đơn hàng</h3>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <span>Tạm tính:</span>
                    <strong>{subtotal.toLocaleString()} đ</strong>
                  </div>
                  <div style={{borderTop: '1px solid #ddd', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800}}>
                    <span>Tổng cộng:</span>
                    <span style={{color: '#0056d2'}}>{subtotal.toLocaleString()} đ</span>
                  </div>
                  <button className="crs-btn-solid" onClick={() => navigate('/checkout')} style={{width: '100%', marginTop: '24px', padding: '16px'}}>Thanh toán ngay</button>
               </div>
            </div>
          </div>
        )
      )}

      {tab === 'orders' && (
        orders.map(order => (
          <div key={order.id} style={{padding: '24px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '16px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                <span style={{fontWeight: 700}}>Đơn hàng #{order.id} - {new Date(order.created_at).toLocaleDateString()}</span>
                <span style={{padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontSize: '12px', fontWeight: 700}}>Đã thanh toán</span>
             </div>
             {order.items?.map(item => (
               <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #fafafa'}}>
                  <span>{item.course?.title}</span>
                  <button onClick={() => navigate(`/learn/${item.course?.id}`)} style={{background: 'none', border: 'none', color: '#0056d2', cursor: 'pointer', fontWeight: 700}}>Vào học</button>
               </div>
             ))}
          </div>
        ))
      )}
    </div>
  );
}
