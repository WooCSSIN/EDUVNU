import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText, parseMetadata } from '../utils/fixEncoding';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses/categories/').then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (activeCategory) params.append('category', activeCategory);
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
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thêm.');
    } finally { setAddingId(null); }
  };

  return (
    <div className="home-wrapper">
      {/* COURSERA STYLE HERO */}
      <section className="hero-section" style={{background: '#00255b', color: 'white', padding: '100px 64px'}}>
        <div className="hero-text" style={{maxWidth: '700px'}}>
          <h1 style={{fontSize: '56px', fontWeight: '700', lineHeight: '1.1', marginBottom: '24px'}}>
            Học tập và thăng tiến <br/> sự nghiệp của bạn
          </h1>
          <p style={{fontSize: '20px', marginBottom: '40px', opacity: 0.9}}>
            Học các chứng chỉ trực tuyến từ các trường đại học và công ty hàng đầu thế giới như Google, IBM, Meta.
          </p>
          <div className="hero-buttons" style={{display: 'flex', gap: '16px'}}>
            <button className="btn-join" style={{padding: '16px 32px', fontSize: '18px'}}>Tham gia miễn phí</button>
            <button className="btn-login" style={{color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px'}}>Dành cho doanh nghiệp</button>
          </div>
        </div>
      </section>

      <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '48px 20px'}}>
        <div className="filter-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
           <div className="tabs" style={{display: 'flex', gap: '24px'}}>
             <button className={activeCategory === '' ? 'tab active' : 'tab'} 
                     style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', paddingBottom: '8px', borderBottom: activeCategory === '' ? '2px solid #0056d2' : 'none'}}
                     onClick={() => setActiveCategory('')}>
                Tất cả các chủ đề
             </button>
             {categories.slice(0, 4).map(cat => (
               <button key={cat.id} 
                       className={activeCategory === String(cat.id) ? 'tab active' : 'tab'}
                       style={{border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', paddingBottom: '8px', borderBottom: activeCategory === String(cat.id) ? '2px solid #0056d2' : 'none'}}
                       onClick={() => setActiveCategory(String(cat.id))}>
                  {fixText(cat.name)}
               </button>
             ))}
           </div>
           
           <div className="search-box" style={{position: 'relative', width: '300px'}}>
             <input type="text" placeholder="Tìm kiếm chứng chỉ..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{width: '100%', padding: '12px 16px', borderRadius: '4px', border: '1px solid #ccc'}} />
           </div>
        </div>

        <h2 className="section-title" style={{fontSize: '28px', fontWeight: '700', marginBottom: '32px'}}>Khám phá thế giới tri thức</h2>
        
        {loading ? (
          <div style={{textAlign: 'center', padding: '100px'}}>
            <p>Đang tải thư viện khóa học chuyên nghiệp... ⏳</p>
          </div>
        ) : (
          <div className="course-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px'}}>
            {courses.length > 0 ? courses.map((course) => {
              const instructorName = fixText(course.partner_name || 'Đại học đối tác');
              
              return (
                <Link to={`/course/${course.id}`} key={course.id} style={{textDecoration: 'none', color: 'inherit'}}>
                  <div className="course-card" style={{border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div className="univ-strip" style={{padding: '16px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'center'}}>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Deeplearning.ai_logo.png/600px-Deeplearning.ai_logo.png" style={{height: '32px', opacity: 0.6}} alt="partner" />
                    </div>
                    <div className="course-body" style={{padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                      <p style={{fontSize: '12px', color: '#666', fontWeight: '600', marginBottom: '4px'}}>{instructorName}</p>
                      <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#1f1f1f'}}>{fixText(course.title)}</h3>
                      <p style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>{course.skills || 'AI, Phân tích dữ liệu, Code...'}</p>
                      
                      <div style={{marginTop: 'auto'}}>
                        <div className="rating" style={{fontSize: '13px'}}>⭐⭐⭐⭐⭐ {course.rating_avg} ({course.num_reviews?.toLocaleString()})</div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px'}}>
                          <span style={{fontSize: '14px', fontWeight: '600', color: '#0056d2'}}> {course.price > 0 ? `${parseFloat(course.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'} </span>
                          <button onClick={(e) => addToCart(e, course.id)} 
                                  style={{background: addingId === course.id ? '#ddd' : '#0056d2', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer'}}>
                            {addingId === course.id ? '...' : '+'}
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
      </div>
    </div>
  );
}
