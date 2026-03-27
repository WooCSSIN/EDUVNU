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
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [courseId, user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
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
      setErrorStatus(err.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  const renderPlayer = (url) => {
    if (!url) return <div style={{color:'white', textAlign:'center', paddingTop:'20%'}}>Video đang chờ nạp...</div>;
    
    // YouTube
    if (url.includes('youtube') || url.includes('youtu.be')) {
      const vidId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return <iframe src={`https://www.youtube.com/embed/${vidId}`} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}} allowFullScreen />;
    }
    
    // Vimeo
    if (url.includes('vimeo')) {
      const vidId = url.split('/').pop();
      return <iframe src={`https://player.vimeo.com/video/${vidId}`} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}} allowFullScreen />;
    }

    // Direct MP4 (Local / Cloudinary)
    return (
      <video controls key={url} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}>
        <source src={url} type="video/mp4" />
      </video>
    );
  };

  if (authLoading || loading) return <div style={{padding:100,textAlign:'center',background:'#1c1d1f',color:'white',minHeight:'100vh'}}>⚡ Đang kết nối bài giảng...</div>;

  return (
    <div className="learn-container" style={{background:'#1c1d1f',color:'white',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <header style={{height:60,background:'#2d2f31',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px'}}>
         <div style={{display:'flex',alignItems:'center',gap:20}}>
            <Link to="/" style={{color:'white',textDecoration:'none',fontWeight:800}}>EduVNU</Link>
            <span style={{fontSize:14,opacity:0.8}}>{fixText(course?.title)}</span>
         </div>
         <button onClick={() => navigate('/')} style={{background: 'none', border:'1px solid #777', color:'white', padding:'6px 12px', borderRadius:4, cursor:'pointer'}}>Thoát</button>
      </header>

      <div style={{display:'flex',flexGrow:1,overflow:'hidden'}}>
        <main style={{flexGrow:1,overflowY:'auto',background:'#000'}}>
          {activeLesson && (
            <div style={{maxWidth:1000,margin:'0 auto'}}>
               <div style={{position:'relative',paddingTop:'56.25%',background:'#000'}}>
                 {renderPlayer(activeLesson.video_url)}
               </div>
               <div style={{padding:32,background:'white',color:'#1c1d1f'}}>
                  <h1 style={{fontSize:24,fontWeight:800,marginBottom:16}}>{activeLesson.title}</h1>
                  <p style={{lineHeight:'1.7',color:'#444'}}>{activeLesson.content}</p>
               </div>
            </div>
          )}
        </main>
        
        <aside style={{width:350,background:'white',borderLeft:'1px solid #ddd',overflowY:'auto',color:'#1c1d1f'}}>
           <div style={{padding:20,borderBottom:'1px solid #ddd',fontWeight:800}}>Nội dung học tập</div>
           {lessons.map((ls,idx) => (
             <div key={ls.id} onClick={() => setActiveLesson(ls)} style={{padding:16,cursor:'pointer',background:activeLesson?.id===ls.id?'#f3f4f6':'transparent',borderBottom:'1px solid #eee'}}>
                <div style={{fontSize:14,fontWeight:activeLesson?.id===ls.id?700:500}}>{idx+1}. {ls.title}</div>
             </div>
           ))}
        </aside>
      </div>
    </div>
  );
}
