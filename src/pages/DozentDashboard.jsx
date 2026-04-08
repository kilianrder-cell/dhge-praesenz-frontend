// src/pages/DozentDashboard.jsx
import { useState } from 'react';
import QRCodeAnzeige from '../components/QRCodeAnzeige';

function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  blocks.shift();
  for (const block of blocks) {
    const get = (key) => {
      const match = block.match(new RegExp(`${key}[^:]*:([^\r\n]+(?:\r?\n[ \t][^\r\n]+)*)`));
      if (!match) return '';
      return match[1].replace(/\r?\n[ \t]/g, '').trim();
    };
    const parseDate = (str) => {
      if (!str) return null;
      const clean = str.replace(/.*:/, '');
      const y = clean.substring(0, 4), mo = clean.substring(4, 6), d = clean.substring(6, 8);
      const h = clean.substring(9, 11) || '00', mi = clean.substring(11, 13) || '00';
      return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}` };
    };
    const summary = get('SUMMARY');
    const parts = summary.split('//').map(s => s.trim());
    const start = parseDate(get('DTSTART'));
    const end = parseDate(get('DTEND'));
    if (!start || !summary) continue;
    events.push({
      id: get('UID'),
      modul: parts[0] || summary,
      raum: get('LOCATION'),
      datum: start.date,
      beginn: start.time,
      ende: end?.time || '',
    });
  }
  return events;
}

const sortiereNachZeit = (events) =>
  [...events].sort((a, b) => a.beginn.localeCompare(b.beginn));

function getWeekDays(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

// Timezone-sicheres Datumsformat
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
const fmtFull = (d) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });

const LEER_FORM = { modul: '', kurs: 'MD23', datum: '', beginn: '', ende: '', raum: '' };

export default function DozentDashboard() {
  const [icsEvents, setIcsEvents] = useState(() => {
  try {
    const gespeichert = localStorage.getItem('icsEvents');
    return gespeichert ? JSON.parse(gespeichert) : [];
  } catch { return []; }
});
  const [icsStatus, setIcsStatus] = useState('');
  const [woche, setWoche] = useState(new Date());
  const [sitzungen, setSitzungen] = useState([]);
  const [qrSitzung, setQrSitzung] = useState(null);
  const [manuelleForm, setManuelleForm] = useState(false);
  const [form, setForm] = useState(LEER_FORM);

  const today = toDateStr(new Date());
  const weekDays = getWeekDays(woche);

  const handleIcsDatei = async (e) => {
    const datei = e.target.files[0];
    if (!datei) return;
    setIcsStatus('Lädt...');
    try {
      const text = await datei.text();
      const events = parseICS(text);
      setIcsEvents(events);
      localStorage.setItem('icsEvents', JSON.stringify(events));
      setIcsStatus(`✓ ${events.length} Termine geladen`);
    } catch {
      setIcsStatus('✗ Laden fehlgeschlagen');
    }
  };

  const eventsForDay = (dateStr) => icsEvents.filter(e => e.datum === dateStr);

  const alsSitzungVorschlagen = (ev) => {
    if (sitzungen.find(s => s.icsId === ev.id)) return;
    setSitzungen(prev => [...prev, {
      id: Date.now(), icsId: ev.id,
      modul: ev.modul, kurs: 'MD23',
      datum: ev.datum, beginn: ev.beginn,
      ende: ev.ende, raum: ev.raum, status: 'geplant',
    }]);
  };

  const manuelHinzufuegen = (e) => {
    e.preventDefault();
    setSitzungen(prev => [...prev, { ...form, id: Date.now(), icsId: null, status: 'geplant' }]);
    setForm(LEER_FORM);
    setManuelleForm(false);
  };

  const starten = (id) => {
    setSitzungen(prev => prev.map(s => s.id === id ? { ...s, status: 'aktiv' } : s));
    setQrSitzung(id);
  };

  const beenden = (id) => {
    if (!confirm('Sitzung wirklich beenden?')) return;
    setSitzungen(prev => prev.map(s => s.id === id ? { ...s, status: 'beendet' } : s));
    if (qrSitzung === id) setQrSitzung(null);
  };

  const heuteEvents = sortiereNachZeit(eventsForDay(today)).filter(ev => !sitzungen.find(s => s.icsId === ev.id));

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Topbar */}
      <div style={{ background: '#006633', color: 'white', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px' }}>DHGE Präsenz</div>
          <span style={{ opacity: 0.6, fontSize: '13px' }}>Dozenten-Ansicht</span>
        </div>
        <a href="/" style={{ fontSize: '13px', opacity: 0.8, color: 'white', textDecoration: 'none' }}>← Abmelden</a>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '300px', minWidth: '300px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ICS Import */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#006633', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📅 Kalender importieren
            </div>
            <label style={{ display: 'block', width: '100%', padding: '7px', background: '#006633', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' }}>
              ICS-Datei hochladen
              <input type="file" accept=".ics" style={{ display: 'none' }} onChange={handleIcsDatei} />
            </label>
            {icsStatus && <div style={{ fontSize: '11px', marginTop: '6px', color: icsStatus.startsWith('✓') ? '#16a34a' : '#dc2626' }}>{icsStatus}</div>}
          </div>

          {/* Manuelle LV */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setManuelleForm(v => !v)}
              style={{ width: '100%', padding: '7px', background: 'white', color: '#006633', border: '1px solid #006633', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {manuelleForm ? '✕ Abbrechen' : '+ LV manuell hinzufügen'}
            </button>
            {manuelleForm && (
              <form onSubmit={manuelHinzufuegen} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  ['Modul', 'modul', 'text', 'z.B. Software-Engineering'],
                  ['Kurs', 'kurs', 'text', 'z.B. MD23'],
                  ['Datum', 'datum', 'date', ''],
                  ['Beginn', 'beginn', 'time', ''],
                  ['Ende', 'ende', 'time', ''],
                  ['Raum', 'raum', 'text', 'z.B. 206'],
                ].map(([label, key, type, placeholder]) => (
                  <div key={key}>
                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{label}</div>
                    <input
                      type={type}
                      required={['modul', 'datum', 'beginn', 'ende'].includes(key)}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '5px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button type="submit" style={{ padding: '7px', background: '#006633', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                  Hinzufügen
                </button>
              </form>
            )}
          </div>

          {/* Wochennavigation */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => { const d = new Date(woche); d.setDate(d.getDate() - 7); setWoche(d); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#555' }}>‹</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
              {fmt(weekDays[0])} – {fmt(weekDays[4])}
            </span>
            <button onClick={() => { const d = new Date(woche); d.setDate(d.getDate() + 7); setWoche(d); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#555' }}>›</button>
          </div>

          {/* Wochentage */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {weekDays.map(day => {
              const ds = toDateStr(day);
              const events = sortiereNachZeit(eventsForDay(ds));
              const isToday = ds === today;
              return (
                <div key={ds} style={{ marginBottom: '2px' }}>
                  <div style={{
                    padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                    color: isToday ? '#006633' : '#888',
                    background: isToday ? '#f0fdf4' : 'transparent',
                    borderLeft: isToday ? '3px solid #006633' : '3px solid transparent',
                  }}>
                    {fmtFull(day)}{isToday ? ' — Heute' : ''}
                  </div>
                  {events.length === 0 && <div style={{ padding: '3px 16px 6px', fontSize: '11px', color: '#ccc' }}>Keine Termine</div>}
                  {events.map(ev => {
                    const schonDrin = sitzungen.find(s => s.icsId === ev.id);
                    return (
                      <div key={ev.id}
                        onClick={() => !schonDrin && alsSitzungVorschlagen(ev)}
                        style={{
                          margin: '2px 10px', padding: '8px 10px',
                          background: schonDrin ? '#f0fdf4' : '#fff',
                          border: `1px solid ${schonDrin ? '#86efac' : '#e5e7eb'}`,
                          borderRadius: '6px',
                          cursor: schonDrin ? 'default' : 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>{ev.modul}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{ev.beginn}–{ev.ende} · {ev.raum}</div>
                        {!schonDrin && <div style={{ fontSize: '10px', color: '#006633', marginTop: '4px', fontWeight: 600 }}>+ Als Sitzung übernehmen</div>}
                        {schonDrin && <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '4px' }}>✓ Übernommen</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Hauptbereich ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Meine Sitzungen</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Sitzungen starten, QR-Code anzeigen und Anwesenheiten verfolgen</p>
          </div>

          {/* Heute-Vorschläge */}
          {heuteEvents.length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginBottom: '10px' }}>📅 Heutige Lehrveranstaltungen aus Stundenplan</div>
              {heuteEvents.map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{ev.modul}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{ev.beginn}–{ev.ende} Uhr · {ev.raum} · MD23</div>
                  </div>
                  <button onClick={() => alsSitzungVorschlagen(ev)}
                    style={{ padding: '7px 14px', background: '#006633', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Übernehmen
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Sitzungsliste */}
          {sitzungen.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '10px', padding: '48px 24px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <div style={{ color: '#9ca3af', fontSize: '14px' }}>Noch keine Sitzungen.</div>
              <div style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>Importiere deinen Kalender oder füge eine LV manuell hinzu.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...sitzungen].sort((a, b) => a.beginn.localeCompare(b.beginn)).map(s => (
                <div key={s.id} style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${s.status === 'aktiv' ? '#006633' : s.status === 'beendet' ? '#9ca3af' : '#fbbf24'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>{s.modul}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          background: s.status === 'aktiv' ? '#dcfce7' : s.status === 'beendet' ? '#f3f4f6' : '#fef9c3',
                          color: s.status === 'aktiv' ? '#15803d' : s.status === 'beendet' ? '#9ca3af' : '#a16207',
                        }}>
                          {s.status === 'aktiv' ? '● Aktiv' : s.status === 'beendet' ? 'Beendet' : 'Geplant'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {s.kurs} · {s.datum} · {s.beginn}–{s.ende} Uhr{s.raum ? ` · ${s.raum}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {s.status === 'geplant' && (
                      <>
                        <button onClick={() => starten(s.id)}
                          style={{ padding: '8px 16px', background: '#006633', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                            ▶ Starten
                        </button>
                        <button onClick={() => setSitzungen(prev => prev.filter(x => x.id !== s.id))}
                          style={{ padding: '8px 14px', background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                          ✕ Entfernen
                        </button>
                        </>
                        )}
                      {s.status === 'aktiv' && (
                        <>
                          <button onClick={() => setQrSitzung(s.id)}
                            style={{ padding: '8px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                            QR-Code
                          </button>
                          <button onClick={() => beenden(s.id)}
                            style={{ padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                            ■ Beenden
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {s.status === 'aktiv' && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>ANWESEND (Demo)</div>
                      {['Max Muster · MD23', 'Laura Fischer · MD23', 'Jonas Weber · MD23'].map(name => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                          <span style={{ color: '#16a34a' }}>✓</span> {name}
                        </div>
                      ))}
                    </div>
                  )}
                  {s.status === 'beendet' && (
                    <button onClick={() => setSitzungen(prev => prev.map(x => x.id === s.id ? { ...x, status: 'geplant' } : x))}
                    style={{ padding: '8px 14px', background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                    ↺ Zurücksetzen
                    </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {qrSitzung && <QRCodeAnzeige einheitId={qrSitzung} onClose={() => setQrSitzung(null)} />}
    </div>
  );
}