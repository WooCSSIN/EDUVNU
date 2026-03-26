import React, { useState } from 'react';

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState('IN_PROGRESS');

  const tabs = [
    { id: 'IN_PROGRESS', label: 'Đang học' },
    { id: 'COMPLETED', label: 'Hoàn tất' },
    { id: 'ARCHIVED', label: 'Đã lưu trữ' }
  ];

  return (
    <div className="container" style={{maxWidth: '1000px', padding: '60px 20px'}}>
      <h1 style={{fontSize: '32px', marginBottom: '32px'}}>Việc học của tôi</h1>
      
      {/* TABS COURSERA STYLE */}
      <div style={{display: 'flex', gap: '32px', borderBottom: '1px solid #ddd', marginBottom: '40px'}}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: '600', color: activeTab === tab.id ? '#0056d2' : '#666',
              borderBottom: activeTab === tab.id ? '3px solid #0056d2' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LEARNING CARDS */}
      <div className="learning-list" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {/* Mockup card dang hoc */}
        <div style={{display: 'flex', gap: '24px', padding: '24px', border: '1px solid #eee', borderRadius: '8px'}}>
           <div style={{width: '200px', height: '110px', background: '#00255b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
              <span style={{fontSize: '12px'}}>Google Analytics</span>
           </div>
           <div style={{flexGrow: 1}}>
              <p style={{fontSize: '12px', fontWeight: '600', color: '#666'}}>Google</p>
              <h3 style={{fontSize: '18px', margin: '4px 0 12px 0'}}>Google Data Analytics Professional Certificate</h3>
              <div style={{width: '100%', height: '8px', background: '#eee', borderRadius: '4px', position: 'relative'}}>
                 <div style={{width: '35%', height: '100%', background: '#0056d2', borderRadius: '4px'}}></div>
              </div>
              <p style={{fontSize: '13px', marginTop: '8px', color: '#444'}}>Đã hoàn thành 35% nội dung</p>
           </div>
           <button style={{alignSelf: 'center', padding: '12px 24px', background: '#0056d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer'}}>
              Tiếp tục học
           </button>
        </div>
      </div>
    </div>
  );
}
