-- Update "Andy Admin" to "RHET Admin" in past activity logs and ticket timeline.
-- Run this in Supabase SQL Editor (or your DB client) after renaming the user.

UPDATE activity_logs
SET actor_name = 'RHET Admin'
WHERE actor_user_id = (SELECT id FROM users WHERE email = 'admin@company.com');

UPDATE ticket_timeline
SET actor_name = 'RHET Admin'
WHERE actor_user_id = (SELECT id FROM users WHERE email = 'admin@company.com');
