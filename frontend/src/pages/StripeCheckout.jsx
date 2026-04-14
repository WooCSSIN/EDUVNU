import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';

// Publishable key của Stripe
const stripePromise = loadStripe('pk_test_51TJ6jYCXDledMR05jGelboBqOpunHDDIB1tv63hrPBjtMsT0agZOLb1ssY2YQDR6GUht4ZR2QusKLcBjS2px798N008DFMTXT9');

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

// Form thanh toán (dùng Stripe Elements)
function CheckoutForm({ orderId, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const cardNumber = elements.getElement(CardNumberElement);
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      // client_secret đã được truyền qua Elements context
      elements._elements.stripeElements._stripe._stripeAccountId || '', // placeholder, sẽ dùng clientSecret từ prop
      { payment_method: { card: cardNumber } }
    );

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Thông báo Backend xác nhận đơn hàng
      try {
        await api.post(`/orders/${orderId}/confirm_payment/`, {
          transaction_id: paymentIntent.id,
        });
      // eslint-disable-next-line no-unused-vars
      } catch (e) { /* ignore */ }
      setSuccess(true);
      setTimeout(() => navigate('/schedule'), 2500);
    }
  };

  if (success) {
    return (
      <div className="stripe-success">
        <div className="stripe-success-icon">✅</div>
        <h2>Thanh toán thành công!</h2>
        <p>Khóa học của bạn đã được kích hoạt. Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-field-group">
        <label className="stripe-label">Số thẻ</label>
        <div className="stripe-input-wrap">
          <CardNumberElement options={CARD_STYLE} />
        </div>
      </div>

      <div className="stripe-row">
        <div className="stripe-field-group">
          <label className="stripe-label">Ngày hết hạn</label>
          <div className="stripe-input-wrap">
            <CardExpiryElement options={CARD_STYLE} />
          </div>
        </div>
        <div className="stripe-field-group">
          <label className="stripe-label">Mã CVV</label>
          <div className="stripe-input-wrap">
            <CardCvcElement options={CARD_STYLE} />
          </div>
        </div>
      </div>

      {error && <div className="stripe-error">⚠️ {error}</div>}

      <button type="submit" disabled={!stripe || processing} className="stripe-pay-btn">
        {processing ? (
          <><span className="stripe-spinner" /> Đang xử lý...</>
        ) : (
          <>🔒 Thanh toán {Number(amount).toLocaleString('vi-VN')} ₫</>
        )}
      </button>

      <div className="stripe-security-note">
        <span>🔐</span> Thông tin thẻ được mã hóa SSL 256-bit bởi Stripe. EduVNU không lưu số thẻ của bạn.
      </div>
    </form>
  );
}

export default function StripeCheckout() {
  usePageSEO({ title: 'Thanh toán thẻ quốc tế - EduVNU', description: 'Thanh toán an toàn bằng thẻ Visa, Mastercard qua Stripe.' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const clientSecret = searchParams.get('client_secret');

  useEffect(() => {
    if (!orderId || !clientSecret) navigate('/checkout');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, clientSecret]);

  if (!clientSecret) return null;

  const options = { clientSecret };

  return (
    <div className="stripe-page">
      <div className="stripe-card">
        {/* Header */}
        <div className="stripe-header">
          <div className="stripe-brand">
            <span className="stripe-logo-edu">EduVNU</span>
            <span className="stripe-x">×</span>
            <img src="https://cdn.brandfetch.io/idtE07liXm/w/400/h/400/theme/dark/icon.png?c=1bfwsmEH20ixsF1n2m3" alt="Stripe" className="stripe-logo-img" />
          </div>
          <div className="stripe-amount-display">
            <div className="stripe-amount-label">Tổng thanh toán</div>
            <div className="stripe-amount-value">{Number(amount).toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        {/* Test card hint */}
        <div className="stripe-test-hint">
          <strong>🧪 Sandbox Test:</strong> Dùng thẻ <code>4242 4242 4242 4242</code> · Bất kỳ ngày hết hạn · Bất kỳ CVV
        </div>

        {/* Stripe Elements */}
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm orderId={orderId} amount={amount} />
        </Elements>

        {/* Accepted cards */}
        <div className="stripe-accepted-cards">
          <span>Hỗ trợ:</span>
          <span className="stripe-card-badge visa">VISA</span>
          <span className="stripe-card-badge master">Mastercard</span>
          <span className="stripe-card-badge amex">AMEX</span>
          <span className="stripe-card-badge jcb">JCB</span>
        </div>
      </div>
    </div>
  );
}
