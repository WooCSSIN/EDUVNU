import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';
import usePageSEO from '../hooks/usePageSEO';

export default function Learn() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null); // Bài kiểm tra đang làm
  
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Heartbeat: đếm giây đã xem của bài học hiện tại
  const heartbeatSecondsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);

  // Quiz states
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  usePageSEO({
    title: course ? `Đang học: ${fixText(course.title)}` : 'Học tập',
    description: course ? `Bài giảng trực tuyến: ${fixText(course.title)} tại EduVNU` : 'Học tập tại EduVNU',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user, authLoading]);

  async function fetchData() {
    try {
      setLoading(true);
      setErrorStatus(null);

      const isDegree = courseId.startsWith('deg_');
      const realId = isDegree ? courseId.replace('deg_', '') : courseId;

      if (isDegree) {
        // --- LOGIC CHO BẰNG CẤP ---
        const res = await api.get(`/courses/degree-programs/${realId}/`);
        const degData = res.data;
        
        // Map Degree JSON Curriculum to Lesson objects for compatibility
        const allLessons = [];
        const chapters = (degData.curriculum || []).map((mod, mi) => {
          const modLessons = (mod.lessons || []).map((lsTitle, li) => {
            const lesson = {
              id: `${mi}-${li}`, // Key dạng "module-lesson"
              title: lsTitle,
              video_url: degData.videos?.[allLessons.length] || '', // Lấy video theo thứ tự tuyến tính
              content: `Mô tả bài học: ${lsTitle}`
            };
            allLessons.push(lesson);
            return lesson;
          });
          return { id: mi, title: mod.title, lessons: modLessons };
        });

        setCourse({
          ...degData,
          chapters: chapters
        });
        setLessons(allLessons);

        // Lấy tiến độ Degree từ Enrollment.progress_data
        const schedRes = await api.get('/courses/courses/my_schedule/');
        const myDeg = schedRes.data.find(item => item.degree_id == realId);
        
        if (myDeg) {
          const pMap = {};
          (myDeg.completed_keys || []).forEach(key => { pMap[key] = 'completed'; });
          setProgress(pMap);
        } else {
          setErrorStatus(403); // Cần enroll để học
        }

        if (allLessons.length > 0) setActiveLesson(allLessons[0]);

      } else {
        // --- LOGIC CHO KHÓA HỌC (CŨ) ---
        const courseRes = await api.get(`/courses/courses/${courseId}/`);
        const courseData = courseRes.data;
        setCourse(courseData);

        await api.get(`/courses/courses/${courseId}/lessons/`);

        const progressRes = await api.get(
          `/courses/progress/my_progress/?course_id=${courseId}`
        ).catch(() => ({ data: [] }));

        const allLessons = [];
        (courseData.chapters || []).forEach(chapter => {
          allLessons.push(...chapter.lessons);
        });
        setLessons(allLessons);

        const pMap = {};
        (progressRes.data || []).forEach(p => { pMap[p.lesson] = p.status; });
        setProgress(pMap);

        if (allLessons.length > 0) setActiveLesson(allLessons[0]);
      }
    } catch (err) {
      setErrorStatus(err.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  // Fix #6: Heartbeat — reset bộ đếm mỗi khi đổi bài học
  useEffect(() => {
    heartbeatSecondsRef.current = 0;
  }, [activeLesson]);

  // Fix #6: Gửi heartbeat mỗi 30 giây khi đang xem bài học
  useEffect(() => {
    if (!activeLesson) return;
    
    // Tạm thời tắt heartbeat cho Degree (tránh lỗi lesson_id không hợp lệ)
    if (courseId.startsWith('deg_')) return;

    heartbeatIntervalRef.current = setInterval(async () => {
      heartbeatSecondsRef.current += 30;
      try {
        await api.post('/courses/progress/heartbeat/', {
          lesson_id: activeLesson.id,
          seconds: 30,
        });
      } catch (e) {
        // Silent fail — buffer sẽ được flush sau
        console.warn('Heartbeat failed:', e?.response?.status);
      }
    }, 30000);
    return () => clearInterval(heartbeatIntervalRef.current);
  }, [activeLesson, courseId]);

  const markCompleted = useCallback(async () => {
    if (!activeLesson || markingDone) return;
    try {
      setMarkingDone(true);
      const isDegree = courseId.startsWith('deg_');
      const realId = isDegree ? courseId.replace('deg_', '') : courseId;
      const status = progress[activeLesson.id] === 'completed' ? 'learning' : 'completed';
      
      if (isDegree) {
        // Gọi API lưu tiến độ Bằng cấp
        await api.post('/courses/courses/update_degree_progress/', {
          degree_id: realId,
          lesson_key: activeLesson.id, // ID ở đây chính là key "module-lesson"
          is_completed: status === 'completed'
        });
      } else {
        // Gọi API lưu tiến độ Khóa học (cũ)
        await api.post('/courses/progress/update_progress/', { 
          lesson_id: activeLesson.id, 
          status 
        });
      }

      setProgress(prev => ({ ...prev, [activeLesson.id]: status }));
      
      if (status === 'completed') {
        const idx = lessons.findIndex(l => l.id === activeLesson.id);
        if (idx !== -1 && idx < lessons.length - 1) setTimeout(() => setActiveLesson(lessons[idx + 1]), 600);
      }
    } catch (e) { console.error(e); } finally { setMarkingDone(false); }
  }, [activeLesson, markingDone, progress, lessons, courseId]);

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const answers = Object.values(userAnswers);
      const res = await api.post(`/courses/quizzes/${activeQuiz.id}/submit/`, { answers });
      setQuizResult(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert('Lỗi khi nộp bài.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const renderPlayer = (lesson) => {
    if (!lesson) return <div className="lrn-no-video"><p>🎥 Video bài giảng này đang được cập nhật...</p></div>;
    
    // Nếu có file video tải lên, ưu tiên dùng thẻ HTML5 Video
    if (lesson.video_file) {
      return (
        <video
          controls
          controlsList="nodownload"
          src={lesson.video_file}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000' }}
        />
      );
    }

    const url = lesson.video_url;
    if (!url || url.trim() === '') return <div className="lrn-no-video"><p>🎥 Video bài giảng này đang được cập nhật...</p></div>;
    
    let vidId = null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      vidId = url.trim();
    } else {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      vidId = (match && match[2].length === 11) ? match[2] : null;
    }

    if (!vidId) return <div className="lrn-no-video"><p>🎥 Video bài giảng này đang được cập nhật...</p></div>;

    return (
      <iframe
        src={`https://www.youtube.com/embed/${vidId}?rel=0`}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  if (authLoading || loading) return <div className="lrn-fullscreen-state"><div className="lrn-spinner" /><p>Đang tải bài giảng...</p></div>;
  if (errorStatus === 403) return (
    <div className="lrn-fullscreen-state" style={{gap: 16}}>
      <span style={{fontSize: 56}}>🔒</span>
      <h2 style={{margin: 0}}>Bạn chưa đăng ký khóa học này</h2>
      <p style={{color: '#6b7280', margin: 0}}>Vui lòng mua khóa học để truy cập nội dung.</p>
      <button
        onClick={() => navigate(`/course/${courseId}`)}
        style={{padding: '12px 28px', background: '#0056d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer'}}
      >
        Xem khóa học →
      </button>
    </div>
  );
  if (errorStatus) return <div className="lrn-fullscreen-state"><h2>Lỗi {errorStatus}</h2></div>;

  const isDegree = courseId.startsWith('deg_');
  const completedCount = lessons.filter(l => progress[l.id] === 'completed').length;
  const completionPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isFullyCompleted = !isDegree && completionPercent === 100;

  return (
    <div className="lrn-root">
      {/* Certificate celebration banner */}
      {isFullyCompleted && (
        <div className="lrn-cert-banner">
          <span className="lrn-cert-banner-icon">🎉</span>
          <span>Chúc mừng! Bạn đã hoàn thành khóa học.</span>
          <Link to={`/certificate/${courseId}`} className="lrn-cert-banner-btn">
            Nhận chứng chỉ →
          </Link>
        </div>
      )}
      <header className="lrn-topbar">
        <div className="lrn-topbar-left"><Link to="/" className="lrn-logo">EduVNU</Link> <span className="lrn-topbar-sep">/</span> <span className="lrn-topbar-title">{fixText(course?.title)}</span></div>
        <div className="lrn-topbar-progress">
          <div className="lrn-topbar-progress-bar"><div className="lrn-topbar-progress-fill" style={{ width: `${completionPercent}%` }} /></div>
          <span>{completionPercent}%</span>
        </div>
        <div className="lrn-topbar-right"><button className="lrn-exit-btn" onClick={() => navigate('/')}>✕ Thoát</button></div>
      </header>

      <div className="lrn-body">
        <main className="lrn-main">
          {activeQuiz ? (
            <div className="quiz-container" style={{padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#fff', minHeight: '100%'}}>
              <h1 style={{fontSize: '2rem', marginBottom: '10px'}}>{activeQuiz.title}</h1>
              <p style={{color: '#64748b', marginBottom: '30px'}}>{activeQuiz.description || 'Hoàn thành bài kiểm tra để đánh giá kiến thức của bạn.'}</p>

              {quizResult ? (
                <div style={{padding: '30px', background: quizResult.passed ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', border: `2px solid ${quizResult.passed ? '#22c55e' : '#ef4444'}`}}>
                  <h2 style={{color: quizResult.passed ? '#15803d' : '#b91c1c', marginBottom: '10px'}}>{quizResult.passed ? '🎉 Chúc mừng! Bạn đã vượt qua.' : '❌ Rất tiếc! Bạn chưa đạt điểm yêu cầu.'}</h2>
                  <div style={{fontSize: '1.5rem', fontWeight: 700}}>Điểm của bạn: {quizResult.score.toFixed(1)}%</div>
                  <p>Số câu đúng: {quizResult.correct_count} / {quizResult.total_questions}</p>
                  <button onClick={() => { setQuizResult(null); setUserAnswers({}); }} style={{marginTop: '20px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'}}>Làm lại bài thi</button>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={q.id} style={{padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px'}}>
                      <h4 style={{marginBottom: '15px'}}>Câu {idx + 1}: {q.text}</h4>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {q.choices.map(c => (
                          <label key={c.id} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', cursor: 'pointer', background: userAnswers[q.id] === c.id ? '#eff6ff' : '#fff'}}>
                            <input type="radio" name={`q-${q.id}`} checked={userAnswers[q.id] === c.id} onChange={() => setUserAnswers({...userAnswers, [q.id]: c.id})} />
                            {c.text}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleQuizSubmit} disabled={submittingQuiz || Object.keys(userAnswers).length < activeQuiz.questions.length} style={{padding: '15px', background: '#0056d2', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: (submittingQuiz || Object.keys(userAnswers).length < activeQuiz.questions.length) ? 0.6 : 1}}>
                    {submittingQuiz ? 'Đang chấm điểm...' : 'Nộp bài kiểm tra'}
                  </button>
                </div>
              )}
            </div>
          ) : activeLesson ? (
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 28px' }}>
              {/* Video Player - giới hạn kích thước hợp lý */}
              <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
                <div style={{ position: 'relative', paddingBottom: '50%', height: 0, overflow: 'hidden' }}>
                  {renderPlayer(activeLesson)}
                </div>
              </div>

              {/* Thông tin bài học */}
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                      ĐANG HỌC
                    </div>
                    <h1 className="lrn-lesson-title" style={{ fontSize: 20, margin: 0, lineHeight: 1.4 }}>
                      {fixText(activeLesson.title)}
                    </h1>
                  </div>
                  <button
                    className={`lrn-done-btn ${progress[activeLesson.id] === 'completed' ? 'done' : ''}`}
                    onClick={markCompleted}
                    disabled={markingDone}
                    style={{ flexShrink: 0, padding: '10px 20px', fontSize: 14 }}
                  >
                    {progress[activeLesson.id] === 'completed' ? '✓ Đã hoàn thành' : '✎ Đánh dấu hoàn thành'}
                  </button>
                </div>

                {activeLesson.content && activeLesson.content !== `Mô tả bài học: ${activeLesson.title}` && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6', color: '#374151', fontSize: 14, lineHeight: 1.75 }}>
                    <strong style={{ color: '#111' }}>📖 Nội dung bài giảng</strong>
                    <p style={{ marginTop: 8 }}>{activeLesson.content}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>

        <aside className={`lrn-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="lrn-sidebar-header"><span>Nội dung khóa học</span></div>
          <div className="lrn-sidebar-content" style={{ overflowY: 'auto', flex: 1 }}>
            {course?.chapters?.map((chapter, cIdx) => (
              <div key={chapter.id} className="lrn-chapter-group" style={{ marginBottom: '15px' }}>
                <div style={{ padding: '12px 20px', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chương {cIdx + 1}: {chapter.title}</div>
                {chapter.lessons.map((ls, lIdx) => (
                  <button key={ls.id} className={`lrn-lesson-item ${activeLesson?.id === ls.id && !activeQuiz ? 'active' : ''} ${progress[ls.id] === 'completed' ? 'done' : ''}`} onClick={() => { setActiveLesson(ls); setActiveQuiz(null); }}>
                    <span className="lrn-lesson-num">{progress[ls.id] === 'completed' ? '✓' : lIdx + 1}</span>
                    <div className="lrn-lesson-item-info"><span className="lrn-lesson-item-title">{fixText(ls.title)}</span></div>
                  </button>
                ))}
                {chapter.quiz && (
                  <button 
                    className="lrn-lesson-item" 
                    onClick={() => { setActiveQuiz(chapter.quiz); setActiveLesson(null); setQuizResult(null); setUserAnswers({}); }} 
                    style={
                      activeQuiz?.id === chapter.quiz.id 
                      ? { background: '#0056d2', color: '#fff' } 
                      : { background: '#f0f9ff', color: '#0369a1', borderLeft: '4px solid #0ea5e9' }
                    }
                  >
                    <span className="lrn-lesson-num" style={{color: activeQuiz?.id === chapter.quiz.id ? '#fff' : '#0369a1'}}>📝</span>
                    <div className="lrn-lesson-item-info"><span className="lrn-lesson-item-title" style={{color: activeQuiz?.id === chapter.quiz.id ? '#fff' : '#0369a1'}}><b>Bài kiểm tra:</b> {chapter.quiz.title}</span></div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
