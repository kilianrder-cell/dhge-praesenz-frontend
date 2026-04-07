// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('roedki.md23');
  const [passwort, setPasswort] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dozent');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
          <span style={{ color: '#006633' }}>DH</span>
          <span style={{ color: '#333' }}>GE</span>
        </div>
        <div style={{ fontSize: '13px', color: '#888', letterSpacing: '3px', marginTop: '2px' }}>
          ANWESENHEIT
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        width: '100%',
        maxWidth: '360px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>
        <input
          style={inputStyle}
          placeholder="Benutzername"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          style={{ ...inputStyle, marginTop: '12px' }}
          type="password"
          placeholder="Kennwort"
          value={passwort}
          onChange={e => setPasswort(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" style={btnStyle}>
          Anmelden
        </button>
        <div style={{ marginTop: '16px', fontSize: '13px', color: '#006633', cursor: 'pointer' }}>
          Kennwort vergessen?
        </div>
      </form>

      <div style={{ marginTop: '24px', fontSize: '13px', color: '#aaa', display: 'flex', gap: '16px' }}>
        <span>Deutsch (de) ▾</span>
        <span style={{ cursor: 'pointer' }}>Cookie-Hinweis</span>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  background: '#fffff0',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnStyle = {
  marginTop: '16px',
  width: '100%',
  padding: '10px',
  background: '#006633',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
};