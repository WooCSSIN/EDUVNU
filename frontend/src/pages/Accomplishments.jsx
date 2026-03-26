import React from 'react';

export default function Accomplishments() {
  const certs = [
    { title: 'Google Data Analytics Professional Certificate', university: 'Google', date: '2026-03-01', id: 'CERT-1234' },
    { title: 'Python for Beginners', university: 'University of Michigan', date: '2026-02-15', id: 'CERT-5678' }
  ];

  return (
    <div className="container" style={{maxWidth: '1000px', padding: '64px 20px'}}>
      <h1 style={{fontSize: '32px', marginBottom: '8px', fontWeight: '700'}}>Thành tích của tôi</h1>
      <p style={{color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '24px', marginBottom: '40px'}}>Chia sẻ các kỹ năng và chứng chỉ bạn đã nỗ lực đạt được.</p>

      {/* GRID NHƯNG DẠNG DANH SÁCH CHI TIẾT */}
      <div className="certs-grid" style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
        {certs.map(cert => (
          <div key={cert.id} style={{display: 'flex', gap: '32px', padding: '32px', border: '1px solid #eee', borderRadius: '8px', position: 'relative'}}>
            {/* MINI CERT LOGO */}
            <div style={{width: '120px', height: '160px', background: '#f8f9fa', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 8px rgba(0,0,0,0.05)'}}>
               📜
            </div>
            
            <div style={{flexGrow: 1}}>
               <p style={{fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px'}}>{cert.university}</p>
               <h3 style={{fontSize: '20px', fontWeight: '700', marginBottom: '12px'}}>{cert.title}</h3>
               <p style={{fontSize: '14px', color: '#444', marginBottom: '8px'}}>Hoàn thành vào ngày: {cert.date}</p>
               <p style={{fontSize: '13px', color: '#666', marginBottom: '24px'}}>Mã số chứng chỉ: {cert.id}</p>
               
               <div style={{display: 'flex', gap: '16px'}}>
                  <button style={{background: '#0056d2', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', fontWeight: '600', cursor: 'pointer'}}>Xem chứng chỉ (PDF) 📄</button>
                  <button style={{background: 'transparent', color: '#0056d2', border: '1px solid #0056d2', padding: '10px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer'}}>Chia sẻ lên LinkedIn 🔗</button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
