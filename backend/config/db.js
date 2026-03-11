const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL; enable when using Supabase connection string
  ...(process.env.DATABASE_URL?.includes("supabase") && {
    ssl: { rejectUnauthorized: false },
  }),
});

module.exports = { pool };

