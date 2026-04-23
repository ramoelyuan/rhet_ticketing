-- Profile picture stored as filename under uploads/avatars/ (served at /uploads/avatars/:name)

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_filename text NULL;
