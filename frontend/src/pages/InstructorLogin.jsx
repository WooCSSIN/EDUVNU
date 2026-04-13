import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/instructor-dashboard.css';

const InstructorLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/accounts/token/', credentials);
            const { access, refresh, user_id, is_instructor } = response.data;
            
            if (!is_instructor) {
                setError('Tài khoản này không có quyền truy cập khu vực Giảng viên.');
                setLoading(false);
                return;
            }

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Cập nhật context auth
            await login(credentials.username, credentials.password);
            
            navigate('/instructor');
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
            setLoading(false);
        }
    };

    return (
        <div className="instr-login-page" style={{
            background: 'linear-gradient(135deg, #001e4d 0%, #0056d2 100%)',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div className="content-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '10px'}}>EduVNU <span style={{color: '#60a5fa'}}>Studio</span></h1>
                <p style={{color: '#cbd5e1', marginBottom: '30px'}}>Không gian sáng tạo dành cho Giảng viên</p>

                {error && <div style={{background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem'}}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{textAlign: 'left', marginBottom: '20px'}}>
                        <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#94a3b8'}}>TÊN ĐĂNG NHẬP</label>
                        <input 
                            type="text" name="username" required 
                            value={credentials.username} onChange={handleChange}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                background: 'rgba(255,255,255,0.05)', color: 'white'
                            }}
                        />
                    </div>
                    <div style={{textAlign: 'left', marginBottom: '30px'}}>
                        <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: '#94a3b8'}}>MẬT KHẨU</label>
                        <input 
                            type="password" name="password" required 
                            value={credentials.password} onChange={handleChange}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                background: 'rgba(255,255,255,0.05)', color: 'white'
                            }}
                        />
                    </div>
                    <button 
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '15px', borderRadius: '10px',
                            background: '#fff', color: '#0056d2', fontWeight: 700,
                            border: 'none', cursor: 'pointer', fontSize: '1rem'
                        }}
                    >
                        {loading ? 'Đang xác thực...' : 'VÀO STUDIO'}
                    </button>
                </form>

                <p style={{marginTop: '30px', fontSize: '0.85rem', color: '#94a3b8'}}>
                    Bạn là học viên? <Link to="/login" style={{color: '#fff', textDecoration: 'none', fontWeight: 600}}>Quay lại trang chủ</Link>
                </p>
            </div>
        </div>
    );
};

export default InstructorLogin;
