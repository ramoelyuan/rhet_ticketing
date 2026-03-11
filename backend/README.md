## Backend (Node.js + Express + PostgreSQL)

### Requirements
- Node.js installed
- PostgreSQL installed and running

### 1) Configure environment
Copy `backend/.env.example` to `backend/.env` and edit:
- `DATABASE_URL`
- `JWT_SECRET`

### 2) Create database
Create a database matching your `DATABASE_URL`, e.g.:

```sql
CREATE DATABASE rhet_ticketing;
```

### 3) Create schema + seed data
From `backend/`:

```bash
npm run db:schema
npm run db:seed
```

Seed login accounts (password `Password123!`):
- Employee: `employee@company.com`
- Technicians: `tech1@company.com`, `tech2@company.com`
- Admin: `admin@company.com`

### 4) Run server
From `backend/`:

```bash
npm run dev
```

Server: `http://localhost:5000`

### API overview
- **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
- **Categories**: `GET /api/categories` (auth required)
- **Tickets**:
  - `POST /api/tickets` (EMPLOYEE)
  - `GET /api/tickets` (role-scoped list + search + pagination)
  - `GET /api/tickets/:id` (details incl replies/assignments/timeline)
  - `POST /api/tickets/:id/replies`
  - `POST /api/tickets/:id/status` (TECHNICIAN/ADMIN)
  - `GET /api/tickets/technicians/workload` (TECHNICIAN/ADMIN)
- **Admin** (ADMIN):
  - `GET /api/admin/dashboard`
  - Categories: `GET/POST /api/admin/categories`, `PATCH /api/admin/categories/:id/toggle`
  - Technicians: `GET/POST /api/admin/technicians`, `PATCH /api/admin/technicians/:id/toggle-availability`
  - Users: `PATCH /api/admin/users/:id/toggle-active`
  - Assign/Reassign: `POST /api/admin/tickets/:id/assign`
  - Reports: `/api/admin/reports/*`

### Auto-assignment logic
When a ticket is created, the system auto-assigns it to the **available technician with the lowest number of active tickets** (active = `OPEN`, `IN_PROGRESS`, `WAITING_FOR_USER`). If none are available, the ticket stays unassigned.

