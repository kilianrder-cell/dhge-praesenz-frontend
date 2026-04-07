// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import client from '../api/client';

const ROLLE_STANDARD = {
  dozent: 'dozent-001',
  studierender: 'student-001',
  verwaltung: 'verwaltung-001',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const rolle = location.state?.rolle || 'studierender';

  const [form, setForm] = useState({
    username: ROLLE_STANDARD[rolle] || '',
    passwort: '',
  });
  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState('');

  const rolleLabel = {
    dozent: 'Dozent/in',
    studierender: 'Studierende/r',
    verwaltung: 'Verwaltung',
  }[rolle];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username) {
      setFehler('Bitte Benutzername eingeben.');
      return;
    }
    setLoading(true);
    setFehler('');
    try {
      const res = await client.post('/api/mock-auth/token', {
        username: form.username,
      });
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));

      login({
        vorname: payload.given_name,
        nachname: payload.family_name,
        email: payload.email,
        rolle: payload.role,
      }, token);

      await new Promise(resolve => setTimeout(resolve, 100));

      if (payload.role === 'dozent') navigate('/dozent');
      else if (payload.role === 'verwaltung') navigate('/verwaltung');
      else navigate('/');
    } catch {
      setFehler('Anmeldung fehlgeschlagen. Benutzername prüfen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
          style={{ marginBottom: '24px', padding: '6px 0' }}
        >
          ← Zurück
        </button>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'var(--green-primary)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Anmelden als</h2>
            <span className="badge badge-green" style={{ marginTop: '6px' }}>{rolleLabel}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Benutzername</label>
              <input
                className="input"
                placeholder="z.B. dozent-001"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="label">Passwort</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.passwort}
                onChange={(e) => setForm({ ...form, passwort: e.target.value })}
                autoComplete="current-password"
              />
            </div>

            {fehler && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                fontSize: '13px', color: 'var(--danger)', marginBottom: '16px',
              }}>
                {fehler}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
            Pilotmodus — Benutzername wird automatisch vorausgefüllt
          </p>
        </div>
      </div>
    </div>
  );
}