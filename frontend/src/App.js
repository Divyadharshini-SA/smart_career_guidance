import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './AuthContext';
import Layout        from './components/Layout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Assessment    from './pages/Assessment';
import ResumeUpload  from './pages/ResumeUpload';
import Career        from './pages/Career';
import Roadmap       from './pages/Roadmap';
import Placement     from './pages/Placement';
import Chatbot       from './pages/Chatbot';
import Progress      from './pages/Progress';
import Profile       from './pages/Profile';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index              element={<Dashboard />} />
            <Route path="assessment"  element={<Assessment />} />
            <Route path="resume"      element={<ResumeUpload />} />
            <Route path="career"      element={<Career />} />
            <Route path="roadmap"     element={<Roadmap />} />
            <Route path="placement"   element={<Placement />} />
            <Route path="chatbot"     element={<Chatbot />} />
            <Route path="progress"    element={<Progress />} />
            <Route path="profile"     element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
