-- Rename IT Support: kier → Kier Bonton, allen → Allen Balagtas.
-- (Matches lowercase names currently in DB.)
-- Run in Supabase SQL Editor (or your DB client).

BEGIN;

-- Update display name and email in users
UPDATE users SET full_name = 'Kier Bonton', email = 'kier@support.com' WHERE full_name = 'kier' AND role = 'TECHNICIAN';
UPDATE users SET full_name = 'Allen Balagtas', email = 'allen@support.com' WHERE full_name = 'allen' AND role = 'TECHNICIAN';

-- Update past activity logs so they show the new names
UPDATE activity_logs al
SET actor_name = 'Kier Bonton'
FROM users u
WHERE al.actor_user_id = u.id AND u.full_name = 'Kier Bonton' AND al.actor_name = 'kier';

UPDATE activity_logs al
SET actor_name = 'Allen Balagtas'
FROM users u
WHERE al.actor_user_id = u.id AND u.full_name = 'Allen Balagtas' AND al.actor_name = 'allen';

-- Update past ticket timeline entries
UPDATE ticket_timeline tt
SET actor_name = 'Kier Bonton'
FROM users u
WHERE tt.actor_user_id = u.id AND u.full_name = 'Kier Bonton' AND tt.actor_name = 'kier';

UPDATE ticket_timeline tt
SET actor_name = 'Allen Balagtas'
FROM users u
WHERE tt.actor_user_id = u.id AND u.full_name = 'Allen Balagtas' AND tt.actor_name = 'allen';

COMMIT;
