// src/pages/CheckIn.jsx
import { useEffect, useState, useRef } from 'react';

const RICKROLL_MP4 = 'https://archive.org/download/Rick_Astley_Never_Gonna_Give_You_Up/Rick%20Astley%20Never%20Gonna%20Give%20You%20Up.mp4';

export default function CheckIn() {
  const [countdown, setCountdown] = useState(3);
  const [zeigeVideo, setZeigeVideo] = useState(false);
  const [gestartet, setGestartet] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setZeigeVideo(true); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const starten = () => {
    setGestartet(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play();
      }
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: gestartet ? '24px' : '48px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '480px', width: '100%' }}>

        {!zeigeVideo && (
          <>
            <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>✓</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginBottom: '8px' }}>Anwesenheit erfasst!</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>Deine Anwesenheit wurde erfolgreich registriert.</div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>
                <span style={{ color: '#006633' }}>DH</span><span style={{ color: '#333' }}>GE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '2px' }}>ANWESENHEIT</div>
            </div>
            <div style={{ fontSize: '12px', color: '#d1d5db' }}>Weiterleitung in {countdown}...</div>
          </>
        )}

        {zeigeVideo && !gestartet && (
          <div onClick={starten} style={{ cursor: 'pointer', background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '10px', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#15803d' }}>Tippe hier für deine Belohnung</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Ein kleines Dankeschön fürs Scannen</div>
          </div>
        )}

        {zeigeVideo && gestartet && (
          <>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '12px' }}>🎵 Du wurdest gerickrollt!</div>
            <video
              ref={videoRef}
              src={RICKROLL_MP4}
              autoPlay
              playsInline
              controls
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </>
        )}
      </div>
    </div>
  );
}