import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
  }, []);

  const login = (tokenVal, userData) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser]   = useState(null);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const t = localStorage.getItem('token');
//     const u = localStorage.getItem('user');
//     if (t) setToken(t);
//     if (u) {
//       try { setUser(JSON.parse(u)); } catch {}
//     }
//   }, []);

//   const login = (tokenVal, userData) => {
//     localStorage.setItem('token', tokenVal);
//     localStorage.setItem('user', JSON.stringify(userData));
//     setToken(tokenVal);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);


// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser]   = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   useEffect(() => {
//     const stored = localStorage.getItem('user');
//     if (stored) setUser(JSON.parse(stored));
//   }, []);

//   const login = (tokenVal, userData) => {
//     localStorage.setItem('token', tokenVal);
//     localStorage.setItem('user', JSON.stringify(userData));
//     setToken(tokenVal);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.clear();
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
