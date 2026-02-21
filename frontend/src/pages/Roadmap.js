import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const DOMAINS = ['Software Engineer','Data Scientist','Web Developer','AI/ML Engineer','Cloud Engineer','Cybersecurity Analyst','Data Engineer'];

export default function Roadmap() {
  const [domain, setDomain]   = useState('Software Engineer');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState([]);

  useEffect(() => {
    API.get('/roadmap/latest').then(r => { setData(r.data); }).catch(() => {});
    API.get('/progress/').then(r => setDone(r.data.completed_roadmap_steps || [])).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await API.post('/roadmap/generate', { career_domain: domain });
      setData(res.data);
      toast.success('Roadmap generated! 🗺️');
    } catch { toast.error('Failed to generate roadmap'); }
    finally { setLoading(false); }
  };

  const completeStep = async (step) => {
    try {
      await API.post('/roadmap/complete-step', { step });
      setDone(prev => [...prev, step]);
      toast.success('Step completed! 🎉');
    } catch {}
  };

  const LEVEL_COLORS = { beginner:'#43E97B', intermediate:'#F9A825', advanced:'#FF6584' };
  const LEVEL_ICONS  = { beginner:'🌱', intermediate:'🌿', advanced:'🌳' };

  return (
    <div>
      <h1 className="page-title">🗺️ Learning Roadmap</h1>
      <p className="page-sub">Personalized step-by-step career preparation plan</p>

      {/* Generator */}
      <div className="card" style={{ marginBottom:28, maxWidth:600 }}>
        <h2 style={{ fontWeight:800, marginBottom:16 }}>⚙️ Generate New Roadmap</h2>
        <div style={{ display:'flex', gap:12 }}>
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{ flex:1 }}>
            {DOMAINS.map(d => <option key={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? '⏳' : '🚀 Generate'}
          </button>
        </div>
      </div>

      {/* Skill Gap */}
      {data?.skill_gap && (
        <div className="card" style={{ marginBottom:24, maxWidth:800, background:'#FFF0F3', border:'2px solid #FF658433' }}>
          <h3 style={{ fontWeight:800, color:'#FF6584', marginBottom:12 }}>📊 Skill Gap Analysis — {data.skill_gap.career_domain || domain}</h3>
          <div style={{ display:'flex', gap:20, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, fontWeight:900, color:'#FF6584' }}>{data.skill_gap.gap_percentage?.toFixed(1)}%</div>
              <div style={{ fontSize:13, color:'#7A7A9D' }}>Gap</div>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width:`${100-(data.skill_gap.gap_percentage||0)}%`, background:'#43E97B' }} />
              </div>
              <div style={{ fontSize:12, color:'#7A7A9D', marginTop:4 }}>
                {(100-(data.skill_gap.gap_percentage||0)).toFixed(1)}% skills matched
              </div>
            </div>
          </div>
          {data.skill_gap.missing_skills?.length > 0 && (
            <>
              <h4 style={{ fontWeight:700, marginBottom:8 }}>❌ Missing Skills:</h4>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {data.skill_gap.missing_skills.map(s => (
                  <span key={s} className="badge" style={{ background:'#FF658422', color:'#FF6584' }}>{s}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Roadmap Steps */}
      {data?.roadmap?.steps && Object.entries(data.roadmap.steps).map(([level, steps]) => (
        <div key={level} style={{ marginBottom:24 }}>
          <h2 style={{ fontWeight:900, color:LEVEL_COLORS[level], marginBottom:14, fontSize:20 }}>
            {LEVEL_ICONS[level]} {level.charAt(0).toUpperCase()+level.slice(1)} Level
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:700 }}>
            {steps.map((step, i) => {
              const isDone = done.includes(step);
              return (
                <div key={i} className="card" style={{
                  display:'flex', alignItems:'center', gap:16, padding:'16px 20px',
                  border:`2px solid ${isDone ? LEVEL_COLORS[level]+'55' : '#E0E7FF'}`,
                  background: isDone ? LEVEL_COLORS[level]+'11' : '#fff'
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', flexShrink:0,
                    background: isDone ? LEVEL_COLORS[level] : '#E0E7FF',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: isDone ? '#fff' : '#7A7A9D', fontWeight:800, fontSize:14
                  }}>
                    {isDone ? '✓' : i+1}
                  </div>
                  <span style={{ flex:1, fontWeight:600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#7A7A9D' : '#2D2D2D' }}>
                    {step}
                  </span>
                  {!isDone && (
                    <button className="btn" onClick={() => completeStep(step)}
                      style={{ background:LEVEL_COLORS[level]+'22', color:LEVEL_COLORS[level], padding:'6px 14px', fontSize:13 }}>
                      Mark Done
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!data && (
        <div className="card" style={{ textAlign:'center', padding:40, maxWidth:400 }}>
          <div style={{ fontSize:50, marginBottom:12 }}>🗺️</div>
          <h3 style={{ fontWeight:800 }}>No roadmap yet</h3>
          <p style={{ color:'#7A7A9D', fontSize:14, marginTop:8 }}>Select a career domain above and generate your personalized roadmap.</p>
        </div>
      )}
    </div>
  );
}
