import React from 'react';

export default function Transactions() {
  const transactions = [
    { id: 'TX12345', date: '26/03/2026', title: 'Google Data Analytics Certificate', amount: '499.000 đ', status: 'Đã hoàn tất' },
    { id: 'TX12346', date: '24/02/2026', title: 'Python for Beginners', amount: '250.000 đ', status: 'Đã hoàn tất' }
  ];

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
          {transactions.map(item => (
            <tr key={item.id} style={{borderBottom: '1px solid #eee', fontSize: '14px'}}>
              <td style={{padding: '16px'}}>{item.date}</td>
              <td style={{padding: '16px', fontWeight: '600', color: '#1f1f1f'}}>{item.title}</td>
              <td style={{padding: '16px', textAlign: 'right', fontWeight: '700'}}>{item.amount}</td>
              <td style={{padding: '16px', textAlign: 'center'}}>
                 <span style={{padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: '600'}}>
                    {item.status}
                 </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
