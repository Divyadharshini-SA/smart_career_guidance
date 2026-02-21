import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const INTERESTS = ['Web Development','Data Science','Machine Learning','Cybersecurity','Cloud Computing','Mobile Development','Game Development','IoT/Embedded','DevOps','Blockchain'];
const SKILL_LIST = ['Python','Java','C++','JavaScript','React','Node.js','Machine Learning','SQL','Docker','AWS'];

export default function Profile() {
  const [profile, setProfile] = useState({ interests:[], skills:{}, personality:'', career_goal:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/profile/').then(r => setProfile({
      interests:    r.data.interests    || [],
      skills:       r.data.skills       || {},
      personality:  r.data.personality  || '',
      career_goal:  r.data.career_goal  || ''
    })).catch(() => {});
  }, []);

  const toggleInterest = (i) => {
    setProfile(p => ({
      ...p,
      interests: p.interests.includes(i) ? p.interests.filter(x=>x!==i) : [...p.interests, i]
    }));
  };

  const setSkillRating = (skill, rating) => {
    setProfile(p => ({ ...p, skills: { ...p.skills, [skill]: parseInt(rating) } }));
  };

  const save = async () => {
    setLoading(true);
    try {
      await API.put('/profile/', profile);
      toast.success('Profile saved! ✅');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:800 }}>
      <h1 className="page-title">👤 My Profile</h1>
      <p className="page-sub">Set your interests and rate your skills for accurate career predictions</p>

      {/* Interests */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontWeight:800, marginBottom:16 }}>❤️ My Interests</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {INTERESTS.map(i => (
            <button key={i} onClick={() => toggleInterest(i)} style={{
              padding:'10px 18px', borderRadius:20, border:'2px solid',
              borderColor: profile.interests.includes(i) ? '#6C63FF' : '#E0E7FF',
              background: profile.interests.includes(i) ? '#6C63FF' : '#fff',
              color: profile.interests.includes(i) ? '#fff' : '#7A7A9D',
              fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Nunito,sans-serif'
            }}>{i}</button>
          ))}
        </div>
      </div>

      {/* Skill Ratings */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontWeight:800, marginBottom:16 }}>💡 Rate Your Skills (1-10)</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {SKILL_LIST.map(skill => (
            <div key={skill} style={{ display:'flex', alignItems:'center', gap:16 }}>
              <span style={{ width:130, fontWeight:700, fontSize:14 }}>{skill}</span>
              <input type="range" min="0" max="10" value={profile.skills[skill] || 0}
                onChange={e => setSkillRating(skill, e.target.value)}
                style={{ flex:1, accentColor:'#6C63FF' }} />
              <span style={{ width:36, textAlign:'center', fontWeight:900, color:'#6C63FF', fontSize:16 }}>
                {profile.skills[skill] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Career Goal & Personality */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontWeight:800, marginBottom:16 }}>🎯 Career Goal & Personality</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontWeight:700, fontSize:14, marginBottom:6, display:'block' }}>Career Goal</label>
            <input value={profile.career_goal} onChange={e => setProfile({...profile, career_goal: e.target.value})}
              placeholder="e.g. Become a Data Scientist at a top MNC" />
          </div>
          <div>
            <label style={{ fontWeight:700, fontSize:14, marginBottom:6, display:'block' }}>Personality Type</label>
            <select value={profile.personality} onChange={e => setProfile({...profile, personality: e.target.value})}>
              <option value="">Select personality type</option>
              {['Analytical','Creative','Leader','Team Player','Detail-oriented','Innovative','Communicator'].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={loading} style={{ fontSize:16, padding:'14px 32px' }}>
        {loading ? '⏳ Saving...' : '💾 Save Profile'}
      </button>
    </div>
  );
}
