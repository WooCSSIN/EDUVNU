import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

export default function Documents() {
  usePageSEO({ title: 'Tài liệu học tập', description: 'Từ khóa khóa học, giáo trình, slide bài giảng được liên kết trực tiếp trên khóa học của bạn.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/courses/courses/my_courses/')
      .then(res => {
        setEnrollments(res.data);
        if (res.data.length > 0) loadLessons(res.data[0].course);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  const loadLessons = async (course) => {
    setSelectedCourse(course);
    setLessonsLoading(true);
    try {
      const res = await api.get(`/courses/courses/${course.id}/lessons/`);
      setLessons(res.data);
    } catch { setLessons([]); }
    finally { setLessonsLoading(false); }
  };

  if (loading) return <div className="page-loading">Đang tải tài liệu ⌛</div>;

  return (
    <div className="documents-page">
      <div className="page-header">
        <h2>📄 Tài Liệu</h2>
        <p>Nội dung bài học từ các khóa học đã đăng ký</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="page-empty">
          <div className="empty-icon">📂</div>
          <p>Bạn chưa có tài liệu nào. Hãy đăng ký khóa học trước.</p>
          <button onClick={() => navigate('/')}>Khám phá khóa học</button>
        </div>
      ) : (
        <div className="documents-layout">
          {/* SIDEBAR COURSES */}
          <aside className="docs-sidebar">
            <h4>Khóa học của tôi</h4>
            {enrollments.map(e => (
              <div
                key={e.id}
                className={`docs-course-item ${selectedCourse?.id === e.course.id ? 'active' : ''}`}
                onClick={() => loadLessons(e.course)}
              >
                <div className="docs-course-dot" />
                <span>{e.course.title}</span>
              </div>
            ))}
          </aside>

          {/* LESSONS LIST */}
          <main className="docs-main">
            {selectedCourse && (
              <>
                <h3 className="docs-course-title">{selectedCourse.title}</h3>
                {lessonsLoading ? (
                  <p>Đang tải bài học...</p>
                ) : lessons.length === 0 ? (
                  <div className="docs-empty">Khóa học này chưa có bài học nào.</div>
                ) : (
                  <div className="docs-lessons">
                    {lessons.map((lesson, idx) => (
                      <div className="docs-lesson-card" key={lesson.id}>
                        <div className="docs-lesson-num">{idx + 1}</div>
                        <div className="docs-lesson-info">
                          <h4>{lesson.title}</h4>
                          <p className="docs-lesson-preview">
                            {lesson.content?.substring(0, 120)}{lesson.content?.length > 120 ? '...' : ''}
                          </p>
                          {lesson.video_url && (
                            <a href={lesson.video_url} target="_blank" rel="noreferrer" className="docs-video-link">
                              🎬 Xem video
                            </a>
                          )}
                        </div>
                        <button
                          className="go-learn-btn"
                          onClick={() => navigate(`/learn/${selectedCourse.id}`)}
                        >
                          Học ngay →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
