import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import usePageSEO from '../hooks/usePageSEO';
import { getCourseThumbnail } from '../utils/courseImages';

/* ── GRADIENT PALETTE ── */
const GRADS = [
  'linear-gradient(135deg,#0056D2 0%,#0099e0 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)',
  'linear-gradient(135deg,#0891b2 0%,#22d3ee 100%)',
  'linear-gradient(135deg,#059669 0%,#34d399 100%)',
  'linear-gradient(135deg,#b45309 0%,#f59e0b 100%)',
];

/* ── STARS COMPONENT ── */
function Stars({ rating, size = 14 }) {
  const n = parseFloat(rating) || 0;
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#d1d5db', fontSize: size }}>★</span>
      ))}
    </span>
  );
}

/* ── MAIN COMPONENT ── */
export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const stickyNavRef = useRef(null);
  const sectionsRef = useRef({});

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [toast, setToast] = useState('');
  const [activeNav, setActiveNav] = useState('about');
  const [expandedModule, setExpandedModule] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  /* SEO — must be before any early return */
  usePageSEO({
    title: course ? fixText(course.title) : 'Chi tiết khóa học',
    description: course?.description?.slice(0, 160) || 'EduVNU - Xem chi tiết khóa học',
  });

  /* Load course data */
  useEffect(() => { loadCourse(); }, [courseId]);

  /* Sticky nav scroll watcher */
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 380);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Fetch reviews when tab active */
  useEffect(() => {
    if (activeNav === 'testimonials' && courseId) {
      setReviewsLoading(true);
      api.get(`/courses/courses/${courseId}/reviews/`)
        .then(r => setReviews(r.data?.results || r.data || []))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeNav, courseId]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/courses/${courseId}/`);
      setCourse(res.data);
      if (user) {
        try {
          const enrollRes = await api.get(`/courses/progress/my_progress/?course_id=${courseId}`);
          if (enrollRes.data?.length > 0) setIsEnrolled(true);
          else {
            await api.get(`/courses/courses/${courseId}/lessons/`);
            setIsEnrolled(true);
          }
        } catch { setIsEnrolled(false); }
      }
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await api.post('/cart/add_item/', { course_id: courseId });
      showToast('✅ Đã thêm vào giỏ hàng!');
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || 'Không thể thêm vào giỏ hàng.');
    } finally { setAddingCart(false); }
  };

  const scrollToSection = id => {
    const el = sectionsRef.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveNav(id);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTopColor: '#0056D2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6b7280' }}>Đang tải khóa học...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!course) return null;

  /* Derived data */
  const title = fixText(course.title);
  const instructor = course.instructor;
  const org = fixText(
    instructor?.full_name ||
    (instructor?.first_name && instructor?.last_name ? `${instructor.first_name} ${instructor.last_name}` : null) ||
    instructor?.first_name || instructor?.username ||
    course.partner_name || 'EduVNU Partner'
  );
  const rating = parseFloat(course.rating) || 4.6;
  const price = parseFloat(course.price) || 0;
  const skills = Array.isArray(course.skills_list) ? course.skills_list : [];
  const gradIdx = parseInt(courseId) % GRADS.length;
  // Use user's local images
  const thumbnailUrl = getCourseThumbnail({ ...course, id: courseId });
  const reviewCount = course.review_count || '10,000+';
  const enrollCount = course.enrollment_count || '150,000+';
  const originalPrice = parseFloat(course.original_price) || 0;
  const isDiscounted = originalPrice > price && price > 0;

  /* Real curriculum from chapters */
  const curriculum = (course.chapters || []).length > 0 
    ? course.chapters.map(ch => ({
        title: ch.title,
        duration: `${ch.lessons?.length || 0} bài học`,
        lessons: (ch.lessons || []).map(l => l.title)
      }))
    : [
        { title: 'Nội dung đang được cập nhật', duration: '...', lessons: [] }
      ];
  
  const totalLessons = (course.chapters || []).reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);

  const whatYouLearn = skills.length >= 4
    ? skills.slice(0, 8)
    : ['Kiến thức nền tảng vững chắc', 'Kỹ năng thực hành thực tế', 'Tư duy phản biện & giải quyết vấn đề', 'Ứng tuyển và phát triển sự nghiệp', ...skills];

  const DEMO_REVIEWS = [
    { name: 'Nguyễn Văn A', role: 'Software Engineer', rating: 5, text: 'Khóa học rất hay, giảng viên giải thích rõ ràng và dễ hiểu. Kiến thức thực tế, áp dụng được ngay vào công việc.' },
    { name: 'Trần Thị B', role: 'Product Manager', rating: 5, text: 'Nội dung phong phú, thực hành nhiều. Rất phù hợp cho người mới bắt đầu lẫn người muốn nâng cao kỹ năng.' },
    { name: 'Lê Minh C', role: 'Data Analyst', rating: 4, text: 'Tuyệt vời! Một trong những khóa học tốt nhất tôi từng tham gia. Chứng chỉ được nhiều công ty công nhận.' },
  ];

  const NAV_ITEMS = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'outcomes', label: 'Kết quả học tập' },
    { id: 'courses', label: 'Nội dung' },
    { id: 'testimonials', label: 'Đánh giá' },
  ];

  /* ── ENROLLMENT CARD ── */
  const EnrollCard = ({ compact = false }) => (
    <div style={{
      background: '#fff',
      borderRadius: compact ? 0 : 12,
      boxShadow: compact ? 'none' : '0 4px 24px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      border: compact ? 'none' : '1px solid #e5e7eb',
    }}>
      {/* Thumbnail */}
      {!compact && (
        <div style={{ height: 180, background: GRADS[gradIdx], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
          )}
          <span style={{ fontSize: 72, color: 'rgba(255,255,255,0.85)', fontWeight: 800, display: thumbnailUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {org[0]?.toUpperCase() || 'E'}
          </span>
        </div>
      )}
      <div style={{ padding: compact ? '12px 20px' : 24 }}>
        {!compact && (
          <div style={{ marginBottom: 16 }}>
            {isDiscounted && (
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <span style={{ fontSize: 16, textDecoration: 'line-through', color: '#6b7280' }}>
                   {originalPrice.toLocaleString('vi-VN')} ₫
                 </span>
                 <span style={{ background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                   Giảm {Math.round((1 - price / originalPrice) * 100)}%
                 </span>
              </div>
            )}
            <div style={{ fontSize: price === 0 ? 26 : 28, fontWeight: 800, color: '#111', lineHeight: 1 }}>
              {price === 0 ? <span style={{ color: '#059669' }}>Miễn phí</span> : `${price.toLocaleString('vi-VN')} ₫`}
            </div>
            {price > 0 && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Truy cập trọn đời • Chứng chỉ hoàn thành</div>}
          </div>
        )}

        {isEnrolled ? (
          <button
            onClick={() => navigate(`/learn/${courseId}`)}
            style={{ width: '100%', padding: compact ? '10px 0' : '14px 0', background: '#0056D2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Vào học ngay →
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={price === 0 ? () => setShowTrialModal(true) : addToCart}
              disabled={addingCart}
              style={{ width: '100%', padding: compact ? '10px 0' : '14px 0', background: addingCart ? '#93c5fd' : '#0056D2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: addingCart ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {addingCart ? 'Đang thêm...' : price === 0 ? 'Đăng ký miễn phí' : 'Thêm vào giỏ hàng'}
            </button>
            {price > 0 && !compact && (
              <button
                onClick={async () => { await addToCart(); navigate('/checkout'); }}
                style={{ width: '100%', padding: '12px 0', background: '#fff', color: '#0056D2', border: '2px solid #0056D2', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Mua ngay
              </button>
            )}
          </div>
        )}

        {!compact && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '📚', text: `${totalLessons} bài học` },
              { icon: '⏱', text: course.duration || '20+ giờ nội dung' },
              { icon: '📱', text: 'Truy cập trên mọi thiết bị' },
              { icon: '🏆', text: 'Chứng chỉ hoàn thành' },
              { icon: '♾️', text: 'Truy cập trọn đời' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {!compact && price > 0 && (
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#15803d' }}>
            🔒 Đảm bảo hoàn tiền 30 ngày nếu không hài lòng
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f5f7f9', minHeight: '100vh' }}>
      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, background: '#1f2937', color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
          {toast}
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <div style={{ background: '#1c1d1f', color: '#fff', padding: '48px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>
          {/* LEFT CONTENT */}
          <div style={{ paddingBottom: 40 }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: 16, fontSize: 13, color: '#bbb' }}>
              <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none' }}>Trang chủ</Link>
              <span style={{ margin: '0 8px', color: '#555' }}>/</span>
              <span style={{ color: '#aaa' }}>{fixText(course.category?.name) || 'Khóa học'}</span>
              <span style={{ margin: '0 8px', color: '#555' }}>/</span>
              <span style={{ color: '#ddd' }}>{title.length > 40 ? title.slice(0, 40) + '…' : title}</span>
            </nav>

            {/* Partner badge / VNU Faculty */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 6, marginBottom: 16, fontSize: 13, color: '#e5e7eb' }}>
              <span style={{ width: 28, height: 28, background: GRADS[gradIdx], borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                {(course.faculty || org)[0]?.toUpperCase()}
              </span>
              {course.faculty || org}
            </div>

            {/* Title / VNU Subject Code */}
            <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: '#fff', maxWidth: 680 }}>
              {course.subject_code && <span style={{color: '#60a5fa', marginRight: '8px'}}>[{course.subject_code}]</span>}
              {title}
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.6, marginBottom: 20, maxWidth: 620 }}>
              {course.description?.split('\n')[0] || `Khóa học chuyên sâu từ ${org} giúp bạn nâng cao kỹ năng ${fixText(course.category?.name) || 'chuyên môn'}.`}
            </p>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {rating > 0 && (
                <>
                  <Stars rating={rating} size={16} />
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{rating.toFixed(1)}</span>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>({typeof reviewCount === 'number' ? reviewCount.toLocaleString() : reviewCount} đánh giá)</span>
                </>
              )}
              <span style={{ color: '#9ca3af', fontSize: 13 }}>•</span>
              <span style={{ color: '#9ca3af', fontSize: 13 }}>{typeof enrollCount === 'number' ? enrollCount.toLocaleString() : enrollCount} học viên đã đăng ký</span>
            </div>

            {/* Meta badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { icon: '📊', label: course.level || 'Mọi trình độ' },
                { icon: '⏱', label: course.duration || '20+ giờ' },
                { icon: '🌐', label: 'Tiếng Việt' },
                { icon: '🏆', label: 'Có chứng chỉ' },
              ].map((b, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 20, fontSize: 12, color: '#e5e7eb' }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Enrollment Card (visible in hero) */}
          <div style={{ position: 'sticky', top: 80, zIndex: 10 }}>
            <EnrollCard />
          </div>
        </div>
      </div>

      {/* ── STICKY SUB-NAV ── */}
      <div ref={stickyNavRef} style={{
        position: 'sticky', top: 56, zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: stickyVisible ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <nav style={{ display: 'flex', gap: 0 }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeNav === item.id ? '3px solid #0056D2' : '3px solid transparent',
                  color: activeNav === item.id ? '#0056D2' : '#374151',
                  fontWeight: activeNav === item.id ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Compact enroll CTA (shows on scroll) */}
          {stickyVisible && !isEnrolled && (
            <button
              onClick={price === 0 ? () => setShowTrialModal(true) : addToCart}
              style={{ padding: '9px 20px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {price === 0 ? 'Đăng ký miễn phí' : 'Thêm vào giỏ hàng'}
            </button>
          )}
          {stickyVisible && isEnrolled && (
            <button
              onClick={() => navigate(`/learn/${courseId}`)}
              style={{ padding: '9px 20px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Vào học ngay →
            </button>
          )}
        </div>
      </div>

      {/* ── QUICK STATS BAR ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid #f3f4f6' }}>
            {[
              { icon: '📚', value: `${totalLessons}`, label: 'Bài học' },
              { icon: '⭐', value: rating.toFixed(1), label: 'Đánh giá trung bình' },
              { icon: '📊', value: course.level || 'Mọi cấp độ', label: 'Trình độ' },
              { icon: '⏱', value: course.duration || 'Linh hoạt', label: 'Thời lượng' },
              { icon: '🌐', value: 'Tiếng Việt', label: 'Ngôn ngữ' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '20px 0', textAlign: 'center', borderRight: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

        {/* ── LEFT: MAIN CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* SECTION: ABOUT */}
          <section ref={el => sectionsRef.current.about = el}>
            {/* What you'll learn */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111' }}>Bạn sẽ học được gì</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {whatYouLearn.slice(0, 8).map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                    <span style={{ color: '#0056D2', fontWeight: 700, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: SKILLS TAGS */}
          {skills.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#111' }}>Kỹ năng bạn sẽ đạt được</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: OUTCOMES */}
          <section ref={el => sectionsRef.current.outcomes = el}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111' }}>Kết quả học tập</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { icon: '🏆', title: 'Nhận chứng chỉ', desc: 'Chứng chỉ được công nhận bởi doanh nghiệp, chia sẻ lên LinkedIn' },
                  { icon: '💼', title: 'Sẵn sàng việc làm', desc: 'Kỹ năng thực tiễn áp dụng ngay vào công việc thực tế' },
                  { icon: '📈', title: 'Nâng cao sự nghiệp', desc: 'Mở ra cơ hội thăng tiến và tăng lương trong lĩnh vực này' },
                  { icon: '🌐', title: 'Cộng đồng học tập', desc: 'Kết nối với hàng nghìn học viên và chuyên gia trên toàn quốc' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: CURRICULUM */}
          <section ref={el => sectionsRef.current.courses = el}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 6 }}>
                  Nội dung khóa học
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  {curriculum.length} phần • {totalLessons} bài học • {course.duration || '20+'} giờ học tập
                </p>
              </div>
              {curriculum.map((mod, mi) => (
                <div key={mi} style={{ borderBottom: mi < curriculum.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <button
                    onClick={() => setExpandedModule(expandedModule === mi ? -1 : mi)}
                    style={{ width: '100%', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expandedModule === mi ? '#f9fafb' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: GRADS[gradIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                        {mi + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{mod.title}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          {mod.lessons.length} bài • {mod.duration}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: 18, transition: 'transform 0.2s', transform: expandedModule === mi ? 'rotate(180deg)' : 'none' }}>›</span>
                  </button>
                  {expandedModule === mi && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: '0 28px 16px 82px' }}>
                      {mod.lessons.map((lesson, li) => (
                        <li key={li} style={{ padding: '10px 0', borderTop: '1px solid #f9fafb', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>▶</span>
                          <span style={{ fontSize: 14, color: '#374151', flex: 1 }}>{lesson}</span>
                          {isEnrolled && (
                            <button onClick={() => navigate(`/learn/${courseId}`)} style={{ fontSize: 12, color: '#0056D2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                              Học ngay →
                            </button>
                          )}
                        </li>
                      ))}
                      {course.chapters?.[mi]?.quiz && (
                        <li style={{ padding: '12px 15px', marginTop: '5px', background: '#f0f9ff', borderRadius: '8px', border: '1px dashed #0056d2', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{fontSize: '1.2rem'}}>📝</span>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: 700, fontSize: '13px', color: '#0369a1'}}>Bài kiểm tra: {course.chapters[mi].quiz.title}</div>
                            <div style={{fontSize: '11px', color: '#64748b'}}>{course.chapters[mi].quiz.questions?.length || 0} câu hỏi trắc nghiệm</div>
                          </div>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: DESCRIPTION */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#111' }}>Về khóa học này</h2>
            <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, ...(showFullDesc ? {} : { maxHeight: 120, overflow: 'hidden', position: 'relative' }) }}>
              {course.description ||
                `Khóa học ${title} được thiết kế bởi ${org}, cung cấp kiến thức toàn diện và kỹ năng thực tiễn. Phù hợp cho cả người mới bắt đầu và những ai muốn nâng cao kỹ năng chuyên môn trong lĩnh vực ${fixText(course.category?.name) || 'công nghệ'}. Với phương pháp học kết hợp lý thuyết và thực hành, khóa học này sẽ giúp bạn đạt được sự tự tin trong công việc.`}
            </div>
            {!showFullDesc && (
              <button onClick={() => setShowFullDesc(true)} style={{ marginTop: 12, color: '#0056D2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Xem thêm ▾
              </button>
            )}
          </div>

          {/* SECTION: INSTRUCTOR */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111' }}>Giảng viên</h2>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: GRADS[gradIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>
                {org[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0056D2', marginBottom: 4 }}>{org}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                  {fixText(course.category?.name) || 'Chuyên gia'} Expert • EduVNU Partner
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#374151', marginBottom: 10 }}>
                  {rating > 0 && <span>⭐ {rating.toFixed(1)} đánh giá</span>}
                  <span>👥 {typeof enrollCount === 'number' ? enrollCount.toLocaleString() : enrollCount} học viên</span>
                  <span>📚 {totalLessons} bài học</span>
                </div>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                  {org} là chuyên gia hàng đầu trong lĩnh vực {fixText(course.category?.name) || 'công nghệ'} với nhiều năm kinh nghiệm thực tiễn và đã đào tạo hàng nghìn học viên trên toàn quốc.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: REVIEWS */}
          <section ref={el => sectionsRef.current.testimonials = el}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111' }}>Đánh giá từ học viên</h2>

              {/* Rating overview */}
              {rating > 0 && (
                <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: '20px 24px', background: '#f9fafb', borderRadius: 10, marginBottom: 24 }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 56, fontWeight: 800, color: '#111', lineHeight: 1 }}>{rating.toFixed(1)}</div>
                    <Stars rating={rating} size={18} />
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Đánh giá khóa học</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const pct = star === 5 ? 72 : star === 4 ? 19 : star === 3 ? 6 : star === 2 ? 2 : 1;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                          <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#6b7280', width: 32, textAlign: 'right' }}>{star} ★</span>
                          <span style={{ fontSize: 12, color: '#9ca3af', width: 28 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '24px 0' }}>Đang tải đánh giá...</div>
                ) : (reviews.length > 0 ? reviews : DEMO_REVIEWS).map((review, i) => {
                  const name = reviews.length > 0
                    ? (review.user?.first_name ? `${review.user.first_name} ${review.user.last_name || ''}`.trim() : review.user?.username || 'Học viên')
                    : review.name;
                  const role = review.role || '';
                  const text = review.comment || review.text || '';
                  const r = review.rating || 5;
                  const initials = (name[0] || 'H').toUpperCase();
                  return (
                    <div key={i} style={{ padding: 20, border: '1px solid #f3f4f6', borderRadius: 10, background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: GRADS[(i + gradIdx) % GRADS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{name}</div>
                          {role && <div style={{ fontSize: 12, color: '#6b7280' }}>{role}</div>}
                          <div style={{ marginTop: 4 }}><Stars rating={r} size={13} /></div>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION: FAQ */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#111' }}>Câu hỏi thường gặp</h2>
            {[
              { q: 'Tôi có cần kinh nghiệm trước không?', a: 'Không, khóa học được thiết kế phù hợp cho người mới bắt đầu. Bạn chỉ cần máy tính và kết nối internet.' },
              { q: 'Mất bao lâu để hoàn thành khóa học?', a: `Với lịch học linh hoạt, bạn có thể hoàn thành trong ${course.duration || '4-6 tuần'} nếu học khoảng 5 giờ mỗi tuần.` },
              { q: 'Chứng chỉ của tôi có được công nhận không?', a: 'Chứng chỉ EduVNU được nhiều doanh nghiệp trong nước công nhận và bạn có thể chia sẻ trực tiếp lên LinkedIn.' },
              { q: 'Tôi có thể truy cập khóa học mãi không?', a: 'Sau khi mua, bạn có quyền truy cập vĩnh viễn vào toàn bộ nội dung khóa học, kể cả các cập nhật trong tương lai.' },
            ].map((faq, i) => (
              <div key={i} style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 8 }}>❓ {faq.q}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR (desktop sticky) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 120 }}>
          <EnrollCard />

          {/* Share card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 12 }}>Chia sẻ khóa học</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Facebook', bg: '#1877f2', icon: 'f' },
                { label: 'LinkedIn', bg: '#0a66c2', icon: 'in' },
                { label: 'Copy link', bg: '#6b7280', icon: '🔗' },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => {if (s.label === 'Copy link') { navigator.clipboard.writeText(window.location.href); showToast('✅ Đã sao chép link!'); }}}
                  style={{ flex: 1, padding: '8px 0', background: s.bg, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Related courses placeholder */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 12 }}>Được cung cấp bởi</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, background: GRADS[gradIdx], borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                {org[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{org}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>EduVNU Partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PROMO STRIP ── */}
      <div style={{ background: '#1c1d1f', marginTop: 48, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: '🎓', title: 'Chứng chỉ nghề nghiệp', desc: 'Nhận chứng chỉ được doanh nghiệp công nhận', color: '#0056D2', action: 'Tìm hiểu thêm' },
            { icon: '🏛️', title: 'Học tại EduVNU', desc: 'Tham gia cộng đồng 150,000+ học viên', color: '#7c3aed', action: 'Khám phá ngay' },
            { icon: '🏢', title: 'EduVNU cho doanh nghiệp', desc: 'Nâng cao kỹ năng cho toàn bộ đội nhóm', color: '#059669', action: 'Liên hệ ngay' },
          ].map((promo, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{promo.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 8 }}>{promo.title}</div>
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, marginBottom: 16 }}>{promo.desc}</div>
              <Link to="/" style={{ fontSize: 13, color: promo.color, fontWeight: 700, textDecoration: 'none' }}>{promo.action} →</Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRIAL MODAL OVERLAY ── */}
      {showTrialModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: 640, borderRadius: 8, padding: '40px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setShowTrialModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#9ca3af', cursor: 'pointer', padding: '0 8px' }}>&times;</button>
            
            <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 32, color: '#111' }}>Dùng thử miễn phí 7 ngày</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
              {[
                { title: 'Truy cập không giới hạn vào tất cả các khóa học trong Chuyên ngành', desc: 'Xem các bài giảng, làm thử các bài tập, tham gia vào các diễn đàn thảo luận và hơn thế nữa.' },
                { title: 'Hủy bất cứ lúc nào.', desc: 'Không áp phí phạt - chỉ cần hủy trước khi bản dùng thử kết thúc nếu nó không phù hợp với bạn.' },
                { title: '20 US$ USD mỗi tháng để tiếp tục học sau khi bản dùng thử của bạn kết thúc', desc: 'Học càng nhanh càng tốt - bạn học càng nhanh, bạn càng tiết kiệm được nhiều.' },
                { title: 'Chứng chỉ khi bạn hoàn thành sau khi thời hạn dùng thử kết thúc', desc: 'Chia sẻ trên sơ yếu lý lịch, LinkedIn và CV của bạn.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowTrialModal(false); navigate('/checkout?trial=true', { state: { program: course } }); }} 
                style={{ padding: '16px 32px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%' }}
              >
                Bắt đầu Dùng thử miễn phí
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
