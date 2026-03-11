const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const { Client } = require("pg");

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: node db/run-sql.js <path-to-sql>");
    process.exit(1);
  }
  const sqlPath = path.isAbsolute(fileArg)
    ? fileArg
    : path.join(process.cwd(), fileArg);

  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();
  try {
    await client.query(sql);
    console.log(`Executed: ${path.relative(process.cwd(), sqlPath)}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

