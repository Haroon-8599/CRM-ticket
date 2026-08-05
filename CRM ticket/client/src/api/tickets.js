/**
 * api/tickets.js — Centralized API calls
 *
 * All HTTP calls go through this module so components stay clean.
 * The baseURL reads from VITE_API_URL in production; in development,
 * Vite's proxy forwards /api → localhost:3001 automatically.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// POST /api/tickets — create a new ticket
export const createTicket = (data) =>
  api.post('/api/tickets', data).then((r) => r.data);

// GET /api/tickets — list with optional filters
export const fetchTickets = ({ status, search } = {}) => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (search)                      params.search = search;
  return api.get('/api/tickets', { params }).then((r) => r.data);
};

// GET /api/tickets/:id — full detail + notes
export const fetchTicket = (ticket_id) =>
  api.get(`/api/tickets/${ticket_id}`).then((r) => r.data);

// PUT /api/tickets/:id — update status and/or add note
export const updateTicket = (ticket_id, data) =>
  api.put(`/api/tickets/${ticket_id}`, data).then((r) => r.data);
