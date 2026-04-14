import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import InstructorSidebar from '../components/InstructorSidebar';
import '../assets/instructor-dashboard.css';

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // API lấy danh sách học viên thật
                const res = await api.get('/courses/instructor-courses/my_students/');
                setStudents(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching students:", error);
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Quản lý học viên</h1>
                        <p style={{color: '#64748b'}}>Theo dõi tiến độ và tương tác với các học viên của bạn.</p>
                    </div>
                </header>

                <div className="content-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <div className="crs-search" style={{width: '300px', background: '#f8fafc'}}>
                            <span className="crs-search-icon">🔍</span>
                            <input type="text" placeholder="Tìm tên học viên..." style={{border: 'none', background: 'transparent', width: '100%', padding: '8px'}} />
                        </div>
                    </div>

                    <table className="course-table">
                        <thead>
                            <tr>
                                <th>Học viên</th>
                                <th>Khóa học</th>
                                <th>Ngày tham gia</th>
                                <th>Tiến độ học tập</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <div style={{width: '32px', height: '32px', background: '#0056d2', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontSize: '0.8rem'}}>
                                                {s.student_name[0]}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 600}}>{s.student_name}</div>
                                                <div style={{fontSize: '0.75rem', color: '#64748b'}}>{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{s.course_title}</td>
                                    <td>{new Date(s.enrolled_at).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div style={{width: '100%', background: '#e2e8f0', borderRadius: '10px', height: '8px', position: 'relative'}}>
                                            <div style={{width: `${s.progress}%`, background: s.progress === 100 ? '#10b981' : '#0056d2', height: '100%', borderRadius: '10px'}}></div>
                                            <span style={{fontSize: '0.7rem', position: 'absolute', right: 0, top: '-15px'}}>{s.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button style={{background: 'none', border: 'none', color: '#0056d2', cursor: 'pointer', fontWeight: 600}}>💬 Nhắn tin</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default InstructorStudents;
