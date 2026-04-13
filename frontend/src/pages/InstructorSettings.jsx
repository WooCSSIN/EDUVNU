import React, { useState, useEffect } from 'react';
import InstructorSidebar from '../components/InstructorSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/instructor-dashboard.css';

const InstructorSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        expertise: '',
        bankName: '',
        accountNumber: '',
        accountHolder: ''
    });

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                bio: user.bio || '',
                expertise: user.expertise || '',
            }));
            
            // Fetch finance data
            api.get('/courses/instructor-courses/finance_data/')
                .then(res => {
                    if (res.data.bank_info) {
                        setProfile(prev => ({
                            ...prev,
                            bankName: res.data.bank_info.bank_name || '',
                            accountNumber: res.data.bank_info.account_number || '',
                            accountHolder: res.data.bank_info.account_holder || '',
                        }));
                    }
                })
                .catch(err => console.error("Error fetching finance data:", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.patch('/accounts/users/me/', {
                first_name: profile.first_name,
                last_name: profile.last_name,
                bio: profile.bio,
                expertise: profile.expertise
            });
            alert('Thông tin cá nhân đã được cập nhật!');
        } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveWallet = async () => {
        setSaving(true);
        try {
            await api.patch('/courses/instructor-courses/update_finance_data/', {
                bank_name: profile.bankName,
                account_number: profile.accountNumber,
                account_holder: profile.accountHolder
            });
            alert('Thông tin ví đã được cập nhật!');
        } catch (err) {
            console.error(err);
            alert('Cập nhật ví thất bại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="instructor-container"><p>Đang tải dữ liệu...</p></div>;

    return (
        <div className="instructor-container">
            <InstructorSidebar />

            <main className="instructor-main">
                <header className="instructor-header">
                    <div>
                        <h1>Cài đặt hồ sơ</h1>
                        <p style={{color: '#64748b'}}>Quản lý thông tin công khai và thiết lập tài khoản của bạn.</p>
                    </div>
                </header>

                <div className="content-card" style={{maxWidth: '800px'}}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #f1f5f9'}}>
                        <div style={{
                            width: '100px', height: '100px', 
                            background: '#e2e8f0', borderRadius: '50%', 
                            marginRight: '30px', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                        }}>👨‍🏫</div>
                        <div>
                            <button className="btn-create-course" style={{padding: '8px 16px', fontSize: '0.85rem'}}>Thay đổi ảnh đại diện</button>
                            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '10px'}}>Định dạng JPG, PNG. Tối đa 2MB.</p>
                        </div>
                    </div>

                    <form>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                             <div>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Họ</label>
                                <input type="text" className="crs-input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                             </div>
                             <div>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tên</label>
                                <input type="text" className="crs-input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                             </div>
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Lĩnh vực chuyên môn</label>
                            <input type="text" className="crs-input" value={profile.expertise} onChange={e => setProfile({...profile, expertise: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} placeholder="Ví dụ: Python, Web Development..." />
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tiểu sử (Bio)</label>
                            <textarea rows="5" className="crs-input" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}></textarea>
                            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>Thông tin này sẽ hiển thị công khai tại trang chi tiết khóa học.</p>
                        </div>

                        <div style={{textAlign: 'right'}}>
                            <button type="button" className="btn-create-course" disabled={saving} onClick={handleSaveProfile}>
                                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                            </button>
                        </div>
                    </form>

                    <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #f1f5f9'}}>
                        <h3 style={{marginBottom: '20px'}}>💳 Phương thức nhận tiền</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                             <div>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tên ngân hàng</label>
                                <input type="text" className="crs-input" value={profile.bankName} onChange={e => setProfile({...profile, bankName: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                             </div>
                             <div>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Số tài khoản</label>
                                <input type="text" className="crs-input" value={profile.accountNumber} onChange={e => setProfile({...profile, accountNumber: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                             </div>
                             <div style={{gridColumn: 'span 2'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tên chủ tài khoản (In hoa không dấu)</label>
                                <input type="text" className="crs-input" value={profile.accountHolder} onChange={e => setProfile({...profile, accountHolder: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                             </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <button type="button" className="btn-create-course" style={{background: '#10b981'}} disabled={saving} onClick={handleSaveWallet}>
                                {saving ? 'Đang xử lý...' : 'Cập nhật ví'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorSettings;
