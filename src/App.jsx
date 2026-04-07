// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DozentDashboard from './pages/DozentDashboard';
import VerwaltungDashboard from './pages/VerwaltungDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dozent" element={<DozentDashboard />} />
        <Route path="/verwaltung" element={<VerwaltungDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}