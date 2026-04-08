// src/pages/CheckIn.jsx
import { useEffect, useState } from 'react';

export default function CheckIn() {
  const [countdown, setCountdown] = useState(3);
  const [zeigeVideo, setZeigeVideo] = useState(false);
  const [videoFreigegeben, setVideoFreigegeben] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setZeigeVideo(true);
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '480px', width: '100%' }}>

        {!zeigeVideo && (
          <>
            <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>
              ✓
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginBottom: '8px' }}>
              Anwesenheit erfasst!
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
              Deine Anwesenheit wurde erfolgreich registriert.
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>
                <span style={{ color: '#006633' }}>DH</span><span style={{ color: '#333' }}>GE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '2px' }}>ANWESENHEIT</div>
            </div>
            <div style={{ fontSize: '12px', color: '#d1d5db' }}>
              Weiterleitung in {countdown}...
            </div>
          </>
        )}

        {zeigeVideo && !videoFreigegeben && (
          <div
            onClick={() => setVideoFreigegeben(true)}
            style={{ cursor: 'pointer', background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '10px', padding: '32px' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#15803d' }}>Tippe hier für deine Belohnung</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Ein kleines Dankeschön fürs Scannen</div>
          </div>
        )}

        {zeigeVideo && !videoFreigegeben && (
  <div
    onClick={() => window.location.href = 'https://youtu.be/dQw4w9WgXcQ'}
    style={{ cursor: 'pointer', background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '10px', padding: '32px' }}
  >
    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
    <div style={{ fontWeight: 700, fontSize: '16px', color: '#15803d' }}>Tippe hier für deine Belohnung</div>
    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Ein kleines Dankeschön fürs Scannen</div>
  </div>
)}
      </div>
    </div>
  );
}