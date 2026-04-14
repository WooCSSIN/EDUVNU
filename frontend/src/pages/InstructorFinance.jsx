import React, { useState, useEffect } from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import api from '../api/axios';
import '../assets/instructor-dashboard.css';

const InstructorFinance = () => {
    const [finance, setFinance] = useState({
        balance: 0,
        bank_info: {},
        transactions: []
    });
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchFinance = async () => {
        try {
            const res = await api.get('/courses/instructor-courses/finance_data/');
            setFinance(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching finance data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinance();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0 || amount > finance.balance) {
            alert('Số tiền rút không hợp lệ hoặc vượt quá số dư.');
            return;
        }

        setSubmitting(true);
        try {
            // Gửi yêu cầu rút tiền vào SQL
            await api.post('/courses/instructor-courses/request_withdrawal/', { amount });
            alert('Yêu cầu rút tiền đã được gửi thành công! Admin sẽ xử lý trong vòng 24h.');
            setWithdrawAmount('');
            fetchFinance(); // Refresh balance
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert('Có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Quản lý thu nhập</h1>
                        <p style={{color: '#64748b'}}>Theo dõi doanh thu và quản lý các yêu cầu thanh toán của bạn.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card" style={{background: 'linear-gradient(135deg, #0056d2 0%, #003a91 100%)', color: 'white'}}>
                        <p className="label" style={{color: 'rgba(255,255,255,0.8)'}}>Số dư hiện tại</p>
                        <h2 style={{fontSize: '2rem'}}>{finance.balance.toLocaleString()}₫</h2>
                        
                        <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                            <input 
                                type="number" 
                                placeholder="Nhập số tiền..." 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '6px', 
                                    border: 'none', outline: 'none', color: '#333'
                                }}
                            />
                            <button 
                                onClick={handleWithdraw}
                                disabled={submitting}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', 
                                    border: 'none', background: 'white', 
                                    color: '#0056d2', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                {submitting ? '...' : 'Rút'}
                            </button>
                        </div>
                    </div>
                    <div className="stat-card">
                        <p className="label">Doanh thu tháng này</p>
                        <h2 style={{fontSize: '2rem'}}>{(finance.balance).toLocaleString()}₫</h2>
                        <p style={{color: '#10b981', fontSize: '0.85rem'}}>Vừa cập nhật từ SQL</p>
                    </div>
                    <div className="stat-card">
                        <p className="label">Tổng đơn hàng</p>
                        <h2 style={{fontSize: '2rem'}}>{finance.transactions.length}</h2>
                        <p style={{color: '#64748b', fontSize: '0.85rem'}}>Lấy từ bảng OrderItem</p>
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px'}}>
                    <div className="content-card">
                        <h3>Lịch sử giao dịch gần đây</h3>
                        <table className="course-table" style={{marginTop: '20px'}}>
                            <thead>
                                <tr>
                                    <th>Mã GD</th>
                                    <th>Khóa học</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finance.transactions.length === 0 ? <tr><td colSpan="4">Chưa có giao dịch nào.</td></tr> : finance.transactions.map(t => (
                                    <tr key={t.id}>
                                        <td style={{fontWeight: 600}}>{t.id}</td>
                                        <td>{t.course}</td>
                                        <td>{t.amount.toLocaleString()}₫</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.75rem',
                                                background: t.status === 'Thành công' ? '#f0fdf4' : '#fff7ed',
                                                color: t.status === 'Thành công' ? '#166534' : '#9a3412'
                                            }}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="content-card">
                        <h3>Tài khoản ngân hàng</h3>
                        <div style={{marginTop: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc'}}>
                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>Tên ngân hàng</div>
                            <div style={{fontWeight: 600, marginBottom: '10px'}}>{finance.bank_info.bank_name}</div>
                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>Số tài khoản</div>
                            <div style={{fontWeight: 600, marginBottom: '10px'}}>{finance.bank_info.account_number}</div>
                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>Chủ tài khoản</div>
                            <div style={{fontWeight: 600}}>{finance.bank_info.account_holder}</div>
                        </div>
                        <button style={{width: '100%', marginTop: '20px', padding: '10px', background: 'none', border: '1px solid #0056d2', color: '#0056d2', borderRadius: '6px', cursor: 'pointer'}}>Thay đổi thông tin</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorFinance;
