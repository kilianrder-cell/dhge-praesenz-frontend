// routes/checkin.js
const express = require('express');
const pool = require('../db');
const crypto = require('crypto');
const { validateQrToken } = require('../services/qr-service');
const router = express.Router();
 
// POST /api/checkin
// Body: { qrPayload: '...', fingerprint: '...' }
router.post('/', async (req, res) => {
  const { qrPayload, fingerprint } = req.body;
  const nutzer = req.user;
 
  // Nur Studierende dürfen einchecken
  if (nutzer.rolle !== 'studierender') {
    return res.status(403).json({ error: 'Nur Studierende' });
  }
 
  try {
    // --- Schicht 1: QR-Token validieren ---
    // Das qr_secret der Einheit aus der DB holen
    const { einheitId } = JSON.parse(qrPayload);
    const einheit = await pool.query(
      'SELECT qr_secret, status FROM einheiten WHERE id = $1',
      [einheitId]
    );
 
    if (!einheit.rows[0] || einheit.rows[0].status !== 'aktiv') {
      await logAudit(einheitId, nutzer.id, 'checkin_versuch', false,
        fingerprint, req.ip, 'Sitzung nicht aktiv');
      return res.status(400).json({ error: 'Sitzung nicht aktiv' });
    }
 
    const qrResult = validateQrToken(qrPayload, einheit.rows[0].qr_secret);
    if (!qrResult.valid) {
      await logAudit(einheitId, nutzer.id, 'checkin_versuch', false,
        fingerprint, req.ip, 'QR-Token abgelaufen oder ungültig');
      return res.status(400).json({ error: 'QR-Code abgelaufen' });
    }
 
    // --- Schicht 2: Device-Fingerprint prüfen ---
    // Gerät registrieren oder vorhandenes finden
    let deviceResult = await pool.query(
      `INSERT INTO devices (nutzer_id, fingerprint, user_agent)
       VALUES ($1, $2, $3)
       ON CONFLICT (nutzer_id, fingerprint) DO NOTHING
       RETURNING id`,
      [nutzer.id, fingerprint, req.headers['user-agent']]
    );
 
    if (deviceResult.rows.length === 0) {
      deviceResult = await pool.query(
        'SELECT id FROM devices WHERE nutzer_id=$1 AND fingerprint=$2',
        [nutzer.id, fingerprint]
      );
    }
    const deviceId = deviceResult.rows[0].id;
 
    // Duplikat-Prüfung: Wurde dieses Gerät für diese Sitzung
    // bereits von einem ANDEREN Nutzer verwendet?
    const dupCheck = await pool.query(
      `SELECT a.nutzer_id FROM anwesenheit a
       JOIN devices d ON a.device_id = d.id
       WHERE a.einheit_id = $1 AND d.fingerprint = $2
       AND a.nutzer_id != $3`,
      [einheitId, fingerprint, nutzer.id]
    );
 
    if (dupCheck.rows.length > 0) {
      await logAudit(einheitId, nutzer.id, 'checkin_versuch', false,
        fingerprint, req.ip, 'Gerät bereits für anderen Nutzer verwendet');
      return res.status(409).json({
        error: 'Dieses Gerät wurde bereits für einen anderen Check-in verwendet'
      });
    }
 
    // --- Schicht 3: Anwesenheit eintragen ---
    // Verifikations-Hash als digitaler Unterschriftsersatz
    const verHash = crypto.createHash('sha256')
      .update(`${nutzer.id}:${einheitId}:${deviceId}:${Date.now()}`)
      .digest('hex');
 
    await pool.query(
      `INSERT INTO anwesenheit
       (einheit_id, nutzer_id, device_id, verifikation_hash)
       VALUES ($1, $2, $3, $4)`,
      [einheitId, nutzer.id, deviceId, verHash]
    );
 
    // Erfolg im Audit-Log festhalten
    await logAudit(einheitId, nutzer.id, 'checkin_erfolg', true,
      fingerprint, req.ip, null);
 
    res.json({
      success: true,
      verifikationHash: verHash,
      zeitstempel: new Date().toISOString()
    });
 
  } catch (err) {
    if (err.code === '23505') { // UNIQUE violation
      return res.status(409).json({ error: 'Bereits eingecheckt' });
    }
    console.error(err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});
 
// Hilfsfunktion: Audit-Log-Eintrag schreiben
async function logAudit(einheitId, nutzerId, aktion, erfolg,
                        fingerprint, ip, fehler) {
  await pool.query(
    `INSERT INTO audit
     (einheit_id, nutzer_id, aktion, erfolgreich,
      device_fingerprint, ip_adresse, fehlergrund)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [einheitId, nutzerId, aktion, erfolg, fingerprint, ip, fehler]
  );
}
 
module.exports = router;
