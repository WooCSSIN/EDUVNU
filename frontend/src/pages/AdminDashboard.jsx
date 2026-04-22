import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ pending: 0, published: 0, users: 0, revenue: 0, contacts: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            // Lấy tất cả khóa học để phân loại theo tab
            const res = await api.get('/courses/admin-courses/');
            const allCourses = res.data.results || res.data;
            setCourses(allCourses);
            
            const msgRes = await api.get('/courses/contact/');
            const allMessages = msgRes.data.results || msgRes.data;
            setMessages(allMessages.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));

            // Tính toán stats sơ bộ (Trong thực tế nên có 1 API stats riêng)
            setStats({
                pending: allCourses.filter(c => c.status === 'pending').length,
                published: allCourses.filter(c => c.status === 'published').length,
                users: 1250, // Mock
                revenue: 45800000, // Mock
                contacts: allMessages.length
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/courses/admin-courses/${id}/approve/`);
            alert('✅ Phê duyệt thành công!');
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi phê duyệt.'); }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/courses/admin-courses/${selectedCourse.id}/reject/`, { reason: rejectionReason });
            alert('❌ Đã từ chối khóa học.');
            setShowRejectModal(false);
            setRejectionReason('');
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi thực thi.'); }
    };

    const filteredCourses = courses.filter(c => {
        if (activeTab === 'all') return true;
        return c.status === activeTab;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            
            {/* SIDEBAR ADMIN (GIAO DIỆN PREMIUM DARK) */}
            <aside style={{ width: '280px', background: '#1e293b', borderRight: '1px solid #334155', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <img src="/course_images/eduvn.png" alt="Logo" style={{ height: '60px', filter: 'brightness(0) invert(1)', transform: 'scale(1.5)' }} />
                    <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '2px', fontWeight: 800 }}>ADMIN CONTROL</div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px 20px', borderRadius: '12px', background: '#334155', cursor: 'pointer', fontWeight: 600 }}>Dashboard</div>
                    <div style={{ padding: '12px 20px', borderRadius: '12px', color: '#94a3b8', cursor: 'not-allowed' }}>Quản lý người dùng</div>
                    <div style={{ padding: '12px 20px', borderRadius: '12px', color: '#94a3b8', cursor: 'not-allowed' }}>Giao dịch tài chính</div>
                    <div style={{ padding: '12px 20px', borderRadius: '12px', color: '#94a3b8', cursor: 'not-allowed' }}>Cài đặt hệ thống</div>
                </nav>

                <button onClick={() => navigate('/')} style={{ marginTop: 'auto', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                   ← Thoát Admin
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>Giám sát Hệ thống</h1>
                        <p style={{ color: '#94a3b8', marginTop: '5px' }}>Dữ liệu thời gian thực được cập nhật từ SSMS.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Phiên đăng nhập</div>
                            <div style={{ fontWeight: 700 }}>Root Admin VNU</div>
                        </div>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💎</div>
                    </div>
                </header>

                {/* STATS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '25px', marginBottom: '40px' }}>
                    {[
                        { label: 'Chờ phê duyệt', value: stats.pending, color: '#f59e0b', icon: '🕒' },
                        { label: 'Đang hoạt động', value: stats.published, color: '#10b981', icon: '🚀' },
                        { label: 'Học viên VNU', value: stats.users, color: '#3b82f6', icon: '👥' },
                        { label: 'Doanh thu EduHub', value: `${(stats.revenue / 1000000).toFixed(1)}M`, color: '#ec4899', icon: '💰' }
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '25px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>{s.icon}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, marginTop: '10px' }}>{s.value}</div>
                        </div>
                    ))}
                    <div style={{ padding: '25px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                        <div className="admin-stat-card">
                            <span style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}>✉️</span>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Yêu cầu hỗ trợ</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.contacts}</div>
                        </div>
                    </div>
                </div>

                {/* TABS & FILTER */}
                <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #334155', marginBottom: '30px' }}>
                    {[
                        { id: 'pending', label: 'Hàng chờ duyệt' },
                        { id: 'published', label: 'Đã xuất bản' },
                        { id: 'rejected', label: 'Đã từ chối' },
                        { id: 'contact', label: 'Yêu cầu hỗ trợ' },
                        { id: 'all', label: 'Tất cả' }
                    ].map(tab => (
                        <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: '15px 5px', cursor: 'pointer', fontWeight: 700,
                            color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                            borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                            transition: 'all 0.3s'
                        }}>{tab.label}</div>
                    ))}
                </div>

                {/* LIST CONTENT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', color: '#475569' }}>
                            <div style={{ fontSize: '4rem' }}>🏖️</div>
                            <p>Mục này hiện đang trống.</p>
                        </div>
                    ) : activeTab === 'contact' ? (
                        messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#475569' }}>
                                <div style={{ fontSize: '4rem' }}>📭</div>
                                <p>Không có yêu cầu hỗ trợ nào.</p>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} style={{
                                    padding: '25px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                                    display: 'flex', flexDirection: 'column', gap: '15px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff' }}>{msg.subject || 'Không có tiêu đề'}</h3>
                                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                <span>👤 {msg.name}</span>
                                                <span style={{ color: '#3b82f6' }}>✉️ {msg.email}</span>
                                            </div>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {new Date(msg.created_at).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                    <div style={{ color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                                        {msg.message}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <a href={`mailto:${msg.email}?subject=Phản hồi: ${msg.subject}`} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'inline-block' }}>Phản hồi Email</a>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        filteredCourses.map(course => (
                            <div key={course.id} style={{
                                padding: '20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
                                display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s',
                                cursor: 'default'
                            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                
                                <div style={{ position: 'relative' }}>
                                    <img src={course.image || 'https://via.placeholder.com/150'} alt="" style={{ width: '140px', height: '90px', borderRadius: '12px', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: course.status === 'published' ? '#10b981' : '#f59e0b', width: 24, height: 24, borderRadius: '50%', border: '3px solid #1e293b' }}></div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{course.title}</h3>
                                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                        <span>👤 {course.instructor_name || 'Giảng viên VNU'}</span>
                                        <span>🏷️ {course.category?.name}</span>
                                        <span>💰 {Number(course.price).toLocaleString()}₫</span>
                                    </div>
                                    {course.rejection_reason && course.status === 'rejected' && (
                                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#ef4444', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                            Lý do từ chối: {course.rejection_reason}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/course/${course.id}`} target="_blank" style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Review</Link>
                                    
                                    {course.status === 'pending' && (
                                        <>
                                            <button onClick={() => { setSelectedCourse(course); setShowRejectModal(true); }} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #ef4444', background: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>Từ chối</button>
                                            <button onClick={() => handleApprove(course.id)} style={{ padding: '12px 25px', borderRadius: '10px', border: 'none', background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>Duyệt</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* MODAL NHẬP LÝ DO TỪ CHỐI (MODERN STYLE) */}
            {showRejectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '35px', border: '1px solid #334155' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Phản hồi giảng viên</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>Từ chối khóa học: <span style={{ color: '#fff' }}>{selectedCourse?.title}</span></p>
                        
                        <form onSubmit={handleRejectSubmit}>
                            <textarea 
                                required rows="6" 
                                value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Hãy giải thích rõ lý do để giảng viên có thể sửa lại..."
                                style={{ width: '100%', padding: '20px', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', color: '#fff', outline: 'none', resize: 'none' }}
                            ></textarea>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" style={{ padding: '12px 30px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Từ chối khóa học</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
