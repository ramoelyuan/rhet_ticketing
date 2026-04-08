-- One-time reset for t.jenny@rhet-corp.com (password: Te@cher-1234)
-- Run against the SAME database as backend/.env DATABASE_URL, then delete this file.

UPDATE users
SET password_hash = '$2b$10$z5JBofaZBqzg5lN92hv3Bedcg6aTwt/dmHXtTYHgErXcUsPUhVX.2'
WHERE LOWER(email) = LOWER('t.jenny@rhet-corp.com');
