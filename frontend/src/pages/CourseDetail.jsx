import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { fixText } from '../utils/fixEncoding';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/courses/${id}/`)
      .then(res => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Đang tải dữ liệu khóa học...</div>;
  if (!course) return <div style={{padding: '100px', textAlign: 'center'}}>Không tìm thấy khóa học này.</div>;

  return (
    <div className="course-detail-page">
      {/* 1. TOP BANNER - DẠNG COURSERA */}
      <section style={{background: '#00255b', color: 'white', padding: '60px 64px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{display: 'flex', gap: '8px', fontSize: '14px', marginBottom: '24px', opacity: 0.8}}>
            <Link to="/" style={{color: 'white'}}>Home</Link> / 
            <span>{course.category?.name || 'Khám phá'}</span> /
            <span>{fixText(course.title)}</span>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{maxWidth: '700px'}}>
              <h1 style={{fontSize: '48px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1'}}>
                {fixText(course.title)}
              </h1>
              <p style={{fontSize: '18px', marginBottom: '24px', opacity: 0.9}}>
                {course.description}
              </p>
              
              <div style={{display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{color: '#ffcc00'}}>⭐⭐⭐⭐⭐</span>
                  <span style={{fontWeight: '700'}}>{course.rating_avg}</span>
                  <span style={{opacity: 0.8}}>({course.num_reviews?.toLocaleString()} reviews)</span>
                </div>
                <div>|</div>
                <div>
                  <span style={{fontWeight: '700'}}>1.250.450</span> đã đăng ký
                </div>
              </div>

              <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Deeplearning.ai_logo.png/600px-Deeplearning.ai_logo.png" 
                     style={{height: '40px', background: 'white', padding: '4px', borderRadius: '4px'}} alt="partner" />
                <span style={{fontSize: '16px'}}>Cung cấp bởi <strong>{course.partner_name || 'EduVNU Partners'}</strong></span>
              </div>
            </div>

            <div style={{background: 'white', color: '#1f1f1f', padding: '24px', borderRadius: '8px', width: '350px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'}}>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Khóa học trực tuyến</p>
              <h2 style={{fontSize: '28px', fontWeight: '700', marginBottom: '16px'}}>
                 {course.price > 0 ? `${parseFloat(course.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
              </h2>
              <button style={{width: '100%', background: '#0056d2', color: 'white', border: 'none', padding: '16px', borderRadius: '4px', fontWeight: '700', fontSize: '18px', cursor: 'pointer', marginBottom: '12px'}}>
                Đăng ký ngay
              </button>
              <p style={{textAlign: 'center', fontSize: '12px', color: '#666'}}>Bắt đầu ngay hôm nay để nhận chứng chỉ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', gap: '48px'}}>
        <div style={{flexGrow: 1}}>
          {/* What you'll learn */}
          <section style={{border: '1px solid #ddd', borderRadius: '8px', padding: '32px', marginBottom: '40px'}}>
             <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '24px'}}>Bạn sẽ học được gì</h2>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                {['Thiết kế và xây dựng mạng nơ-ron.', 'Master các kỹ thuật gỡ lỗi Deep Learning.', 'Xây dựng CNN và RNN.', 'Ứng dụng AI vào thế giới thực.'].map(item => (
                  <div key={item} style={{display: 'flex', gap: '12px'}}>
                    <span style={{color: '#0056d2'}}>✓</span>
                    <span style={{fontSize: '14px'}}>{item}</span>
                  </div>
                ))}
             </div>
          </section>

          {/* About */}
          <section style={{marginBottom: '40px'}}>
             <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '16px'}}>Về chuyên môn này</h2>
             <p style={{color: '#444', lineHeight: '1.7'}}>{course.description}</p>
          </section>

          {/* Skills gained */}
          <section>
             <h2 style={{fontSize: '18px', fontWeight: '700', marginBottom: '16px'}}>Kỹ năng bạn sẽ đạt được</h2>
             <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {(course.skills || 'AI, Python, Data Science').split(',').map(skill => (
                  <span key={skill} style={{background: '#eee', padding: '8px 16px', borderRadius: '20px', fontSize: '13px'}}>
                    {skill.trim()}
                  </span>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
