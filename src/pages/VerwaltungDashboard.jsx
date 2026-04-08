// src/pages/VerwaltungDashboard.jsx
import { useState } from 'react';

// ── Demo-Daten ──────────────────────────────────────────────
const KURSE = ['MD', 'DM', 'HE', 'HM', 'MI', 'TO', 'DI', 'TV'];
const JAHRGAENGE = ['23', '24', '25'];

const DEMO_TEILNEHMER = [
  { name: 'Max Mustermann', matrikelnr: '100123', status: 'anwesend' },
  { name: 'Laura Fischer', matrikelnr: '100124', status: 'anwesend' },
  { name: 'Jonas Weber', matrikelnr: '100125', status: 'anwesend' },
  { name: 'Anna Schmidt', matrikelnr: '100126', status: 'entschuldigt' },
  { name: 'Tim Bauer', matrikelnr: '100127', status: 'fehlend' },
  { name: 'Sarah Müller', matrikelnr: '100128', status: 'anwesend' },
  { name: 'Felix Hoffmann', matrikelnr: '100129', status: 'anwesend' },
  { name: 'Jana Koch', matrikelnr: '100130', status: 'fehlend' },
];

function genLVs(kursKuerzel, jahrgang) {
  const kurs = `${kursKuerzel}${jahrgang}`;
  return [
    { id: `${kurs}-1`, modul: 'Software-Engineering', datum: '08.04.2026', beginn: '09:45', ende: '11:15', raum: '206', dozent: 'Prof. Anschütz', status: 'beendet' },
    { id: `${kurs}-2`, modul: 'Praxis der Digitalisierung', datum: '08.04.2026', beginn: '11:30', ende: '13:00', raum: '206', dozent: 'Prof. Straubel', status: 'aktiv' },
    { id: `${kurs}-3`, modul: 'Komplexseminar Digitalisierung', datum: '09.04.2026', beginn: '09:45', ende: '11:15', raum: '105', dozent: 'Prof. Straubel', status: 'geplant' },
    { id: `${kurs}-4`, modul: 'Controlling & Unternehmensführung', datum: '15.04.2026', beginn: '11:30', ende: '13:00', raum: 'T105-ONL', dozent: 'Prof. Cravotta', status: 'geplant' },
    { id: `${kurs}-5`, modul: 'Anwendungsbezogene Theorie', datum: '24.04.2026', beginn: '10:00', ende: '10:30', raum: '105', dozent: 'Prof. Hoppe', status: 'geplant' },
  ];
}

