// src/pages/DozentDashboard.jsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import QRCodeAnzeige from '../components/QRCodeAnzeige';
import TeilnehmerListe from '../components/TeilnehmerListe';
import client from '../api/client';


const navItems = [
  { label: 'Meine Sitzungen', path: '/dozent', icon: '📋' },
];

export default function DozentDashboard() {
  const [einheiten, setEinheiten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktiveSitzung, setAktiveSitzung] = useState(null);
  const [qrOffen, setQrOffen] = useState(false);
  const [neueEinheit, setNeueEinheit] = useState(false);
  const [form, setForm] = useState({ modul: '', kurs: '', datum: '', beginn: '', ende: '', raum: '' });
  const [icsUrl, setIcsUrl] = useState('');
  const [icsStatus, setIcsStatus] = useState('');

  const laden = async () => {
    console.log('Token im localStorage:', localStorage.getItem('token'));
    try {
      const res = await client.get('/api/einheiten');
      setEinheiten(res.data);
    } catch { /* still */ }
    finally { setLoading(false); }
  };

  useEffect(() => { laden(); }, []);

  const sitzungErstellen = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/einheiten', form);
      setNeueEinheit(false);
      setForm({ modul: '', kurs: '', datum: '', beginn: '', ende: '', raum: '' });
      laden();
    } catch { alert('Fehler beim Erstellen.'); }
  };

  const aktivieren = async (id) => {
    try {
      await client.patch(`/api/einheiten/${id}/aktivieren`);
      setAktiveSitzung(id);
      setQrOffen(true);
      laden();
    } catch { alert('Fehler beim Aktivieren.'); }
  };

  const beenden = async (id) => {
    if (!confirm('Sitzung wirklich beenden?')) return;
    try {
      await client.patch(`/api/einheiten/${id}/beenden`);
      setAktiveSitzung(null);
      laden();
    } catch { alert('Fehler beim Beenden.'); }
  };

  const icsImport = async () => {
    if (!icsUrl.trim()) return;
    setIcsStatus('lädt...');
    try {
      await client.put('/api/kalender/ics-url', { ics_url: icsUrl });
      await client.post('/api/kalender/import');
      setIcsStatus('✓ Import erfolgreich');
      laden();
    } catch { setIcsStatus('✗ Import fehlgeschlagen'); }
  };

  const statusBadge = (status) => ({
    geplant: <span className="badge badge-gray">Geplant</span>,
    aktiv: <span className="badge badge-green">● Aktiv</span>,
    beendet: <span className="badge badge-gray">Beendet</span>,
  }[status]);

  return (
    <Layout navItems={navItems}>
      <div className="page-header">
        <h1>Meine Lehreinheiten</h1>
        <p>Sitzungen erstellen, aktivieren und Anwesenheiten verfolgen</p>
      </div>

      {/* ICS-Import */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>📅</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Kalender importieren</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ICS-Link aus dem DHGE Selfservice</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="input"
            placeholder="https://selfservice.dhge.de/kalender/ics?..."
            value={icsUrl}
            onChange={(e) => setIcsUrl(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={icsImport}>Importieren</button>
        </div>
        {icsStatus && (
          <p style={{ fontSize: '13px', marginTop: '8px', color: icsStatus.startsWith('✓') ? 'var(--success)' : 'var(--danger)' }}>
            {icsStatus}
          </p>
        )}
      </div>

      {/* Aktionen */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Sitzungen</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setNeueEinheit(true)}>
          + Neue Sitzung
        </button>
      </div>

      {/* Neue Sitzung erstellen */}
      {neueEinheit && (
        <div className="card" style={{ marginBottom: '16px', border: '2px solid var(--green-primary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Neue Lehreinheit</h3>
          <form onSubmit={sitzungErstellen}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Modul</label>
                <input className="input" placeholder="z.B. Software-Engineering" required
                  value={form.modul} onChange={(e) => setForm({ ...form, modul: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Kurs</label>
                <input className="input" placeholder="z.B. MD23" required
                  value={form.kurs} onChange={(e) => setForm({ ...form, kurs: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Datum</label>
                <input className="input" type="date" required
                  value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Raum</label>
                <input className="input" placeholder="z.B. H 2.01"
                  value={form.raum} onChange={(e) => setForm({ ...form, raum: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Beginn</label>
                <input className="input" type="time" required
                  value={form.beginn} onChange={(e) => setForm({ ...form, beginn: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Ende</label>
                <input className="input" type="time" required
                  value={form.ende} onChange={(e) => setForm({ ...form, ende: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setNeueEinheit(false)}>Abbrechen</button>
              <button type="submit" className="btn btn-primary">Erstellen</button>
            </div>
          </form>
        </div>
      )}

      {/* Sitzungsliste */}
      {loading ? (
        <div className="card"><p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Lädt...</p></div>
      ) : einheiten.length === 0 ? (
        <div className="card empty-state">
          <p>Noch keine Lehreinheiten angelegt.</p>
          <p style={{ marginTop: '4px', fontSize: '12px' }}>Erstelle deine erste Sitzung oder importiere deinen Kalender.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {einheiten.map((e) => (
            <div key={e.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>{e.modul}</span>
                    {statusBadge(e.status)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {e.kurs} · {new Date(e.datum).toLocaleDateString('de-DE')} · {e.beginn}–{e.ende} Uhr
                    {e.raum && ` · ${e.raum}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {e.status === 'geplant' && (
                    <button className="btn btn-primary btn-sm" onClick={() => aktivieren(e.id)}>
                      ▶ Starten
                    </button>
                  )}
                  {e.status === 'aktiv' && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setAktiveSitzung(e.id); setQrOffen(true); }}>
                        QR-Code anzeigen
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => beenden(e.id)}>
                        ■ Beenden
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Live-Liste bei aktiver Sitzung */}
              {e.status === 'aktiv' && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <TeilnehmerListe einheitId={e.id} live={true} />
                </div>
              )}

              {/* Abgeschlossene Liste */}
              {e.status === 'beendet' && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(ev) => {
                      const el = ev.currentTarget.nextElementSibling;
                      el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }}
                  >
                    Anwesenheitsliste anzeigen ▾
                  </button>
                  <div style={{ display: 'none', marginTop: '12px' }}>
                    <TeilnehmerListe einheitId={e.id} live={false} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR-Code Modal */}
      {qrOffen && aktiveSitzung && (
        <QRCodeAnzeige einheitId={aktiveSitzung} onClose={() => setQrOffen(false)} />
      )}
    </Layout>
  );
}