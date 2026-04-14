import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';
import { Loading } from '../components/LoadingUI';

export default function MockVNPay() {
  usePageSEO({ title: 'Cổng thanh toán VNPAY (Demo)' });
  const [searchParams] = useSearchParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount') || '0';

  const [cardNumber, setCardNumber] = useState('9704198526191432198');
  const [cardName, setCardName] = useState('NGUYEN VAN A');
  const [cardDate, setCardDate] = useState('07/15');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState(1); // 1 = input card, 2 = input otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setTimeout(() => setError('Mã giao dịch không hợp lệ!'), 0);
    }
  }, [orderId]);

  const handleNext = () => {
    if (!cardNumber || !cardName || !cardDate) {
      setError('Vui lòng nhập đầy đủ thông tin thẻ');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleConfirm = async () => {
    if (otp !== '123456') {
      setError('Mã OTP không chính xác. Nhập 123456 để tiếp tục.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Xác nhận thanh toán qua API
      await api.post(`/orders/${orderId}/confirm_payment/`, { transaction_id: 'VNPAY_MOCK_SUCCESS' });
      // Chuyển hướng về trang Kết quả
      window.location.href = `/payment-return?mock=success&order_id=${orderId}`;
    } catch (e) {
      setLoading(false);
      setError('Failed to mock payment confirmation. See console.');
      console.error(e);
    }
  };

  if (error && !orderId) return <div style={{textAlign:'center', marginTop:50, color:'red'}}>{error}</div>;

  return (
    <div style={{minHeight:'100vh', background:'#f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 20px'}}>
      <div style={{background:'white', width:'100%', maxWidth:500, borderRadius:12, boxShadow:'0 10px 25px rgba(0,0,0,0.1)', overflow:'hidden'}}>
        
        {/* Header */}
        <div style={{background:'#0056d2', padding:'20px 30px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{color:'white', fontWeight:800, fontSize:24, letterSpacing:1}}>VNPAY<span style={{fontWeight:400}}>QR</span></div>
          <div style={{background:'rgba(255,255,255,0.2)', padding:'4px 10px', borderRadius:20, color:'white', fontSize:12, fontWeight:600}}>SANDBOX DEMO</div>
        </div>

        {/* Amount */}
        <div style={{padding:'20px 30px', borderBottom:'1px solid #e5e7eb', textAlign:'center', background:'#f8fafc'}}>
          <div style={{color:'#64748b', fontSize:14, marginBottom:4}}>Số tiền thanh toán</div>
          <div style={{color:'#0f172a', fontSize:28, fontWeight:700}}>{Number(amount).toLocaleString('vi-VN')} VND</div>
        </div>

        {/* Content */}
        <div style={{padding:'30px'}}>
          {error && <div style={{background:'#fee2e2', color:'#ef4444', padding:12, borderRadius:6, marginBottom:20, fontSize:14}}>{error}</div>}

          {step === 1 ? (
            <div>
              <div style={{fontWeight:600, marginBottom:20, color:'#1e293b'}}>💳 Thông tin thẻ ATM Nội địa</div>
              
              <div style={{marginBottom:16}}>
                <label style={{display:'block', fontSize:13, fontWeight:600, color:'#64748b', marginBottom:6}}>Số thẻ</label>
                <input value={cardNumber} onChange={e=>setCardNumber(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #cbd5e1', borderRadius:6, fontSize:15}} />
              </div>
              
              <div style={{marginBottom:16}}>
                <label style={{display:'block', fontSize:13, fontWeight:600, color:'#64748b', marginBottom:6}}>Tên chủ thẻ (Viết không dấu)</label>
                <input value={cardName} onChange={e=>setCardName(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #cbd5e1', borderRadius:6, fontSize:15, textTransform:'uppercase'}} />
              </div>

              <div style={{marginBottom:24}}>
                <label style={{display:'block', fontSize:13, fontWeight:600, color:'#64748b', marginBottom:6}}>Ngày phát hành (MM/YY)</label>
                <input value={cardDate} onChange={e=>setCardDate(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #cbd5e1', borderRadius:6, fontSize:15}} />
              </div>

              <button 
                onClick={handleNext} 
                className="crs-btn-solid" 
                style={{width:'100%', padding:16, fontSize:16}}
                disabled={loading}
              >
                {loading ? 'Đang xác thực...' : 'Tiếp tục'}
              </button>
              <div style={{textAlign:'center', marginTop:16}}>
                <a href="/checkout" style={{color:'#64748b', fontSize:14, textDecoration:'none'}}>Hủy giao dịch</a>
              </div>
            </div>
          ) : (
            <div>
              <div style={{fontWeight:600, marginBottom:20, color:'#1e293b'}}>Xác thực giao dịch OTP</div>
              <p style={{fontSize:14, color:'#64748b', marginBottom:20}}>Một mã OTP đã được gửi về số điện thoại của bạn. Vui lòng nhập mã để hoàn tất thanh toán.</p>
              
              <div style={{marginBottom:24}}>
                <label style={{display:'block', fontSize:13, fontWeight:600, color:'#64748b', marginBottom:6}}>Mã OTP (DEMO: 123456)</label>
                <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Nhập 123456" style={{width:'100%', padding:'12px', border:'1px solid #cbd5e1', borderRadius:6, fontSize:18, textAlign:'center', letterSpacing:4}} />
              </div>

              <button 
                onClick={handleConfirm} 
                className="crs-btn-solid" 
                style={{width:'100%', padding:16, fontSize:16, background:'#059669'}}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div style={{marginTop:30, color:'#94a3b8', fontSize:12, textAlign:'center'}}>
        <p>Chú ý: Đây là giao diện giả lập (Mock Gateway) cho mục đích Demo đồ án.</p>
        <p>Không có giao dịch thực tế nào được thực hiện.</p>
      </div>
    </div>
  );
}
