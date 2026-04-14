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

      // Bước 1: Lấy thông tin khóa học (public)
      const courseRes = await api.get(`/courses/courses/${courseId}/`);
      const courseData = courseRes.data;
      setCourse(courseData);

      // Bước 2 (Fix #2): Xác minh đăng ký — endpoint này trả 403 nếu chưa enroll
      await api.get(`/courses/courses/${courseId}/lessons/`);

      // Bước 3: Load progress song song sau khi xác nhận đã enroll
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
  }, [activeLesson]);

  const markCompleted = useCallback(async () => {
    if (!activeLesson || markingDone) return;
    try {
      setMarkingDone(true);
      const status = progress[activeLesson.id] === 'completed' ? 'learning' : 'completed';
      await api.post('/courses/progress/update_progress/', { lesson_id: activeLesson.id, status });
      setProgress(prev => ({ ...prev, [activeLesson.id]: status }));
      
      if (status === 'completed') {
        const idx = lessons.findIndex(l => l.id === activeLesson.id);
        if (idx !== -1 && idx < lessons.length - 1) setTimeout(() => setActiveLesson(lessons[idx + 1]), 600);
      }
    } catch (e) { console.error(e); } finally { setMarkingDone(false); }
  }, [activeLesson, markingDone, progress, lessons]);

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

  const renderPlayer = (url) => {
    if (!url) return <div className="lrn-no-video"><p>Video chưa cập nhật.</p></div>;
    const vidId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
    return (
      <iframe
        src={`https://www.youtube.com/embed/${vidId}?rel=0`}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
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

  return (
    <div className="lrn-root">
      <header className="lrn-topbar">
        <div className="lrn-topbar-left"><Link to="/" className="lrn-logo">EduVNU</Link> <span className="lrn-topbar-sep">/</span> <span className="lrn-topbar-title">{fixText(course?.title)}</span></div>
        <div className="lrn-topbar-progress">
          <div className="lrn-topbar-progress-bar"><div className="lrn-topbar-progress-fill" style={{ width: `${Math.round((lessons.filter(l => progress[l.id] === 'completed').length / lessons.length) * 100)}%` }} /></div>
          <span>{Math.round((lessons.filter(l => progress[l.id] === 'completed').length / lessons.length) * 100)}%</span>
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
            <>
              <div className="lrn-player-wrap"><div className="lrn-player-ratio">{renderPlayer(activeLesson.video_url)}</div></div>
              <div className="lrn-lesson-info" style={{padding: '30px'}}>
                <h1 className="lrn-lesson-title">{fixText(activeLesson.title)}</h1>
                <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                  <button className={`lrn-done-btn ${progress[activeLesson.id] === 'completed' ? 'done' : ''}`} onClick={markCompleted} disabled={markingDone}>
                    {progress[activeLesson.id] === 'completed' ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  </button>
                </div>
                <div className="lrn-lesson-content" style={{marginTop: '30px'}}>
                  <h3>📖 Nội dung bài giảng</h3>
                  <p>{activeLesson.content || 'Đang cập nhật nội dung...'}</p>
                </div>
              </div>
            </>
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
                  <button className={`lrn-lesson-item ${activeQuiz?.id === chapter.quiz.id ? 'active' : ''}`} onClick={() => { setActiveQuiz(chapter.quiz); setActiveLesson(null); setQuizResult(null); setUserAnswers({}); }} style={{background: '#f0f9ff', color: '#0369a1', borderLeft: '4px solid #0ea5e9'}}>
                    <span className="lrn-lesson-num">📝</span>
                    <div className="lrn-lesson-item-info"><span className="lrn-lesson-item-title"><b>Bài kiểm tra:</b> {chapter.quiz.title}</span></div>
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
