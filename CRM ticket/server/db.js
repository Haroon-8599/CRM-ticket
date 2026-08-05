/**
 * db.js — Database initialization and seed data
 *
 * Uses Node.js's built-in `node:sqlite` module (available since Node 22).
 * This is a pure-JS, synchronous SQLite API — no native compilation needed,
 * no Visual Studio required, works out-of-the-box on any platform.
 *
 * On first run this file:
 *   1. Creates the /data directory if it doesn't exist
 *   2. Creates both tables (tickets, notes) if they don't exist
 *   3. Seeds 5 sample tickets + notes so the dashboard is never empty
 */

// node:sqlite is built into Node.js 22+. No npm install needed.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs   = require('fs');

// Pull DB path from env or fall back to ./data/crm.sqlite (/tmp/crm.sqlite on Vercel)
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const defaultDbPath = isVercel
  ? path.join('/tmp', 'crm.sqlite')
  : path.resolve(__dirname, 'data', 'crm.sqlite');

const dbPath = process.env.DB_PATH
  ? (path.isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : path.resolve(__dirname, process.env.DB_PATH))
  : defaultDbPath;

// Make sure the directory exists before opening the file
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open (or create) the SQLite file
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrent-read performance
db.exec('PRAGMA journal_mode = WAL');

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id     TEXT    UNIQUE NOT NULL,
    customer_name  TEXT    NOT NULL,
    customer_email TEXT    NOT NULL,
    subject       TEXT    NOT NULL,
    description   TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'Open',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id  TEXT    NOT NULL REFERENCES tickets(ticket_id),
    note_text  TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─────────────────────────────────────────────
// Seed data — only inserted when table is empty
// ─────────────────────────────────────────────
const ticketCount = db.prepare('SELECT COUNT(*) as cnt FROM tickets').get();

if (ticketCount.cnt === 0) {
  console.log('🌱 Seeding sample data...');

  const insertTicket = db.prepare(`
    INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
    VALUES (@ticket_id, @customer_name, @customer_email, @subject, @description, @status, @created_at, @updated_at)
  `);

  const insertNote = db.prepare(`
    INSERT INTO notes (ticket_id, note_text, created_at)
    VALUES (@ticket_id, @note_text, @created_at)
  `);

  const seeds = [
    {
      ticket_id: 'TKT-001',
      customer_name: 'Priya Sharma',
      customer_email: 'priya.sharma@example.com',
      subject: 'Login page not loading after password reset',
      description:
        'After resetting my password via the email link, I am redirected back to the login page but it shows a blank white screen. I have tried Chrome, Firefox, and Edge. The issue persists. I can see a 401 error in the browser console.',
      status: 'In Progress',
      created_at: '2026-07-28 08:10:00',
      updated_at: '2026-07-29 11:45:00',
    },
    {
      ticket_id: 'TKT-002',
      customer_name: 'Arjun Mehta',
      customer_email: 'arjun.mehta@techcorp.io',
      subject: 'Invoice #2047 shows wrong amount',
      description:
        'My latest invoice dated July 25 shows ₹14,500 but I was quoted ₹12,000 for the Professional plan. No upgrades were made on my account. Please correct this and reissue the invoice.',
      status: 'Open',
      created_at: '2026-07-30 14:22:00',
      updated_at: '2026-07-30 14:22:00',
    },
    {
      ticket_id: 'TKT-003',
      customer_name: 'Sanya Kapoor',
      customer_email: 'sanya@brightmedia.in',
      subject: 'API rate limit hit unexpectedly at low traffic',
      description:
        'We are on the Business plan with a limit of 10,000 requests/day. Our logs show we are only making ~3,000 requests, yet we are hitting 429 errors from 2 PM onwards every day. Please investigate — this is blocking production.',
      status: 'Open',
      created_at: '2026-07-31 09:05:00',
      updated_at: '2026-07-31 09:05:00',
    },
    {
      ticket_id: 'TKT-004',
      customer_name: 'Rohan Desai',
      customer_email: 'rohan.desai@shopnow.com',
      subject: 'Export to CSV button missing from reports',
      description:
        'The "Export to CSV" button that was in the Reports tab seems to have disappeared after the July 22 update. I rely on this weekly for my team reports. Can you restore it or advise an alternative?',
      status: 'Closed',
      created_at: '2026-07-22 16:40:00',
      updated_at: '2026-07-25 10:15:00',
    },
    {
      ticket_id: 'TKT-005',
      customer_name: 'Ananya Bose',
      customer_email: 'ananya.bose@finflow.co',
      subject: 'Dashboard widget data lagging by 2 hours',
      description:
        'The "Active Users" widget on my dashboard consistently shows data that is exactly 2 hours behind real time. I have verified this by comparing it with our own analytics. This started around August 1st.',
      status: 'In Progress',
      created_at: '2026-08-01 07:55:00',
      updated_at: '2026-08-02 13:30:00',
    },
  ];

  // Manual transaction — BEGIN / COMMIT / ROLLBACK
  db.exec('BEGIN');
  try {
    for (const ticket of seeds) {
      insertTicket.run(ticket);
    }

    // Add notes to TKT-001 and TKT-004
    insertNote.run({
      ticket_id: 'TKT-001',
      note_text:
        'Confirmed with engineering — a stale session cookie is causing the redirect loop. Deployed a fix to staging. Asking user to clear cookies and retry.',
      created_at: '2026-07-29 11:45:00',
    });
    insertNote.run({
      ticket_id: 'TKT-001',
      note_text:
        'User confirmed the fix works after clearing cookies. Monitoring for 24 hours before closing.',
      created_at: '2026-07-30 09:00:00',
    });
    insertNote.run({
      ticket_id: 'TKT-004',
      note_text:
        'Identified as a UI regression in v2.3.1. The button was accidentally removed during a cleanup. Re-added in v2.3.2 patch released today.',
      created_at: '2026-07-24 15:00:00',
    });
    insertNote.run({
      ticket_id: 'TKT-004',
      note_text: 'User confirmed the CSV export is working again. Closing ticket.',
      created_at: '2026-07-25 10:15:00',
    });

    db.exec('COMMIT');
    console.log('✅ Seed complete — 5 tickets, 4 notes inserted.');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('❌ Seed failed, rolled back:', err.message);
  }
}

module.exports = db;
