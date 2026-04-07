// src/components/TeilnehmerListe.jsx
import { useState, useEffect } from 'react';
import client from '../api/client';

export default function TeilnehmerListe({ einheitId, live }) {
  const [teilnehmer, setTeilnehmer] = useState([]);
  const [loading, setLoading] = useState(true);

  const laden = async () => {
    try {
      const res = await client.get(`/api/anwesenheit/einheit/${einheitId}`);
      setTeilnehmer(res.data.eintraege || []);
    } catch {
      // Fehler still ignorieren — nächster Versuch beim nächsten Poll
    } finally {
      setLoading(false);
    }
  };

  // Live-Polling alle 10 Sekunden wenn Sitzung aktiv
  useEffect(() => {
    laden();
    if (!live) return;
    const interval = setInterval(laden, 10000);
    return () => clearInterval(interval);
  }, [einheitId, live]);

  const manuellEintragen = async (nutzerName) => {
    // TODO: Backend-Endpunkt für manuelle Anwesenheit (Phase 2)
    // Vorerst: lokale UI-Aktualisierung
    const dummy = {
      id: Date.now(),
      vorname: nutzerName.split(' ')[0] || nutzerName,
      nachname: nutzerName.split(' ')[1] || '',
      matrikelnr: '–',
      eingecheckt_am: new Date().toISOString(),
      manuell: true,
    };
    setTeilnehmer((prev) => [...prev, dummy]);
  };

  const [manuellerName, setManuellerName] = useState('');
  const [manuelleEingabe, setManuelleEingabe] = useState(false);

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center' }}>Lädt...</div>;

  return (
    <div>
      {/* Header mit Zähler */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Anwesende</span>
          <span className="badge badge-green" style={{ marginLeft: '8px' }}>{teilnehmer.length}</span>
        </div>
        {live && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setManuelleEingabe(!manuelleEingabe)}
          >
            + Manuell eintragen
          </button>
        )}
      </div>

      {/* Manuelle Eingabe (für online zugeschaltete) */}
      {manuelleEingabe && (
        <div style={{
          background: 'var(--green-light)',
          border: '1px solid var(--green-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          gap: '8px',
        }}>
          <input
            className="input"
            placeholder="Vorname Nachname"
            value={manuellerName}
            onChange={(e) => setManuellerName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (manuellerName.trim()) {
                manuellEintragen(manuellerName.trim());
                setManuellerName('');
                setManuelleEingabe(false);
              }
            }}
          >
            ✓ Eintragen
          </button>
        </div>
      )}

      {/* Tabelle */}
      {teilnehmer.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          <p>Noch keine Anwesenheiten erfasst</p>
          {live && <p style={{ marginTop: '4px', fontSize: '12px' }}>Warte auf Check-ins der Studierenden…</p>}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>NAME</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>MATRIKELNR.</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>UHRZEIT</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {teilnehmer.map((t, i) => (
                <tr key={t.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                    {t.vorname} {t.nachname}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {t.matrikelnr || '–'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {new Date(t.eingecheckt_am).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {t.manuell
                      ? <span className="badge badge-orange">Manuell</span>
                      : <span className="badge badge-green">✓ Verifiziert</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {live && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
          Automatische Aktualisierung alle 10 Sekunden
        </p>
      )}
    </div>
  );
}