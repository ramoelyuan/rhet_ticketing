-- Move Paul Camus, MJ Tamayo, and JC Pagdanganan from Employees to IT Support.
-- Run this against your database (e.g. psql $DATABASE_URL -f move_employees_to_it_support.sql)

BEGIN;

UPDATE users
SET role = 'TECHNICIAN'
WHERE full_name IN ('Paul Camus', 'MJ Tamayo', 'JC Pagdanganan')
  AND role = 'EMPLOYEE';

INSERT INTO technicians (user_id, is_available)
SELECT id, true
FROM users
WHERE full_name IN ('Paul Camus', 'MJ Tamayo', 'JC Pagdanganan')
  AND role = 'TECHNICIAN'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
