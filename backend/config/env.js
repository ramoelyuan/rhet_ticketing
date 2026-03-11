const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};

module.exports = { env };

