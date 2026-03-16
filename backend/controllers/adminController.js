const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { pool } = require("../config/db");
const { addTimelineEvent } = require("../services/timeline");
const { addActivityLog } = require("../services/activityLog");
const { ACTIVE_STATUSES } = require("../services/assignment");

// Categories
const categorySchema = z.object({ name: z.string().min(2) });

async function listCategories(req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, is_active, created_at FROM categories ORDER BY name ASC"
    );
    res.json({
      categories: rows.map((c) => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        createdAt: c.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = categorySchema.parse(req.body);
    const { rows } = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name, is_active, created_at",
      [name.trim()]
    );
    const c = rows[0];
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "CATEGORY_CREATED",
      meta: { categoryId: c.id, name: c.name },
    });
    res.status(201).json({
      category: { id: c.id, name: c.name, isActive: c.is_active, createdAt: c.created_at },
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    next(err);
  }
}

async function toggleCategory(req, res, next) {
  try {
    const id = req.params.id;
    const { rows } = await pool.query(
      "UPDATE categories SET is_active = NOT is_active WHERE id=$1 RETURNING id, name, is_active",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const c = rows[0];
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "CATEGORY_TOGGLED",
      meta: { categoryId: c.id, isActive: c.is_active },
    });
    res.json({ category: { id: c.id, name: c.name, isActive: c.is_active } });
  } catch (err) {
    next(err);
  }
}

// Employees
async function listEmployees(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, is_active, created_at
      FROM users
      WHERE role = 'EMPLOYEE'
      ORDER BY full_name ASC
      `
    );
    res.json({
      employees: rows.map((e) => ({
        id: e.id,
        fullName: e.full_name,
        email: e.email,
        isActive: e.is_active,
        createdAt: e.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

const createEmployeeSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

async function createEmployee(req, res, next) {
  try {
    const { fullName, email, password } = createEmployeeSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1,$2,$3,'EMPLOYEE')
      RETURNING id, full_name, email, role
      `,
      [fullName.trim(), email.toLowerCase(), passwordHash]
    );
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "EMPLOYEE_CREATED",
      meta: { userId: rows[0].id, email: rows[0].email },
    });
    res.status(201).json({ employee: rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      const message = first ? (first.path.join(".") + ": " + first.message) : "Invalid request";
      return res.status(400).json({ error: message, details: err.issues });
    }
    if (err.code === "23505")
      return res.status(409).json({ error: "An account with this email already exists." });
    next(err);
  }
}

// Technicians
async function listTechnicians(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT u.id, u.full_name, u.email, u.is_active, tech.is_available
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      WHERE u.role='TECHNICIAN'
      ORDER BY u.full_name ASC
      `
    );
    res.json({
      technicians: rows.map((t) => ({
        id: t.id,
        fullName: t.full_name,
        email: t.email,
        isActive: t.is_active,
        isAvailable: t.is_available,
      })),
    });
  } catch (err) {
    next(err);
  }
}

const createTechSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

async function createTechnician(req, res, next) {
  const client = await pool.connect();
  try {
    const { fullName, email, password } = createTechSchema.parse(req.body);
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1,$2,$3,'TECHNICIAN')
      RETURNING id, full_name, email, role
      `,
      [fullName.trim(), email.toLowerCase(), passwordHash]
    );
    await client.query("INSERT INTO technicians (user_id, is_available) VALUES ($1,true)", [
      rows[0].id,
    ]);
    await client.query("COMMIT");
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "IT_SUPPORT_CREATED",
      meta: { userId: rows[0].id, email: rows[0].email },
    });
    res.status(201).json({ technician: rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    next(err);
  } finally {
    client.release();
  }
}

async function toggleTechnicianAvailability(req, res, next) {
  try {
    const id = req.params.id;
    const { rows } = await pool.query(
      `
      UPDATE technicians
      SET is_available = NOT is_available
      WHERE user_id=$1
      RETURNING user_id, is_available
      `,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ technicianId: rows[0].user_id, isAvailable: rows[0].is_available });
  } catch (err) {
    next(err);
  }
}