// ── Komponente ──────────────────────────────────────────────
export default function VerwaltungDashboard() {
  const [offen, setOffen] = useState({});
  const [gewaehlterKurs, setGewaehlterKurs] = useState('MD23');
  const [suche, setSuche] = useState('');
  const [aufgeklappeLV, setAufgeklappeLV] = useState(null);

  const toggleKurs = (k) => setOffen(prev => ({ ...prev, [k]: !prev[k] }));

  const lvs = genLVs(
    gewaehlterKurs.slice(0, -2),
    gewaehlterKurs.slice(-2)
  ).filter(lv =>
    lv.modul.toLowerCase().includes(suche.toLowerCase()) ||
    lv.dozent.toLowerCase().includes(suche.toLowerCase())
  );

  // Statistik über alle Kurse
  const alleKurse = KURSE.flatMap(k => JAHRGAENGE.map(j => `${k}${j}`));
  const alleLVs = alleKurse.flatMap(k => genLVs(k.slice(0, -2), k.slice(-2)));
  const gesamt = alleLVs.length;
  const aktiv = alleLVs.filter(l => l.status === 'aktiv').length;

  const statusStyle = (s) => ({
    padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
    background: s === 'aktiv' ? '#dcfce7' : s === 'beendet' ? '#f3f4f6' : '#fef9c3',
    color: s === 'aktiv' ? '#15803d' : s === 'beendet' ? '#9ca3af' : '#a16207',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Topbar */}
      <div style={{ background: '#006633', color: 'white', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px' }}>DHGE Präsenz</div>
          <span style={{ opacity: 0.6, fontSize: '13px' }}>Verwaltungs-Ansicht</span>
        </div>
        <a href="/" style={{ fontSize: '13px', opacity: 0.8, color: 'white', textDecoration: 'none' }}>← Abmelden</a>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* ── Sidebar: Kursbaum ── */}
        <div style={{ width: '220px', minWidth: '220px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 700, color: '#006633', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Kurse
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {KURSE.map(k => (
              <div key={k}>
                <button
                  onClick={() => toggleKurs(k)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#1f2937' }}
                >
                  <span>{k}</span>
                  <span style={{ color: '#9ca3af', fontSize: '11px' }}>{offen[k] ? '▲' : '▼'}</span>
                </button>
                {offen[k] && JAHRGAENGE.map(j => {
                  const kursName = `${k}${j}`;
                  const aktiv = kursName === gewaehlterKurs;
                  return (
                    <button
                      key={kursName}
                      onClick={() => setGewaehlterKurs(kursName)}
                      style={{
                        width: '100%', padding: '6px 16px 6px 28px',
                        background: aktiv ? '#f0fdf4' : 'none',
                        border: 'none', cursor: 'pointer',
                        fontSize: '13px', color: aktiv ? '#006633' : '#6b7280',
                        fontWeight: aktiv ? 700 : 400,
                        textAlign: 'left',
                        borderLeft: aktiv ? '3px solid #006633' : '3px solid transparent',
                      }}
                    >
                      {kursName}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Hauptbereich ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Statistik-Kacheln */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Lehreinheiten gesamt', wert: gesamt, farbe: '#006633', bg: '#f0fdf4' },
              { label: 'Aktive Sitzungen', wert: aktiv, farbe: '#dc2626', bg: '#fef2f2' },
            ].map(({ label, wert, farbe, bg }) => (
              <div key={label} style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: farbe }}>{wert}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Lehreinheiten */}
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Lehreinheiten — {gewaehlterKurs}</h2>
              <input
                placeholder="Suche nach Modul oder Dozent..."
                value={suche}
                onChange={e => setSuche(e.target.value)}
                style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', width: '240px' }}
              />
            </div>

            {lvs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Keine Lehreinheiten gefunden.</div>
            ) : (
              lvs.map(lv => (
                <div key={lv.id}>
                  <div
                    onClick={() => setAufgeklappeLV(aufgeklappeLV === lv.id ? null : lv.id)}
                    style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: aufgeklappeLV === lv.id ? '#f9fafb' : 'white' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{lv.modul}</span>
                        <span style={statusStyle(lv.status)}>
                          {lv.status === 'aktiv' ? '● Aktiv' : lv.status === 'beendet' ? 'Beendet' : 'Geplant'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {lv.datum} · {lv.beginn}–{lv.ende} · {lv.raum} · {lv.dozent}
                      </div>
                    </div>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{aufgeklappeLV === lv.id ? '▲' : '▼'}</span>
                  </div>

                  {/* Demo-Teilnehmertabelle */}
                  {aufgeklappeLV === lv.id && (
                    <div style={{ padding: '16px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '10px' }}>
                        ANWESENHEITSLISTE — {gewaehlterKurs} ({DEMO_TEILNEHMER.filter(t => t.status === 'anwesend').length}/{DEMO_TEILNEHMER.length} anwesend)
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f3f4f6' }}>
                            {['Name', 'Matrikelnr.', 'Status', 'Eingecheckt'].map(h => (
                              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_TEILNEHMER.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 500 }}>{t.name}</td>
                              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{t.matrikelnr}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                                  background: t.status === 'anwesend' ? '#dcfce7' : t.status === 'entschuldigt' ? '#fef9c3' : '#fee2e2',
                                  color: t.status === 'anwesend' ? '#15803d' : t.status === 'entschuldigt' ? '#a16207' : '#dc2626',
                                }}>
                                  {t.status === 'anwesend' ? '✓ Anwesend' : t.status === 'entschuldigt' ? '~ Entschuldigt' : '✗ Fehlend'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: '#6b7280' }}>
                                {t.status === 'anwesend' ? `${lv.beginn} Uhr` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}