BEGIN;

-- Categories
INSERT INTO categories (name)
VALUES
  ('Hardware'),
  ('Software'),
  ('Network'),
  ('Access / Accounts'),
  ('Email'),
  ('Printer')
ON CONFLICT (name) DO NOTHING;

-- Users (password: Password123!)
-- Note: bcrypt hash generated once and stored here for easy local setup.
INSERT INTO users (full_name, email, password_hash, role)
VALUES
  ('Alice Employee', 'employee@company.com', '$2b$10$WVIc/FC/ay9LhZr0BdIw.u9lYv7a7p0eiqwrw6lmJmuSZdM7Oro6y', 'EMPLOYEE'),
  ('Tom Technician', 'tech1@company.com',     '$2b$10$WVIc/FC/ay9LhZr0BdIw.u9lYv7a7p0eiqwrw6lmJmuSZdM7Oro6y', 'TECHNICIAN'),
  ('Tina Technician', 'tech2@company.com',   '$2b$10$WVIc/FC/ay9LhZr0BdIw.u9lYv7a7p0eiqwrw6lmJmuSZdM7Oro6y', 'TECHNICIAN'),
  ('Andy Admin', 'admin@company.com',       '$2b$10$WVIc/FC/ay9LhZr0BdIw.u9lYv7a7p0eiqwrw6lmJmuSZdM7Oro6y', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Technicians table rows
INSERT INTO technicians (user_id, is_available)
SELECT id, true FROM users WHERE role = 'TECHNICIAN'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

