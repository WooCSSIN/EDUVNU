import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import '../assets/instructor-dashboard.css';

const InstructorCreateCourse = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State (Đồng bộ hoàn toàn với Model Course chuyên nghiệp)
    const [formData, setFormData] = useState({
        title: '',
        subject_code: '',
        faculty: '',
        category: '',
        description: '',
        price: 0,
        original_price: 0,
        level: 'Người mới',
        duration: '',
        skills: '',
        objective: '',
        partner_name: ''
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        // Lấy danh mục khóa học
        api.get('/courses/categories/').then(res => setCategories(res.data.results || res.data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        // RÀ SOÁT: Chuyển dữ liệu sang FormData để gửi kèm ảnh
        Object.keys(formData).forEach(key => {
            if (key !== 'category' && formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        
        if (image) data.append('image', image);
        if (formData.category) data.append('category_id', formData.category);

        try {
            await api.post('/courses/instructor-courses/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Chúc mừng! Khóa học đã được tạo thành công.');
            navigate('/instructor/courses'); // Quay về trang danh sách khóa học
        } catch (error) {
            console.error('Error creating course:', error);
            const serverError = error.response?.data;
            let errorMsg = 'Có lỗi xảy ra khi tạo khóa học.';
            
            if (serverError) {
                // Nếu server trả về lỗi chi tiết (vd: {title: ["Trường này là bắt buộc"]})
                errorMsg = Object.entries(serverError)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
            }
            
            alert(`Lỗi hệ thống:\n${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instructor-container" style={{background: '#f1f5f9'}}>
            <div style={{width: '100%', maxWidth: '900px', margin: '40px auto', padding: '0 20px'}}>
                <header style={{marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Link to="/instructor" className="crs-nav-link" style={{fontSize: '0.9rem'}}>← Quay lại Dashboard</Link>
                        <h1 style={{marginTop: '10px'}}>Tạo khóa học mới</h1>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <span style={{color: '#64748b', fontSize: '0.9rem'}}>Bước {step} / 3</span>
                    </div>
                </header>

                <form className="content-card" style={{padding: '40px'}} onSubmit={handleSubmit}>
                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="form-step slide-in">
                            <h2 style={{marginBottom: '20px'}}>1. Thông tin cơ bản</h2>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Tiêu đề khóa học*</label>
                                <input 
                                    type="text" name="title" required className="crs-input" 
                                    placeholder="Ví dụ: Lập trình Python từ cơ bản đến nâng cao"
                                    value={formData.title} onChange={handleChange}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                />
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Mã môn học (VNU)</label>
                                    <input 
                                        type="text" name="subject_code" className="crs-input" placeholder="VD: INT3117"
                                        value={formData.subject_code} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Danh mục</label>
                                    <select 
                                        name="category" className="crs-input" value={formData.category} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Mô tả khóa học</label>
                                <textarea 
                                    name="description" rows="5" className="crs-input" 
                                    placeholder="Nêu bật những gì học viên sẽ nhận được từ khóa học này..."
                                    value={formData.description} onChange={handleChange}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                ></textarea>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <button type="button" className="btn-create-course" onClick={() => setStep(2)}>Tiếp theo →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MEDIA & DETAILS */}
                    {step === 2 && (
                        <div className="form-step slide-in">
                            <h2 style={{marginBottom: '20px'}}>2. Hình ảnh & Chi tiết</h2>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Hình ảnh đại diện (Thumbnail)</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" />
                                <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>Kích thước đề xuất: 1280x720 (16:9)</p>
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Mục tiêu khóa học (Học viên sẽ đạt được gì?)*</label>
                                <textarea 
                                    name="objective" rows="3" className="crs-input" 
                                    placeholder="Ví dụ: Nắm vững kiến thức nền tảng về Python và xây dựng được ứng dụng đầu tay..."
                                    value={formData.objective} onChange={handleChange}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                ></textarea>
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Kỹ năng đạt được (Cách nhau bằng dấu phẩy)*</label>
                                <input 
                                    type="text" name="skills" placeholder="Ví dụ: Python, SQL, Django, Web Dev"
                                    value={formData.skills} onChange={handleChange}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                />
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Cấp độ</label>
                                    <select 
                                        name="level" className="crs-input" value={formData.level} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    >
                                        <option value="Người mới">Người mới</option>
                                        <option value="Trung cấp">Trung cấp</option>
                                        <option value="Chuyên gia">Chuyên gia</option>
                                        <option value="Tất cả trình độ">Tất cả trình độ</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Đối tác / Trường đào tạo (VNU hoặc Đối tác)</label>
                                    <input 
                                        type="text" name="partner_name" placeholder="VD: Google, Stanford, UET-VNU"
                                        value={formData.partner_name} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    />
                                </div>
                            </div>
                            <div style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Thời lượng dự kiến</label>
                                <input 
                                    type="text" name="duration" placeholder="VD: 15 giờ học"
                                    value={formData.duration} onChange={handleChange}
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                />
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <button type="button" style={{background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'}} onClick={() => setStep(1)}>← Quay lại</button>
                                <button type="button" className="btn-create-course" onClick={() => setStep(3)}>Tiếp theo →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PRICING & SUBMIT */}
                    {step === 3 && (
                        <div className="form-step slide-in">
                            <h2 style={{marginBottom: '20px'}}>3. Thiết lập giá</h2>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Giá bán hiện tại (₫)</label>
                                    <input 
                                        type="number" name="price" value={formData.price} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Giá niêm yết (Gốc)</label>
                                    <input 
                                        type="number" name="original_price" value={formData.original_price} onChange={handleChange}
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                                    />
                                </div>
                            </div>
                            <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px'}}>
                                <p style={{fontSize: '0.9rem', color: '#475569'}}>Bằng cách nhấn hoàn tất, khóa học của bạn sẽ được lưu ở trạng thái <b>Bản nháp</b>. Bạn có thể thêm bài học và video ở bước tiếp theo từ Dashboard.</p>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <button type="button" style={{background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'}} onClick={() => setStep(2)}>← Quay lại</button>
                                <button type="submit" className="btn-create-course" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Hoàn tất & Khởi tạo khóa học'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default InstructorCreateCourse;
