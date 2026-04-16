import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/orders/')
      .then(res => {
        setTransactions(res.data.results || res.data);
      })
      .catch(err => console.error("Không thể tải lịch sử giao dịch", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusText = (s) => s === 'paid' ? 'Đã hoàn tất' : s === 'pending' ? 'Chờ thanh toán' : 'Thất bại';
  const getStatusColor = (s) => s === 'paid' ? {bg: '#dcfce7', color: '#166534'} : s === 'pending' ? {bg: '#fbf8cc', color: '#9a7b4f'} : {bg: '#fee2e2', color: '#991b1b'};

  return (
    <div className="container" style={{maxWidth: '1000px', padding: '64px 20px'}}>
      <h1 style={{fontSize: '32px', marginBottom: '8px'}}>Lịch sử giao dịch</h1>
      <p style={{color: '#666', marginBottom: '40px'}}>Xem lại tất cả các khoản mua sắm và thanh toán của bạn.</p>

      {/* TABLE COURSERA STYLE */}
      <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #eee'}}>
        <thead style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
          <tr>
            <th style={{padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700'}}>Ngày</th>
            <th style={{padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700'}}>Khóa học / Chứng chỉ</th>
            <th style={{padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '700'}}>Số tiền</th>
            <th style={{padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700'}}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={{padding: '16px', textAlign: 'center'}}>Đang tải dữ liệu...</td></tr>
          ) : transactions.length === 0 ? (
            <tr><td colSpan="4" style={{padding: '16px', textAlign: 'center'}}>Bạn chưa có giao dịch nào.</td></tr>
          ) : (
            transactions.map(item => {
              const statusCol = getStatusColor(item.status);
              return (
                <tr key={item.id} style={{borderBottom: '1px solid #eee', fontSize: '14px'}}>
                  <td style={{padding: '16px'}}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{padding: '16px', fontWeight: '600', color: '#1f1f1f'}}>
                    {item.items && item.items.length > 0 ? item.items.map(i => i.course?.title).join(', ') : `Đơn hàng #${item.id}`}
                  </td>
                  <td style={{padding: '16px', textAlign: 'right', fontWeight: '700'}}>{parseFloat(item.total_price).toLocaleString('vi-VN')} đ</td>
                  <td style={{padding: '16px', textAlign: 'center'}}>
                    <span style={{padding: '4px 12px', background: statusCol.bg, color: statusCol.color, borderRadius: '12px', fontSize: '12px', fontWeight: '600'}}>
                        {getStatusText(item.status)}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
