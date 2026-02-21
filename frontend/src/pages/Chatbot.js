import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const SUGGESTIONS = [
  'How do I improve my resume?',
  'What skills should I learn for Data Science?',
  'Tips for technical interview',
  'How to prepare for aptitude test?',
  'Best resources for coding practice',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role:'assistant', text:"Hi! 👋 I'm your AI Career Mentor. Ask me about career guidance, resume tips, skill improvement, or placement preparation!" }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role:'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await API.post('/chatbot/ask', { message: text });
      setMessages(prev => [...prev, { role:'assistant', text: res.data.response }]);
    } catch {
      toast.error('Chatbot error');
      setMessages(prev => [...prev, { role:'assistant', text:"Sorry, I couldn't process that. Please try again!" }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 100px)' }}>
      <h1 className="page-title">🤖 AI Career Mentor</h1>
      <p className="page-sub">Your personal career guidance assistant</p>

      {/* Suggestions */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)} style={{
            background:'#F0EEFF', border:'none', borderRadius:20, padding:'8px 14px',
            fontSize:13, fontWeight:700, color:'#6C63FF', cursor:'pointer'
          }}>{s}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex:1, overflowY:'auto', background:'#fff', borderRadius:16,
        border:'2px solid #E0E7FF', padding:20, display:'flex', flexDirection:'column', gap:14
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#6C63FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, marginRight:10 }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth:'70%', padding:'12px 18px', borderRadius:16,
              background: m.role==='user' ? '#6C63FF' : '#F0EEFF',
              color: m.role==='user' ? '#fff' : '#2D2D2D',
              fontSize:14, fontWeight:600, lineHeight:1.6,
              borderBottomRightRadius: m.role==='user' ? 4 : 16,
              borderBottomLeftRadius:  m.role==='assistant' ? 4 : 16,
            }}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#FF6584', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, marginLeft:10 }}>
                👤
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#6C63FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
            <div style={{ background:'#F0EEFF', padding:'12px 18px', borderRadius:16, borderBottomLeftRadius:4 }}>
              <span style={{ color:'#6C63FF', fontWeight:700 }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:12, marginTop:14 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send()}
          placeholder="Ask anything about your career, skills, or placement..."
          style={{ flex:1, borderRadius:12 }}
        />
        <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}
          style={{ padding:'12px 24px', whiteSpace:'nowrap' }}>
          Send 🚀
        </button>
      </div>
    </div>
  );
}
