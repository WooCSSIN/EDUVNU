import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import usePageSEO from '../hooks/usePageSEO';

export default function Policies() {
  const location = useLocation();
  const hash = location.hash?.replace('#', '') || '';
  const [activeTab, setActiveTab] = useState(hash || 'terms');

  usePageSEO({
    title: activeTab === 'refund' ? 'Chính sách hoàn trả' : activeTab === 'privacy' ? 'Chính sách bảo mật' : 'Điều khoản sử dụng',
    description: 'Chính sách bảo mật, điều khoản dịch vụ và chính sách hoàn tiền của nền tảng EduVNU.',
  });

  const tabs = [
    { id: 'terms', label: '📋 Điều khoản sử dụng', icon: '📋' },
    { id: 'privacy', label: '🔒 Chính sách bảo mật', icon: '🔒' },
    { id: 'refund', label: '💰 Chính sách hoàn trả', icon: '💰' },
  ];

  return (
    <div className="policies-page">
      {/* Hero */}
      <div className="policies-hero">
        <h1>Chính sách & Điều khoản</h1>
        <p>Cập nhật lần cuối: 17/04/2026</p>
      </div>

      <div className="policies-container">
        {/* Tabs */}
        <div className="policies-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`policies-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="policies-content">

          {/* ── ĐIỀU KHOẢN SỬ DỤNG ── */}
          {activeTab === 'terms' && (
            <div className="policies-body">
              <h2>Điều khoản sử dụng</h2>
              <p className="policies-lead">Chào mừng bạn đến với EduVNU. Bằng việc truy cập và sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau.</p>

              <h3>1. Tài khoản người dùng</h3>
              <ul>
                <li>Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
                <li>Mỗi cá nhân chỉ được sở hữu một (01) tài khoản duy nhất.</li>
                <li>Bạn chịu trách nhiệm bảo vệ mật khẩu và toàn bộ hoạt động dưới tài khoản của mình.</li>
                <li>Nghiêm cấm chia sẻ tài khoản hoặc chuyển nhượng cho bên thứ ba.</li>
              </ul>

              <h3>2. Nội dung & Bản quyền</h3>
              <ul>
                <li>Toàn bộ nội dung khóa học (video, tài liệu, bài tập, quiz) thuộc bản quyền của giảng viên và EduVNU.</li>
                <li>Nghiêm cấm sao chép, tải xuống, phát tán hoặc bán lại nội dung khóa học dưới bất kỳ hình thức nào.</li>
                <li>Bạn được phép trích dẫn một phần nội dung cho mục đích học tập cá nhân với ghi nhận nguồn.</li>
              </ul>

              <h3>3. Quy tắc ứng xử</h3>
              <ul>
                <li>Tôn trọng giảng viên và các học viên khác trong mọi tương tác.</li>
                <li>Không đăng tải nội dung xúc phạm, phân biệt đối xử hoặc vi phạm pháp luật.</li>
                <li>Không sử dụng bot, tool tự động hoặc hành vi gian lận trong bài kiểm tra.</li>
              </ul>

              <h3>4. Thanh toán & Giá cả</h3>
              <ul>
                <li>Giá khóa học được hiển thị bằng VNĐ và đã bao gồm thuế (nếu có).</li>
                <li>Chúng tôi hỗ trợ thanh toán qua VNPay, MoMo, SePay và Stripe.</li>
                <li>Sau khi thanh toán thành công, bạn có quyền truy cập trọn đời vào khóa học đã mua.</li>
              </ul>

              <h3>5. Chấm dứt dịch vụ</h3>
              <p>EduVNU có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện hành vi vi phạm nghiêm trọng, bao gồm gian lận, chia sẻ trái phép hoặc lạm dụng hệ thống.</p>

              <div className="policies-note">
                <strong>📌 Lưu ý:</strong> Các điều khoản có thể được cập nhật theo thời gian. Chúng tôi sẽ thông báo qua email khi có những thay đổi quan trọng.
              </div>
            </div>
          )}

          {/* ── CHÍNH SÁCH BẢO MẬT ── */}
          {activeTab === 'privacy' && (
            <div className="policies-body">
              <h2>Chính sách bảo mật</h2>
              <p className="policies-lead">EduVNU cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng theo các tiêu chuẩn cao nhất.</p>

              <h3>1. Thông tin chúng tôi thu thập</h3>
              <div className="policies-info-grid">
                <div className="policies-info-card">
                  <h4>📝 Thông tin đăng ký</h4>
                  <p>Họ tên, email, số điện thoại, mật khẩu (được mã hóa), ảnh đại diện.</p>
                </div>
                <div className="policies-info-card">
                  <h4>📊 Dữ liệu học tập</h4>
                  <p>Tiến độ học, thời gian xem video, kết quả bài kiểm tra, tương tác bình luận.</p>
                </div>
                <div className="policies-info-card">
                  <h4>💳 Thông tin thanh toán</h4>
                  <p>Xử lý bởi cổng thanh toán bảo mật (VNPay, Stripe). EduVNU <strong>không</strong> lưu trữ số thẻ.</p>
                </div>
                <div className="policies-info-card">
                  <h4>🍪 Cookie & Analytics</h4>
                  <p>Cookie phiên làm việc, phân tích hành vi người dùng ẩn danh để cải thiện dịch vụ.</p>
                </div>
              </div>

              <h3>2. Mục đích sử dụng</h3>
              <ul>
                <li>Cung cấp và cá nhân hóa dịch vụ học tập.</li>
                <li>Xử lý đơn hàng và giao dịch thanh toán.</li>
                <li>Gửi thông báo khóa học, chứng chỉ và cập nhật hệ thống.</li>
                <li>Phân tích và cải thiện chất lượng nền tảng.</li>
              </ul>

              <h3>3. Bảo vệ dữ liệu</h3>
              <ul>
                <li>Mật khẩu được mã hóa bằng thuật toán bcrypt/PBKDF2.</li>
                <li>Truyền tải dữ liệu qua HTTPS/TLS.</li>
                <li>Xác thực API bằng JWT Token có thời hạn.</li>
                <li>Quyền truy cập dữ liệu được phân quyền nghiêm ngặt.</li>
              </ul>

              <h3>4. Quyền của bạn</h3>
              <ul>
                <li><strong>Truy cập:</strong> Bạn có quyền xem toàn bộ dữ liệu cá nhân mà chúng tôi lưu trữ.</li>
                <li><strong>Chỉnh sửa:</strong> Bạn có thể cập nhật thông tin qua trang Hồ sơ bất kỳ lúc nào.</li>
                <li><strong>Xóa:</strong> Bạn có quyền yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
                <li><strong>Phản đối:</strong> Bạn có quyền từ chối nhận email marketing.</li>
              </ul>

              <h3>5. Chia sẻ thông tin</h3>
              <p>Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp:</p>
              <ul>
                <li>Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.</li>
                <li>Với đối tác thanh toán (VNPay, Stripe) để xử lý giao dịch.</li>
                <li>Khi được bạn đồng ý rõ ràng bằng văn bản.</li>
              </ul>
            </div>
          )}

          {/* ── CHÍNH SÁCH HOÀN TRẢ ── */}
          {activeTab === 'refund' && (
            <div className="policies-body">
              <h2>Chính sách hoàn trả</h2>
              <p className="policies-lead">EduVNU muốn bạn hoàn toàn hài lòng với mỗi khóa học. Nếu không, chúng tôi hỗ trợ hoàn tiền theo các điều kiện dưới đây.</p>

              <div className="policies-refund-highlight">
                <div className="policies-refund-badge">✅</div>
                <div>
                  <h3>Đảm bảo hoàn tiền 30 ngày</h3>
                  <p>Nếu khóa học không đáp ứng kỳ vọng, bạn có thể yêu cầu hoàn tiền trong vòng 30 ngày kể từ ngày mua.</p>
                </div>
              </div>

              <h3>Điều kiện hoàn tiền</h3>
              <div className="policies-conditions">
                <div className="policies-condition yes">
                  <h4>✅ Được hoàn tiền khi:</h4>
                  <ul>
                    <li>Yêu cầu trong vòng 30 ngày từ ngày thanh toán.</li>
                    <li>Chưa hoàn thành quá 20% nội dung khóa học.</li>
                    <li>Chưa tải hoặc nhận chứng chỉ từ khóa học đó.</li>
                    <li>Khóa học gặp lỗi kỹ thuật nghiêm trọng không thể khắc phục.</li>
                  </ul>
                </div>
                <div className="policies-condition no">
                  <h4>❌ Không hoàn tiền khi:</h4>
                  <ul>
                    <li>Đã quá 30 ngày kể từ ngày mua.</li>
                    <li>Đã hoàn thành trên 20% nội dung.</li>
                    <li>Đã tải chứng chỉ hoàn thành.</li>
                    <li>Vi phạm điều khoản sử dụng (chia sẻ tài khoản, gian lận, ...).</li>
                    <li>Khóa học miễn phí hoặc trong chương trình khuyến mại đặc biệt.</li>
                  </ul>
                </div>
              </div>

              <h3>Quy trình hoàn tiền</h3>
              <ol className="policies-steps">
                <li>
                  <span className="policies-step-num">1</span>
                  <div><strong>Gửi yêu cầu:</strong> Liên hệ qua trang <Link to="/contact">Hỗ trợ</Link> hoặc email support@eduvnu.edu.vn</div>
                </li>
                <li>
                  <span className="policies-step-num">2</span>
                  <div><strong>Xác minh:</strong> Đội ngũ hỗ trợ sẽ kiểm tra điều kiện trong 1-2 ngày làm việc.</div>
                </li>
                <li>
                  <span className="policies-step-num">3</span>
                  <div><strong>Hoàn tiền:</strong> Tiền sẽ được hoàn về phương thức thanh toán ban đầu trong 5-7 ngày làm việc.</div>
                </li>
              </ol>

              <div className="policies-note">
                <strong>💡 Mẹo:</strong> Trước khi yêu cầu hoàn tiền, hãy thử liên hệ giảng viên hoặc đội ngũ hỗ trợ. Nhiều vấn đề có thể được giải quyết nhanh chóng!
              </div>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="policies-footer-cta">
          <h3>Bạn có thắc mắc về chính sách?</h3>
          <p>Đội ngũ hỗ trợ EduVNU luôn sẵn sàng giải đáp 24/7.</p>
          <Link to="/contact" className="policies-contact-btn">Liên hệ ngay →</Link>
        </div>
      </div>
    </div>
  );
}
