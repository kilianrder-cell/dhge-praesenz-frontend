const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/roles');

// GET /api/anwesenheit/:einheitId — Teilnehmerliste für eine Sitzung
router.get('/:einheitId', requireRole('dozent', 'verwaltung'), async (req, res) => {
  const { einheitId } = req.params;
  try {
    const result = await db.query(`
      SELECT n.vorname, n.nachname, n.email, n.matrikelnr, n.kurs,
             a.eingecheckt_am
      FROM anwesenheit a
      JOIN nutzer n ON n.id = a.nutzer_id
      WHERE a.einheit_id = $1
      ORDER BY a.eingecheckt_am ASC
    `, [einheitId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fehler bei Anwesenheitsabfrage:', err);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// POST /api/anwesenheit/manuell — Manuelles Eintragen durch Dozent
router.post('/manuell', requireRole('dozent'), async (req, res) => {
  const { einheit_id, matrikelnr } = req.body;
  try {
    const nutzer = await db.query(
      'SELECT id FROM nutzer WHERE matrikelnr = $1', [matrikelnr]
    );
    if (nutzer.rows.length === 0) {
      return res.status(404).json({ error: 'Studierender nicht gefunden' });
    }
    const nutzer_id = nutzer.rows[0].id;
    await db.query(`
      INSERT INTO anwesenheit (einheit_id, nutzer_id, verifikation_hash, eingecheckt_am)
      VALUES ($1, $2, 'manuell', NOW())
      ON CONFLICT (einheit_id, nutzer_id) DO NOTHING
    `, [einheit_id, nutzer_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Fehler bei manuellem Eintrag:', err);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

module.exports = router;