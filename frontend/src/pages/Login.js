import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const submit = async e => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await API.post('/auth/login', form);
//       login(res.data.token, { id: res.data.user_id, name: res.data.name });
//       toast.success('Welcome back! 🎉');
//       navigate('/');
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Login failed');
//     } finally { setLoading(false); }
//   };
const submit = async e => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await API.post('/auth/login', form);
    console.log('Login response:', res.data);  // debug
    const { token, user_id, name } = res.data;
    login(token, { id: user_id, name: name });
    console.log('Token saved:', localStorage.getItem('token'));  // debug
    toast.success('Welcome back! 🎉');
    navigate('/');
  } catch (err) {
    toast.error(err.response?.data?.error || 'Login failed');
  } finally { setLoading(false); }
};
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#6C63FF 0%,#43E97B 100%)'
    }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 40, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#6C63FF' }}>Smart Career Guidance</h1>
          <p style={{ color: '#7A7A9D', marginTop: 6 }}>Login to your account</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: 'block' }}>📧 Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@email.com" required />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: 'block' }}>🔒 Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#7A7A9D', fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: '#6C63FF', fontWeight: 700 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
