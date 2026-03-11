const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { pool } = require("../config/db");
const { signAccessToken } = require("../services/jwt");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { rows } = await pool.query(
      "SELECT id, full_name, email, role, password_hash, is_active FROM users WHERE email=$1",
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAccessToken({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    });
    return res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user.id;

    const { rows } = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [passwordHash, userId]);

    return res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request", details: err.issues });
    }
    next(err);
  }
}

module.exports = { login, me, changePassword };

