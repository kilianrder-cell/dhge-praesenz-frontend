// src/components/QRCodeAnzeige.jsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function getToken() {
  // Wechselt alle 30 Sekunden — basiert auf aktueller Zeit
  return Math.floor(Date.now() / 30000);
}

export default function QRCodeAnzeige({ einheitId, onClose }) {
  const [countdown, setCountdown] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [token, setToken] = useState(getToken());

  const checkinUrl = `${window.location.origin}/checkin/${einheitId}?t=${token}`;

  useEffect(() => {
    const timer = setInterval(() => {
      const sek = Math.floor(Date.now() / 1000) % 30;
      setCountdown(30 - sek);
      setToken(getToken());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '24px',
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '17px' }}>QR-Code zum Einchecken</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{
          background: 'white', padding: '20px',
          borderRadius: '12px', display: 'inline-block',
          border: '1px solid #e5e7eb',
        }}>
          <QRCodeSVG value={checkinUrl} size={220} level="M" />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: countdown <= 5 ? '#fef2f2' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '14px',
            color: countdown <= 5 ? '#dc2626' : '#006633',
          }}>
            {countdown}
          </div>
          Sekunden bis zur Erneuerung
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
          Zeige diesen Code im Beamer — Studierende scannen ihn mit der Kamera
        </p>
      </div>
    </div>
  );
}