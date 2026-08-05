/**
 * routes/tickets.js — All ticket API endpoints
 *
 * Endpoints:
 *   POST   /api/tickets              — Create a new ticket
 *   GET    /api/tickets              — List tickets (with optional ?status= and ?search=)
 *   GET    /api/tickets/:ticket_id   — Get full ticket detail + notes
 *   PUT    /api/tickets/:ticket_id   — Update status and/or add a note
 */

const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate the next ticket_id (e.g. TKT-001, TKT-002...)
// We query the highest existing numeric suffix and increment by 1.
// This never reuses IDs even if rows are deleted, because we use MAX(id).
// ─────────────────────────────────────────────────────────────────────────────
function generateTicketId() {
  // MAX(id) is the autoincrement integer — we use it as the basis for the next ID
  const row = db.prepare('SELECT MAX(id) as maxId FROM tickets').get();
  const nextNum = (row.maxId ?? 0) + 1;
  // Zero-pad to 3 digits: 1 → "001", 42 → "042", 100 → "100"
  return `TKT-${String(nextNum).padStart(3, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tickets — Create a new ticket
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_email, subject, description } = req.body;

    // Validate required fields
    const missing = [];
    if (!customer_name?.trim())  missing.push('customer_name');
    if (!customer_email?.trim()) missing.push('customer_email');
    if (!subject?.trim())        missing.push('subject');
    if (!description?.trim())    missing.push('description');

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missing,
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      return res.status(400).json({
        error: 'Invalid email address',
        fields: ['customer_email'],
      });
    }

    const ticket_id = generateTicketId();

    const stmt = db.prepare(`
      INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status)
      VALUES (@ticket_id, @customer_name, @customer_email, @subject, @description, 'Open')
    `);

    stmt.run({
      ticket_id,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      subject: subject.trim(),
      description: description.trim(),
    });

    // Fetch the created_at that SQLite generated
    const created = db.prepare('SELECT created_at FROM tickets WHERE ticket_id = ?').get(ticket_id);

    return res.status(201).json({
      ticket_id,
      created_at: created.created_at,
    });
  } catch (err) {
    console.error('POST /api/tickets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tickets — List tickets with optional filtering
//
// Query params:
//   ?status=Open|In Progress|Closed   (exact match, case-sensitive)
//   ?search=term                       (substring match on name, email, ticket_id, subject, description)
//
// Both params are optional and combinable.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;

    // Build the WHERE clause dynamically based on which params were provided
    const conditions = [];
    const params = {};

    if (status && status !== 'All') {
      conditions.push('status = @status');
      params.status = status;
    }

    if (search && search.trim()) {
      // SQLite LIKE is case-insensitive for ASCII; we add % wildcards for substring match
      const term = `%${search.trim()}%`;
      conditions.push(`(
        customer_name  LIKE @search COLLATE NOCASE OR
        customer_email LIKE @search COLLATE NOCASE OR
        ticket_id      LIKE @search COLLATE NOCASE OR
        subject        LIKE @search COLLATE NOCASE OR
        description    LIKE @search COLLATE NOCASE
      )`);
      params.search = term;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const tickets = db.prepare(`
      SELECT ticket_id, customer_name, customer_email, subject, status, created_at
      FROM tickets
      ${where}
      ORDER BY created_at DESC
    `).all(params);

    return res.json(tickets);
  } catch (err) {
    console.error('GET /api/tickets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tickets/:ticket_id — Full ticket detail + its notes
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:ticket_id', (req, res) => {
  try {
    const { ticket_id } = req.params;

    const ticket = db.prepare(`
      SELECT ticket_id, customer_name, customer_email, subject, description,
             status, created_at, updated_at
      FROM tickets
      WHERE ticket_id = ?
    `).get(ticket_id);

    if (!ticket) {
      return res.status(404).json({ error: `Ticket ${ticket_id} not found` });
    }

    // Fetch all notes for this ticket, oldest first (chronological thread)
    const notes = db.prepare(`
      SELECT note_text, created_at
      FROM notes
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).all(ticket_id);

    return res.json({ ...ticket, notes });
  } catch (err) {
    console.error(`GET /api/tickets/${req.params.ticket_id} error:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tickets/:ticket_id — Update status and/or append a note
//
// Body: { status?: string, notes?: string }
// At least one field must be present.
// Notes are APPENDED (never overwrite history).
// updated_at is always refreshed.
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:ticket_id', (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, notes } = req.body;

    // Require at least one field
    if (status === undefined && notes === undefined) {
      return res.status(400).json({
        error: 'Request body must include at least one of: status, notes',
      });
    }

    // Validate status value if provided
    const validStatuses = ['Open', 'In Progress', 'Closed'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Check ticket exists
    const existing = db.prepare('SELECT id FROM tickets WHERE ticket_id = ?').get(ticket_id);
    if (!existing) {
      return res.status(404).json({ error: `Ticket ${ticket_id} not found` });
    }

    // Run both operations in a transaction (manual BEGIN/COMMIT/ROLLBACK —
    // node:sqlite doesn't have a transaction() helper like better-sqlite3)
    let updatedAt;
    db.exec('BEGIN');
    try {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updatedAt = now;

      if (status !== undefined) {
        db.prepare(`
          UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?
        `).run(status, now, ticket_id);
      } else {
        // Even if only a note is added, refresh updated_at
        db.prepare(`
          UPDATE tickets SET updated_at = ? WHERE ticket_id = ?
        `).run(now, ticket_id);
      }

      if (notes && notes.trim()) {
        db.prepare(`
          INSERT INTO notes (ticket_id, note_text) VALUES (?, ?)
        `).run(ticket_id, notes.trim());
      }

      db.exec('COMMIT');
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }

    return res.json({ success: true, updated_at: updatedAt });
  } catch (err) {
    console.error(`PUT /api/tickets/${req.params.ticket_id} error:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
