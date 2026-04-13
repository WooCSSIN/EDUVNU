import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const InstructorSidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { path: '/instructor', label: 'Tổng quan', icon: '📊' },
        { path: '/instructor/courses', label: 'Khóa học của tôi', icon: '📚' },
        { path: '/instructor/students', label: 'Học viên', icon: '👥' },
        { path: '/instructor/reviews', label: 'Đánh giá', icon: '⭐' },
        { path: '/instructor/analytics', label: 'Phân tích', icon: '📈' },
        { path: '/instructor/finance', label: 'Thu nhập', icon: '💰' },
        { path: '/instructor/settings', label: 'Cài đặt', icon: '⚙️' },
        { path: '/instructor/help', label: 'Hỗ trợ', icon: '❓' },
    ];

    return (
        <aside className="instructor-sidebar">
            <div className="logo-area">
                <h2 style={{fontSize: '1.5rem', fontWeight: 800}}>EduVNU <span style={{fontSize: '0.8rem', color: '#60a5fa'}}>STUDIO</span></h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link 
                                to={item.path} 
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span> 
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <Link to="/" className="sidebar-link"><span className="icon">⬅️</span> <span>Về trang chủ</span></Link>
            </div>
        </aside>
    );
};

export default InstructorSidebar;
