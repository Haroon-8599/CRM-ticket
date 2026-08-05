# Datastraw Support Ticketing CRM

A production-ready Customer Support Ticketing system built as a full-stack monorepo.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Node.js + Express                   |
| Database    | SQLite via `better-sqlite3`         |
| Frontend    | React 18 + Vite + Tailwind CSS v3   |
| HTTP Client | Axios                               |
| Notifications | react-hot-toast                   |
| Icons       | lucide-react                        |
| Deploy      | Render.com (single Web Service)     |

---

## Project Structure

```
/
├── server/
│   ├── index.js            # Express entry point, middleware, static serving
│   ├── db.js               # SQLite setup, schema, seed data
│   ├── routes/
│   │   └── tickets.js      # All 4 API endpoints
│   └── package.json
├── client/
│   ├── index.html          # HTML shell + Google Fonts
│   ├── vite.config.js      # Vite + dev proxy to Express
│   ├── tailwind.config.js  # Custom colors, fonts, animations
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx        # React root + Toaster
│       ├── App.jsx         # Routes
│       ├── index.css       # Global styles + Tailwind directives
│       ├── api/
│       │   └── tickets.js  # Axios API calls (centralized)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatusPill.jsx
│       │   ├── TicketTable.jsx
│       │   ├── SkeletonRow.jsx
│       │   ├── EmptyState.jsx
│       │   └── NoteThread.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx        # Stats overview, live search, status filter
│       │   ├── CreateTicket.jsx     # Ticket creation with client validation
│       │   ├── TicketDetail.jsx     # Detail view, optimistic status, notes
│       │   └── LoginPage.jsx        # Agent & Admin login portal with 1-click personas
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+ and npm

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd crm-ticket
```

### 2. Start the backend
```bash
cd server
npm install
npm run dev
# Server starts at http://localhost:3001
# SQLite database created at server/data/crm.sqlite
# 5 sample tickets + 4 notes seeded automatically on first run
```

### 3. Start the frontend (new terminal)
```bash
cd client
npm install
npm run dev
# Vite starts at http://localhost:5173
# API calls proxy automatically to localhost:3001
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

All endpoints return JSON. Base URL: `http://localhost:3001`

### `POST /api/tickets`
Create a new ticket.

**Request body:**
```json
{
  "customer_name":  "Priya Sharma",
  "customer_email": "priya@example.com",
  "subject":        "Login not working",
  "description":    "Detailed description of the issue..."
}
```

**Response (201):**
```json
{ "ticket_id": "TKT-006", "created_at": "2026-08-03 14:30:00" }
```

---

### `GET /api/tickets`
List tickets. Both query params are optional and combinable.

**Query params:**
- `?status=Open` — filter by status (`Open`, `In Progress`, `Closed`)
- `?search=priya` — substring search across name, email, ticket ID, subject, description

**Response (200):**
```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "Priya Sharma",
    "customer_email": "priya@example.com",
    "subject": "Login not working",
    "status": "Open",
    "created_at": "2026-08-03 14:30:00"
  }
]
```

---

### `GET /api/tickets/:ticket_id`
Full detail for a single ticket, including all notes.

**Response (200):**
```json
{
  "ticket_id": "TKT-001",
  "customer_name": "Priya Sharma",
  "customer_email": "priya@example.com",
  "subject": "Login not working",
  "description": "Full description...",
  "status": "In Progress",
  "created_at": "2026-08-03 14:30:00",
  "updated_at": "2026-08-03 15:00:00",
  "notes": [
    { "note_text": "Investigating...", "created_at": "2026-08-03 15:00:00" }
  ]
}
```

**Response (404):**
```json
{ "error": "Ticket TKT-999 not found" }
```

---

### `PUT /api/tickets/:ticket_id`
Update status and/or append a note. At least one field required.

**Request body:**
```json
{
  "status": "Closed",
  "notes": "Issue resolved. Closing ticket."
}
```

**Response (200):**
```json
{ "success": true, "updated_at": "2026-08-03 15:30:00" }
```

---

## Production Build (Single Service Deploy)

Build the React frontend, then run Express to serve everything:

```bash
# 1. Build the React app
cd client && npm run build

# 2. Start Express in production mode (serves /client/dist)
cd ../server
NODE_ENV=production npm start
# http://localhost:3001 → serves the full app
```

---

## Deploying to Render.com

1. Push this repo to GitHub.
2. On Render, create a **Web Service** with:
   - **Build command:** `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start command:** `cd server && NODE_ENV=production node index.js`
   - **Environment:** `NODE_ENV=production`, `PORT=10000` (Render injects this)
3. Render will serve the Express API + React frontend from one URL.

---

## Architecture Decisions

**Why SQLite + `better-sqlite3`?**
SQLite with a synchronous driver is perfect for a demo-scale app: zero external setup, file-based, no connection pooling needed. The synchronous API keeps Express route handlers simple and readable.

**Why no ORM?**
Raw SQL keeps every query visible and explainable. For a 2-table schema this is genuinely simpler than adding an ORM abstraction layer.

**Why single-service deploy?**
Express serves the built React `dist/` in production. One Render service, one URL, no cross-origin CORS complexity in production. The Vite dev proxy handles CORS during development automatically.

**Why debounced search hits the API?**
Rather than filtering the already-fetched array on the client, each search fires a proper `GET /api/tickets?search=` request. This demonstrates real API design and scales correctly if the dataset grows.

**Optimistic UI for status updates:**
The status pill changes instantly on click; the API call happens in the background. If it fails, the pill rolls back and a toast error is shown. This is the standard UX pattern for fast-feeling interfaces.

---

## Features Checklist

- [x] Create ticket (POST with validation, auto-generated TKT-NNN ID)
- [x] List tickets (GET with search + status filter)
- [x] View ticket detail (GET with notes)
- [x] Update status + add note (PUT)
- [x] 5 sample tickets seeded on first run
- [x] Responsive design (375px → desktop)
- [x] Loading skeletons
- [x] Empty states
- [x] Toast notifications
- [x] 404 handling
- [x] Optimistic UI
