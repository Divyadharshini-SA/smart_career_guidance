import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

// ── Test type config ──────────────────────────────────────────
const TEST_TYPES = [
  {
    key: 'aptitude', label: 'Aptitude', icon: '📊', color: '#6C63FF',
    bg: 'linear-gradient(135deg,#6C63FF,#a78bfa)',
    topics: [
      'Percentages','Profit & Loss','Time & Work','Speed & Distance',
      'Simple Interest','Compound Interest','Number Series',
      'Logical Reasoning','Blood Relations','Coding & Decoding','Verbal Ability'
    ]
  },
  {
    key: 'technical', label: 'Technical', icon: '💻', color: '#FF6584',
    bg: 'linear-gradient(135deg,#FF6584,#ff8fab)',
    topics: [
      'Python','Data Structures','Algorithms','DBMS',
      'Networking','OOP','Operating Systems','Web Development'
    ]
  },
  {
    key: 'soft_skill', label: 'Soft Skills', icon: '🤝', color: '#43E97B',
    bg: 'linear-gradient(135deg,#43E97B,#38f9d7)',
    topics: [
      'Communication','Time Management','Leadership','Teamwork',
      'Problem Solving','Interview Skills','Emotional Intelligence'
    ]
  }
];

const QUESTIONS_PER_TEST = 10;

