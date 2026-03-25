// middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../db');
 
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Kein Token' });
 
  try {
    // Token verifizieren – derselbe JWT_SECRET wie im Mock-IdP
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // Just-in-Time Provisioning:
    // Beim allerersten Login wird der Nutzer automatisch angelegt.
    // Bei allen weiteren Logins greift ON CONFLICT und es passiert nichts.
    const result = await pool.query(`
      INSERT INTO nutzer (ldap_uid, vorname, nachname, email, rolle, kurs, matrikelnr)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (ldap_uid) DO NOTHING
      RETURNING id, rolle
    `, [
      decoded.sub,           // Eindeutige Nutzer-ID aus dem Token
      decoded.given_name,    // Vorname
      decoded.family_name,   // Nachname
      decoded.email,
      decoded.role,          // 'dozent', 'studierender', 'verwaltung'
      decoded.kurs || null,  // Nur bei Studierenden gefüllt
      decoded.matrikelnr || null
    ]);
    // Falls ON CONFLICT gegriffen hat (Nutzer existiert bereits),
    // die bestehende ID nachladen:
    if (result.rows.length === 0) {
      const existing = await pool.query(
        'SELECT id, rolle FROM nutzer WHERE ldap_uid = $1',
        [decoded.sub]
      );
      req.user = {
        id: existing.rows[0].id,
        rolle: existing.rows[0].rolle,
        ...decoded
      };
    } else {
      req.user = {
        id: result.rows[0].id,
        rolle: result.rows[0].rolle,
        ...decoded
      };
    }
 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
}
 
