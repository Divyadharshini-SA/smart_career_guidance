import React, { useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const TYPES = [
  { key:'aptitude',   label:'📊 Aptitude Test',       color:'#6C63FF', desc:'Quantitative, Logical & Verbal' },
  { key:'technical',  label:'💻 Technical Test',       color:'#FF6584', desc:'Python, DSA, DBMS, Networking' },
  { key:'soft_skill', label:'🤝 Soft Skills Test',     color:'#43E97B', desc:'Communication, Leadership, Time Mgmt' },
];

export default function Assessment() {
  const [type, setType]         = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const startTest = async (t) => {
    setLoading(true);
    try {
      const res = await API.get(`/assessment/questions/${t}`);
      setQuestions(res.data.questions);
      setType(t);
      setAnswers({});
      setResult(null);
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.warning('Please answer all questions!'); return;
    }
    setLoading(true);
    try {
      const res = await API.post('/assessment/submit', { type, answers });
      setResult(res.data);
      toast.success('Assessment submitted! 🎉');
    } catch { toast.error('Submission failed'); }
    finally { setLoading(false); }
  };

  // Results screen
  if (result) return (
    <div>
      <h1 className="page-title">🎉 Assessment Complete!</h1>
      <div className="card" style={{ maxWidth:500, textAlign:'center', padding:40 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>
          {result.percentage >= 70 ? '🏆' : result.percentage >= 50 ? '👍' : '📚'}
        </div>
        <h2 style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>Your Score</h2>
        <div style={{ fontSize:48, fontWeight:900, color:'#6C63FF', marginBottom:4 }}>
          {result.percentage}%
        </div>
        <p style={{ color:'#7A7A9D', marginBottom:24 }}>{result.score} out of {result.total} correct</p>
        <div style={{ textAlign:'left', marginBottom:24 }}>
          <h3 style={{ fontWeight:800, marginBottom:12 }}>Topic-wise Scores:</h3>
          {Object.entries(result.topic_scores || {}).map(([topic, score]) => (
            <div key={topic} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontWeight:700, textTransform:'capitalize' }}>{topic}</span>
                <span style={{ fontWeight:700, color:'#6C63FF' }}>{score}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width:`${(score/3)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setType(null); setResult(null); setQuestions([]); }}>
          🔄 Take Another Test
        </button>
      </div>
    </div>
  );

  // Quiz screen
  if (type && questions.length) return (
    <div>
      <h1 className="page-title">📝 {TYPES.find(t=>t.key===type)?.label}</h1>
      <p className="page-sub">{questions.length} questions • Answer all before submitting</p>
      <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:700 }}>
        {questions.map((q, i) => (
          <div key={q.id} className="card">
            <p style={{ fontWeight:800, fontSize:16, marginBottom:16 }}>
              <span style={{ color:'#6C63FF' }}>Q{i+1}.</span> {q.question}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {q.options.map(opt => (
                <button key={opt} onClick={() => setAnswers({...answers, [q.id]: opt})}
                  style={{
                    padding:'12px 16px', borderRadius:10, border:'2px solid',
                    borderColor: answers[q.id] === opt ? '#6C63FF' : '#E0E7FF',
                    background: answers[q.id] === opt ? '#F0EEFF' : '#fff',
                    color: answers[q.id] === opt ? '#6C63FF' : '#2D2D2D',
                    fontWeight: answers[q.id] === opt ? 800 : 600,
                    cursor:'pointer', fontSize:14, textAlign:'left', fontFamily:'Nunito,sans-serif'
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ alignSelf:'flex-start', fontSize:16, padding:'14px 32px' }}>
          {loading ? '⏳ Submitting...' : '✅ Submit Assessment'}
        </button>
      </div>
    </div>
  );

  // Test selection screen
  return (
    <div>
      <h1 className="page-title">📝 Assessments</h1>
      <p className="page-sub">Choose a test to evaluate your skills</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
        {TYPES.map(t => (
          <div key={t.key} className="card" style={{ cursor:'pointer', padding:32, textAlign:'center', border:`2px solid ${t.color}33` }}
            onClick={() => startTest(t.key)}>
            <div style={{ fontSize:40, marginBottom:16 }}>{t.label.split(' ')[0]}</div>
            <h3 style={{ fontWeight:800, color:t.color, marginBottom:8 }}>{t.label.slice(3)}</h3>
            <p style={{ color:'#7A7A9D', fontSize:14, marginBottom:20 }}>{t.desc}</p>
            <button className="btn" style={{ background:t.color, color:'#fff', width:'100%', justifyContent:'center' }}>
              {loading ? 'Loading...' : 'Start Test →'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
