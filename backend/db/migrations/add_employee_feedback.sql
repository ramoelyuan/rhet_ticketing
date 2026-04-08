-- Optional written feedback with star rating. Run after add_employee_rating.sql if needed.

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS employee_feedback text NULL;
