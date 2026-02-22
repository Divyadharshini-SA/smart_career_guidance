import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState('');
  const navigate             = useNavigate();

  const ADMIN_PASSWORD = 'scg_admin_2024'; // change this

  const login = e => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem('admin_access', pwd);
      navigate('/admin');
    } else {
      setError('Wrong password!');
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center',
      background:'linear-gradient(135deg,#2D2D2D,#6C63FF)'
    }}>
      <div style={{ background:'#fff', borderRadius:24, padding:40, width:380,
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
          <h1 style={{ fontWeight:900, fontSize:22, color:'#2D2D2D' }}>Admin Access</h1>
          <p style={{ color:'#7A7A9D', fontSize:14, marginTop:4 }}>
            Restricted to administrators only
          </p>
        </div>
        <form onSubmit={login} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setError(''); }}
            placeholder="Enter admin password"
          />
          {error && (
            <p style={{ color:'#FF6584', fontWeight:700, fontSize:14, textAlign:'center' }}>
              ❌ {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary"
            style={{ justifyContent:'center', fontSize:16, padding:'13px' }}>
            🚀 Access Admin Panel
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:16, color:'#7A7A9D', fontSize:13 }}>
          Students do not have access to this page
        </p>
      </div>
    </div>
  );
}