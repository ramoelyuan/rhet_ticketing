const { pool } = require("../config/db");

async function addTimelineEvent({
  ticketId,
  eventType,
  actorUserId,
  actorName,
  message = null,
  meta = {},
  client = null,
}) {
  const runner = client || pool;
  await runner.query(
    `INSERT INTO ticket_timeline (ticket_id, event_type, actor_user_id, actor_name, message, meta)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [ticketId, eventType, actorUserId, actorName, message, meta]
  );
}

module.exports = { addTimelineEvent };

