import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../api';

export default function Progress() {
  const [prog, setProg] = useState(null);

  useEffect(() => { API.get('/progress/').then(r => setProg(r.data)).catch(() => {}); }, []);

  if (!prog) return <div><h1 className="page-title">📊 Progress Tracker</h1><p style={{color:'#7A7A9D'}}>Loading...</p></div>;

  const radarData = [
    { subject:'Skills',    val: prog.skill_score    || 0 },
    { subject:'Aptitude',  val: prog.aptitude_score || 0 },
    { subject:'Resume',    val: prog.resume_score   || 0 },
    { subject:'Roadmap',   val: prog.roadmap_completion || 0 },
    { subject:'Readiness', val: prog.placement_readiness || 0 },
  ];

  const readiness = prog.placement_readiness || 0;
  const level     = readiness >= 70 ? { label:'Placement Ready 🎉', color:'#43E97B' }
                  : readiness >= 50 ? { label:'Getting There! 💪',  color:'#F9A825' }
                  : { label:'Keep Going! 📚', color:'#FF6584' };

  return (
    <div>
      <h1 className="page-title">📊 Progress Tracker</h1>
      <p className="page-sub">Your overall placement readiness at a glance</p>

      {/* Readiness Hero */}
      <div style={{
        background:`linear-gradient(135deg,${level.color},#6C63FF)`,
        borderRadius:20, padding:'32px 36px', color:'#fff', marginBottom:28,
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div>
          <p style={{ fontSize:16, opacity:0.85, marginBottom:8 }}>Overall Placement Readiness</p>
          <div style={{ fontSize:56, fontWeight:900 }}>{readiness.toFixed(1)}%</div>
          <div style={{ marginTop:10, background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'6px 18px', display:'inline-block', fontWeight:700 }}>
            {level.label}
          </div>
        </div>
        <div style={{ fontSize:80 }}>🎯</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Score cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { label:'Technical Skill Score',  val:prog.skill_score,         color:'#6C63FF', icon:'💻' },
            { label:'Aptitude Score',          val:prog.aptitude_score,      color:'#FF6584', icon:'🧠' },
            { label:'Resume Score',            val:prog.resume_score,        color:'#43E97B', icon:'📄' },
            { label:'Roadmap Completion',      val:prog.roadmap_completion,  color:'#F9A825', icon:'🗺️' },
          ].map(p => (
            <div key={p.label} className="card" style={{ padding:'18px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:22 }}>{p.icon}</span>
                  <span style={{ fontWeight:700, fontSize:15 }}>{p.label}</span>
                </div>
                <span style={{ fontWeight:900, fontSize:20, color:p.color }}>{(p.val||0).toFixed(1)}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width:`${p.val||0}%`, background:p.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 style={{ fontWeight:800, marginBottom:16 }}>🕸️ Skills Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontFamily:'Nunito', fontWeight:700, fontSize:13 }} />
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              <Radar name="Score" dataKey="val" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed Steps */}
      {prog.completed_roadmap_steps?.length > 0 && (
        <div className="card" style={{ marginTop:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:14 }}>✅ Completed Roadmap Steps ({prog.completed_roadmap_steps.length})</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {prog.completed_roadmap_steps.map(s => (
              <span key={s} className="badge" style={{ background:'#EFFFEF', color:'#43E97B', fontSize:13, padding:'6px 14px' }}>✓ {s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
