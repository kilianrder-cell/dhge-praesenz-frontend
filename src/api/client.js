// src/api/client.js
import axios from 'axios';

// VITE_API_URL wird von Railway als Umgebungsvariable gesetzt.
// Lokal fällt es auf localhost:4000 zurück.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// JWT-Token bei jeder Anfrage automatisch mitsenden
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Bei 401 automatisch ausloggen
// src/api/client.js
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Nur ausloggen wenn Token wirklich ungültig ist
      // NICHT bei Fehlern die nichts mit Auth zu tun haben
      const url = err.config?.url || '';
      const istAuthFehler = !url.includes('mock-auth');
      if (istAuthFehler) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default client;