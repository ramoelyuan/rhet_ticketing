BEGIN;

-- Clear all ticket-related data and activity logs (for fresh testing).
TRUNCATE TABLE
  activity_logs,
  ticket_timeline,
  ticket_attachments,
  ticket_replies,
  ticket_assignments,
  tickets
RESTART IDENTITY
CASCADE;

COMMIT;

