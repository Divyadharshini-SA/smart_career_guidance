import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV = [
  { to: '/',           icon: '🏠', label: 'Dashboard' },
  { to: '/assessment', icon: '📝', label: 'Assessment' },
  { to: '/resume',     icon: '📄', label: 'Resume' },
  { to: '/career',     icon: '🎯', label: 'Career' },
  { to: '/roadmap',    icon: '🗺️', label: 'Roadmap' },
  { to: '/placement',  icon: '💼', label: 'Placement' },
  { to: '/chatbot',    icon: '🤖', label: 'AI Mentor' },
  { to: '/progress',   icon: '📊', label: 'Progress' },
  { to: '/profile',    icon: '👤', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: open ? 230 : 68,
        background: 'linear-gradient(180deg,#6C63FF 0%,#574fd6 100%)',
        transition: 'width 0.3s',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 100, overflowX: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 18px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          {open && <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>Smart Career<br/>Guidance</span>}
        </div>

        {/* Toggle */}
        <button onClick={() => setOpen(!open)} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 18, padding: '6px 10px', borderRadius: 8,
          margin: '0 12px 16px', alignSelf: open ? 'flex-end' : 'center'
        }}>{open ? '◀' : '▶'}</button>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              color: isActive ? '#6C63FF' : 'rgba(255,255,255,0.85)',
              background: isActive ? '#fff' : 'transparent',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap', overflow: 'hidden'
            })}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
              {open && n.label}
            </NavLink>
          ))}

          {/* ── Admin link — only visible if role is admin ── */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              color: isActive ? '#6C63FF' : 'rgba(255,255,255,0.85)',
              background: isActive ? '#fff' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap', overflow: 'hidden',
              marginTop: 8
            })}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚙️</span>
              {open && 'Admin Panel'}
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 14px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          {open && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 }}>
              👋 {user?.name || 'Student'}
              {user?.role === 'admin' && (
                <span style={{
                  marginLeft: 6, background: '#FFD700', color: '#2D2D2D',
                  borderRadius: 6, padding: '1px 6px', fontSize: 11, fontWeight: 900
                }}>ADMIN</span>
              )}
            </p>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px', borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center', gap: 8
          }}>
            <span>🚪</span>{open && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: open ? 230 : 68, flex: 1,
        transition: 'margin-left 0.3s',
        padding: '32px 36px', minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  );
}


// import React, { useState } from 'react';
// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext';

// const NAV = [
//   { to: '/',           icon: '🏠', label: 'Dashboard' },
//   { to: '/assessment', icon: '📝', label: 'Assessment' },
//   { to: '/resume',     icon: '📄', label: 'Resume' },
//   { to: '/career',     icon: '🎯', label: 'Career' },
//   { to: '/roadmap',    icon: '🗺️', label: 'Roadmap' },
//   { to: '/placement',  icon: '💼', label: 'Placement' },
//   { to: '/chatbot',    icon: '🤖', label: 'AI Mentor' },
//   { to: '/progress',   icon: '📊', label: 'Progress' },
//   { to: '/profile',    icon: '👤', label: 'Profile' },
//   // { to:'/admin', icon:'⚙️', label:'Admin' },
// ];

// export default function Layout() {
//   const { user, logout } = useAuth();
//   const navigate         = useNavigate();
//   const [open, setOpen]  = useState(true);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh' }}>
//       {/* Sidebar */}
//       <aside style={{
//         width: open ? 230 : 68,
//         background: 'linear-gradient(180deg,#6C63FF 0%,#574fd6 100%)',
//         transition: 'width 0.3s',
//         display: 'flex', flexDirection: 'column',
//         padding: '24px 0', position: 'fixed', top: 0, left: 0,
//         height: '100vh', zIndex: 100, overflowX: 'hidden'
//       }}>
//         {/* Logo */}
//         <div style={{ padding: '0 18px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{ fontSize: 28 }}>🚀</span>
//           {open && <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>Smart Career<br/>Guidance</span>}
//         </div>

//         {/* Toggle */}
//         <button onClick={() => setOpen(!open)} style={{
//           background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
//           color: '#fff', fontSize: 18, padding: '6px 10px', borderRadius: 8,
//           margin: '0 12px 16px', alignSelf: open ? 'flex-end' : 'center'
//         }}>{open ? '◀' : '▶'}</button>

//         {/* Nav Links */}
//         <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
//           {NAV.map(n => (
//             <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
//               display: 'flex', alignItems: 'center', gap: 12,
//               padding: '11px 14px', borderRadius: 12,
//               textDecoration: 'none', fontWeight: 700, fontSize: 14,
//               color: isActive ? '#6C63FF' : 'rgba(255,255,255,0.85)',
//               background: isActive ? '#fff' : 'transparent',
//               transition: 'all 0.2s',
//               whiteSpace: 'nowrap', overflow: 'hidden'
//             })}>
//               <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
//               {open && n.label}
//             </NavLink>
//           ))}
//         </nav>

//         {/* User + Logout */}
//         <div style={{ padding: '16px 14px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
//           {open && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 }}>
//             👋 {user?.name || 'Student'}
//           </p>}
//           <button onClick={handleLogout} style={{
//             width: '100%', padding: '10px', borderRadius: 10, border: 'none',
//             background: 'rgba(255,255,255,0.15)', color: '#fff',
//             cursor: 'pointer', fontWeight: 700, fontSize: 14,
//             display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center', gap: 8
//           }}>
//             <span>🚪</span>{open && 'Logout'}
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main style={{
//         marginLeft: open ? 230 : 68, flex: 1,
//         transition: 'margin-left 0.3s',
//         padding: '32px 36px', minHeight: '100vh'
//       }}>
//         <Outlet />
//       </main>
//     </div>
//   );
// }
