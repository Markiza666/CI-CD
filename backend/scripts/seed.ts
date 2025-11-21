// scripts/seed.ts
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.DATABASE_SSL === "true"
			? { rejectUnauthorized: false }
			: undefined,
});

async function main() {
	// 1) Säkerställ rätt kolumner i meetups-tabellen
	await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE meetups
  ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS date_time TIMESTAMP, -- utan tidszon, kan vara NULL
  ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'Online',
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER, -- kan vara NULL
  ADD COLUMN IF NOT EXISTS host_id UUID, -- kan vara NULL
  ADD COLUMN IF NOT EXISTS category meetup_category, -- ENUM-typen du skapade
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Europe/Stockholm');
  `);

	// 2) Lägg in exempeldata
	const insertSQL = `
    INSERT INTO meetups (title, description, date_time, location, max_capacity, host_id, category)
    VALUES
      ('React Meetup', 'Hooks, Zustand & RTK', NOW() + interval '3 days', 'Online', 50, gen_random_uuid(), 'Tech'),
      ('DevOps Night', 'CI/CD på riktigt', NOW() + interval '10 days', 'Stockholm HQ', 40, gen_random_uuid(), 'DevOps')
    ON CONFLICT DO NOTHING;
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