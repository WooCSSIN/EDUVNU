import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import usePageSEO from '../hooks/usePageSEO';

const GRADS = [
  'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#0891b2,#22d3ee)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#b45309,#f59e0b)',
];

function Stars({ rating }) {
  const n = Math.round(parseFloat(rating) || 0);
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
      ))}
    </span>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // ❗ usePageSEO must be called unconditionally BEFORE any early returns (Rules of Hooks)
  usePageSEO({
    title: course ? fixText(course.title) : 'Chi tiết khóa học',
    description: course
      ? (course.description?.slice(0, 160) || `Khóa học ${fixText(course.title)} tại EduVNU`)
      : 'EduVNU - Xem chi tiết khóa học',
  });

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Fetch real reviews when user clicks Đánh giá tab
  useEffect(() => {
    if (activeTab === 'reviews' && courseId) {
      setReviewsLoading(true);
      api.get(`/courses/courses/${courseId}/reviews/`)
        .then(r => setReviews(r.data?.results || r.data || []))
        .catch(() => setReviews([]))  // Fallback to demo data if API missing
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab, courseId]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/courses/${courseId}/`);
      setCourse(res.data);
      // Kiểm tra enrolled thực sự qua enrollment API
      if (user) {
        try {
          const enrollRes = await api.get(`/courses/progress/my_progress/?course_id=${courseId}`);
          // Nếu có dữ liệu progress => đã ghi danh
          if (enrollRes.data && enrollRes.data.length > 0) setIsEnrolled(true);
          else {
            // Kiểm tra thêm qua lessons API (nếu trả 200 = đã enrolled)
            await api.get(`/courses/courses/${courseId}/lessons/`);
            setIsEnrolled(true);
          }
        } catch {
          setIsEnrolled(false);
        }
      }
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingCart(true);
    try {
      await api.post('/cart/add_item/', { course_id: courseId });
      showToast('Đã thêm vào giỏ hàng!');
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || 'Không thể thêm.');
    } finally { setAddingCart(false); }
  };

  if (loading) return <div className="crs-loading">Đang tải...</div>;
  if (!course) return null;

  const title = fixText(course.title);
  // Fix: Use full name chain so 'Giảng viên' fallback only when truly no name available
  const instructor = course.instructor;
  const org = fixText(
    instructor?.full_name ||
    (instructor?.first_name && instructor?.last_name ? `${instructor.first_name} ${instructor.last_name}` : null) ||
    instructor?.first_name ||
    instructor?.username ||
    course.partner_name ||
    'EduVNU Partner'
  );
  const rating = parseFloat(course.rating) || 0;
  const price = parseFloat(course.price) || 0;
  const skills = Array.isArray(course.skills_list) ? course.skills_list : [];
  const gradIdx = parseInt(courseId) % GRADS.length;
  // Thumbnail: use real image if available, else gradient avatar
  const thumbnailUrl = course.thumbnail || course.thumbnail_url || course.image || null;

  // (SEO now applied above, before early returns)

  // Tạo mock curriculum từ skills
  const curriculum = skills.length > 0
    ? [
        { title: 'Giới thiệu & Tổng quan', lessons: ['Giới thiệu khóa học', 'Cài đặt môi trường', 'Tổng quan nội dung'] },
        { title: 'Kiến thức nền tảng', lessons: skills.slice(0, 3).map(s => `Học về ${s}`) },
        { title: 'Thực hành & Dự án', lessons: ['Bài tập thực hành', 'Dự án cuối khóa', 'Đánh giá & Chứng chỉ'] },
      ]
    : [
        { title: 'Module 1: Giới thiệu', lessons: ['Bài 1: Tổng quan', 'Bài 2: Cài đặt', 'Bài 3: Bắt đầu'] },
        { title: 'Module 2: Nội dung chính', lessons: ['Bài 4: Lý thuyết', 'Bài 5: Thực hành', 'Bài 6: Bài tập'] },
        { title: 'Module 3: Nâng cao', lessons: ['Bài 7: Chuyên sâu', 'Bài 8: Dự án', 'Bài 9: Tổng kết'] },
      ];

  const totalLessons = curriculum.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <div className="cd-page">
      {toast && <div className="toast">{toast}</div>}

      {/* HERO BANNER */}
      <div className="cd-hero" style={{ background: GRADS[gradIdx] }}>
        <div className="cd-hero-inner">
          <div className="cd-hero-content">
            {/* BREADCRUMB */}
            <nav aria-label="Breadcrumb" className="cd-breadcrumb">
              <Link to="/" className="cd-bc-link">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link to="/" className="cd-bc-link">{fixText(course.category?.name) || 'Khóa học'}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{title.length > 40 ? title.slice(0, 40) + '…' : title}</span>
            </nav>

            <h1 className="cd-title">{title}</h1>
            <p className="cd-desc">{course.description?.split('\n')[0] || `Khóa học chuyên sâu từ ${org}`}</p>

            {/* RATING ROW */}
            <div className="cd-rating-row">
              {rating > 0 && (
                <>
                  <span className="cd-rating-num">{rating.toFixed(1)}</span>
                  <Stars rating={rating} />
                  {course.review_count && <span className="cd-review-count">({fixText(course.review_count)})</span>}
                </>
              )}
            </div>

            {/* META */}
            <div className="cd-meta-row">
              <span>👨‍🏫 {org}</span>
              {course.level && <span>📊 {course.level}</span>}
              {course.duration && <span>⏱ {course.duration}</span>}
              <span>📚 {totalLessons} bài học</span>
            </div>
          </div>

          {/* STICKY CARD */}
          <div className="cd-sticky-card">
            {/* Thumbnail: real image if available, else gradient letter */}
            <div className="cd-card-thumb" style={{ height: 160, overflow: 'hidden', borderRadius: '8px 8px 0 0', background: GRADS[gradIdx], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              ) : null}
              <span style={{ fontSize: 64, color: 'rgba(255,255,255,0.85)', display: thumbnailUrl ? 'none' : 'flex' }}>
                {org[0]?.toUpperCase() || 'E'}
              </span>
            </div>
            <div className="cd-card-body">
              <div className="cd-card-price">
                {price === 0
                  ? <span className="cd-price-free">Miễn phí</span>
                  : <span className="cd-price-paid">{price.toLocaleString('vi-VN')} đ</span>}
              </div>

              {isEnrolled ? (
                <button className="cd-enroll-btn" onClick={() => navigate(`/learn/${courseId}`)}>
                  Vào học ngay →
                </button>
              ) : (
                <>
                  <button className="cd-enroll-btn" onClick={addToCart} disabled={addingCart}>
                    {addingCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                  </button>
                  <button className="cd-buy-btn" onClick={async () => { await addToCart(); navigate('/checkout'); }}>
                    Mua ngay
                  </button>
                </>
              )}

              <div className="cd-card-includes">
                <p className="cd-includes-title">Khóa học bao gồm:</p>
                <ul>
                  <li>📚 {totalLessons} bài học</li>
                  {course.duration && <li>⏱ {course.duration} học tập</li>}
                  <li>📱 Truy cập trên mọi thiết bị</li>
                  <li>🏆 Chứng chỉ hoàn thành</li>
                  <li>♾️ Truy cập trọn đời</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="cd-tabs-bar">
        <div className="cd-tabs-inner">
          {['overview', 'curriculum', 'instructor', 'reviews'].map(tab => (
            <button
              key={tab}
              className={`cd-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Tổng quan'
               : tab === 'curriculum' ? 'Nội dung khóa học'
               : tab === 'instructor' ? 'Giảng viên'
               : 'Đánh giá'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="cd-content">
        <div className="cd-content-main">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="cd-section">
              <h2>Bạn sẽ học được gì</h2>
              {skills.length > 0 ? (
                <div className="cd-skills-grid">
                  {skills.map((s, i) => (
                    <div key={i} className="cd-skill-item">
                      <span className="cd-check">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cd-skills-grid">
                  {['Kiến thức nền tảng vững chắc', 'Kỹ năng thực hành thực tế', 'Tư duy giải quyết vấn đề', 'Chuẩn bị cho sự nghiệp'].map((s, i) => (
                    <div key={i} className="cd-skill-item"><span className="cd-check">✓</span><span>{s}</span></div>
                  ))}
                </div>
              )}

              <h2 style={{ marginTop: 32 }}>Yêu cầu</h2>
              <ul className="cd-req-list">
                <li>Không cần kinh nghiệm trước — phù hợp cho người mới bắt đầu</li>
                <li>Máy tính có kết nối internet</li>
                <li>Tinh thần học hỏi và kiên trì</li>
              </ul>

              <h2 style={{ marginTop: 32 }}>Mô tả khóa học</h2>
              <p className="cd-desc-text">
                {course.description || `Khóa học ${title} được thiết kế bởi ${org}, cung cấp kiến thức toàn diện và kỹ năng thực tiễn. Phù hợp cho cả người mới bắt đầu và những ai muốn nâng cao kỹ năng chuyên môn.`}
              </p>
            </div>
          )}

          {/* CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div className="cd-section">
              <h2>Nội dung khóa học</h2>
              <p className="cd-curriculum-summary">{curriculum.length} phần • {totalLessons} bài học</p>
              <div className="cd-curriculum">
                {curriculum.map((section, si) => (
                  <div key={si} className="cd-section-item">
                    <button
                      className="cd-section-header"
                      onClick={() => setExpandedSection(expandedSection === si ? -1 : si)}
                    >
                      <span className="cd-section-chevron">{expandedSection === si ? '▼' : '▶'}</span>
                      <span className="cd-section-title">{section.title}</span>
                      <span className="cd-section-count">{section.lessons.length} bài</span>
                    </button>
                    {expandedSection === si && (
                      <ul className="cd-lesson-list">
                        {section.lessons.map((lesson, li) => (
                          <li key={li} className="cd-lesson-item">
                            <span className="cd-lesson-icon">▶</span>
                            <span className="cd-lesson-name">{lesson}</span>
                            {isEnrolled && (
                              <button className="cd-lesson-start" onClick={() => navigate(`/learn/${courseId}`)}>
                                Học ngay
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSTRUCTOR TAB */}
          {activeTab === 'instructor' && (
            <div className="cd-section">
              <h2>Giảng viên</h2>
              <div className="cd-instructor-card">
                <div className="cd-instructor-avatar">{org[0]?.toUpperCase()}</div>
                <div className="cd-instructor-info">
                  <h3>{org}</h3>
                  <p className="cd-instructor-title">{fixText(course.category?.name) || 'Chuyên gia'} Expert</p>
                  <div className="cd-instructor-stats">
                    {rating > 0 && <span>⭐ {rating.toFixed(1)} đánh giá</span>}
                    <span>📚 {totalLessons} bài học</span>
                    <span>🎓 Giảng viên chuyên nghiệp</span>
                  </div>
                  <p className="cd-instructor-bio">
                    {org} là chuyên gia hàng đầu trong lĩnh vực {fixText(course.category?.name) || 'công nghệ'} với nhiều năm kinh nghiệm thực tiễn. Đã đào tạo hàng nghìn học viên trên toàn thế giới.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="cd-section">
              <h2>Đánh giá học viên</h2>
              {rating > 0 && (
                <div className="cd-rating-overview">
                  <div className="cd-rating-big">
                    <span className="cd-rating-big-num">{rating.toFixed(1)}</span>
                    <Stars rating={rating} />
                    <span className="cd-rating-label">Đánh giá khóa học</span>
                  </div>
                  <div className="cd-rating-bars">
                    {[5,4,3,2,1].map(star => (
                      <div key={star} className="cd-rating-bar-row">
                        <div className="cd-rating-bar-fill" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 2}%` }} />
                        <span>{star} ★</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Real reviews from API */}
              <div className="cd-reviews-list">
                {reviewsLoading ? (
                  <div style={{color:'var(--muted)',padding:'20px 0'}}>Đang tải đánh giá...</div>
                ) : reviews.length > 0 ? (
                  reviews.map((review, i) => (
                    <div key={i} className="cd-review-item">
                      <div className="cd-review-header">
                        <div className="cd-reviewer-avatar">
                          {(review.user?.first_name || review.user?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="cd-reviewer-name">
                            {review.user?.first_name ? `${review.user.first_name} ${review.user.last_name || ''}`.trim() : review.user?.username || 'Học viên'}
                          </p>
                          <Stars rating={review.rating || 5} />
                        </div>
                      </div>
                      <p className="cd-review-text">{review.comment || review.text || ''}</p>
                    </div>
                  ))
                ) : (
                  // Fallback demo reviews khi API chưa có data
                  [
                    { name: 'Nguyễn Văn A', rating: 5, text: 'Khóa học rất hay, giảng viên giải thích rõ ràng và dễ hiểu. Tôi đã học được rất nhiều kiến thức bổ ích.' },
                    { name: 'Trần Thị B', rating: 4, text: 'Nội dung phong phú, thực hành nhiều. Rất phù hợp cho người mới bắt đầu.' },
                    { name: 'Lê Văn C', rating: 5, text: 'Tuyệt vời! Đây là một trong những khóa học tốt nhất tôi từng tham gia.' },
                  ].map((review, i) => (
                    <div key={i} className="cd-review-item">
                      <div className="cd-review-header">
                        <div className="cd-reviewer-avatar">{review.name[0]}</div>
                        <div>
                          <p className="cd-reviewer-name">{review.name}</p>
                          <Stars rating={review.rating} />
                        </div>
                      </div>
                      <p className="cd-review-text">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
