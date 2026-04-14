import React, { useState, useEffect } from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import api from '../api/axios';
import '../assets/instructor-dashboard.css';

const InstructorAnalytics = () => {
    const [data, setData] = useState({
        total_hours: 0,
        completion_data: [],
        active_students: 0
    });
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/courses/instructor-courses/detailed_analytics/');
                setData(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);
    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Phân tích & Báo cáo</h1>
                        <p style={{color: '#64748b'}}>Phân tích dữ liệu để hiểu rõ hơn về hành vi của học viên.</p>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="label">Tổng thời lượng học</p>
                        <h2 style={{fontSize: '2rem'}}>{data.total_hours} giờ</h2>
                        <span style={{color: '#10b981'}}>Dữ liệu thời gian thực</span>
                    </div>
                    <div className="stat-card">
                        <p className="label">Học viên đang hoạt động</p>
                        <h2 style={{fontSize: '2rem'}}>{data.active_students}</h2>
                        <span style={{color: '#64748b'}}>Học viên đã ghi danh</span>
                    </div>
                    <div className="stat-card">
                        <p className="label">Đánh giá trung bình</p>
                        <h2 style={{fontSize: '2rem'}}>4.8</h2>
                        <span style={{color: '#0056d2'}}>Điểm uy tín</span>
                    </div>
                </div>

                <div className="content-card" style={{marginTop: '30px'}}>
                    <h3>Tỷ lệ hoàn thành theo khóa học</h3>
                    <div style={{marginTop: '25px'}}>
                        {data.completion_data.length === 0 ? <p>Chưa có dữ liệu học tập.</p> : data.completion_data.map((item, idx) => (
                            <div key={idx} style={{marginBottom: '25px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                    <span style={{fontWeight: 600}}>{item.name} ({item.total_students} SV)</span>
                                    <span style={{fontWeight: 700, color: '#0056d2'}}>{item.rate}%</span>
                                </div>
                                <div style={{width: '100%', background: '#e2e8f0', height: '12px', borderRadius: '10px', overflow: 'hidden'}}>
                                    <div style={{
                                        width: `${item.rate}%`, 
                                        height: '100%', 
                                        background: 'linear-gradient(90deg, #0056d2 0%, #60a5fa 100%)',
                                        borderRadius: '10px'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px'}}>
                    <div className="content-card">
                        <h3>Lưu lượng truy cập theo nguồn</h3>
                        <div style={{marginTop: '15px'}}>
                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <div style={{width: '12px', height: '12px', background: '#0056d2', marginRight: '10px'}}></div>
                                <span>Tìm kiếm tự nhiên: 55%</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <div style={{width: '12px', height: '12px', background: '#60a5fa', marginRight: '10px'}}></div>
                                <span>Mạng xã hội: 25%</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <div style={{width: '12px', height: '12px', background: '#e2e8f0', marginRight: '10px'}}></div>
                                <span>Trực tiếp: 20%</span>
                            </div>
                        </div>
                    </div>
                    <div className="content-card">
                        <h3>Đánh giá theo sao</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '15px'}}>
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <span style={{width: '60px', fontSize: '0.85rem'}}>{star} sao</span>
                                    <div style={{flex: 1, background: '#f1f5f9', height: '8px', borderRadius: '4px'}}>
                                        <div style={{width: star >= 4 ? '80%' : '10%', height: '100%', background: '#f59e0b', borderRadius: '4px'}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorAnalytics;
