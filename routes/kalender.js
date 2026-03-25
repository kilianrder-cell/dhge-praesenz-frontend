const express = require('express');
const router = express.Router();
const db = require('../db');
const ical = require('node-ical');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Endpunkt 1: Dozent speichert seine persönliche ICS-URL
// PUT statt POST, weil wir einen bestehenden Nutzerdatensatz aktualisieren
router.put('/ics-url', verifyToken, requireRole('dozent'), async (req, res) => {
  const { ics_url } = req.body;

  // Einfache Validierung: Ist es überhaupt eine URL?
  if (!ics_url || !ics_url.startsWith('http')) {
    return res.status(400).json({ error: 'Ungültige URL' });
  }

  try {
    await db.query(
      'UPDATE nutzer SET ics_url = $1 WHERE id = $2',
      [ics_url, req.user.id] // req.user.id kommt aus dem JWT, den auth.js ausliest
    );
    res.json({ message: 'ICS-URL erfolgreich gespeichert' });
  } catch (err) {
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

// Endpunkt 2: Dozent löst den Import manuell aus
router.post('/import', verifyToken, requireRole('dozent'), async (req, res) => {
  try {
    // Hole die gespeicherte URL aus der Datenbank
    const result = await db.query(
      'SELECT ics_url FROM nutzer WHERE id = $1',
      [req.user.id]
    );

    const ics_url = result.rows[0]?.ics_url;
    if (!ics_url) {
      return res.status(400).json({ error: 'Keine ICS-URL hinterlegt' });
    }

    // node-ical ruft die URL ab und parst die Kalenderdaten
    const events = await ical.async.fromURL(ics_url);
    
    // Hier folgt später die Logik, die Events in die Tabelle "einheiten" schreibt
    // Vorerst geben wir die Events zurück, um zu prüfen ob der Import klappt
    res.json({ message: 'Import erfolgreich', anzahl: Object.keys(events).length });
  } catch (err) {
    res.status(500).json({ error: 'Import fehlgeschlagen: ' + err.message });
  }
});

module.exports = router;