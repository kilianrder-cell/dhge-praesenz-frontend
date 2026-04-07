// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [rolle, setRolle] = useState(null);
  const [username, setUsername] = useState('');
  const [passwort, setPasswort] = useState('');

  if (!rolle) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
            <span style={{ color: '#006633' }}>DH</span><span style={{ color: '#333' }}>GE</span>
          </div>
          <div style={{ fontSize: '13px', color: '#888', letterSpacing: '3px', marginTop: '2px' }}>ANWESENHEIT</div>
        </div>
        <div style={{ background: 'white', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '360px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '16px', textAlign: 'center' }}>Bitte wählen Sie Ihre Rolle</div>
          <button onClick={() => setRolle('dozent')} style={{ ...rolleBtn, marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>👨‍🏫</span>
            <div>
              <div style={{ fontWeight: 700 }}>Dozent/in</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Sitzungen verwalten & QR-Code anzeigen</div>
            </div>
          </button>
          <button onClick={() => setRolle('verwaltung')} style={rolleBtn}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
            <div>
              <div style={{ fontWeight: 700 }}>Verwaltung</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Anwesenheitsübersicht & Auswertungen</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
          <span style={{ color: '#006633' }}>DH</span><span style={{ color: '#333' }}>GE</span>
        </div>
        <div style={{ fontSize: '13px', color: '#888', letterSpacing: '3px', marginTop: '2px' }}>ANWESENHEIT</div>
      </div>
      <div style={{ background: 'white', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '360px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '13px', color: '#006633', marginBottom: '16px', cursor: 'pointer' }} onClick={() => setRolle(null)}>
          ← Zurück zur Rollenauswahl
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
          Anmelden als {rolle === 'dozent' ? 'Dozent/in' : 'Verwaltung'}
        </div>
        <input style={inputStyle} placeholder="Benutzername"
          value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
        <input style={{ ...inputStyle, marginTop: '12px' }} type="password" placeholder="Kennwort"
          value={passwort} onChange={e => setPasswort(e.target.value)} autoComplete="current-password" />
        <button onClick={() => navigate(rolle === 'dozent' ? '/dozent' : '/verwaltung')} style={btnStyle}>
          Anmelden
        </button>
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#006633', cursor: 'pointer' }}>Kennwort vergessen?</div>
      </div>
      <div style={{ marginTop: '24px', fontSize: '13px', color: '#aaa', display: 'flex', gap: '16px' }}>
        <span>Deutsch (de) ▾</span>
        <span>Cookie-Hinweis</span>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', background: '#fffff0', boxSizing: 'border-box' };
const btnStyle = { marginTop: '16px', width: '100%', padding: '10px', background: '#006633', color: 'white', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' };
const rolleBtn = { width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '14px' };