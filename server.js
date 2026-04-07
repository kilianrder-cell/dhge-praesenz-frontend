// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
 
const authMiddleware = require('./middleware/auth');
const einheitenRoutes = require('./routes/einheiten');
const checkinRoutes = require('./routes/checkin');
const anwesenheitRoutes = require('./routes/anwesenheit');
const kalenderRoutes = require('./routes/kalender');
const mockIdpRoutes = require('./services/mock-idp');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Mock-IdP (ohne Auth-Middleware - ist der Login-Endpunkt selbst)
app.use('/api/mock-auth', mockIdpRoutes);
 
// Geschützte API-Routen
app.use('/api/einheiten', authMiddleware, einheitenRoutes);
app.use('/api/checkin', authMiddleware, checkinRoutes);
app.use('/api/anwesenheit', authMiddleware, anwesenheitRoutes);
app.use('/api/kalender', authMiddleware, kalenderRoutes);
 
// Health-Check für Railway
app.get('/health', (_, res) => res.json({ status: 'ok' }));
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API läuft auf Port ${PORT}`));
