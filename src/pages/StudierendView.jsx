// src/pages/StudierendView.jsx
// Studierende landen hier direkt über den QR-Code-Link.
// Kein separater QR-Scanner nötig — die einheitId steckt in der URL.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function StudierendView() {
  const { einheitId } = useParams();
  const navigate = useNavigate();
  const [schritt, setSchritt] = useState('login'); // login | bestaetigen | erfolg | fehler
  const [form, setForm] = useState({ vorname: '', nachname: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [meldung, setMeldung] = useState('');
  const [verifikationsHash, setVerifikationsHash] = useState('');

  const anmelden = async (e) => {
    e.preventDefault();
    if (!form.vorname || !form.nachname || !form.email) return;
    setLoading(true);
    try {
      const res = await client.post('/api/mock-auth/token', { rolle: 'studierender' });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify({ ...form, rolle: 'studierender' }));
      setSchritt('bestaetigen');
    } catch { setMeldung('Anmeldung fehlgeschlagen.'); }
    finally { setLoading(false); }
  };

  const einchecken = async () => {
    setLoading(true);
    setMeldung('');
    try {
      // Fingerprint simulieren (Browser-Info)
      const fingerprint = btoa(navigator.userAgent + screen.width + screen.height).slice(0, 40);

      // QR-Payload für diese Sitzung holen
      const qrRes = await client.get(`/api/einheiten/${einheitId}/qr`);
      const qrPayload = qrRes.data.qrPayload;

      const res = await client.post('/api/checkin', { qrPayload, fingerprint });
      setVerifikationsHash(res.data.verifikationHash);
      setSchritt('erfolg');
    } catch (err) {
      const msg = err.response?.data?.error || 'Check-in fehlgeschlagen.';
      setMeldung(msg);
      if (msg.includes('eingecheckt')) setSchritt('erfolg');
    } finally { setLoading(false); }
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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'var(--green-primary)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>DHGE Präsenz</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Anwesenheit bestätigen</p>
        </div>

        {/* Schritt: Login */}
        {schritt === 'login' && (
          <div className="card">
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px' }}>Kurz anmelden</h2>
            <form onSubmit={anmelden}>
              <div className="form-group">
                <label className="label">Vorname</label>
                <input className="input" placeholder="Anna" required
                  value={form.vorname} onChange={(e) => setForm({ ...form, vorname: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Nachname</label>
                <input className="input" placeholder="Müller" required
                  value={form.nachname} onChange={(e) => setForm({ ...form, nachname: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">E-Mail</label>
                <input className="input" type="email" placeholder="a.mueller@dhge.de" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              {meldung && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>{meldung}</p>}
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Lädt...' : 'Weiter →'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Beliebige Daten verwenden (Pilotmodus)
            </p>
          </div>
        )}

        {/* Schritt: Bestätigen */}
        {schritt === 'bestaetigen' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Hallo, {form.vorname}!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
              Klicke auf den Button um deine Anwesenheit für diese Sitzung zu bestätigen.
            </p>
            {meldung && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                fontSize: '13px', color: 'var(--danger)', marginBottom: '16px',
              }}>
                {meldung}
              </div>
            )}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={einchecken}
              disabled={loading}
              style={{ fontSize: '17px', padding: '16px' }}
            >
              {loading ? 'Wird verarbeitet...' : '✓ Anwesenheit bestätigen'}
            </button>
          </div>
        )}

        {/* Schritt: Erfolg */}
        {schritt === 'erfolg' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px',
              background: 'var(--green-light)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
            }}>
              ✅
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green-primary)', marginBottom: '8px' }}>
              Anwesenheit bestätigt!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {form.vorname} {form.nachname}, du bist als anwesend erfasst.
            </p>
            {verifikationsHash && (
              <div style={{
                background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                padding: '12px', marginBottom: '20px',
              }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Verifikations-Hash</p>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                  {verifikationsHash}
                </p>
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Du kannst dieses Fenster jetzt schließen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}