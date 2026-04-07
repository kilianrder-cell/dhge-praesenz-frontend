// src/pages/DozentDashboard.jsx
import { useState, useEffect } from 'react';
import QRCodeAnzeige from '../components/QRCodeAnzeige';

// ICS direkt im Browser parsen
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
      const clean = str.replace(/TZID=[^:]+:/, '').replace('T', '').substring(0, 12);
      const y = clean.substring(0, 4), mo = clean.substring(4, 6), d = clean.substring(6, 8);
      const h = clean.substring(8, 10) || '00', mi = clean.substring(10, 12) || '00';
      return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}`, full: new Date(`${y}-${mo}-${d}T${h}:${mi}:00`) };
    };
    const summary = get('SUMMARY');
    const parts = summary.split('//').map(s => s.trim());
    const start = parseDate(get('DTSTART'));
    const end = parseDate(get('DTEND'));
    if (!start || !summary) continue;
    events.push({
      id: get('UID'),
      modul: parts[0] || summary,
      typ: parts[1] || '',
      dozent: parts[2] || '',
      raum: get('LOCATION'),
      datum: start.date,
      beginn: start.time,
      ende: end?.time || '',
      startFull: start.full,
    });
  }
  return events;
}

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

const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
const fmtFull = (d) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
const toDateStr = (d) => d.toISOString().split('T')[0];

export default function DozentDashboard() {
  const [icsEvents, setIcsEvents] = useState([]);
  const [icsStatus, setIcsStatus] = useState('');
  const [woche, setWoche] = useState(new Date());
  const [sitzungen, setSitzungen] = useState([]);
  const [qrSitzung, setQrSitzung] = useState(null);

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
    setIcsStatus(`✓ ${events.length} Termine geladen`);
  } catch {
    setIcsStatus('✗ Laden fehlgeschlagen');
  }
};

  const eventsForDay = (dateStr) =>
    icsEvents.filter(e => e.datum === dateStr);

  const heuteEvents = eventsForDay(today);

  const alsSitzungVorschlagen = (ev) => {
    if (sitzungen.find(s => s.icsId === ev.id)) return;
    setSitzungen(prev => [...prev, {
      id: Date.now(),
      icsId: ev.id,
      modul: ev.modul,
      kurs: 'MD23',
      datum: ev.datum,
      beginn: ev.beginn,
      ende: ev.ende,
      raum: ev.raum,
      status: 'geplant',
    }]);
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

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Topbar */}
      <div style={{ background: '#006633', color: 'white', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>DHGE Präsenz</div>
          <span style={{ opacity: 0.6, fontSize: '13px' }}>Dozenten-Ansicht</span>
        </div>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>Prof. Straubel</span>
      </div>

      <div style={{ display: 'flex', gap: '0', height: 'calc(100vh - 56px)' }}>

        {/* ── Sidebar: Wochenkalender ── */}
        <div style={{ width: '300px', minWidth: '300px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* ICS-Import */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#006633', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📅 Kalender importieren
        </div>
         <label style={{
          display: 'block', width: '100%', padding: '7px',
          background: '#006633', color: 'white', border: 'none',
          borderRadius: '6px', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box',
        }}>
        ICS-Datei hochladen
          <input
            type="file"
            accept=".ics"
            style={{ display: 'none' }}
            onChange={handleIcsDatei}
          />
        </label>
        {icsStatus && (
      <div style={{ fontSize: '11px', marginTop: '6px', color: icsStatus.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
       {icsStatus}
      </div>
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
              const events = eventsForDay(ds);
              const isToday = ds === today;
              return (
                <div key={ds} style={{ marginBottom: '2px' }}>
                  {/* Tag-Header */}
                  <div style={{
                    padding: '6px 16px',
                    fontSize: '12px', fontWeight: 700,
                    color: isToday ? '#006633' : '#888',
                    background: isToday ? '#f0fdf4' : 'transparent',
                    borderLeft: isToday ? '3px solid #006633' : '3px solid transparent',
                  }}>
                    {fmtFull(day)}{isToday ? ' — Heute' : ''}
                  </div>

                  {/* Events */}
                  {events.length === 0 && (
                    <div style={{ padding: '3px 16px 6px', fontSize: '11px', color: '#ccc' }}>Keine Termine</div>
                  )}
                  {events.map(ev => {
                    const bereitsHinzugefuegt = sitzungen.find(s => s.icsId === ev.id);
                    return (
                      <div key={ev.id}
                        onClick={() => !bereitsHinzugefuegt && isToday && alsSitzungVorschlagen(ev)}
                        style={{
                          margin: '2px 10px',
                          padding: '8px 10px',
                          background: bereitsHinzugefuegt ? '#f0fdf4' : isToday ? '#fff' : '#fafafa',
                          border: `1px solid ${bereitsHinzugefuegt ? '#86efac' : isToday ? '#d1fae5' : '#eee'}`,
                          borderRadius: '6px',
                          cursor: isToday && !bereitsHinzugefuegt ? 'pointer' : 'default',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>
                          {ev.modul}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {ev.beginn}–{ev.ende} · {ev.raum}
                        </div>
                        {isToday && !bereitsHinzugefuegt && (
                          <div style={{ fontSize: '10px', color: '#006633', marginTop: '4px', fontWeight: 600 }}>
                            + Als Sitzung übernehmen
                          </div>
                        )}
                        {bereitsHinzugefuegt && (
                          <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '4px' }}>✓ Übernommen</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Hauptbereich: Sitzungen ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Meine Sitzungen</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
              Sitzungen starten, QR-Code anzeigen und Anwesenheiten verfolgen
            </p>
          </div>

          {/* Heute-Vorschläge */}
          {heuteEvents.filter(ev => !sitzungen.find(s => s.icsId === ev.id)).length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', marginBottom: '10px' }}>
                📅 Heutige Lehrveranstaltungen aus Stundenplan
              </div>
              {heuteEvents.filter(ev => !sitzungen.find(s => s.icsId === ev.id)).map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{ev.modul}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{ev.beginn}–{ev.ende} Uhr · {ev.raum} · MD23</div>
                  </div>
                  <button
                    onClick={() => alsSitzungVorschlagen(ev)}
                    style={{ padding: '7px 14px', background: '#006633', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
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
              <div style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>
                Importiere deinen Kalender und übernehme eine heutige LV.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sitzungen.map(s => (
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
                        {s.kurs} · {new Date(s.datum).toLocaleDateString('de-DE')} · {s.beginn}–{s.ende} Uhr{s.raum ? ` · ${s.raum}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {s.status === 'geplant' && (
                        <button onClick={() => starten(s.id)}
                          style={{ padding: '8px 16px', background: '#006633', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                          ▶ Starten
                        </button>
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

                  {/* Demo-Teilnehmerliste bei aktiver Sitzung */}
                  {s.status === 'aktiv' && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>
                        ANWESEND (Demo)
                      </div>
                      {['Max Muster · MD23', 'Laura Fischer · MD23', 'Jonas Weber · MD23'].map(name => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                          <span style={{ color: '#16a34a' }}>✓</span> {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR-Code Modal */}
      {qrSitzung && (
        <QRCodeAnzeige einheitId={qrSitzung} onClose={() => setQrSitzung(null)} />
      )}
    </div>
  );
}