async function toggleUserActive(req, res, next) {
  try {
    const id = req.params.id;
    const { rows } = await pool.query(
      "UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING id, is_active",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "USER_ACTIVE_TOGGLED",
      meta: { userId: rows[0].id, isActive: rows[0].is_active },
    });
    res.json({ userId: rows[0].id, isActive: rows[0].is_active });
  } catch (err) {
    next(err);
  }
}

// Manual assignment / reassignment
const assignSchema = z.object({ technicianId: z.string().uuid().nullable() });

async function assignTicket(req, res, next) {
  const client = await pool.connect();
  try {
    const ticketId = req.params.id;
    const { technicianId } = assignSchema.parse(req.body);

    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT id, status, assigned_technician_id FROM tickets WHERE id=$1",
      [ticketId]
    );
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const isFinal = ticket.status === "RESOLVED" || ticket.status === "NOT_RESOLVED";
    if (isFinal)
      return res.status(400).json({ error: "Ticket is closed and cannot be modified." });

    const setStatus = ticket.status === "OPEN" && technicianId ? "IN_PROGRESS" : null;
    await client.query(
      setStatus
        ? "UPDATE tickets SET assigned_technician_id=$1, status='IN_PROGRESS', updated_at=now() WHERE id=$2"
        : "UPDATE tickets SET assigned_technician_id=$1, updated_at=now() WHERE id=$2",
      [technicianId, ticketId]
    );

    if (technicianId) {
      await client.query(
        "INSERT INTO ticket_assignments (ticket_id, assigned_to, assigned_by) VALUES ($1,$2,$3)",
        [ticketId, technicianId, req.user.id]
      );
      await addTimelineEvent({
        ticketId,
        eventType: "ASSIGNED_TO_TECHNICIAN",
        actorUserId: req.user.id,
        actorName: req.user.fullName,
        message: "Assigned/reassigned technician",
        meta: { from: ticket.assigned_technician_id, to: technicianId },
        client,
      });
    } else {
      await addTimelineEvent({
        ticketId,
        eventType: "ASSIGNED_TO_TECHNICIAN",
        actorUserId: req.user.id,
        actorName: req.user.fullName,
        message: "Ticket unassigned",
        meta: { from: ticket.assigned_technician_id, to: null },
        client,
      });
    }

    await client.query("COMMIT");
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "TICKET_ASSIGNED",
      meta: { ticketId, from: ticket.assigned_technician_id, to: technicianId },
    });
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    next(err);
  } finally {
    client.release();
  }
}

