const express = require("express");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { pool } = require("../config/db");
const { addClient } = require("../services/sse");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const token = req.query.token || req.headers.authorization?.replace(/^Bearer\s+/i, "") || null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, env.jwtSecret);
    const { rows } = await pool.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id=$1",
      [payload.sub]
    );
    const user = rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: "Invalid user" });

    const role = user.role;
    if (role !== "TECHNICIAN" && role !== "ADMIN") {
      return res.status(403).json({ error: "Events only for IT Support and Admin" });
    }

    const userInfo = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };
    addClient(res, userInfo);

    const keepalive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
        res.flush?.();
      } catch {
        clearInterval(keepalive);
      }
    }, 30000);

    res.on("close", () => clearInterval(keepalive));
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(err);
  }
});

module.exports = router;
