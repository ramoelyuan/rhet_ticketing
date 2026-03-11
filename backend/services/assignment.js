const { pool } = require("../config/db");

const ACTIVE_STATUSES = ["OPEN", "IN_PROGRESS"];

async function pickTechnicianWithLowestActiveTickets(client = null) {
  const runner = client || pool;
  const { rows } = await runner.query(
    `
    SELECT u.id, u.full_name, COUNT(t.id) AS active_count
    FROM users u
    JOIN technicians tech ON tech.user_id = u.id
    LEFT JOIN tickets t
      ON t.assigned_technician_id = u.id
     AND t.status = ANY($1::ticket_status[])
    WHERE u.role = 'TECHNICIAN'
      AND u.is_active = true
      AND tech.is_available = true
    GROUP BY u.id, u.full_name
    ORDER BY active_count ASC, u.full_name ASC
    LIMIT 1
    `,
    [ACTIVE_STATUSES]
  );
  return rows[0] || null;
}

module.exports = { pickTechnicianWithLowestActiveTickets, ACTIVE_STATUSES };

