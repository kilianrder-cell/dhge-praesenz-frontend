// src/components/QRCodeAnzeige.jsx
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import client from '../api/client';

export default function QRCodeAnzeige({ einheitId, onClose }) {
  const [qrPayload, setQrPayload] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [fehler, setFehler] = useState('');

  // QR-Code-URL für Studierende — enthält die einheitId
  const checkinUrl = `${window.location.origin}/checkin/${einheitId}`;

  const ladeQR = async () => {
    try {
      const res = await client.get(`/api/einheiten/${einheitId}/qr`);
      setQrPayload(res.data.qrPayload);
      setCountdown(30);
    } catch {
      setFehler('QR-Code konnte nicht geladen werden.');
    }
  };

  // Alle 30 Sekunden neuen QR-Code laden (rotierendes Zeitfenster)
  useEffect(() => {
    ladeQR();
    const interval = setInterval(ladeQR, 30000);
    return () => clearInterval(interval);
  }, [einheitId]);

  // Countdown-Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 30));
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

        {fehler ? (
          <div style={{ color: 'var(--danger)', padding: '24px' }}>{fehler}</div>
        ) : qrPayload ? (
          <>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
              border: '1px solid var(--border)',
            }}>
              {/* QR-Code verlinkt direkt auf die Check-in-Seite */}
              <QRCodeSVG value={checkinUrl} size={220} level="M" />
            </div>

            {/* Countdown */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '13px', color: 'var(--text-secondary)',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: countdown <= 5 ? '#fef2f2' : 'var(--green-light)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px',
                  color: countdown <= 5 ? 'var(--danger)' : 'var(--green-primary)',
                }}>
                  {countdown}
                </div>
                Sekunden bis zur Erneuerung
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Zeige diesen Code im Beamer — Studierende scannen ihn mit der Kamera
            </p>
          </>
        ) : (
          <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Lädt...</div>
        )}
      </div>
    </div>
  );
}