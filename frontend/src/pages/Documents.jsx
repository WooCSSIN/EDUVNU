import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px', minHeight: '80vh' },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 28, fontWeight: 700, margin: 0, color: '#111' },
  headerSub: { color: '#6b7280', marginTop: 6, fontSize: 15 },
  layout: { display: 'flex', gap: 28, alignItems: 'flex-start' },
  sidebar: {
    width: 280, flexShrink: 0, background: '#fff', borderRadius: 12,
    border: '1px solid #e5e7eb', padding: 20, position: 'sticky', top: 90,
  },
  sidebarTitle: { fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  courseItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, cursor: 'pointer', marginBottom: 4, fontSize: 14, fontWeight: active ? 600 : 400,
    background: active ? '#eff6ff' : 'transparent', color: active ? '#1d4ed8' : '#374151',
    border: active ? '1px solid #bfdbfe' : '1px solid transparent',
    transition: 'all 0.15s',
  }),
  dot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
  main: { flex: 1, minWidth: 0 },
  courseHeader: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 24,
    background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 20,
  },
  courseIcon: (isDegree) => ({
    width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0,
    background: isDegree ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'linear-gradient(135deg,#0369a1,#0ea5e9)',
  }),
  learnBtn: {
    marginLeft: 'auto', padding: '10px 22px', background: '#0056d2', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
    whiteSpace: 'nowrap', transition: 'background 0.2s',
  },
  moduleHeader: {
    padding: '12px 18px', background: 'linear-gradient(135deg,#eff6ff,#f0f4ff)', borderRadius: 10,
    fontWeight: 700, color: '#1e40af', fontSize: 14, marginBottom: 10, marginTop: 20,
    borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: 8,
  },
  lessonCard: {
    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
    background: '#fff', borderRadius: 10, border: '1px solid #f3f4f6', marginBottom: 8,
    transition: 'box-shadow 0.2s',
  },
  lessonNum: {
    width: 32, height: 32, borderRadius: '50%', background: '#f0f4ff', color: '#3b82f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  lessonTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: '#1f2937' },
  lessonContent: { margin: '4px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
  emptyState: { textAlign: 'center', padding: '80px 20px', color: '#9ca3af' },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
};

export default function Documents() {
  usePageSEO({ title: 'Giáo trình học tập', description: 'Xem giáo trình, nội dung bài giảng từ các khóa học đã đăng ký tại EduVNU.' });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    api.get('/courses/courses/my_courses/')
      .then(res => {
        setEnrollments(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          if (first.type === 'degree' && first.degree) loadDegree(first.degree);
          else if (first.course) loadCourse(first.course);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadCourse = async (course) => {
    setSelectedItem({ type: 'course', ...course });
    setLessonsLoading(true);
    try {
      const res = await api.get(`/courses/courses/${course.id}/lessons/`);
      setLessons(res.data);
    } catch(err) { setLessons([]); }
    finally { setLessonsLoading(false); }
  };

  const loadDegree = async (degree) => {
    setSelectedItem({ type: 'degree', ...degree });
    setLessonsLoading(true);
    try {
      const res = await api.get(`/courses/degree-programs/${degree.id}/`);
      const curriculum = res.data.curriculum || [];
      const flatLessons = [];
      curriculum.forEach((mod, mi) => {
        (mod.lessons || []).forEach((ls, li) => {
          flatLessons.push({
            id: `${mi}-${li}`,
            title: ls.title || ls,
            module: mod.title || mod.name || `Module ${mi + 1}`,
            moduleIndex: mi,
          });
        });
      });
      setLessons(flatLessons);
    } catch(err) { setLessons([]); }
    finally { setLessonsLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>Đang tải giáo trình ⌛</div>;

  // Nhóm lessons theo module (cho degree)
  const groupedByModule = {};
  if (selectedItem?.type === 'degree') {
    lessons.forEach(ls => {
      if (!groupedByModule[ls.module]) groupedByModule[ls.module] = [];
      groupedByModule[ls.module].push(ls);
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>📚 Giáo Trình</h2>
        <p style={styles.headerSub}>Chương trình học từ các khóa học và bằng cấp đã đăng ký</p>
      </div>

      {enrollments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📂</div>
          <p style={{ fontSize: 16, marginBottom: 20 }}>Bạn chưa có giáo trình nào. Hãy đăng ký khóa học trước.</p>
          <button style={styles.learnBtn} onClick={() => navigate('/')}>Khám phá khóa học</button>
        </div>
      ) : (
        <div style={styles.layout}>
          {/* SIDEBAR */}
          <aside style={styles.sidebar}>
            <div style={styles.sidebarTitle}>Khóa học của tôi</div>
            {enrollments.map(e => {
              const isDegree = e.type === 'degree';
              const item = isDegree ? e.degree : e.course;
              if (!item) return null;
              const isActive = selectedItem?.id === item.id && selectedItem?.type === (isDegree ? 'degree' : 'course');
              return (
                <div
                  key={e.id}
                  style={styles.courseItem(isActive)}
                  onClick={() => isDegree ? loadDegree(item) : loadCourse(item)}
                  onMouseEnter={ev => { if (!isActive) ev.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={ev => { if (!isActive) ev.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={styles.dot(isDegree ? '#7c3aed' : '#0369a1')} />
                  <span style={{ lineHeight: 1.3 }}>
                    {item.title}
                    {isDegree && <small style={{ display: 'block', fontSize: 11, color: '#8b5cf6', marginTop: 2 }}>🎓 Bằng cấp</small>}
                  </span>
                </div>
              );
            })}
          </aside>

          {/* MAIN */}
          <main style={styles.main}>
            {selectedItem && (
              <>
                {/* Header */}
                <div style={styles.courseHeader}>
                  <div style={styles.courseIcon(selectedItem.type === 'degree')}>
                    {(selectedItem.title || 'K')[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>{selectedItem.title}</h3>
                    <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
                      {selectedItem.type === 'degree'
                        ? `🎓 Chương trình bằng cấp • ${lessons.length} bài giảng`
                        : `📖 Khóa học • ${lessons.length} bài giảng`}
                    </p>
                  </div>
                  <button
                    style={styles.learnBtn}
                    onClick={() => navigate(`/learn/${selectedItem.type === 'degree' ? `deg_${selectedItem.id}` : selectedItem.id}`)}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#003f9e'}
                    onMouseLeave={ev => ev.currentTarget.style.background = '#0056d2'}
                  >
                    Học ngay →
                  </button>
                </div>

                {/* Content */}
                {lessonsLoading ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Đang tải nội dung...</p>
                ) : lessons.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 60 }}>Chưa có nội dung giáo trình cho mục này.</div>
                ) : selectedItem.type === 'degree' ? (
                  /* ── DEGREE: nhóm theo Module ── */
                  <div>
                    {Object.entries(groupedByModule).map(([moduleName, moduleLessons], mi) => (
                      <div key={mi}>
                        <div style={styles.moduleHeader}>
                          <span>📘</span> {moduleName}
                          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 400, color: '#60a5fa' }}>
                            {moduleLessons.length} bài
                          </span>
                        </div>
                        {moduleLessons.map((lesson, idx) => (
                          <div key={lesson.id} style={{ ...styles.lessonCard, marginLeft: 12 }}>
                            <div style={styles.lessonNum}>{idx + 1}</div>
                            <div>
                              <h4 style={styles.lessonTitle}>{lesson.title}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── COURSE: danh sách bài học ── */
                  <div>
                    {lessons.map((lesson, idx) => (
                      <div key={lesson.id} style={styles.lessonCard}>
                        <div style={styles.lessonNum}>{idx + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={styles.lessonTitle}>{lesson.title}</h4>
                          {lesson.content && (
                            <p style={styles.lessonContent}>
                              {lesson.content.substring(0, 150)}{lesson.content.length > 150 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <button
                          style={{ ...styles.learnBtn, padding: '8px 16px', fontSize: 13 }}
                          onClick={() => navigate(`/learn/${selectedItem.id}`)}
                        >
                          Học →
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
