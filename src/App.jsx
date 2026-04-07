// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import RollenAuswahl from './pages/RollenAuswahl';
import Login from './pages/Login';
import DozentDashboard from './pages/DozentDashboard';
import StudierendView from './pages/StudierendView';
import VerwaltungDashboard from './pages/VerwaltungDashboard';

// Globaler Auth-Kontext — wird später mit echtem OIDC-Flow befüllt
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function PrivateRoute({ children, rolle }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (rolle && user.rolle !== rolle) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    // Session aus localStorage wiederherstellen
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Öffentliche Routen */}
          <Route path="/" element={<RollenAuswahl />} />
          <Route path="/login" element={<Login />} />

          {/* Studierende kommen per QR-Code direkt auf diese Route */}
          <Route path="/checkin/:einheitId" element={<StudierendView />} />

          {/* Geschützte Routen */}
          <Route path="/dozent/*" element={
            <PrivateRoute rolle="dozent">
              <DozentDashboard />
            </PrivateRoute>
          } />
          <Route path="/verwaltung/*" element={
            <PrivateRoute rolle="verwaltung">
              <VerwaltungDashboard />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}