import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import InstructorSidebar from '../components/InstructorSidebar';
import '../assets/instructor-dashboard.css';

const InstructorCourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCourse, setActiveCourse] = useState(null);
    const [annMsg, setAnnMsg] = useState({ title: '', content: '' });

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/instructor-courses/');
            setCourses(res.data.results || res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const submitForReview = async (courseId) => {
        if (!window.confirm('Sau khi gửi duyệt, bạn sẽ không thể chỉnh sửa nội dung cho đến khi có kết quả. Bạn có chắc không?')) return;
        try {
            await api.post(`/courses/instructor-courses/${courseId}/submit_review/`);
            alert('Đã gửi yêu cầu phê duyệt thành công!');
            fetchCourses();
        } catch (error) {
            alert('Lỗi: Không thể gửi yêu cầu.');
        }
    };

    const sendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/courses/instructor-courses/${activeCourse.id}/send_announcement/`, annMsg);
            alert('Thông báo đã được gửi thành công!');
            setActiveCourse(null);
            setAnnMsg({ title: '', content: '' });
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi thông báo.'));
        }
    };

    const getStatusBadge = (status, reason) => {
        switch(status) {
            case 'published': return <span className="badge badge-published">Đang bán</span>;
            case 'pending': return <span className="badge" style={{background: '#fef3c7', color: '#d97706'}}>🕒 Chờ duyệt</span>;
            case 'rejected': return (
                <span className="badge" style={{background: '#fee2e2', color: '#dc2626', cursor: 'help'}} title={`Lý do: ${reason || 'Không rõ'}`}>
                    ❌ Bị từ chối
                </span>
            );
            default: return <span className="badge badge-draft">Bản nháp</span>;
        }
    };

    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Tất cả khóa học</h1>
                        <p style={{color: '#64748b'}}>Quản lý {courses.length} khóa học và luồng phê duyệt nội dung.</p>
                    </div>
                    <Link to="/instructor/create-course" className="btn-create-course">
                        + Tạo khóa học mới
                    </Link>
                </header>

                <div className="content-card">
                    <div style={{marginBottom: '20px'}}>
                        <input 
                            type="text" placeholder="Tìm kiếm khóa học..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>

                    {loading ? (
                        <p>Đang tải danh sách...</p>
                    ) : (
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>Khóa học</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Trạng thái phê duyệt</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map(course => (
                                    <tr key={course.id}>
                                        <td>
                                            <div className="course-info">
                                                <img src={course.image || 'https://via.placeholder.com/150'} alt="" className="course-img" />
                                                <span style={{fontWeight: 600}}>{course.title}</span>
                                            </div>
                                        </td>
                                        <td>{course.category?.name || 'Chưa phân loại'}</td>
                                        <td>{Number(course.price).toLocaleString()}₫</td>
                                        <td>{getStatusBadge(course.status, course.rejection_reason)}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                                <Link to={`/instructor/course/${course.id}/curriculum`} style={{textDecoration: 'none', color: '#0056d2', fontWeight: 600}}>✏️ Sửa bài</Link>
                                                
                                                {course.status === 'draft' && (
                                                    <button 
                                                        onClick={() => submitForReview(course.id)}
                                                        style={{background: '#0ea5e9', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem'}}
                                                    >
                                                        🚀 Gửi duyệt
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => setActiveCourse(course)}
                                                    style={{background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer'}}
                                                >
                                                    📢 Thông báo
                                                </button>
                                                <Link to={`/course/${course.id}`} target="_blank" style={{textDecoration: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.85rem'}}>👁️ Review</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* MODAL GỬI THÔNG BÁO (Giữ nguyên logic cũ) */}
                {activeCourse && (
                    <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div className="content-card" style={{width: '100%', maxWidth: '500px', padding: '30px'}}>
                            <h3>Gửi thông báo tới học viên</h3>
                            <form onSubmit={sendAnnouncement}>
                                <input type="text" required value={annMsg.title} onChange={(e) => setAnnMsg({...annMsg, title: e.target.value})} style={{width: '100%', padding: '10px', marginBottom: '15px'}} placeholder="Tiêu đề" />
                                <textarea required rows="5" value={annMsg.content} onChange={(e) => setAnnMsg({...annMsg, content: e.target.value})} style={{width: '100%', padding: '10px', marginBottom: '20px'}} placeholder="Nội dung..."></textarea>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                    <button type="button" onClick={() => setActiveCourse(null)}>Hủy</button>
                                    <button type="submit" className="btn-create-course">Gửi ngay</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InstructorCourseList;
