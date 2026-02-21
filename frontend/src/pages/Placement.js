import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Placement() {
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [tab,  setTab]  = useState('aptitude');

  useEffect(() => {
    API.get('/placement/preparation').then(r => setData(r.data)).catch(() => {});
    API.get('/placement/jobs').then(r => setJobs(r.data)).catch(() => {});
  }, []);

  const TABS = [
    { key:'aptitude',  label:'📊 Aptitude',  color:'#6C63FF' },
    { key:'coding',    label:'💻 Coding',    color:'#FF6584' },
    { key:'interview', label:'🎤 Interview', color:'#43E97B' },
    { key:'resources', label:'🔗 Resources', color:'#F9A825' },
    { key:'jobs',      label:'💼 Jobs',      color:'#29B6F6' },
  ];

  return (
    <div>
      <h1 className="page-title">💼 Placement Preparation</h1>
      <p className="page-sub">Everything you need to crack campus placements</p>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="btn"
            style={{
              background: tab===t.key ? t.color : '#fff',
              color: tab===t.key ? '#fff' : t.color,
              border: `2px solid ${t.color}`,
              padding:'10px 18px', fontSize:14
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Aptitude Topics */}
      {tab==='aptitude' && data?.aptitude_topics && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
          {data.aptitude_topics.map(t => (
            <div key={t.topic} className="card">
              <h3 style={{ fontWeight:800, color:'#6C63FF', marginBottom:12 }}>📊 {t.topic}</h3>
              {t.subtopics.map(s => (
                <div key={s} style={{ padding:'8px 12px', background:'#F0EEFF', borderRadius:8, marginBottom:6, fontSize:14, fontWeight:600 }}>
                  → {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Coding Topics */}
      {tab==='coding' && data?.coding_topics && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
          {data.coding_topics.map(t => (
            <div key={t.topic} className="card">
              <h3 style={{ fontWeight:800, color:'#FF6584', marginBottom:12 }}>💻 {t.topic}</h3>
              {t.subtopics.map(s => (
                <div key={s} style={{ padding:'8px 12px', background:'#FFF0F3', borderRadius:8, marginBottom:6, fontSize:14, fontWeight:600 }}>
                  → {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Interview Topics */}
      {tab==='interview' && data?.interview_topics && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:600 }}>
          {data.interview_topics.map((t, i) => (
            <div key={t} className="card" style={{ display:'flex', gap:16, alignItems:'center', padding:'16px 20px' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#EFFFEF', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#43E97B', fontSize:16 }}>
                {i+1}
              </div>
              <span style={{ fontWeight:700, fontSize:15 }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Resources */}
      {tab==='resources' && data?.resources && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {Object.entries(data.resources).map(([cat, links]) => (
            <div key={cat}>
              <h3 style={{ fontWeight:800, textTransform:'capitalize', marginBottom:12, color:'#F9A825' }}>📚 {cat}</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                {links.map(r => (
                  <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                    style={{
                      background:'#fff', border:'2px solid #F9A82544', borderRadius:12,
                      padding:'12px 20px', textDecoration:'none', color:'#2D2D2D',
                      fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:8,
                      boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all 0.2s'
                    }}>
                    🔗 {r.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs */}
      {tab==='jobs' && jobs && (
        <div className="card" style={{ maxWidth:600 }}>
          <h2 style={{ fontWeight:800, marginBottom:6 }}>💼 Recommended for: {jobs.career_domain}</h2>
          <p style={{ color:'#7A7A9D', marginBottom:20, fontSize:14 }}>Entry-level roles matching your profile</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {jobs.recommended_roles.map(r => (
              <div key={r} style={{ display:'flex', gap:14, alignItems:'center', padding:'14px 16px', background:'#EAF8FF', borderRadius:12 }}>
                <span style={{ fontSize:20 }}>💼</span>
                <span style={{ fontWeight:700, fontSize:15, color:'#29B6F6' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
