const { pool } = require("../config/db");

async function listActiveCategories(req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT id, name FROM categories WHERE is_active=true ORDER BY name ASC"
    );
    res.json({ categories: rows.map((c) => ({ id: c.id, name: c.name })) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listActiveCategories };

