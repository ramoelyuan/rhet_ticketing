const { z } = require("zod");
const { pool } = require("../config/db");
const { addTimelineEvent } = require("../services/timeline");
const { addActivityLog } = require("../services/activityLog");
const { ACTIVE_STATUSES } = require("../services/assignment");
const { broadcastNewTicket } = require("../services/sse");

const createTicketSchema = z.object({
  subject: z.string().trim().min(3),
  description: z.string().trim().min(5),
  categoryId: z
    .preprocess((v) => (v === "" ? null : v), z.string().uuid().nullable())
    .optional()
    .nullable(),
  priority: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
      z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    )
    .default("LOW"),
});

function buildTicketWhere({ user, q, ticketId, status, statusGroup, priority, categoryId, technicianId, from, to }) {
  const where = [];
  const params = [];
  let idx = 1;

  const add = (sql, val) => {
    where.push(sql.replaceAll("?", `$${idx}`));
    params.push(val);
    idx += 1;
  };

  if (user.role === "EMPLOYEE") add("t.created_by = ?", user.id);
  // Technicians can work on any ticket (no assigned-only filter).

  if (ticketId) {
    add("t.ticket_number::text LIKE ?", `%${ticketId}%`);
  } else if (q) {
    add("(t.subject ILIKE ? OR t.description ILIKE ?)", `%${q}%`);
    params.push(`%${q}%`);
    idx += 1;
  }
  if (statusGroup === "active") {
    where.push(`t.status = ANY($${idx}::ticket_status[])`);
    params.push(["OPEN", "IN_PROGRESS"]);
    idx += 1;
  } else if (statusGroup === "resolved") {
    add("t.status = ?", "RESOLVED");
  } else if (statusGroup === "unresolved") {
    add("t.status = ?", "NOT_RESOLVED");
  } else if (status) {
    add("t.status = ?", status);
  }
  if (priority) add("t.priority = ?", priority);
  if (categoryId) add("t.category_id = ?", categoryId);
  if (technicianId) add("t.assigned_technician_id = ?", technicianId);
  if (from) add("t.created_at >= ?", from);
  if (to) add("t.created_at <= ?", to);

  return { whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

async function createTicket(req, res, next) {
  const client = await pool.connect();
  try {
    const parsed = createTicketSchema.parse({
      subject: req.body.subject,
      description: req.body.description,
      categoryId: req.body.categoryId || null,
      priority: req.body.priority || "LOW",
    });

    await client.query("BEGIN");

    const { rows: ticketRows } = await client.query(
      `
      INSERT INTO tickets (created_by, category_id, subject, description, priority, status, assigned_technician_id)
      VALUES ($1,$2,$3,$4,$5,'OPEN',$6)
      RETURNING id, ticket_number, created_at, status, priority, assigned_technician_id
      `,
      [
        req.user.id,
        parsed.categoryId,
        parsed.subject,
        parsed.description,
        parsed.priority,
        null,
      ]
    );
    const ticket = ticketRows[0];

    await addTimelineEvent({
      ticketId: ticket.id,
      eventType: "TICKET_CREATED",
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      message: "Ticket created",
      meta: { priority: parsed.priority },
      client,
    });

    await client.query("COMMIT");

    broadcastNewTicket();

    return res.status(201).json({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        assignedTechnicianId: ticket.assigned_technician_id,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  } finally {
    client.release();
  }
}

async function listTickets(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "10", 10)));
    const offset = (page - 1) * limit;

    const q = (req.query.q || "").trim() || null;
    const ticketId = (req.query.ticketId || "").trim() || null;
    const status = req.query.status || null;
    const statusGroup = req.query.statusGroup || null;
    const priority = req.query.priority || null;
    const categoryId = req.query.categoryId || null;
    const technicianId = req.query.technicianId || null;
    const from = req.query.from || null;
    const to = req.query.to || null;

    const { whereSql, params } = buildTicketWhere({
      user: req.user,
      q,
      ticketId,
      status,
      statusGroup,
      priority,
      categoryId,
      technicianId,
      from,
      to,
    });

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM tickets t
      ${whereSql}
      `,
      params
    );
    const total = countResult.rows[0].total;

    const dataParams = [...params, limit, offset];
    const orderSql =
      statusGroup === "active"
        ? `
          ORDER BY
            CASE t.priority
              WHEN 'URGENT' THEN 4
              WHEN 'HIGH' THEN 3
              WHEN 'MEDIUM' THEN 2
              WHEN 'LOW' THEN 1
              ELSE 0
            END DESC,
            t.created_at ASC
        `
        : `ORDER BY t.created_at DESC`;
    const { rows } = await pool.query(
      `
      SELECT
        t.id, t.ticket_number, t.subject, t.priority, t.status, t.created_at, t.updated_at, t.resolved_at,
        c.name AS category_name,
        u.full_name AS created_by_name,
        tech.full_name AS technician_name,
        t.assigned_technician_id
      FROM tickets t
      LEFT JOIN categories c ON c.id = t.category_id
      JOIN users u ON u.id = t.created_by
      LEFT JOIN users tech ON tech.id = t.assigned_technician_id
      ${whereSql}
      ${orderSql}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      dataParams
    );

    return res.json({
      page,
      limit,
      total,
      items: rows.map((r) => ({
        id: r.id,
        ticketNumber: r.ticket_number,
        subject: r.subject,
        priority: r.priority,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        resolvedAt: r.resolved_at,
        category: r.category_name,
        createdByName: r.created_by_name,
        assignedTechnicianId: r.assigned_technician_id,
        technicianName: r.technician_name,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getTicketDetails(req, res, next) {
  try {
    const ticketId = req.params.id;

    const base = await pool.query(
      `
      SELECT
        t.*,
        c.name AS category_name,
        creator.full_name AS created_by_name,
        tech.full_name AS technician_name
      FROM tickets t
      LEFT JOIN categories c ON c.id = t.category_id
      JOIN users creator ON creator.id = t.created_by
      LEFT JOIN users tech ON tech.id = t.assigned_technician_id
      WHERE t.id=$1
      `,
      [ticketId]
    );
    const ticket = base.rows[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Access control: employee sees own, technician sees assigned, admin sees all
    if (req.user.role === "EMPLOYEE" && ticket.created_by !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    // Technicians can view any ticket.

    const [replies, assignments, timeline] = await Promise.all([
      pool.query(
        `
        SELECT r.id, r.message, r.is_internal, r.created_at, u.full_name AS author_name, u.role AS author_role
        FROM ticket_replies r
        JOIN users u ON u.id = r.author_id
        WHERE r.ticket_id=$1
        ORDER BY r.created_at ASC
        `,
        [ticketId]
      ),
      pool.query(
        `
        SELECT a.id, a.assigned_at, assignee.full_name AS assigned_to_name, a.assigned_to, by_user.full_name AS assigned_by_name
        FROM ticket_assignments a
        JOIN users assignee ON assignee.id = a.assigned_to
        LEFT JOIN users by_user ON by_user.id = a.assigned_by
        WHERE a.ticket_id=$1
        ORDER BY a.assigned_at ASC
        `,
        [ticketId]
      ),
      pool.query(
        `
        SELECT id, event_type, actor_user_id, actor_name, message, meta, created_at
        FROM ticket_timeline
        WHERE ticket_id=$1
        ORDER BY created_at ASC
        `,
        [ticketId]
      ),
    ]);

    const replyRows = replies.rows.filter((r) => {
      if (!r.is_internal) return true;
      return req.user.role !== "EMPLOYEE";
    });

    return res.json({
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        resolvedAt: ticket.resolved_at,
        closedAt: ticket.closed_at,
        category: ticket.category_name,
        createdBy: { id: ticket.created_by, name: ticket.created_by_name },
        assignedTechnician: ticket.assigned_technician_id
          ? { id: ticket.assigned_technician_id, name: ticket.technician_name }
          : null,
        employeeRating: ticket.employee_rating ?? null,
        employeeRatedAt: ticket.employee_rated_at ?? null,
      },
      replies: replyRows.map((r) => ({
        id: r.id,
        message: r.message,
        isInternal: r.is_internal,
        createdAt: r.created_at,
        authorName: r.author_name,
        authorRole: r.author_role,
      })),
      assignments: assignments.rows.map((a) => ({
        id: a.id,
        assignedAt: a.assigned_at,
        assignedToId: a.assigned_to,
        assignedToName: a.assigned_to_name,
        assignedByName: a.assigned_by_name,
      })),
      timeline: timeline.rows.map((e) => ({
        id: e.id,
        type: e.event_type,
        actorName: e.actor_name,
        message: e.message,
        meta: e.meta,
        createdAt: e.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

const replySchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().optional().default(false),
});

async function addReply(req, res, next) {
  try {
    const ticketId = req.params.id;
    const { message, isInternal } = replySchema.parse(req.body);

    const { rows } = await pool.query(
      "SELECT id, status, created_by, assigned_technician_id FROM tickets WHERE id=$1",
      [ticketId]
    );
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const isFinal = ticket.status === "RESOLVED" || ticket.status === "NOT_RESOLVED";
    if (isFinal)
      return res.status(400).json({ error: "Ticket is closed and cannot be modified." });

    if (req.user.role === "EMPLOYEE" && ticket.created_by !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    // Technicians can reply to any ticket.

    const internal = isInternal && req.user.role !== "EMPLOYEE";
    const insert = await pool.query(
      `
      INSERT INTO ticket_replies (ticket_id, author_id, message, is_internal)
      VALUES ($1,$2,$3,$4)
      RETURNING id, created_at
      `,
      [ticketId, req.user.id, message, internal]
    );

    await addTimelineEvent({
      ticketId,
      eventType: internal ? "INTERNAL_NOTE_ADDED" : req.user.role === "TECHNICIAN" ? "TECHNICIAN_REPLIED" : "USER_REPLIED",
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      message: internal ? "Internal note added" : "Reply added",
      meta: { replyId: insert.rows[0].id },
    });
    if (req.user.role === "TECHNICIAN" || req.user.role === "ADMIN") {
      await addActivityLog({
        actorUserId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: "TICKET_REPLIED",
        meta: { ticketId, isInternal: internal },
      });
    }

    res.status(201).json({ id: insert.rows[0].id, createdAt: insert.rows[0].created_at });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "NOT_RESOLVED"]),
});

async function updateStatus(req, res, next) {
  try {
    const ticketId = req.params.id;
    const { status } = statusSchema.parse(req.body);

    const { rows } = await pool.query(
      "SELECT id, status, created_by, assigned_technician_id FROM tickets WHERE id=$1",
      [ticketId]
    );
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user.role === "EMPLOYEE") return res.status(403).json({ error: "Forbidden" });
    const isFinal = ticket.status === "RESOLVED" || ticket.status === "NOT_RESOLVED";
    if (isFinal)
      return res.status(400).json({ error: "Ticket is already closed and cannot be modified." });

    if (req.user.role === "TECHNICIAN") {
      if (!ticket.assigned_technician_id)
        return res.status(400).json({ error: "Take the ticket before changing its status." });
      if (ticket.assigned_technician_id !== req.user.id)
        return res.status(403).json({ error: "Only the assigned IT Support can change the status." });
      if (ticket.status !== "IN_PROGRESS")
        return res.status(400).json({ error: "Ticket must be in progress before it can be resolved." });
      if (status !== "RESOLVED" && status !== "NOT_RESOLVED")
        return res.status(400).json({ error: "IT Support can only set status to Resolved or Not Resolved." });
    }

    const resolvedAt = status === "RESOLVED" ? new Date() : null;

    await pool.query(
      `
      UPDATE tickets
      SET status=$1,
          resolved_at = COALESCE($2, resolved_at),
          updated_at = now()
      WHERE id=$3
      `,
      [status, resolvedAt, ticketId]
    );

    const eventType =
      status === "RESOLVED" ? "TICKET_RESOLVED" : status === "NOT_RESOLVED" ? "STATUS_UPDATED" : "STATUS_UPDATED";

    await addTimelineEvent({
      ticketId,
      eventType,
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      message: `Status updated to ${status}`,
      meta: { from: ticket.status, to: status },
    });
    if (req.user.role === "TECHNICIAN" || req.user.role === "ADMIN") {
      await addActivityLog({
        actorUserId: req.user.id,
        actorName: req.user.fullName,
        actorRole: req.user.role,
        action: "TICKET_STATUS_CHANGED",
        meta: { ticketId, from: ticket.status, to: status },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

const rateSchema = z.object({
  rating: z.preprocess((v) => (v != null ? Number(v) : v), z.number().int().min(1).max(5)),
});

async function rateTicket(req, res, next) {
  try {
    const ticketId = req.params.id;
    const { rating } = rateSchema.parse(req.body);

    let rows;
    try {
      const result = await pool.query(
        "SELECT id, status, created_by, assigned_technician_id, employee_rating FROM tickets WHERE id=$1",
        [ticketId]
      );
      rows = result.rows;
    } catch (dbErr) {
      if (dbErr.code === "42703") {
        return res.status(503).json({
          error: "Rating feature not set up. Run the database migration: node db/run-sql.js db/migrations/add_employee_rating.sql",
        });
      }
      throw dbErr;
    }

    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (req.user.role !== "EMPLOYEE" || ticket.created_by !== req.user.id)
      return res.status(403).json({ error: "Only the ticket creator can rate this ticket." });
    if (ticket.status !== "RESOLVED" && ticket.status !== "NOT_RESOLVED")
      return res.status(400).json({ error: "You can only rate closed tickets." });
    if (!ticket.assigned_technician_id)
      return res.status(400).json({ error: "No IT Support was assigned to this ticket." });
    if (ticket.employee_rating != null)
      return res.status(400).json({ error: "You have already rated this ticket." });

    try {
      await pool.query(
        "UPDATE tickets SET employee_rating=$1, employee_rated_at=now(), updated_at=now() WHERE id=$2",
        [rating, ticketId]
      );
    } catch (dbErr) {
      if (dbErr.code === "42703") {
        return res.status(503).json({
          error: "Rating feature not set up. Run the database migration: node db/run-sql.js db/migrations/add_employee_rating.sql",
        });
      }
      throw dbErr;
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

async function technicianWorkload(req, res, next) {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        COALESCE(SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END), 0)::int AS total_assigned,
        COALESCE(SUM(CASE WHEN t.status = ANY($1::ticket_status[]) THEN 1 ELSE 0 END), 0)::int AS active_tickets,
        COALESCE(SUM(CASE WHEN t.status = 'RESOLVED' THEN 1 ELSE 0 END), 0)::int AS resolved_tickets,
        COALESCE(SUM(CASE WHEN t.priority = 'URGENT' AND t.status = ANY($1::ticket_status[]) THEN 1 ELSE 0 END), 0)::int AS urgent_active
      FROM users u
      JOIN technicians tech ON tech.user_id = u.id
      LEFT JOIN tickets t ON t.assigned_technician_id = u.id
      WHERE u.role='TECHNICIAN' AND u.is_active=true
      GROUP BY u.id, u.full_name
      ORDER BY active_tickets DESC, urgent_active DESC, u.full_name ASC
      `,
      [ACTIVE_STATUSES]
    );
    res.json({
      technicians: rows.map((r) => ({
        id: r.id,
        name: r.full_name,
        totalAssigned: r.total_assigned,
        activeTickets: r.active_tickets,
        resolvedTickets: r.resolved_tickets,
        urgentActive: r.urgent_active,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function takeTicket(req, res, next) {
  const client = await pool.connect();
  try {
    const ticketId = req.params.id;
    const technicianId = req.user.id;

    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT id, status, assigned_technician_id FROM tickets WHERE id=$1 FOR UPDATE",
      [ticketId]
    );
    const ticket = rows[0];
    if (!ticket) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (ticket.status !== "OPEN") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Only open tickets can be taken." });
    }
    if (ticket.assigned_technician_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Ticket is already taken." });
    }

    await client.query(
      "UPDATE tickets SET assigned_technician_id=$1, status='IN_PROGRESS', updated_at=now() WHERE id=$2",
      [technicianId, ticketId]
    );
    await client.query(
      "INSERT INTO ticket_assignments (ticket_id, assigned_to, assigned_by) VALUES ($1,$2,$3)",
      [ticketId, technicianId, technicianId]
    );
    await addTimelineEvent({
      ticketId,
      eventType: "ASSIGNED_TO_TECHNICIAN",
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      message: "Ticket taken by IT Support",
      meta: { from: ticket.assigned_technician_id, to: technicianId },
      client,
    });

    await client.query("COMMIT");
    await addActivityLog({
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: "TICKET_TAKEN",
      meta: { ticketId },
    });
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    next(err);
  } finally {
    client.release();
  }
}

module.exports = {
  createTicket,
  listTickets,
  getTicketDetails,
  addReply,
  updateStatus,
  rateTicket,
  takeTicket,
  technicianWorkload,
};

