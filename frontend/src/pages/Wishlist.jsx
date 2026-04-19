import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import usePageSEO from '../hooks/usePageSEO';
import { getCourseThumbnail } from '../utils/courseImages';
import { fixText } from '../utils/fixEncoding';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageSEO({ title: 'Khóa học yêu thích', description: 'Danh sách các khóa học bạn đã lưu.' });

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await api.get('/courses/wishlist/my_wishlist/');
      setWishlist(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeWishlist = async (courseId) => {
    try {
      await api.post(`/courses/courses/${courseId}/toggle_wishlist/`);
      setWishlist(wishlist.filter(w => w.course.id !== courseId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;
  }

  return (
    <div style={{ background: '#f5f7f9', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>❤️ Khóa học yêu thích</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>Lưu giữ những khóa học bạn quan tâm để học sau.</p>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Danh sách trống</h3>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Bạn chưa lưu khóa học nào vào danh sách yêu thích.</p>
            <Link to="/courses" style={{ padding: '12px 24px', background: '#0056D2', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700 }}>
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {wishlist.map(item => {
              const course = item.course;
              const price = parseFloat(course.price) || 0;
              const rating = parseFloat(course.rating_avg) || 0;
              const title = fixText(course.title);
              
              return (
                <div key={item.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <Link to={`/course/${course.id}`} style={{ display: 'block', height: 160, background: '#f3f4f6', overflow: 'hidden' }}>
                    <img src={getCourseThumbnail(course)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                  </Link>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 12, color: '#0056D2', fontWeight: 700, marginBottom: 8 }}>
                      {fixText(course.category?.name) || 'Khóa học'}
                    </div>
                    <Link to={`/course/${course.id}`} style={{ textDecoration: 'none', color: '#111' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.4 }} className="line-clamp-2">
                        {title}
                      </h3>
                    </Link>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                      {course.instructor?.username || course.partner_name || 'EduVNU'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'auto' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>{rating.toFixed(1)}</span>
                      <span style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>({course.num_reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>
                        {price > 0 ? `${price.toLocaleString('vi-VN')} ₫` : <span style={{ color: '#059669' }}>Miễn phí</span>}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); removeWishlist(course.id); }}
                        style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'background 0.2s' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
