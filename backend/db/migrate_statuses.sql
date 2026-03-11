-- Add NOT_RESOLVED status and migrate old statuses to new workflow.
-- Run this on existing databases. New installs: schema.sql already includes NOT_RESOLVED.

-- Add NOT_RESOLVED. Run once; if already applied, skip or ignore duplicate error.
ALTER TYPE ticket_status ADD VALUE 'NOT_RESOLVED';

UPDATE tickets SET status = 'IN_PROGRESS' WHERE status = 'WAITING_FOR_USER';
UPDATE tickets SET status = 'RESOLVED' WHERE status = 'CLOSED';
