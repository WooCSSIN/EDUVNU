import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

export default function Orders() {
  usePageSEO({ title: 'Lịch sử giao dịch', description: 'Xem lại thông tin các đơn hàng và danh sách khóa học bạn đã thanh toán tại EduVNU.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/orders/') // <-- Đã bỏ phần /orders dư thừa
      .then(r => setOrders(r.data.results || r.data || []))
      .catch((err) => { console.error('Lỗi khi tải đơn hàng:', err); })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const total = orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);

  if (loading) return <div className="crs-loading">Đang tải...</div>;

  return (
    <div className="crs-transactions">
      <div className="crs-page-header">
        <h1>Lịch sử giao dịch</h1>
      </div>

      {/* STATS */}
      <div className="crs-stats-row">
        <div className="crs-stat-box">
          <span className="crs-stat-val">{orders.length}</span>
          <span className="crs-stat-lbl">Đơn hàng</span>
        </div>
        <div className="crs-stat-box">
          <span className="crs-stat-val">{total.toLocaleString('vi-VN')} đ</span>
          <span className="crs-stat-lbl">Tổng chi tiêu</span>
        </div>
        <div className="crs-stat-box">
          <span className="crs-stat-val">{orders.reduce((s, o) => s + (o.items?.length || 0), 0)}</span>
          <span className="crs-stat-lbl">Khóa học đã mua</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="crs-empty-state centered">
          <div className="crs-empty-icon">🧾</div>
          <h3>Chưa có giao dịch nào</h3>
          <button className="crs-btn-solid" onClick={() => navigate('/')}>Mua khóa học ngay</button>
        </div>
      ) : (
        <div className="crs-orders-list">
          {orders.map(order => (
            <div key={order.id} className="crs-order-row">
              <div className="crs-order-head" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="crs-order-left">
                  <span className="crs-order-id">Đơn #{order.id}</span>
                  <span className="crs-order-date">{new Date(order.created_at).toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'})}</span>
                </div>
                <div className="crs-order-right">
                  <span className="crs-order-price">{parseFloat(order.total_price).toLocaleString('vi-VN')} đ</span>
                  <span className={`crs-status-badge ${order.status}`}>
                    {order.status === 'paid' ? '✓ Đã thanh toán' : order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                  </span>
                  <span className="crs-expand">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === order.id && (
                <div className="crs-order-detail">
                  {order.items?.map(item => (
                    <div key={item.id} className="crs-order-item">
                      <div className="crs-oi-thumb" style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)'}}>
                        {item.course?.title?.[0]}
                      </div>
                      <div className="crs-oi-info">
                        <p className="crs-oi-title">{item.course?.title}</p>
                        <p className="crs-oi-org">{item.course?.instructor?.username}</p>
                      </div>
                      <span className="crs-oi-price">{parseFloat(item.price).toLocaleString('vi-VN')} đ</span>
                      <button className="crs-btn-outline sm" onClick={() => navigate(`/learn/${item.course?.id}`)}>Vào học</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
