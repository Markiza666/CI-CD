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
	// 1) Bas: extension + kolumner + DEFAULT för location (så seed alltid funkar)
	await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    ALTER TABLE meetups
      ADD COLUMN IF NOT EXISTS "title"       text,
      ADD COLUMN IF NOT EXISTS "description" text,
      ADD COLUMN IF NOT EXISTS "startAt"     timestamptz,
      ADD COLUMN IF NOT EXISTS "capacity"    integer,
      ADD COLUMN IF NOT EXISTS "location"    text;

    -- om location råkar vara NOT NULL utan default → sätt default
    ALTER TABLE meetups ALTER COLUMN "location" SET DEFAULT 'Online';
  `);

	// 2) Finns date_time-kolumnen?
	const colCheck = await pool.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'meetups' AND column_name = 'date_time'
    LIMIT 1
  `);
	const hasDateTime = (colCheck.rowCount ?? 0) > 0;

	// 3) Seed – inkludera "location" i båda varianterna
	const insertSQL = hasDateTime
		? `
      INSERT INTO meetups (id, "title", "description", "startAt", "capacity", "location", date_time)
      VALUES
        (gen_random_uuid(), 'React Meetup', 'Hooks, Zustand & RTK', NOW() + interval '3 days', 50, 'Online',       NOW() + interval '3 days'),
        (gen_random_uuid(), 'DevOps Night', 'CI/CD på riktigt',     NOW() + interval '10 days', 40, 'Stockholm HQ', NOW() + interval '10 days')
      ON CONFLICT DO NOTHING;
    `
		: `
      INSERT INTO meetups (id, "title", "description", "startAt", "capacity", "location")
      VALUES
        (gen_random_uuid(), 'React Meetup', 'Hooks, Zustand & RTK', NOW() + interval '3 days', 50, 'Online'),
        (gen_random_uuid(), 'DevOps Night', 'CI/CD på riktigt',     NOW() + interval '10 days', 40, 'Stockholm HQ')
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