async function listActivity(req, res, next) {
  try {
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit || "100", 10)));
    const { rows } = await pool.query(
      `
      SELECT id, actor_user_id, actor_name, actor_role, action, meta, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        actorUserId: r.actor_user_id,
        actorName: r.actor_name,
        actorRole: r.actor_role,
        action: r.action,
        meta: r.meta != null ? r.meta : {},
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    if (err.code === "42P01") {
      return res.json({ items: [] });
    }
    next(err);
  }
}

// Admin dashboard counts
async function adminDashboard(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status='OPEN' THEN 1 ELSE 0 END)::int AS open,
        SUM(CASE WHEN status='IN_PROGRESS' THEN 1 ELSE 0 END)::int AS in_progress,
        SUM(CASE WHEN status='RESOLVED' THEN 1 ELSE 0 END)::int AS resolved,
        SUM(CASE WHEN status='NOT_RESOLVED' THEN 1 ELSE 0 END)::int AS not_resolved,
        SUM(CASE WHEN assigned_technician_id IS NULL THEN 1 ELSE 0 END)::int AS unassigned,
        SUM(CASE WHEN priority='URGENT' AND status = ANY($1::ticket_status[]) THEN 1 ELSE 0 END)::int AS urgent_active
      FROM tickets
      `,
      [ACTIVE_STATUSES]
    );
    res.json({
      totals: {
        total: rows[0].total,
        open: rows[0].open,
        urgent: rows[0].urgent_active,
        inProgress: rows[0].in_progress,
        resolved: rows[0].resolved,
        notResolved: rows[0].not_resolved,
        unassigned: rows[0].unassigned,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Reports
async function reportTicketsPerTechnician(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT u.full_name AS technician, COUNT(t.id)::int AS tickets
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      LEFT JOIN tickets t ON t.assigned_technician_id = u.id
      WHERE u.role='TECHNICIAN' AND u.is_active=true
      GROUP BY u.full_name
      ORDER BY tickets DESC, technician ASC
      `
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

async function reportCategoryDistribution(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT COALESCE(c.name, 'Uncategorized') AS category, COUNT(t.id)::int AS tickets
      FROM tickets t
      LEFT JOIN categories c ON c.id = t.category_id
      GROUP BY COALESCE(c.name, 'Uncategorized')
      ORDER BY tickets DESC, category ASC
      `
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

async function reportMonthlyTrends(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        COUNT(*)::int AS tickets
      FROM tickets
      WHERE created_at >= now() - interval '12 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at) ASC
      `
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

async function reportTechnicianPerformance(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.full_name AS technician,
        COUNT(*) FILTER (WHERE t.status='RESOLVED')::int AS resolved_count,
        AVG(EXTRACT(EPOCH FROM (COALESCE(t.resolved_at, t.closed_at) - t.created_at)) / 3600.0)
          FILTER (WHERE (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)) AS avg_resolution_hours
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      LEFT JOIN tickets t ON t.assigned_technician_id = u.id
      WHERE u.role='TECHNICIAN' AND u.is_active=true
      GROUP BY u.full_name
      ORDER BY resolved_count DESC, technician ASC
      `
    );
    res.json({
      data: rows.map((r) => ({
        technician: r.technician,
        resolvedCount: r.resolved_count,
        avgResolutionHours: r.avg_resolution_hours ? Number(r.avg_resolution_hours) : null,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function reportTechnicianRankingMonth(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.full_name AS technician,
        COUNT(t.id)::int AS resolved_count
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      LEFT JOIN tickets t ON t.assigned_technician_id = u.id
        AND t.status = 'RESOLVED'
        AND (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)
        AND COALESCE(t.resolved_at, t.closed_at) >= date_trunc('month', now())
        AND COALESCE(t.resolved_at, t.closed_at) < date_trunc('month', now()) + interval '1 month'
      WHERE u.role = 'TECHNICIAN' AND u.is_active = true
      GROUP BY u.full_name
      ORDER BY resolved_count DESC, technician ASC
      `
    );
    const data = rows.map((r, i) => ({
      rank: i + 1,
      technician: r.technician,
      resolvedCount: r.resolved_count,
    }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function reportTechnicianRatingRankingMonth(req, res, next) {
  try {
    const rawMonth = req.query.month;
    const rawYear = req.query.year;
    const now = new Date();
    const year = rawYear ? parseInt(String(rawYear).trim(), 10) : now.getFullYear();
    const month = rawMonth ? parseInt(String(rawMonth).trim(), 10) : now.getMonth() + 1;
    if (!month || month < 1 || month > 12 || !year || year < 2000) {
      return res.json({ data: [] });
    }
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

    const { rows } = await pool.query(
      `
      SELECT
        u.full_name AS technician,
        ROUND(AVG(t.employee_rating)::numeric, 2)::float AS avg_rating,
        COUNT(t.id)::int AS rating_count
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      INNER JOIN tickets t ON t.assigned_technician_id = u.id
        AND t.employee_rating IS NOT NULL
        AND (t.resolved_at IS NOT NULL OR t.closed_at IS NOT NULL)
        AND COALESCE(t.resolved_at, t.closed_at) >= $1::date
        AND COALESCE(t.resolved_at, t.closed_at) < ($1::date + interval '1 month')
      WHERE u.role = 'TECHNICIAN' AND u.is_active = true
      GROUP BY u.full_name
      ORDER BY avg_rating DESC, rating_count DESC, technician ASC
      `,
      [monthStart]
    );
    const data = rows.map((r, i) => ({
      rank: i + 1,
      technician: r.technician,
      avgRating: r.avg_rating,
      ratingCount: r.rating_count,
    }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCategories,
  createCategory,
  toggleCategory,
  listEmployees,
  createEmployee,
  listActivity,
  listTechnicians,
  createTechnician,
  toggleTechnicianAvailability,
  toggleUserActive,
  assignTicket,
  adminDashboard,
  reportTicketsPerTechnician,
  reportCategoryDistribution,
  reportMonthlyTrends,
  reportTechnicianPerformance,
  reportTechnicianRankingMonth,
  reportTechnicianRatingRankingMonth,
};

