import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { fixText, parseMetadata } from '../utils/fixEncoding';
import { getCourseThumbnail } from '../utils/courseImages';
import { Loading, SkeletonCard } from '../components/LoadingUI';
import usePageSEO from '../hooks/usePageSEO';

export default function Home() {
  usePageSEO({
    title: 'Trang chủ',
    description: 'EduVNU - Nền tảng học trực tuyến hàng đầu Việt Nam. 100+ khóa học chất lượng cao về AI, Data Science, Business, UX Design từ các đối tác uy tín quốc tế.',
    keywords: 'học trực tuyến, khóa học online, EduVNU, AI, data science, lập trình, python, UX design',
  });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [ordering, setOrdering] = useState(''); // New ordering state
  const [toast, setToast] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc các tham số Lọc/Tìm kiếm từ URL (khi điều hướng từ MegaMenu, Header...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('q') || '');
    
    const priceMax = params.get('price_max');
    if (priceMax !== null) {
      setFilterPriceMax(priceMax);
      setShowFilters(true); // Tự động mở khung lọc nếu có param bộ lọc nâng cao
    } else {
      setFilterPriceMax('');
    }

    const lvl = params.get('level');
    if (lvl) {
      setFilterLevel(lvl);
      setShowFilters(true);
    } else {
      setFilterLevel('');
    }

    setActiveCategory(params.get('category') || '');
  }, [location.search]);

  useEffect(() => {
    api.get('/courses/categories/').then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory, ordering, filterLevel, filterPriceMin, filterPriceMax, filterRating]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (activeCategory) params.append('category', activeCategory);
      if (ordering) params.append('ordering', ordering);
      if (filterLevel) params.append('level', filterLevel);
      if (filterPriceMin) params.append('price_min', filterPriceMin);
      if (filterPriceMax) params.append('price_max', filterPriceMax);
      if (filterRating) params.append('rating_min', filterRating);
      const res = await api.get('/courses/courses/?' + params.toString());
      setCourses(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const addToCart = async (e, courseId) => {
    e.preventDefault(); e.stopPropagation(); // Ngay chan viec nhay trang vao detail
    if (!user) { navigate('/login'); return; }
    setAddingId(courseId);
    try {
      await api.post('/cart/add_item/', { course_id: courseId });
      setToast('✅ Đã thêm vào giỏ hàng!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err.response?.data?.message || '❌ Không thể thêm.');
      setTimeout(() => setToast(''), 3000);
    } finally { setAddingId(null); }
  };

  return (
    <main className="home-wrapper">
      {/* COURSERA STYLE HERO */}
      <section className="hero-section" style={{position: 'relative', overflow: 'hidden', color: 'white', padding: '120px 64px', minHeight: '550px', display: 'flex', alignItems: 'center'}}>
        {/* Lớp iframe nền full section (có cắt phần dưới để giấu logo Spline) */}
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden'}}>
          <iframe 
            src="https://my.spline.design/earth-ioVfVKnUbg0yrx8WVxPZmIrd/" 
            frameBorder="0" 
            title="Trái đất 3D"
            style={{width: '100%', height: 'calc(100% + 80px)', border: 'none', display: 'block'}}
          ></iframe>
        </div>
        
        {/* Lớp phủ mờ gradient (cho phép chuột đâm xuyên qua với pointerEvents: 'none' để tương tác 3D) */}
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,37,91,0.95) 0%, rgba(0,37,91,0.5) 50%, rgba(0,37,91,0.1) 100%)', pointerEvents: 'none', zIndex: 1}}></div>

        <div className="hero-text" style={{maxWidth: '700px', position: 'relative', zIndex: 2}}>
          <h1 style={{fontSize: '56px', fontWeight: '700', lineHeight: '1.1', marginBottom: '24px'}}>
            Học tập và thăng tiến <br/> sự nghiệp của bạn
          </h1>
          <p style={{fontSize: '20px', marginBottom: '40px', opacity: 0.9}}>
            Học các chứng chỉ trực tuyến từ các trường đại học và công ty hàng đầu thế giới như Google, IBM, Meta.
          </p>
          <div className="hero-buttons" style={{display: 'flex', gap: '16px'}}>
            <button className="btn-join" style={{padding: '16px 32px', fontSize: '18px', fontWeight: 'bold'}} onClick={()=>navigate('/login')}>Tham gia miễn phí</button>
            <button className="btn-login" style={{color: 'black', background: 'rgba(255,255,255,0.9)', borderColor: 'transparent', padding: '16px 32px', fontSize: '18px', fontWeight: 'bold'}} onClick={()=>navigate('/degrees')}>Dành cho doanh nghiệp</button>
          </div>
        </div>
      </section>

      <section className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '48px 20px'}}>
        <nav className="filter-row" aria-label="Lọc khóa học" style={{display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
           <div className="tabs" style={{display: 'flex', gap: '24px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px', flex: '1 1 0%', minWidth: 0}} role="tablist">
             <button className={activeCategory === '' ? 'tab active' : 'tab'} 
                     style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', paddingBottom: '8px', borderBottom: activeCategory === '' ? '2px solid #0056d2' : 'none', flexShrink: 0}}
                     onClick={() => setActiveCategory('')}>
                Tất cả các chủ đề
             </button>
             {categories.map(cat => (
               <button key={cat.id} 
                       className={activeCategory === String(cat.id) ? 'tab active' : 'tab'}
                       style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', paddingBottom: '8px', borderBottom: activeCategory === String(cat.id) ? '2px solid #0056d2' : 'none', flexShrink: 0}}
                       onClick={() => setActiveCategory(String(cat.id))}>
                  {fixText(cat.name)}
               </button>
             ))}
           </div>
           
           <div style={{display: 'flex', gap: '16px'}}>
             <div className="search-box" style={{position: 'relative', width: '250px'}}>
               <input type="text" placeholder="Bạn muốn học gì?" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{width: '100%', padding: '10px 30px 10px 16px', borderRadius: '4px', border: '1px solid #ccc'}} />
               {searchQuery && (
                 <button onClick={() => { setSearchQuery(''); navigate('/'); }} 
                         style={{position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#888', padding: '0 4px'}}
                         aria-label="Xóa tìm kiếm">
                   &times;
                 </button>
               )}
             </div>
             
             <div className="sort-box" style={{position: 'relative', width: '200px'}}>
               <select 
                  value={ordering} 
                  onChange={e => setOrdering(e.target.value)}
                  style={{width: '100%', padding: '10px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer'}}
               >
                 <option value="">Sắp xếp mặc định</option>
                 <option value="-created_at">Mới nhất</option>
                 <option value="price">Giá: Thấp đến cao</option>
                 <option value="-price">Giá: Cao đến thấp</option>
                 <option value="-rating_avg">Đánh giá cao nhất</option>
               </select>
             </div>
           </div>
        </nav>

        {/* ADVANCED FILTERS */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: showFilters ? '#0056D2' : '#f3f4f6', color: showFilters ? '#fff' : '#374151', border: 'none', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
          >
            🔍 Bộ lọc nâng cao {showFilters ? '▲' : '▼'}
          </button>
          {showFilters && (
            <div style={{ marginTop: 16, padding: 24, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Trình độ</label>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 14 }}>
                  <option value="">Tất cả trình độ</option>
                  <option value="Tất cả trình độ">Tất cả các trình độ</option>
                  <option value="Người mới">Beginner (Người mới bắt đầu)</option>
                  <option value="Trung cấp">Intermediate (Trung cấp)</option>
                </select>
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giá từ (₫)</label>
                <input type="number" placeholder="0" value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giá đến (₫)</label>
                <input type="number" placeholder="10,000,000" value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Đánh giá tối thiểu</label>
                <select value={filterRating} onChange={e => setFilterRating(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 14 }}>
                  <option value="">Tất cả</option>
                  <option value="4.5">★★★★★ 4.5+</option>
                  <option value="4.0">★★★★ 4.0+</option>
                  <option value="3.5">★★★ 3.5+</option>
                  <option value="3.0">★★★ 3.0+</option>
                </select>
              </div>
              <button
                onClick={() => { setFilterLevel(''); setFilterPriceMin(''); setFilterPriceMax(''); setFilterRating(''); }}
                style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >Xóa bộ lọc</button>
            </div>
          )}
        </div>

        <h2 className="section-title" style={{fontSize: '28px', fontWeight: '700', marginBottom: '32px'}}>Khám phá thế giới tri thức</h2>
        
        {loading ? (
          <div className="course-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px'}}>
            <SkeletonCard count={8} />
          </div>
        ) : (
          <div className="course-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px'}}>
            {courses.length > 0 ? courses.map((course) => {
              const instructorName = fixText(course.partner_name || 'Đại học đối tác');
              
              return (
                <Link to={`/course/${course.id}`} key={course.id} style={{textDecoration: 'none', color: 'inherit'}}>
                  <div className="course-card" style={{border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'}}>
                    {course.original_price && course.original_price > course.price && (
                      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        Giảm {Math.round((1 - course.price / course.original_price) * 100)}%
                      </div>
                    )}
                    <div className="course-thumb" style={{ height: '140px', background: '#e5e7eb', position: 'relative' }}>
                      <img src={getCourseThumbnail(course)} alt={fixText(course.title)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', fontSize: 13, fontWeight: 600 }}>
                        {instructorName}
                      </div>
                    </div>
                    <div className="course-body" style={{padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                      <p style={{fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '4px'}}>
                        {course.faculty ? `${course.faculty} - ${instructorName}` : instructorName}
                      </p>
                      <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1f1f1f'}}>
                        {course.subject_code && <span style={{color: '#0056d2', marginRight: '6px'}}>[{course.subject_code}]</span>}
                        {fixText(course.title)}
                      </h3>
                      <p style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>{course.skills || 'AI, Phân tích dữ liệu, Code...'}</p>
                      
                      <div style={{marginTop: 'auto'}}>
                        <div className="rating" style={{fontSize: '13px'}}>⭐⭐⭐⭐⭐ {course.rating_avg} ({course.num_reviews?.toLocaleString()})</div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px'}}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {course.original_price && course.original_price > course.price && (
                              <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#888' }}>
                                {parseFloat(course.original_price).toLocaleString('vi-VN')} đ
                              </span>
                            )}
                            <span style={{fontSize: '16px', fontWeight: '700', color: '#0056d2'}}> 
                              {course.price > 0 ? `${parseFloat(course.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'} 
                            </span>
                          </div>
                          <button onClick={(e) => addToCart(e, course.id)} 
                                  aria-label={`Thêm ${fixText(course.title)} vào giỏ hàng`}
                                  style={{background: addingId === course.id ? '#ddd' : '#0056d2', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                            {addingId === course.id ? '...' : '+ Thêm'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#666'}}>
                <h3>Không tìm thấy khóa học nào phù hợp.</h3>
                <p>Hãy thử tìm kiếm với từ khóa khác.</p>
              </div>
            )}
          </div>
        )}
      </section>
      {toast && <div className="toast" role="alert" aria-live="assertive">{toast}</div>}
    </main>
  );
}
