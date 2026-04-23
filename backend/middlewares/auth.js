const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { getSessionUserById } = require("../services/sessionUser");

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await getSessionUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { authRequired };

