import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fixText } from '../utils/fixEncoding';

export default function Learn() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [courseId, user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        api.get(`/courses/courses/${courseId}/`),
        api.get(`/courses/courses/${courseId}/lessons/`),
        api.get(`/courses/progress/my_progress/?course_id=${courseId}`).catch(() => ({ data: [] }))
      ]);
      setCourse(courseRes.data);
      const sorted = (lessonsRes.data || []).sort((a,b) => a.order_number - b.order_number);
      setLessons(sorted);
      const pMap = {};
      (progressRes.data || []).forEach(p => { pMap[p.lesson] = p.status; });
      setProgress(pMap);
      if (sorted.length > 0) setActiveLesson(sorted[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Xử lý YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vidId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      // Thêm origin để tránh lỗi chặn nhúng trên localhost
      return `https://www.youtube.com/embed/${vidId}?rel=0&enablejsapi=1&origin=${window.location.origin}`;
    }
    // Xử lý Vimeo
    if (url.includes('vimeo')) {
      const vidId = url.split('/').pop();
      return `https://player.vimeo.com/video/${vidId}`;
    }
    return url;
  };

  const markComplete = async (lessonId) => {
    if (!lessonId) return;
    try {
      await api.post('/courses/progress/update_progress/', { lesson_id: lessonId, status: 'completed' });
      setProgress(p => ({ ...p, [lessonId]: 'completed' }));
    } catch {}
  };

  if (authLoading || loading) return <div style={{padding:100,textAlign:'center',background:'#1c1d1f',color:'white',minHeight:'100vh'}}>🚀 Đang chuẩn bị bài giảng chất lượng cao...</div>;

  return (
    <div className="learn-container" style={{background:'#1c1d1f',color:'white',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <header style={{height:60,background:'#2d2f31',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px'}}>
         <div style={{display:'flex',alignItems:'center',gap:20}}>
            <Link to="/" style={{color:'white',textDecoration:'none',fontWeight:800, fontSize: 20}}>EduVNU</Link>
            <span style={{fontSize:14,opacity:0.8}}>{fixText(course?.title)}</span>
         </div>
         <button onClick={() => navigate('/')} style={{background: 'none', border:'1px solid #777', color:'white', padding:'6px 16px', borderRadius:4, cursor:'pointer'}}>Thoát</button>
      </header>

      <div style={{display:'flex',flexGrow:1,overflow:'hidden'}}>
        <main style={{flexGrow:1,overflowY:'auto',background:'#000'}}>
          {activeLesson && (
            <div style={{maxWidth:1000,margin:'0 auto'}}>
               <div style={{position:'relative',paddingTop:'56.25%',background:'#000'}}>
                 {activeLesson.video_url.includes('mp4') ? (
                   <video controls key={activeLesson.video_url} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}>
                      <source src={activeLesson.video_url} type="video/mp4" />
                   </video>
                 ) : (
                   <iframe 
                     src={getEmbedUrl(activeLesson.video_url)}
                     style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   />
                 )}
               </div>
               <div style={{padding:32,background:'white',color:'#1c1d1f'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:24, alignItems: 'center'}}>
                    <h1 style={{fontSize:24,fontWeight:800}}>{activeLesson.title}</h1>
                    <button 
                      onClick={() => markComplete(activeLesson.id)}
                      disabled={progress[activeLesson.id]==='completed'}
                      style={{background: progress[activeLesson.id]==='completed'?'#eee':'#1c1d1f', color: progress[activeLesson.id]==='completed'?'#666':'#fff', border:'none', padding:'12px 24px', borderRadius:4, fontWeight:700, cursor:'pointer'}}>
                      {progress[activeLesson.id]==='completed'?'✓ Đã xong':'Đánh dấu xong'}
                    </button>
                  </div>
                  <div style={{lineHeight:'1.7',color:'#444'}}>{activeLesson.content}</div>
               </div>
            </div>
          )}
        </main>
        
        <aside style={{width:350,background:'white',borderLeft:'1px solid #ddd',overflowY:'auto',color:'#1c1d1f'}}>
           <div style={{padding:20,borderBottom:'1px solid #ddd',fontWeight:800}}>Nội dung học tập</div>
           {lessons.map((ls,idx) => (
             <div key={ls.id} onClick={() => setActiveLesson(ls)} style={{padding:16,display:'flex',gap:12,cursor:'pointer',background:activeLesson?.id===ls.id?'#f3f4f6':'transparent',borderBottom:'1px solid #eee'}}>
                <div>{progress[ls.id]==='completed'?'✅':'⬜'}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:activeLesson?.id===ls.id?700:500}}>{idx+1}. {ls.title}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:4}}>Video - 10:00</div>
                </div>
             </div>
           ))}
        </aside>
      </div>
    </div>
  );
}
