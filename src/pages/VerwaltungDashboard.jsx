// src/pages/VerwaltungDashboard.jsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TeilnehmerListe from '../components/TeilnehmerListe';
import client from '../api/client';

const navItems = [
  { label: 'Übersicht', path: '/verwaltung', icon: '📊' },
];

export default function VerwaltungDashboard() {
  const [einheiten, setEinheiten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ausgewaehlt, setAusgewaehlt] = useState(null);

  useEffect(() => {
    client.get('/api/einheiten')
      .then((res) => setEinheiten(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => ({
    geplant: <span className="badge badge-gray">Geplant</span>,
    aktiv: <span className="badge badge-green">● Aktiv</span>,
    beendet: <span className="badge badge-gray">Beendet</span>,
  }[status]);

  const aktiveAnzahl = einheiten.filter((e) => e.status === 'aktiv').length;
  const beendeteAnzahl = einheiten.filter((e) => e.status === 'beendet').length;

  return (
    <Layout navItems={navItems}>
      <div className="page-header">
        <h1>Anwesenheitsübersicht</h1>
        <p>Alle Lehreinheiten und Anwesenheitsdaten im Überblick</p>
      </div>

      {/* Statistik-Kacheln */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green-primary)' }}>{einheiten.length}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Lehreinheiten gesamt</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)' }}>{aktiveAnzahl}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Aktive Sitzungen</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-secondary)' }}>{beendeteAnzahl}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Abgeschlossene Sitzungen</div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="card">
        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Alle Lehreinheiten</h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Lädt...</p>
        ) : einheiten.length === 0 ? (
          <div className="empty-state"><p>Noch keine Daten vorhanden.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Modul', 'Kurs', 'Datum', 'Zeit', 'Status', 'Anwesenheiten'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '12px' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {einheiten.map((e) => (
                  <>
                    <tr
                      key={e.id}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => setAusgewaehlt(ausgewaehlt === e.id ? null : e.id)}
                    >
                      <td style={{ padding: '12px', fontWeight: 500 }}>{e.modul}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{e.kurs}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(e.datum).toLocaleDateString('de-DE')}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{e.beginn}–{e.ende}</td>
                      <td style={{ padding: '12px' }}>{statusBadge(e.status)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
                          {ausgewaehlt === e.id ? '▲' : '▾'} Details
                        </span>
                      </td>
                    </tr>
                    {ausgewaehlt === e.id && (
                      <tr key={`detail-${e.id}`}>
                        <td colSpan={6} style={{ background: 'var(--bg)', padding: '16px 24px' }}>
                          <TeilnehmerListe einheitId={e.id} live={e.status === 'aktiv'} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}