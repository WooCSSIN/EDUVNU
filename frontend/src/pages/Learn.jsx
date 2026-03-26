import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Learn() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCourseData();
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        api.get(`/courses/courses/${courseId}/`),
        api.get(`/courses/courses/${courseId}/lessons/`),
        api.get(`/courses/progress/my_progress/?course_id=${courseId}`),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      // Map progress theo lesson id
      const progressMap = {};
      progressRes.data.forEach(p => { progressMap[p.lesson] = p.status; });
      setProgress(progressMap);
      if (lessonsRes.data.length > 0) setActiveLesson(lessonsRes.data[0]);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Bạn chưa đăng ký khóa học này.');
      } else {
        setError('Không thể tải khóa học.');
      }
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (lessonId) => {
    try {
      await api.post('/courses/progress/update_progress/', { lesson_id: lessonId, status: 'completed' });
      setProgress(prev => ({ ...prev, [lessonId]: 'completed' }));
    } catch {}
  };

  const completedCount = Object.values(progress).filter(s => s === 'completed').length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) return <div className="learn-loading">Đang tải khóa học ⌛</div>;
  if (error) return (
    <div className="learn-error">
      <p>{error}</p>
      <button onClick={() => navigate('/')}>Về trang chủ</button>
    </div>
  );

  return (
    <div className="learn-page">
      {/* SIDEBAR */}
      <aside className="learn-sidebar">
        <div className="sidebar-header">
          <h3>{course?.title}</h3>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="progress-text">{progressPercent}% hoàn thành ({completedCount}/{lessons.length})</span>
        </div>

        <ul className="lesson-list">
          {lessons.map((lesson, idx) => (
            <li
              key={lesson.id}
              className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''} ${progress[lesson.id] === 'completed' ? 'completed' : ''}`}
              onClick={() => setActiveLesson(lesson)}
            >
              <span className="lesson-check">
                {progress[lesson.id] === 'completed' ? '✅' : '⭕'}
              </span>
              <span className="lesson-title">{idx + 1}. {lesson.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="learn-main">
        {activeLesson ? (
          <>
            <h2 className="lesson-heading">{activeLesson.title}</h2>

            {/* VIDEO */}
            {activeLesson.video_url && (
              <div className="video-wrapper">
                {activeLesson.video_url.includes('youtube') ? (
                  <iframe
                    src={activeLesson.video_url.replace('watch?v=', 'embed/')}
                    title={activeLesson.title}
                    allowFullScreen
                  />
                ) : (
                  <video controls src={activeLesson.video_url} />
                )}
              </div>
            )}

            {/* NỘI DUNG BÀI HỌC */}
            <div className="lesson-content">
              <p>{activeLesson.content}</p>
            </div>

            {/* ACTIONS */}
            <div className="lesson-actions">
              {progress[activeLesson.id] === 'completed' ? (
                <span className="completed-badge">✅ Đã hoàn thành</span>
              ) : (
                <button className="complete-lesson-btn" onClick={() => markComplete(activeLesson.id)}>
                  Đánh dấu hoàn thành
                </button>
              )}

              {/* Điều hướng bài trước/sau */}
              <div className="lesson-nav">
                <button
                  className="nav-btn"
                  disabled={lessons.indexOf(activeLesson) === 0}
                  onClick={() => setActiveLesson(lessons[lessons.indexOf(activeLesson) - 1])}
                >
                  ← Bài trước
                </button>
                <button
                  className="nav-btn"
                  disabled={lessons.indexOf(activeLesson) === lessons.length - 1}
                  onClick={() => setActiveLesson(lessons[lessons.indexOf(activeLesson) + 1])}
                >
                  Bài tiếp →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-lesson">Chưa có bài học nào trong khóa học này.</div>
        )}
      </main>
    </div>
  );
}
