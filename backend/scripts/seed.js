"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seed.ts
require("dotenv/config");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL === "true"
		? { rejectUnauthorized: false }
		: undefined,
});
async function main() {
	// 1) Bas: extension + kolumner som koden använder
	await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    ALTER TABLE meetups
      ADD COLUMN IF NOT EXISTS "title"       text,
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "startAt"     timestamptz,
      ADD COLUMN IF NOT EXISTS "capacity"    integer;
  `);
	// 2) Kolla om date_time-kolumnen finns
	const colCheck = await pool.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'meetups' AND column_name = 'date_time'
    LIMIT 1
  `);
	const hasDateTime = (colCheck.rowCount ?? 0) > 0;
	// 3) Seed – välj INSERT-variant beroende på om date_time finns
	const insertSQL = hasDateTime
		? `
      INSERT INTO meetups (id, "title", "description", "startAt", "capacity", date_time)
      VALUES
        (gen_random_uuid(), 'React Meetup', 'Hooks, Zustand & RTK', NOW() + interval '3 days', 50, NOW() + interval '3 days'),
        (gen_random_uuid(), 'DevOps Night', 'CI/CD på riktigt',     NOW() + interval '10 days', 40, NOW() + interval '10 days');
    `
		: `
      INSERT INTO meetups (id, "title", "description", "startAt", "capacity")
      VALUES
        (gen_random_uuid(), 'React Meetup', 'Hooks, Zustand & RTK', NOW() + interval '3 days', 50),
        (gen_random_uuid(), 'DevOps Night', 'CI/CD på riktigt',     NOW() + interval '10 days', 40);
    `;
	await pool.query(insertSQL);
	console.log("✅ Seed klart!");
	await pool.end();
}
main().catch(async (e) => {
	console.error("❌ Seed fel:", e);
	await pool.end();
	process.exit(1);
});