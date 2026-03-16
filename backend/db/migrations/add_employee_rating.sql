-- Add employee rating (1-5 stars) for closed tickets. Run this on existing databases.
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS employee_rating smallint NULL
    CHECK (employee_rating >= 1 AND employee_rating <= 5),
  ADD COLUMN IF NOT EXISTS employee_rated_at timestamptz NULL;
