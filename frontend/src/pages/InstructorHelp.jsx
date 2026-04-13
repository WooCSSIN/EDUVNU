import React from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import '../assets/instructor-dashboard.css';

const InstructorHelp = () => {
    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Hỗ trợ & Hướng dẫn</h1>
                        <p style={{color: '#64748b'}}>Chúng tôi luôn sẵn sàng hỗ trợ bạn thành công trên EduVNU.</p>
                    </div>
                </header>

                <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '30px'}}>
                    <div className="help-content">
                        <h3>Tài liệu hướng dẫn</h3>
                        <div className="stats-grid" style={{gridTemplateColumns: '1fr 1fr', marginTop: '20px'}}>
                            <div className="content-card" style={{cursor: 'pointer', transition: '0.3s'}} onMouseOver={e => e.currentTarget.style.borderColor = '#0056d2'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                                <div style={{fontSize: '2rem', marginBottom: '10px'}}>🎬</div>
                                <h4>Cách quay video bài giảng</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '5px'}}>Hướng dẫn setup ánh sáng, âm thanh và phần mềm quay màn hình.</p>
                            </div>
                            <div className="content-card" style={{cursor: 'pointer', transition: '0.3s'}} onMouseOver={e => e.currentTarget.style.borderColor = '#0056d2'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                                <div style={{fontSize: '2rem', marginBottom: '10px'}}>💰</div>
                                <h4>Tối ưu hóa doanh thu</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '5px'}}>Mẹo thiết lập giá và tham gia các chương trình khuyến mãi của sàn.</p>
                            </div>
                            <div className="content-card" style={{cursor: 'pointer', transition: '0.3s'}} onMouseOver={e => e.currentTarget.style.borderColor = '#0056d2'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                                <div style={{fontSize: '2rem', marginBottom: '10px'}}>📈</div>
                                <h4>Xây dựng thương hiệu cá nhân</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '5px'}}>Cách viết profile giảng viên ấn tượng để thu hút học viên.</p>
                            </div>
                            <div className="content-card" style={{cursor: 'pointer', transition: '0.3s'}} onMouseOver={e => e.currentTarget.style.borderColor = '#0056d2'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                                <div style={{fontSize: '2rem', marginBottom: '10px'}}>🛡️</div>
                                <h4>Bản quyền nội dung</h4>
                                <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '5px'}}>Chính sách bảo vệ video và tài liệu của bạn khỏi việc sao chép lậu.</p>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-help">
                        <div className="content-card" style={{background: '#f8fafc'}}>
                            <h3>Liên hệ hỗ trợ kỹ thuật</h3>
                            <p style={{fontSize: '0.9rem', color: '#64748b', marginTop: '10px', marginBottom: '20px'}}>Nếu gặp vấn đề về upload video hoặc thanh toán, hãy gửi tin nhắn cho chúng tôi.</p>
                            <form>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '5px'}}>Vấn đề của bạn</label>
                                    <select style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
                                        <option>Lỗi upload video</option>
                                        <option>Lỗi thanh toán/rút tiền</option>
                                        <option>Cấp quyền giảng viên</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                                <div style={{marginBottom: '15px'}}>
                                    <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '5px'}}>Mô tả chi tiết</label>
                                    <textarea rows="4" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}></textarea>
                                </div>
                                <button type="button" className="btn-create-course" style={{width: '100%'}}>Gửi yêu cầu</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorHelp;
