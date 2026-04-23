const { pool } = require("../config/db");

function toSessionShape(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    department: row.department ?? null,
    avatarUrl: row.avatar_filename ? `/uploads/avatars/${row.avatar_filename}` : null,
  };
}

/**
 * Load user for JWT auth middleware. Falls back if optional columns are missing (pre-migration DB).
 */
async function getSessionUserById(userId) {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, role, is_active, department, avatar_filename
      FROM users
      WHERE id=$1
      `,
      [userId]
    );
    const row = rows[0];
    if (!row || !row.is_active) return null;
    return toSessionShape(row);
  } catch (err) {
    if (err.code !== "42703") throw err;
    const { rows } = await pool.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id=$1",
      [userId]
    );
    const row = rows[0];
    if (!row || !row.is_active) return null;
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      department: null,
      avatarUrl: null,
    };
  }
}

/**
 * Load user row for login (includes password_hash). Falls back if optional columns missing.
 */
async function getUserRowForLogin(emailLower) {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, role, password_hash, is_active, department, avatar_filename
      FROM users
      WHERE email=$1
      `,
      [emailLower]
    );
    return rows[0];
  } catch (err) {
    if (err.code !== "42703") throw err;
    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, role, password_hash, is_active
      FROM users
      WHERE email=$1
      `,
      [emailLower]
    );
    return rows[0];
  }
}

module.exports = { getSessionUserById, getUserRowForLogin, toSessionShape };
