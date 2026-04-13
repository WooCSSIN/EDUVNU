import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import InstructorSidebar from '../components/InstructorSidebar';
import '../assets/instructor-dashboard.css';

const InstructorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyMap, setReplyMap] = useState({});

    const fetchReviews = async () => {
        try {
            const res = await api.get('/courses/instructor-courses/my_reviews/');
            setReviews(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReply = async (reviewId) => {
        const reply = replyMap[reviewId];
        if (!reply) return;

        try {
            await api.post(`/courses/reviews/${reviewId}/reply/`, { reply });
            alert('Đã gửi phản hồi!');
            setReplyMap({ ...replyMap, [reviewId]: '' });
            fetchReviews();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi phản hồi.'));
        }
    };

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Đánh giá & Phản hồi</h1>
                        <p style={{color: '#64748b'}}>Lắng nghe ý kiến của học viên để hoàn thiện khóa học.</p>
                    </div>
                </header>

                <div className="reviews-list">
                    {loading ? <p>Đang tải...</p> : (
                        reviews.map(rev => (
                            <div key={rev.id} className="content-card" style={{marginBottom: '20px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <div style={{fontWeight: 700, marginRight: '10px'}}>{rev.user}</div>
                                        <div style={{color: '#f59e0b'}}>
                                            {'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}
                                        </div>
                                    </div>
                                    <div style={{fontSize: '0.85rem', color: '#64748b'}}>{new Date(rev.created_at).toLocaleDateString('vi-VN')}</div>
                                </div>
                                <div style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '10px'}}>Khóa học: <span style={{color: '#1e293b', fontWeight: 600}}>{rev.course_title || 'Khóa học'}</span></div>
                                <p style={{lineHeight: 1.6}}>{rev.comment}</p>
                                
                                {rev.instructor_reply && (
                                    <div style={{marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0056d2'}}>
                                        <div style={{fontWeight: 600, fontSize: '0.85rem', marginBottom: '5px'}}>Bạn đã phản hồi:</div>
                                        <p style={{fontSize: '0.9rem', color: '#475569'}}>{rev.instructor_reply}</p>
                                    </div>
                                )}

                                {!rev.instructor_reply && (
                                    <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9'}}>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            <input 
                                                type="text" 
                                                placeholder="Nhập phản hồi của bạn..."
                                                value={replyMap[rev.id] || ''}
                                                onChange={(e) => setReplyMap({...replyMap, [rev.id]: e.target.value})}
                                                style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none'}}
                                            />
                                            <button 
                                                onClick={() => handleReply(rev.id)}
                                                style={{padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0056d2', color: 'white', fontWeight: 600, cursor: 'pointer'}}
                                            >
                                                Gửi
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default InstructorReviews;
