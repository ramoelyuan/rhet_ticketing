-- Employee accounts (default password: HR-1234)
-- Hash generated via: node db/gen-hash.js "HR-1234"
BEGIN;

INSERT INTO users (full_name, email, password_hash, role)
VALUES
  ('Anna Mae Lago', 'annie@rhet-corp.com', '$2b$10$JFB0VJFBaAlq5PnbPzIYeOSp48AtXEhdOkhi3/udHHYO128URc.vq', 'EMPLOYEE'),
  ('Kersten Ventura', 'kengvents09@little-champion.com', '$2b$10$JFB0VJFBaAlq5PnbPzIYeOSp48AtXEhdOkhi3/udHHYO128URc.vq', 'EMPLOYEE'),
  ('Michelle Gaspar', 'gasparmichelle085@little-champion.com', '$2b$10$JFB0VJFBaAlq5PnbPzIYeOSp48AtXEhdOkhi3/udHHYO128URc.vq', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;

COMMIT;
