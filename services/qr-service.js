// services/qr-service.js
const crypto = require('crypto');
 
// Generiert den QR-Code-Inhalt für eine bestimmte Einheit
function generateQrPayload(einheitId, qrSecret) {
  // Zeitfenster: alle 30 Sekunden ein neuer Slot
  const timeSlot = Math.floor(Date.now() / 30000);
 
  // SHA-256-Hash aus drei Bestandteilen:
  // 1) Einheit-ID (welche Sitzung?)
  // 2) Zeitslot (wann genau?)
  // 3) Server-Secret (nur dem Server bekannt)
  const hash = crypto.createHash('sha256')
    .update(`${einheitId}:${timeSlot}:${qrSecret}`)
    .digest('hex');
 
  return JSON.stringify({ einheitId, hash, ts: timeSlot });
}
 
// Prüft, ob ein gescannter QR-Token gültig ist
function validateQrToken(payload, qrSecret) {
  const { einheitId, hash, ts } = JSON.parse(payload);
  const currentSlot = Math.floor(Date.now() / 30000);
 
  // Toleranz: aktuelles UND vorheriges Zeitfenster akzeptieren,
  // damit ein Scan am Übergang zweier Fenster nicht fehlschlägt.
  for (const slot of [currentSlot, currentSlot - 1]) {
    const expected = crypto.createHash('sha256')
      .update(`${einheitId}:${slot}:${qrSecret}`)
      .digest('hex');
    if (hash === expected) return { valid: true, einheitId };
  }
  return { valid: false };
}
 
module.exports = { generateQrPayload, validateQrToken };
