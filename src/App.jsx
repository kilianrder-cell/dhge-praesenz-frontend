// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import RollenAuswahl from './pages/RollenAuswahl';
import Login from './pages/Login';
import DozentDashboard from './pages/DozentDashboard';
import StudierendView from './pages/StudierendView';
import VerwaltungDashboard from './pages/VerwaltungDashboard';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function PrivateRoute({ children, rolle }) {
  const { user } = useAuth();

  // Fallback auf localStorage — verhindert Flackern beim ersten Render
  const gespeicherterNutzer = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const aktuellerNutzer = user || (gespeicherterNutzer && token ? JSON.parse(gespeicherterNutzer) : null);

  if (!aktuellerNutzer) return <Navigate to="/" replace />;
  if (rolle && aktuellerNutzer.rolle !== rolle) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    // Nur wiederherstellen wenn beides vorhanden ist
    if (saved && token) return JSON.parse(saved);
    return null;
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