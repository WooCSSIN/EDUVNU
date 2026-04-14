import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import '../assets/instructor-dashboard.css';

const InstructorCourseCurriculum = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals & Form states
    const [showChapterForm, setShowChapterForm] = useState(false);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null); 
    
    const [newChapter, setNewChapter] = useState({ title: '', order: 1 });
    const [newLesson, setNewLesson] = useState({ title: '', video_url: '', content: '', order_number: 1 });

    // Quiz Editor States
    const [quizData, setQuizData] = useState({ title: '', passing_score: 70, questions: [] });
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newChoices, setNewChoices] = useState([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
    ]);

    useEffect(() => {
         
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    async function fetchData() {
        try {
            const courseRes = await api.get(`/courses/instructor-courses/${courseId}/`);
            setCourse(courseRes.data);
            const chaptersRes = await api.get(`/courses/chapters/?course=${courseId}`);
            setChapters(chaptersRes.data.results || chaptersRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching curriculum:", error);
            setLoading(false);
        }
    };

    // --- CHAPTER LOGIC ---
    const handleAddChapter = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/chapters/', { ...newChapter, course: courseId });
            setNewChapter({ title: '', order: chapters.length + 1 });
            setShowChapterForm(false);
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi khi thêm chương.'); }
    };

    const handleDeleteChapter = async (id) => {
        if (window.confirm('Xóa chương này sẽ xóa toàn bộ bài học và quiz bên trong. Bạn có chắc không?')) {
            // eslint-disable-next-line no-unused-vars
            try { await api.delete(`/courses/chapters/${id}/`); fetchData(); } catch (error) { alert('Lỗi khi xóa.'); }
        }
    };

    // --- LESSON LOGIC ---
    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/lessons/', { ...newLesson, course: courseId, chapter: activeChapter.id });
            setNewLesson({ title: '', video_url: '', content: '', order_number: (activeChapter.lessons?.length || 0) + 1 });
            setShowLessonForm(false);
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi khi thêm bài giảng.'); }
    };

    const handleDeleteLesson = async (id) => {
        if (window.confirm('Xóa bài này?')) {
            // eslint-disable-next-line no-unused-vars
            try { await api.delete(`/courses/lessons/${id}/`); fetchData(); } catch (error) { alert('Lỗi khi xóa.'); }
        }
    };

    // --- QUIZ LOGIC ---
    const openQuizManager = (chapter) => {
        setActiveChapter(chapter);
        if (chapter.quiz) {
            setQuizData(chapter.quiz);
        } else {
            setQuizData({ title: `Kiểm tra: ${chapter.title}`, passing_score: 70, questions: [] });
        }
        setShowQuizModal(true);
    };

    const handleSaveQuizBase = async () => {
        try {
            if (activeChapter.quiz) {
                // eslint-disable-next-line no-unused-vars
                const res = await api.patch(`/courses/quizzes/${activeChapter.quiz.id}/`, {
                    title: quizData.title,
                    passing_score: quizData.passing_score
                });
                alert('Đã cập nhật thông tin Quiz!');
            } else {
                const res = await api.post('/courses/quizzes/', {
                    chapter: activeChapter.id,
                    title: quizData.title,
                    passing_score: quizData.passing_score
                });
                 
                activeChapter.quiz = res.data;
                alert('Đã tạo Quiz mới! Bây giờ hãy thêm câu hỏi.');
            }
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi khi lưu Quiz.'); }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!activeChapter.quiz) { alert('Vui lòng lưu thông tin Quiz trước!'); return; }
        try {
            const qRes = await api.post('/courses/questions/', {
                quiz: activeChapter.quiz.id,
                text: newQuestionText,
                order: quizData.questions.length + 1
            });
            
            // Add choices
            for (let choice of newChoices) {
                if (choice.text.trim()) {
                    await api.post('/courses/choices/', {
                        question: qRes.data.id,
                        text: choice.text,
                        is_correct: choice.is_correct
                    });
                }
            }
            
            setNewQuestionText('');
            setNewChoices([
                { text: '', is_correct: true },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
            ]);
            
            // Refresh Quiz Data in Modal
            const updatedQuiz = await api.get(`/courses/quizzes/${activeChapter.quiz.id}/`);
            setQuizData(updatedQuiz.data);
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert('Lỗi khi thêm câu hỏi.'); }
    };

    if (loading) return <div className="instructor-container"><p style={{margin: 'auto'}}>Đang nạp cấu trúc chương trình...</p></div>;

    return (
        <div className="instructor-container" style={{background: '#f1f5f9'}}>
            <div style={{width: '100%', maxWidth: '1000px', margin: '40px auto', padding: '0 20px'}}>
                <header style={{marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Link to="/instructor" style={{fontSize: '0.9rem', color: '#64748b', textDecoration: 'none'}}>← Quay lại Dashboard</Link>
                        <h1 style={{marginTop: '10px'}}>Biên soạn: <span style={{color: '#0056d2'}}>{course?.title}</span></h1>
                    </div>
                    <button className="btn-create-course" onClick={() => setShowChapterForm(true)}>+ Thêm chương mới</button>
                </header>

                {/* FORM THÊM CHƯƠNG */}
                {showChapterForm && (
                    <div className="content-card" style={{marginBottom: '30px', border: '2px solid #0056d2'}}>
                        <h3>🆕 Tạo chương mới</h3>
                        <form onSubmit={handleAddChapter} style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                            <input 
                                type="text" placeholder="Tiêu đề chương" required
                                value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})}
                                style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                            />
                            <button type="submit" className="btn-create-course">Lưu chương</button>
                            <button type="button" onClick={() => setShowChapterForm(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>Hủy</button>
                        </form>
                    </div>
                )}

                <div className="curriculum-builder">
                    {chapters.length === 0 ? (
                        <div className="content-card" style={{textAlign: 'center', padding: '60px'}}><p style={{color: '#64748b'}}>Khóa học trống.</p></div>
                    ) : (
                        chapters.map((chapter, idx) => (
                            <div key={chapter.id} className="content-card" style={{marginBottom: '20px', padding: '0'}}>
                                <div style={{
                                    padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0'
                                }}>
                                    <div>
                                        <span style={{fontWeight: 800, color: '#0056d2', marginRight: '10px'}}>CHƯƠNG {idx + 1}:</span>
                                        <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{chapter.title}</span>
                                    </div>
                                    <div style={{display: 'flex', gap: '15px'}}>
                                        <button onClick={() => openQuizManager(chapter)} style={{background: '#e0f2fe', border: 'none', color: '#0369a1', padding: '5px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'}}>
                                            {chapter.quiz ? '📝 Edit Quiz' : '➕ Add Quiz'}
                                        </button>
                                        <button onClick={() => { setActiveChapter(chapter); setShowLessonForm(true); }} style={{background: 'none', border: 'none', color: '#059669', fontWeight: 600, cursor: 'pointer'}}>+ Thêm bài học</button>
                                        <button onClick={() => handleDeleteChapter(chapter.id)} style={{background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer'}}>🗑️</button>
                                    </div>
                                </div>

                                <div style={{padding: '20px'}}>
                                    {(chapter.lessons || []).length === 0 && !chapter.quiz ? (
                                        <p style={{fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', margin: 0}}>Trống.</p>
                                    ) : (
                                        <>
                                            {chapter.lessons.map((lesson, lIdx) => (
                                                <div key={lesson.id} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '8px'}}>
                                                    <div><span style={{width: '24px', color: '#64748b'}}>{lIdx + 1}.</span> {lesson.title}</div>
                                                    <button onClick={() => handleDeleteLesson(lesson.id)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'}}>Xóa</button>
                                                </div>
                                            ))}
                                            {chapter.quiz && (
                                                <div style={{padding: '12px 15px', background: '#f0f9ff', color: '#0369a1', borderRadius: '8px', border: '1px dashed #0ea5e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                    <span>📊 <b>Quiz:</b> {chapter.quiz.title} ({chapter.quiz.questions?.length || 0} câu hỏi)</span>
                                                    <span style={{fontSize: '0.8rem', background: '#fff', padding: '2px 8px', borderRadius: '10px'}}>Passing: {chapter.quiz.passing_score}%</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* MODAL THÊM BÀI HỌC */}
                {showLessonForm && (
                    <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div className="content-card" style={{width: '100%', maxWidth: '600px', padding: '30px'}}>
                            <h2>Thêm bài học mới</h2>
                            <form onSubmit={handleAddLesson}>
                                <div style={{marginBottom: '15px'}}><label>Tiêu đề</label><input type="text" required style={{width: '100%', padding: '10px'}} value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} /></div>
                                <div style={{marginBottom: '15px'}}><label>Video URL</label><input type="text" style={{width: '100%', padding: '10px'}} value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} /></div>
                                <div style={{marginBottom: '20px'}}><label>Nội dung</label><textarea rows="4" style={{width: '100%', padding: '10px'}} value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})}></textarea></div>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}><button type="button" onClick={() => setShowLessonForm(false)}>Hủy</button><button type="submit" className="btn-create-course">Lưu</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL QUẢN LÝ QUIZ (Siêu Modal) */}
                {showQuizModal && (
                    <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div className="content-card" style={{width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '30px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2>⚙️ Quản lý Quiz: {activeChapter?.title}</h2>
                                <button onClick={() => setShowQuizModal(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>
                            </div>

                            <section style={{background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px'}}>
                                <h4 style={{marginBottom: '15px'}}>1. Thông tin cơ bản</h4>
                                <div style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                                    <div style={{flex: 2}}>
                                        <label>Tiêu đề Quiz</label>
                                        <input type="text" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} style={{width: '100%', padding: '10px', marginTop: '5px'}} />
                                    </div>
                                    <div style={{flex: 1}}>
                                        <label>Điểm đạt (%)</label>
                                        <input type="number" value={quizData.passing_score} onChange={e => setQuizData({...quizData, passing_score: e.target.value})} style={{width: '100%', padding: '10px', marginTop: '5px'}} />
                                    </div>
                                    <button onClick={handleSaveQuizBase} className="btn-create-course">Lưu cấu hình</button>
                                </div>
                            </section>

                            <section>
                                <h4 style={{marginBottom: '15px'}}>2. Danh sách câu hỏi ({quizData.questions?.length || 0})</h4>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px'}}>
                                    {quizData.questions?.map((q, idx) => (
                                        <div key={q.id} style={{padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px'}}>
                                            <div style={{fontWeight: 600}}>Câu {idx + 1}: {q.text}</div>
                                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
                                                {q.choices?.map(c => (
                                                    <div key={c.id} style={{fontSize: '0.85rem', color: c.is_correct ? '#059669' : '#64748b'}}>
                                                        {c.is_correct ? '✅' : '⚪'} {c.text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px'}}>
                                    <h5 style={{marginBottom: '15px'}}>➕ Thêm câu hỏi mới</h5>
                                    <form onSubmit={handleAddQuestion}>
                                        <input type="text" placeholder="Nội dung câu hỏi..." required value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                                            {newChoices.map((choice, index) => (
                                                <div key={index} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <input type="radio" name="correct_choice" checked={choice.is_correct} onChange={() => {
                                                        const updated = newChoices.map((c, i) => ({ ...c, is_correct: i === index }));
                                                        setNewChoices(updated);
                                                    }} />
                                                    <input type="text" placeholder={`Đáp án ${index + 1}`} value={choice.text} onChange={e => {
                                                        const updated = [...newChoices];
                                                        updated[index].text = e.target.value;
                                                        setNewChoices(updated);
                                                    }} style={{flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0'}} />
                                                </div>
                                            ))}
                                        </div>
                                        <button type="submit" className="btn-create-course" style={{width: '100%'}}>Xác nhận thêm câu hỏi</button>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorCourseCurriculum;
