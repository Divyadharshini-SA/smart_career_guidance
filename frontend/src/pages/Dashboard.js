import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API from '../api';

const CARDS = [
  { to:'/assessment', icon:'📝', label:'Take Assessment',  color:'#6C63FF', bg:'#F0EEFF' },
  { to:'/resume',     icon:'📄', label:'Upload Resume',    color:'#FF6584', bg:'#FFF0F3' },
  { to:'/career',     icon:'🎯', label:'Career Predict',   color:'#43E97B', bg:'#EFFFEF' },
  { to:'/roadmap',    icon:'🗺️', label:'My Roadmap',       color:'#F9A825', bg:'#FFFBEA' },
  { to:'/placement',  icon:'💼', label:'Placement Prep',   color:'#29B6F6', bg:'#EAF8FF' },
  { to:'/chatbot',    icon:'🤖', label:'AI Mentor',        color:'#AB47BC', bg:'#F9EEFF' },
];

export default function Dashboard() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [prog, setProg] = useState(null);

  useEffect(() => {
    API.get('/progress/').then(r => setProg(r.data)).catch(() => {});
  }, []);

  const readiness = prog?.placement_readiness || 0;
  const level = readiness >= 70 ? '🟢 Placement Ready' : readiness >= 50 ? '🟡 Intermediate' : '🔴 Beginner';

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#6C63FF,#FF6584)',
        borderRadius: 20, padding: '32px 36px', color: '#fff', marginBottom: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ opacity: 0.85, marginTop: 6, fontSize: 16 }}>Track your career readiness and grow every day!</p>
          <span style={{
            display:'inline-block', marginTop:12, background:'rgba(255,255,255,0.2)',
            borderRadius:20, padding:'6px 16px', fontSize:14, fontWeight:700
          }}>{level}</span>
        </div>
        <div style={{ fontSize: 80 }}>🚀</div>
      </div>

      {/* Progress Overview */}
      {prog && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:32 }}>
          {[
            { label:'Skill Score',       val:prog.skill_score,         color:'#6C63FF' },
            { label:'Aptitude Score',    val:prog.aptitude_score,      color:'#FF6584' },
            { label:'Resume Score',      val:prog.resume_score,        color:'#43E97B' },
            { label:'Roadmap Done',      val:prog.roadmap_completion,  color:'#F9A825' },
            { label:'Placement Ready',   val:prog.placement_readiness, color:'#29B6F6' },
          ].map(p => (
            <div key={p.label} className="card" style={{ textAlign:'center', padding:20 }}>
              <div style={{ fontSize:28, fontWeight:900, color:p.color }}>{p.val?.toFixed(0) || 0}%</div>
              <div style={{ fontSize:13, color:'#7A7A9D', marginTop:4, fontWeight:600 }}>{p.label}</div>
              <div className="progress-bar-wrap" style={{ marginTop:10 }}>
                <div className="progress-bar-fill" style={{ width:`${p.val || 0}%`, background:p.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Cards */}
      <h2 style={{ fontWeight:900, fontSize:20, marginBottom:16 }}>Quick Actions</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
        {CARDS.map(c => (
          <div key={c.to} onClick={() => navigate(c.to)} className="card" style={{
            cursor:'pointer', textAlign:'center', padding:28,
            background:c.bg, border:`2px solid ${c.color}22`,
            transition:'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform='none'}
          >
            <div style={{ fontSize:36, marginBottom:12 }}>{c.icon}</div>
            <div style={{ fontWeight:800, fontSize:15, color:c.color }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
