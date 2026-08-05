/**
 * index.js — Express application entry point
 *
 * In development: serves only the API (frontend runs separately via Vite).
 * In production:  also serves the built React app from /client/dist,
 *                 so a single Render Web Service handles everything.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const ticketsRouter = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// CORS: allow specified CLIENT_URL or dev server origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/tickets', ticketsRouter);

// Simple health-check so Render / Docker know the service is alive
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Serve React frontend in production
// ─────────────────────────────────────────────
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(clientDistPath);

if (isProduction && fs.existsSync(clientDistPath)) {
  // Serve static assets (JS, CSS, images)
  app.use(express.static(clientDistPath));

  // For any route that isn't an API call, send the React index.html
  // so that client-side routing (React Router) works on direct URL access.
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ─────────────────────────────────────────────
// Start server & Graceful Shutdown (Standalone Node.js Server)
// ─────────────────────────────────────────────
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    if (isProduction && fs.existsSync(clientDistPath)) {
      console.log(`   Serving React frontend from ${clientDistPath}`);
    } else {
      console.log(`   API-only mode (frontend on http://localhost:5173)`);
    }
  });

  // Handle graceful shutdown for containers & hosting services
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 ${signal} received. Closing server gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;


