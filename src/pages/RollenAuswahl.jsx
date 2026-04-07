// src/pages/RollenAuswahl.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useEffect } from 'react';

const rollen = [
  {
    id: 'dozent',
    label: 'Dozent/in',
    beschreibung: 'Sitzungen erstellen, QR-Codes anzeigen und Anwesenheiten verwalten',
    icon: '👨‍🏫',
    farbe: '#006633',
  },
  {
    id: 'studierender',
    label: 'Studierende/r',
    beschreibung: 'Anwesenheit per QR-Code bestätigen',
    icon: '🎓',
    farbe: '#1d4ed8',
  },
  {
    id: 'verwaltung',
    label: 'Verwaltung',
    beschreibung: 'Anwesenheitsübersichten und Auswertungen einsehen',
    icon: '📊',
    farbe: '#7c3aed',
  },
];

export default function RollenAuswahl() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Bereits eingeloggte Nutzer weiterleiten
  useEffect(() => {
    if (user) {
      if (user.rolle === 'dozent') navigate('/dozent');
      else if (user.rolle === 'verwaltung') navigate('/verwaltung');
    }
  }, [user]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          width: '64px', height: '64px',
          background: 'var(--green-primary)',
          borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 16px rgba(0,102,51,0.3)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          DHGE Präsenz
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
          Digitale Anwesenheitserfassung für die Duale Hochschule Gera-Eisenach
        </p>
        <div style={{
          display: 'inline-block',
          marginTop: '12px',
          padding: '4px 12px',
          background: '#fff8e1',
          border: '1px solid #f59e0b',
          borderRadius: '100px',
          fontSize: '12px',
          color: '#92400e',
          fontWeight: 600,
        }}>
          🧪 Pilotmodus — Rolle auswählen
        </div>
      </div>

      {/* Rollenkarten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '860px',
      }}>
        {rollen.map((rolle) => (
          <button
            key={rolle.id}
            onClick={() => navigate('/login', { state: { rolle: rolle.id } })}
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = rolle.farbe;
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12)`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>{rolle.icon}</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {rolle.label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {rolle.beschreibung}
            </div>
            <div style={{
              marginTop: '16px',
              fontSize: '13px',
              fontWeight: 600,
              color: rolle.farbe,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              Anmelden →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}