const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const NUTZER = [
  { sub: 'dozent-001', given_name: 'Thomas', family_name: 'Müller',
    email: 'thomas.mueller@dhge.de', role: 'dozent', kurs: null, matrikelnr: null },
  { sub: 'student-001', given_name: 'Max', family_name: 'Muster',
    email: 'm.muster@dhge.de', role: 'studierender', kurs: 'MD23', matrikelnr: '123456' },
  { sub: 'verwaltung-001', given_name: 'Anna', family_name: 'Schmidt',
    email: 'a.schmidt@dhge.de', role: 'verwaltung', kurs: null, matrikelnr: null },
];

router.post('/token', (req, res) => {
  const { username } = req.body;
  const nutzer = NUTZER.find(n => n.sub === username);
  if (!nutzer) return res.status(401).json({ error: 'Unbekannter Nutzer' });

  const token = jwt.sign(nutzer, process.env.JWT_SECRET, {
    issuer: 'dhge-mock-idp',
    audience: 'dhge-praesenz-api',
    expiresIn: '8h',
  });

  res.json({ token });
});

module.exports = router;