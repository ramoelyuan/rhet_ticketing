const { pool } = require("../config/db");

async function addActivityLog({
  actorUserId,
  actorName,
  actorRole,
  action,
  meta = {},
  client = null,
}) {
  const runner = client || pool;
  try {
    await runner.query(
      `INSERT INTO activity_logs (actor_user_id, actor_name, actor_role, action, meta)
       VALUES ($1,$2,$3,$4,$5)`,
      [actorUserId, actorName, actorRole, action, meta]
    );
  } catch {
    // If activity_logs table doesn't exist yet (no migration applied),
    // don't break the main request.
  }
}

module.exports = { addActivityLog };

