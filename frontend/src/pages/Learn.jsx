import { useState, useEffect } from 'react';
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
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [errorStatus, setErrorStatus] = useState(null);

  usePageSEO({
    title: course ? `Đang học: ${fixText(course.title)}` : 'Học tập',
    description: course ? `Bài giảng trực tuyến: ${fixText(course.title)} tại EduVNU` : 'Học tập tại EduVNU',
  });

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
    if (!url) {
      return (
        <div style={{
          position:'absolute', top:0, left:0, width:'100%', height:'100%',
          background:'linear-gradient(135deg,#1c1d1f,#2d2f31)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16
        }}>
          <div style={{fontSize:64}}>🎬</div>
          <p style={{color:'rgba(255,255,255,0.7)', fontSize:16, textAlign:'center', maxWidth:400}}>
            Video bài học chưa được tải lên.<br/>
            <span style={{fontSize:13, opacity:0.6}}>Giảng viên sẽ cập nhật video sớm.</span>
          </p>
          <div style={{display:'flex', gap:12, marginTop:8}}>
            <a href="https://www.youtube.com/results?search_query=coursera+free+course" target="_blank" rel="noreferrer"
              style={{background:'#ff0000', color:'white', padding:'8px 16px', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:600}}>
              Tìm trên YouTube
            </a>
          </div>
        </div>
      );
    }

    // YouTube
    if (url.includes('youtube') || url.includes('youtu.be')) {
      let vidId = '';
      if (url.includes('v=')) vidId = url.split('v=')[1]?.split('&')[0];
      else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1]?.split('?')[0];
      else vidId = url.split('/').pop();
      
      const origin = window.location.origin;
      return (
        <iframe
          src={`https://www.youtube.com/embed/${vidId}?rel=0&modestbranding=1&origin=${origin}&enablejsapi=1`}
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }

    // Vimeo
    if (url.includes('vimeo')) {
      const vidId = url.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vidId}`}
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
          allowFullScreen
        />
      );
    }

    // Direct video file
    return (
      <video controls key={url} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',background:'#000'}}>
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <p style={{color:'white',textAlign:'center',paddingTop:'20%'}}>Trình duyệt không hỗ trợ video này.</p>
      </video>
    );
  };

  if (authLoading || loading) return <div style={{padding:100,textAlign:'center',background:'#1c1d1f',color:'white',minHeight:'100vh'}}>⚡ Đang kết nối bài giảng...</div>;

  if (errorStatus === 403) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',gap:20,padding:40,textAlign:'center'}}>
      <div style={{fontSize:72}}>🔒</div>
      <h2 style={{fontSize:28,fontWeight:700}}>Bạn chưa ghi danh khóa học này</h2>
      <p style={{color:'var(--muted)',fontSize:16,maxWidth:480}}>Vui lòng mua khóa học để truy cập nội dung bài giảng. Sau khi thanh toán, bạn sẽ được tự động ghi danh.</p>
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button className="crs-btn-solid" style={{padding:'14px 32px',fontSize:16}} onClick={()=>navigate(`/course/${courseId}`)}>Xem & Mua khóa học</button>
        <button className="crs-btn-outline" style={{padding:'14px 24px'}} onClick={()=>navigate('/')}>← Về trang chủ</button>
      </div>
    </div>
  );

  if (errorStatus) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',gap:16,padding:40,textAlign:'center'}}>
      <div style={{fontSize:64}}>⚠️</div>
      <h2>Đã xảy ra lỗi (Mã: {errorStatus})</h2>
      <button className="crs-btn-solid" onClick={()=>navigate('/')}>Về trang chủ</button>
    </div>
  );

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
          {activeLesson ? (
            <div style={{maxWidth:1000,margin:'0 auto'}}>
               <div style={{position:'relative',paddingTop:'56.25%',background:'#000'}}>
                 {renderPlayer(activeLesson.video_url)}
               </div>
               <div style={{padding:32,background:'white',color:'#1c1d1f'}}>
                  <h1 style={{fontSize:24,fontWeight:800,marginBottom:16}}>{activeLesson.title}</h1>
                  {activeLesson.content ? (
                    <p style={{lineHeight:'1.7',color:'#444',whiteSpace:'pre-wrap'}}>{activeLesson.content}</p>
                  ) : (
                    <p style={{color:'#94a3b8',fontStyle:'italic'}}>Nội dung bài học đang được cập nhật...</p>
                  )}
               </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',color:'white',gap:16}}>
              <div style={{fontSize:56}}>📚</div>
              <p style={{fontSize:18,opacity:0.7}}>Chưa có bài học nào trong khóa học này.</p>
              <button onClick={() => navigate('/')} style={{background:'#0056D2',color:'white',border:'none',padding:'10px 24px',borderRadius:6,cursor:'pointer'}}>
                Về trang chủ
              </button>
            </div>
          )}
        </main>
        
        <aside style={{width:350,background:'white',borderLeft:'1px solid #ddd',overflowY:'auto',color:'#1c1d1f'}}>
           <div style={{padding:20,borderBottom:'1px solid #ddd',fontWeight:800,fontSize:15}}>
             Nội dung học tập
             <span style={{float:'right',fontSize:12,color:'#64748b',fontWeight:400}}>
               {lessons.length} bài học
             </span>
           </div>
           {lessons.length === 0 ? (
             <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>
               <div style={{fontSize:40,marginBottom:12}}>📝</div>
               <p>Chưa có bài học nào</p>
             </div>
           ) : lessons.map((ls, idx) => (
             <div key={ls.id} onClick={() => setActiveLesson(ls)}
               style={{
                 padding:'14px 16px', cursor:'pointer',
                 background: activeLesson?.id === ls.id ? '#eff6ff' : 'transparent',
                 borderBottom:'1px solid #f1f5f9',
                 borderLeft: activeLesson?.id === ls.id ? '3px solid #0056D2' : '3px solid transparent',
                 transition:'all 0.15s'
               }}>
               <div style={{display:'flex',alignItems:'center',gap:10}}>
                 <span style={{
                   width:24, height:24, borderRadius:'50%',
                   background: progress[ls.id] === 'completed' ? '#16a34a' : activeLesson?.id === ls.id ? '#0056D2' : '#e2e8f0',
                   color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                   fontSize:11, fontWeight:700, flexShrink:0
                 }}>
                   {progress[ls.id] === 'completed' ? '✓' : idx + 1}
                 </span>
                 <div style={{flex:1}}>
                   <div style={{
                     fontSize:13, fontWeight: activeLesson?.id === ls.id ? 700 : 500,
                     color: activeLesson?.id === ls.id ? '#0056D2' : '#1c1d1f',
                     lineHeight:1.4
                   }}>
                     {ls.title}
                   </div>
                   {ls.video_url ? (
                     <span style={{fontSize:11,color:'#16a34a'}}>▶ Có video</span>
                   ) : (
                     <span style={{fontSize:11,color:'#94a3b8'}}>📄 Bài đọc</span>
                   )}
                 </div>
               </div>
             </div>
           ))}
        </aside>
      </div>
    </div>
  );
}