export default function Assessment() {
  // screen: 'home' | 'type' | 'topic' | 'quiz' | 'result'
  const [screen,    setScreen]    = useState('home');
  const [testType,  setTestType]  = useState(null);
  const [topic,     setTopic]     = useState(null);  // null = general
  const [testNum,   setTestNum]   = useState(1);     // which test set
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [history,   setHistory]   = useState([]);
  const [topicCounts, setTopicCounts] = useState({});

  useEffect(() => {
    API.get('/assessment/history').then(r => setHistory(r.data)).catch(() => {});
  }, []);

  // Load question counts per topic when type is selected
  const loadTopicCounts = async (type) => {
    try {
      const res = await API.get(`/assessment/topic-counts/${type.key}`);
      setTopicCounts(res.data);
    } catch {
      // fallback: assume 40 per topic
      const counts = {};
      type.topics.forEach(t => counts[t] = 40);
      setTopicCounts(counts);
    }
  };

  const selectType = async (type) => {
    setTestType(type);
    await loadTopicCounts(type);
    setScreen('type');
  };

  // Start general test (random questions from all topics)
  const startGeneralTest = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/assessment/questions/${testType.key}?level=all&topic=all&count=10`
      );
      if (!res.data.questions?.length) {
        toast.warning('No questions found! Please ask admin to upload questions.');
        return;
      }
      setTopic(null);
      setTestNum(0);
      setQuestions(res.data.questions);
      setAnswers({});
      setResult(null);
      setScreen('quiz');
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  // Start specific topic test (test 1, 2, 3...)
  const startTopicTest = async (topicName, testNumber) => {
    setLoading(true);
    try {
      const skip = (testNumber - 1) * QUESTIONS_PER_TEST;
      const res  = await API.get(
        `/assessment/questions/${testType.key}?topic=${encodeURIComponent(topicName)}&count=10&skip=${skip}&level=all`
      );
      if (!res.data.questions?.length) {
        toast.warning(`No questions for Test ${testNumber}. Try a lower test number.`);
        return;
      }
      setTopic(topicName);
      setTestNum(testNumber);
      setQuestions(res.data.questions);
      setAnswers({});
      setResult(null);
      setScreen('quiz');
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  const submitTest = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.warning(`Please answer all ${questions.length} questions!`);
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/assessment/submit', {
        type: testType.key, answers
      });
      setResult(res.data);
      setHistory(prev => [{
        type: testType.key,
        percentage: res.data.percentage,
        taken_at: new Date().toISOString()
      }, ...prev]);
      setScreen('result');
      toast.success('Submitted! 🎉');
    } catch { toast.error('Submission failed'); }
    finally { setLoading(false); }
  };

  const goHome  = () => { setScreen('home'); setTestType(null); setQuestions([]); setAnswers({}); setResult(null); };
  const goType  = () => { setScreen('type'); setQuestions([]); setAnswers({}); setResult(null); };

  // How many tests available for a topic
  const testCount = (topicName) => {
    const count = topicCounts[topicName] || 40;
    return Math.max(1, Math.floor(count / QUESTIONS_PER_TEST));
  };

  // ── HOME ─────────────────────────────────────────────────────
  if (screen === 'home') return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#2D2D2D', marginBottom: 6 }}>
          📝 Placement Assessment Center
        </h1>
        <p style={{ color: '#7A7A9D', fontSize: 15 }}>
          Topic-wise tests just like IndiaBix — General Test + Topic Practice Sets
        </p>
      </div>

      {/* 3 Test Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 36 }}>
        {TEST_TYPES.map(t => (
          <div key={t.key} onClick={() => selectType(t)}
            style={{
              background: t.bg, borderRadius: 20, padding: 28, cursor: 'pointer',
              boxShadow: `0 8px 32px ${t.color}33`,
              transition: 'all 0.25s', color: '#fff'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{t.icon}</div>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{t.label} Test</h2>
            <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 16 }}>
              {t.topics.length} topics • General + Topic-wise tests
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {t.topics.slice(0, 4).map(top => (
                <span key={top} style={{
                  background: 'rgba(255,255,255,0.25)', borderRadius: 10,
                  padding: '3px 10px', fontSize: 12, fontWeight: 700
                }}>{top}</span>
              ))}
              {t.topics.length > 4 && (
                <span style={{
                  background: 'rgba(255,255,255,0.25)', borderRadius: 10,
                  padding: '3px 10px', fontSize: 12, fontWeight: 700
                }}>+{t.topics.length - 4} more</span>
              )}
            </div>
            <div style={{
              marginTop: 20, background: 'rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '10px 16px',
              fontWeight: 800, fontSize: 14, textAlign: 'center'
            }}>
              Start {t.label} Test →
            </div>
          </div>
        ))}
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 800, marginBottom: 14 }}>📋 Recent Tests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: '#F8F9FF', borderRadius: 10
              }}>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {h.type.replace('_', ' ')}
                </span>
                <span style={{
                  fontWeight: 900,
                  color: h.percentage >= 70 ? '#43E97B' : h.percentage >= 50 ? '#F9A825' : '#FF6584'
                }}>{h.percentage?.toFixed(1)}%</span>
                <span style={{ color: '#7A7A9D', fontSize: 13 }}>
                  {new Date(h.taken_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── TYPE PAGE (General + Topics) ─────────────────────────────
  if (screen === 'type' && testType) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={goHome} style={{
          background: 'none', border: '2px solid #E0E7FF', borderRadius: 10,
          padding: '8px 14px', cursor: 'pointer', fontWeight: 700, color: '#6C63FF'
        }}>← Back</button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#2D2D2D', margin: 0 }}>
            {testType.icon} {testType.label} Test
          </h1>
          <p style={{ color: '#7A7A9D', margin: 0, fontSize: 14 }}>
            Choose General Test or practice topic-wise
          </p>
        </div>
      </div>

      {/* General Test Card */}
      <div style={{
        background: testType.bg, borderRadius: 20, padding: 28,
        marginBottom: 32, color: '#fff',
        boxShadow: `0 8px 32px ${testType.color}44`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
              🎯 General Test
            </h2>
            <p style={{ opacity: 0.85, fontSize: 14, margin: 0 }}>
              10 random questions from all {testType.label.toLowerCase()} topics mixed together
            </p>
          </div>
          <button onClick={startGeneralTest} disabled={loading} style={{
            background: '#fff', color: testType.color,
            border: 'none', borderRadius: 14, padding: '14px 24px',
            fontWeight: 900, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif'
          }}>
            {loading ? '⏳ Loading...' : '🚀 Start Now'}
          </button>
        </div>
      </div>

      {/* Topic-wise Tests */}
      <h2 style={{ fontWeight: 900, fontSize: 18, color: '#2D2D2D', marginBottom: 16 }}>
        📚 Topic-wise Practice
      </h2>
      <p style={{ color: '#7A7A9D', fontSize: 14, marginBottom: 20, marginTop: -10 }}>
        Each test has 10 questions. Complete all tests to master each topic!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {testType.topics.map(topicName => {
          const numTests = testCount(topicName);
          return (
            <div key={topicName} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                {/* Topic name */}
                <div style={{ minWidth: 160 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: '#2D2D2D', margin: 0 }}>
                    {topicName}
                  </h3>
                  <p style={{ color: '#7A7A9D', fontSize: 13, margin: '3px 0 0' }}>
                    {numTests * QUESTIONS_PER_TEST} questions • {numTests} tests
                  </p>
                </div>

                {/* Test buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Array.from({ length: numTests }, (_, i) => i + 1).map(testN => (
                    <button
                      key={testN}
                      onClick={() => startTopicTest(topicName, testN)}
                      disabled={loading}
                      style={{
                        padding: '8px 16px', borderRadius: 10,
                        border: `2px solid ${testType.color}`,
                        background: '#fff', color: testType.color,
                        fontWeight: 800, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'Nunito, sans-serif',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = testType.color;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = testType.color;
                      }}>
                      Test {testN}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── QUIZ SCREEN ───────────────────────────────────────────────
  if (screen === 'quiz') return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#2D2D2D', margin: 0 }}>
            {testType.icon} {topic ? `${topic} — Test ${testNum}` : `${testType.label} General Test`}
          </h1>
          <p style={{ color: '#7A7A9D', fontSize: 13, margin: '4px 0 0' }}>
            {questions.length} Questions
          </p>
        </div>
        <div style={{
          background: '#F0EEFF', borderRadius: 12, padding: '8px 16px',
          fontWeight: 800, color: testType.color, fontSize: 14
        }}>
          {Object.keys(answers).length}/{questions.length} answered
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 8, background: '#E0E7FF', borderRadius: 8, marginBottom: 24, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: 8,
          background: testType.bg,
          width: `${(Object.keys(answers).length / questions.length) * 100}%`,
          transition: 'width 0.3s'
        }} />
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, i) => (
          <div key={q.id} className="card" style={{
            border: `2px solid ${answers[q.id] ? testType.color + '66' : '#E0E7FF'}`,
            transition: 'border 0.2s'
          }}>
            {/* Question header */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
              <span style={{
                background: testType.color, color: '#fff',
                borderRadius: 8, padding: '3px 11px',
                fontWeight: 800, fontSize: 13, flexShrink: 0
              }}>Q{i + 1}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: testType.color,
                background: testType.color + '18', borderRadius: 6, padding: '2px 8px'
              }}>{q.topic}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#7A7A9D',
                background: '#F0F4FF', borderRadius: 6, padding: '2px 8px',
                textTransform: 'capitalize'
              }}>{q.level}</span>
            </div>

            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, lineHeight: 1.5, color: '#2D2D2D' }}>
              {q.question}
            </p>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  style={{
                    padding: '12px 16px', borderRadius: 10, border: '2px solid',
                    borderColor: answers[q.id] === opt ? testType.color : '#E0E7FF',
                    background: answers[q.id] === opt ? testType.color + '18' : '#fff',
                    color: answers[q.id] === opt ? testType.color : '#2D2D2D',
                    fontWeight: answers[q.id] === opt ? 800 : 600,
                    cursor: 'pointer', fontSize: 14, textAlign: 'left',
                    fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s'
                  }}>
                  <span style={{ fontWeight: 900, marginRight: 6 }}>
                    {['A', 'B', 'C', 'D'][oi]}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={goType} style={{
          padding: '13px 20px', borderRadius: 12, border: '2px solid #E0E7FF',
          background: '#fff', color: '#7A7A9D', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
        }}>← Back</button>
        <button onClick={submitTest} disabled={loading} style={{
          flex: 1, padding: '13px', borderRadius: 12, border: 'none',
          background: testType.bg, color: '#fff',
          fontWeight: 900, fontSize: 16, cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
          boxShadow: `0 4px 16px ${testType.color}44`
        }}>
          {loading ? '⏳ Submitting...' : '✅ Submit Test'}
        </button>
      </div>
    </div>
  );

  // ── RESULT SCREEN ─────────────────────────────────────────────
  if (screen === 'result' && result) return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: '#2D2D2D', marginBottom: 24 }}>
        🎉 Test Results
      </h1>

      {/* Score card */}
      <div className="card" style={{
        textAlign: 'center', padding: 36, marginBottom: 24,
        background: testType.bg, color: '#fff',
        boxShadow: `0 8px 32px ${testType.color}44`
      }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>
          {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '🎯' : result.percentage >= 40 ? '📚' : '💪'}
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 6 }}>
          {result.percentage}%
        </div>
        <p style={{ opacity: 0.85, fontSize: 16 }}>
          {result.score} correct out of {result.total} questions
        </p>
        {topic && (
          <p style={{ opacity: 0.75, fontSize: 14, marginTop: 4 }}>
            {topic} — Test {testNum}
          </p>
        )}
        <div style={{
          marginTop: 16, background: 'rgba(255,255,255,0.2)',
          borderRadius: 14, padding: '10px 20px', display: 'inline-block',
          fontWeight: 800, fontSize: 15
        }}>
          {result.percentage >= 70 ? '🚀 Excellent! Ready for placement!'
            : result.percentage >= 50 ? '💪 Good! Keep practising!'
            : '📖 Needs more practice!'}
        </div>
      </div>

      {/* Topic breakdown */}
      {Object.keys(result.topic_scores || {}).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>📊 Topic-wise Score</h3>
          {Object.entries(result.topic_scores).map(([t, pct]) => (
            <div key={t} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t}</span>
                <span style={{
                  fontWeight: 900,
                  color: pct >= 70 ? '#43E97B' : pct >= 50 ? '#F9A825' : '#FF6584'
                }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: '#E0E7FF', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 8, width: `${pct}%`,
                  background: pct >= 70 ? '#43E97B' : pct >= 50 ? '#F9A825' : '#FF6584',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weak topics */}
      {Object.entries(result.topic_scores || {}).some(([, v]) => v < 50) && (
        <div className="card" style={{
          background: '#FFF5F5', border: '2px solid #FF658433', marginBottom: 20
        }}>
          <h3 style={{ fontWeight: 800, color: '#FF6584', marginBottom: 10 }}>
            ⚠️ Topics to Improve
          </h3>
          {Object.entries(result.topic_scores).filter(([, v]) => v < 50).map(([t]) => (
            <div key={t} style={{
              padding: '8px 12px', background: '#fff', borderRadius: 8,
              marginBottom: 6, fontWeight: 700, fontSize: 14
            }}>
              📌 Practise more: <span style={{ color: '#FF6584' }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {topic && (
          <button onClick={() => startTopicTest(topic, testNum)} style={{
            flex: 1, padding: '13px', borderRadius: 12, border: 'none',
            background: testType.bg, color: '#fff',
            fontWeight: 900, cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
          }}>🔄 Retry This Test</button>
        )}
        {topic && testNum < testCount(topic) && (
          <button onClick={() => startTopicTest(topic, testNum + 1)} style={{
            flex: 1, padding: '13px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#43E97B,#38f9d7)', color: '#fff',
            fontWeight: 900, cursor: 'pointer', fontFamily: 'Nunito, sans-serif'
          }}>➡️ Next Test ({testNum + 1})</button>
        )}
        <button onClick={goType} style={{
          flex: 1, padding: '13px', borderRadius: 12,
          border: '2px solid #E0E7FF', background: '#fff',
          color: '#7A7A9D', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif'
        }}>📚 All Topics</button>
        <button onClick={goHome} style={{
          padding: '13px 18px', borderRadius: 12,
          border: '2px solid #E0E7FF', background: '#fff',
          color: '#7A7A9D', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif'
        }}>🏠</button>
      </div>
    </div>
  );

  return null;
}


// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import API from '../api';

// const TYPES = [
//   { key:'aptitude',   label:'📊 Aptitude Test',       color:'#6C63FF', desc:'Quantitative, Logical & Verbal' },
//   { key:'technical',  label:'💻 Technical Test',       color:'#FF6584', desc:'Python, DSA, DBMS, Networking' },
//   { key:'soft_skill', label:'🤝 Soft Skills Test',     color:'#43E97B', desc:'Communication, Leadership, Time Mgmt' },
// ];

// export default function Assessment() {
//   const [type, setType]         = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers]   = useState({});
//   const [result, setResult]     = useState(null);
//   const [loading, setLoading]   = useState(false);

//   const startTest = async (t) => {
//     setLoading(true);
//     try {
//       const res = await API.get(`/assessment/questions/${t}`);
//       setQuestions(res.data.questions);
//       setType(t);
//       setAnswers({});
//       setResult(null);
//     } catch { toast.error('Failed to load questions'); }
//     finally { setLoading(false); }
//   };

//   const submit = async () => {
//     if (Object.keys(answers).length < questions.length) {
//       toast.warning('Please answer all questions!'); return;
//     }
//     setLoading(true);
//     try {
//       const res = await API.post('/assessment/submit', { type, answers });
//       setResult(res.data);
//       toast.success('Assessment submitted! 🎉');
//     } catch { toast.error('Submission failed'); }
//     finally { setLoading(false); }
//   };

//   // Results screen
//   if (result) return (
//     <div>
//       <h1 className="page-title">🎉 Assessment Complete!</h1>
//       <div className="card" style={{ maxWidth:500, textAlign:'center', padding:40 }}>
//         <div style={{ fontSize:64, marginBottom:16 }}>
//           {result.percentage >= 70 ? '🏆' : result.percentage >= 50 ? '👍' : '📚'}
//         </div>
//         <h2 style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>Your Score</h2>
//         <div style={{ fontSize:48, fontWeight:900, color:'#6C63FF', marginBottom:4 }}>
//           {result.percentage}%
//         </div>
//         <p style={{ color:'#7A7A9D', marginBottom:24 }}>{result.score} out of {result.total} correct</p>
//         <div style={{ textAlign:'left', marginBottom:24 }}>
//           <h3 style={{ fontWeight:800, marginBottom:12 }}>Topic-wise Scores:</h3>
//           {Object.entries(result.topic_scores || {}).map(([topic, score]) => (
//             <div key={topic} style={{ marginBottom:10 }}>
//               <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
//                 <span style={{ fontWeight:700, textTransform:'capitalize' }}>{topic}</span>
//                 <span style={{ fontWeight:700, color:'#6C63FF' }}>{score}</span>
//               </div>
//               <div className="progress-bar-wrap">
//                 <div className="progress-bar-fill" style={{ width:`${(score/3)*100}%` }} />
//               </div>
//             </div>
//           ))}
//         </div>
//         <button className="btn btn-primary" onClick={() => { setType(null); setResult(null); setQuestions([]); }}>
//           🔄 Take Another Test
//         </button>
//       </div>
//     </div>
//   );

//   // Quiz screen
//   if (type && questions.length) return (
//     <div>
//       <h1 className="page-title">📝 {TYPES.find(t=>t.key===type)?.label}</h1>
//       <p className="page-sub">{questions.length} questions • Answer all before submitting</p>
//       <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:700 }}>
//         {questions.map((q, i) => (
//           <div key={q.id} className="card">
//             <p style={{ fontWeight:800, fontSize:16, marginBottom:16 }}>
//               <span style={{ color:'#6C63FF' }}>Q{i+1}.</span> {q.question}
//             </p>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
//               {q.options.map(opt => (
//                 <button key={opt} onClick={() => setAnswers({...answers, [q.id]: opt})}
//                   style={{
//                     padding:'12px 16px', borderRadius:10, border:'2px solid',
//                     borderColor: answers[q.id] === opt ? '#6C63FF' : '#E0E7FF',
//                     background: answers[q.id] === opt ? '#F0EEFF' : '#fff',
//                     color: answers[q.id] === opt ? '#6C63FF' : '#2D2D2D',
//                     fontWeight: answers[q.id] === opt ? 800 : 600,
//                     cursor:'pointer', fontSize:14, textAlign:'left', fontFamily:'Nunito,sans-serif'
//                   }}>
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//         <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ alignSelf:'flex-start', fontSize:16, padding:'14px 32px' }}>
//           {loading ? '⏳ Submitting...' : '✅ Submit Assessment'}
//         </button>
//       </div>
//     </div>
//   );

//   // Test selection screen
//   return (
//     <div>
//       <h1 className="page-title">📝 Assessments</h1>
//       <p className="page-sub">Choose a test to evaluate your skills</p>
//       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
//         {TYPES.map(t => (
//           <div key={t.key} className="card" style={{ cursor:'pointer', padding:32, textAlign:'center', border:`2px solid ${t.color}33` }}
//             onClick={() => startTest(t.key)}>
//             <div style={{ fontSize:40, marginBottom:16 }}>{t.label.split(' ')[0]}</div>
//             <h3 style={{ fontWeight:800, color:t.color, marginBottom:8 }}>{t.label.slice(3)}</h3>
//             <p style={{ color:'#7A7A9D', fontSize:14, marginBottom:20 }}>{t.desc}</p>
//             <button className="btn" style={{ background:t.color, color:'#fff', width:'100%', justifyContent:'center' }}>
//               {loading ? 'Loading...' : 'Start Test →'}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
