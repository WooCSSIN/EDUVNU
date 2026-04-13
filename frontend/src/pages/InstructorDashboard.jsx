import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InstructorSidebar from '../components/InstructorSidebar';
import '../assets/instructor-dashboard.css';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [realStats, setRealStats] = useState({ total_courses: 0, total_students: 0, total_revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                // Lấy danh sách khóa học của mình
                const coursesRes = await api.get('/courses/instructor-courses/');
                setCourses(coursesRes.data.results || coursesRes.data);

                // Lấy thống kê thật
                const statsRes = await api.get('/courses/instructor-courses/statistics/');
                setRealStats(statsRes.data);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching instructor data:", error);
                setLoading(false);
            }
        };

        fetchInstructorData();
    }, []);

    // Map dữ liệu thật vào mảng hiển thị
    const statsDisplay = [
        { label: 'Tổng số học viên', value: realStats.total_students.toLocaleString(), change: '+12%', up: true },
        { label: 'Thu nhập thực nhận', value: (realStats.my_earnings || 0).toLocaleString() + '₫', change: '70% hoa hồng', up: true },
        { label: 'Doanh thu tổng', value: (realStats.total_revenue || 0).toLocaleString() + '₫', change: 'Tổng sàn', up: true },
        { label: 'Khóa học của tôi', value: realStats.total_courses, change: 'Active', up: true },
    ];

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            {/* MAIN CONTENT */}
            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Chào buổi sáng, {user?.first_name || user?.username}! 👋</h1>
                        <p style={{color: '#64748b'}}>Đây là những gì đang diễn ra với các khóa học của bạn hôm nay.</p>
                    </div>
                    <Link to="/instructor/create-course" className="btn-create-course">
                        + Tạo khóa học mới
                    </Link>
                </header>

                {/* STATS */}
                <div className="stats-grid">
                    {statsDisplay.map((stat, idx) => (
                        <div key={idx} className="stat-card">
                            <p className="label">{stat.label}</p>
                            <div style={{display: 'flex', alignItems: 'baseline'}}>
                                <span className="value">{stat.value}</span>
                                {stat.change && <span className={`change ${stat.up ? 'up' : ''}`}>{stat.change}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* COURSE LIST */}
                <div className="content-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <h2>Khóa học gần đây</h2>
                        <Link to="/instructor/courses" style={{color: '#0056d2', fontSize: '0.875rem', fontWeight: 600}}>Xem tất cả</Link>
                    </div>
                    
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>Khóa học</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Học viên</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.slice(0, 5).map(course => (
                                    <tr key={course.id}>
                                        <td>
                                            <div className="course-info">
                                                <img src={course.image || 'https://via.placeholder.com/150'} alt="" className="course-img" />
                                                <span style={{fontWeight: 600}}>{course.title}</span>
                                            </div>
                                        </td>
                                        <td>{course.category?.name || 'Chưa phân loại'}</td>
                                        <td>{Number(course.price).toLocaleString()}₫</td>
                                        <td>{course.num_reviews * 10 || 0}</td>
                                        <td>
                                            <span className={`badge ${course.is_active ? 'badge-published' : 'badge-draft'}`}>
                                                {course.is_active ? 'Đang bán' : 'Bản nháp'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link 
                                                to={`/instructor/course/${course.id}/curriculum`}
                                                style={{textDecoration: 'none', color: '#0056d2', fontWeight: 600}}
                                            >
                                                ✏️ Quản lý nội dung
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
