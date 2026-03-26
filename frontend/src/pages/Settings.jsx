import React from 'react';

export default function Settings() {
  return (
    <div className="container" style={{maxWidth: '800px', margin: '48px auto', padding: '0 20px'}}>
      <h1 style={{fontSize: '32px', marginBottom: '8px', fontWeight: '700'}}>Cài đặt tài khoản</h1>
      <p style={{color: '#666', borderBottom: '1px solid #ddd', paddingBottom: '24px', marginBottom: '40px'}}>Quản lý thông tin cá nhân và tài khoản của bạn.</p>

      {/* SECTION HỒ SƠ */}
      <div style={{marginBottom: '56px'}}>
         <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '24px'}}>Hồ sơ cá nhân</h2>
         <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div style={{display: 'flex', gap: '24px'}}>
               <div style={{width: '96px', height: '96px', background: '#ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>👤</div>
               <div style={{flexGrow: 1}}>
                  <p style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>Ảnh hồ sơ</p>
                  <p style={{fontSize: '13px', color: '#666', marginBottom: '12px'}}>Ảnh của bạn sẽ hiển thị công khai cho các học viên khác.</p>
                  <button style={{border: '1px solid #0056d2', color: '#0056d2', padding: '8px 16px', borderRadius: '4px', background: 'transparent', fontWeight: '600', cursor: 'pointer'}}>Thay đổi ảnh</button>
               </div>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
               <label style={{fontSize: '13px', fontWeight: '600'}}>Tên hiển thị</label>
               <input type="text" placeholder="Nguyễn Văn A" style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px'}} />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
               <label style={{fontSize: '13px', fontWeight: '600'}}>Giới thiệu bản thân</label>
               <textarea placeholder="Viết một vài dòng về bạn..." style={{padding: '12px', border: '1px solid #ddd', borderRadius: '4px', height: '100px'}} />
            </div>
         </div>
      </div>

      {/* SECTION BẢO MẬT */}
      <div style={{marginBottom: '56px'}}>
         <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '24px', borderTop: '1px solid #eee', paddingTop: '40px'}}>Bảo mật</h2>
         <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <p style={{fontSize: '14px', fontWeight: '600'}}>Email</p>
            <p style={{fontSize: '14px'}}>nguyen@gmail.com</p>
            <button style={{background: '#0056d2', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', width: 'fit-content'}}>Lưu thay đổi</button>
         </div>
      </div>
    </div>
  );
}
