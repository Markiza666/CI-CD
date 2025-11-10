// import {  } from 'express';
import { Request, Response, Router } from "express";
import db from "../db";
import auth from "../middleware/authMiddleware";
// import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	try {
		// const q = req.query.q as string;
		// Läs vilka kolumner som finns
		console.log("🔍 Incoming query params:", req.query);
		const cols = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'meetups'
    `);
		const colset = new Set(cols.rows.map((r) => r.column_name));

		const nameCol = colset.has("name")
			? "name"
			: colset.has("title")
				? `"title"`
				: null;
		const dateCol = colset.has("date")
			? "date"
			: colset.has("startAt")
				? `"startAt"`
				: null;
		const hasDescription = colset.has("description");

		const q =
			(req.query.q as string) ?? (req.query.searchQuery as string) ?? "";
		const term = q.trim();

		// Bygg WHERE & ORDER dynamiskt
		const whereParts: string[] = [];
		const params: any[] = [];

		if (term) {
			params.push(`%${term}%`);
			const likeExprs: string[] = [];
			if (nameCol) likeExprs.push(`${nameCol} ILIKE $${params.length}`);
			if (hasDescription) likeExprs.push(`description ILIKE $${params.length}`);
			if (likeExprs.length) whereParts.push(`(${likeExprs.join(" OR ")})`);
		}

		if (!term && dateCol) {
			whereParts.push(`${dateCol} >= NOW()`);
		}
		const whereSQL = whereParts.length
			? `WHERE ${whereParts.join(" AND ")}`
			: "";
		const orderSQL = dateCol ? `ORDER BY ${dateCol} ASC NULLS LAST` : "";

		// 1) Försök hämta data
		const sql = `SELECT * FROM meetups ${whereSQL} ${orderSQL}`;
		console.log("🔍 Running query:", sql, params); // ← Lägg den här
		let result = await db.query(sql, params);

		// 2) Om tomt – gör en liten engångs-seed och hämta igen
		if (result.rowCount === 0) {
			// seed bara när vi INTE filtrerar på term (annars riskerar vi seed varje gång man söker)
			if (!term) {
				// const { v4: uuidv4 } = await import("uuid");
				const uuidMod = await (eval('import("uuid")') as Promise<
					typeof import("uuid")
				>);
				const uuidv4 = uuidMod.v4;

				const id1 = uuidv4();
				const id2 = uuidv4();

				if (nameCol && dateCol) {
					// name/date-variant
					await db.query(
						`
            INSERT INTO meetups (id, ${nameCol}, ${hasDescription ? "description," : ""
						} ${dateCol}, capacity)
            VALUES
              ($1, 'React Meetup'${hasDescription ? ", 'Hooks, Zustand & RTK'" : ""
						}, NOW() + interval '3 days', 50),
              ($2, 'DevOps Night'${hasDescription ? ", 'CI/CD på riktigt'" : ""
						}, NOW() + interval '10 days', 40)
            ON CONFLICT DO NOTHING
          `,
						[id1, id2]
					);
				} else if (colset.has("title") && colset.has("startAt")) {
					// title/"startAt"-variant
					await db.query(
						`
            INSERT INTO meetups (id, "title", ${hasDescription ? "description," : ""
						} "startAt", capacity)
            VALUES
              ($1, 'React Meetup'${hasDescription ? ", 'Hooks, Zustand & RTK'" : ""
						}, NOW() + interval '3 days', 50),
              ($2, 'DevOps Night'${hasDescription ? ", 'CI/CD på riktigt'" : ""
						}, NOW() + interval '10 days', 40)
            ON CONFLICT DO NOTHING
          `,
						[id1, id2]
					);
				}

				// hämta igen efter seed
				result = await db.query(sql, params);

			}
		}

		return res.json(result.rows);
	}catch (err: any) {
		console.error("GET /meetups failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch meetups" });
	}

});  // här slutar insert

router.get("/:id", async (req, res) => {
	const result = await db.query(`SELECT * FROM meetups WHERE id = $1`, [
		req.params.id,
	]);
	res.json(result.rows[0]);
});

router.post("/:id/register", auth, async (req: Request, res: Response) => {
	const meetupId = req.params.id;
	const userId = req.userId;

	const capacityCheck = await db.query(
		`
   SELECT capacity, (
     SELECT COUNT(*) FROM registrations WHERE meetup_id = $1
   ) AS current FROM meetups WHERE id = $1
`,
		[meetupId]
	);

	if (capacityCheck.rows[0].current >= capacityCheck.rows[0].capacity) {
		return res.status(400).json({ error: "Meetup is full" });
	}

    //await db.query(
	  //   `INSERT INTO registrations (id, user_id, meetup_id) VALUES ($1, $2, $3)`,
	    // [uuidv4(), req.userId, meetupId]
	   //);

	const { v4: uuidv4 } = await import("uuid"); //  funkar i CJS
	await db.query(
		`INSERT INTO registrations (id, user_id, meetup_id)
  VALUES ($1, $2, $3)`,
		[uuidv4(), req.userId, meetupId]
	);

	res.status(201).json({ message: "Registered" });
});
// Route to create a new meetup TESTING PURPOSES
router.post("/", auth, async (req: Request, res: Response) => {
	const { name, description, date, capacity } = req.body;
	const { v4: uuidv4 } = await import("uuid");

	try {
		await db.query(
			`INSERT INTO meetups (id, name, description, date, capacity)
       VALUES ($1, $2, $3, $4, $5)`,
			[uuidv4(), name, description, date, capacity]
		);
		res.status(201).json({ message: "✅ Meetup skapad" });
	} catch (err) {
		console.error("POST /meetups failed:", err);
		res.status(500).json({ error: "⛔ Kunde inte skapa meetup" });
	}
});


router.delete("/:id/register", auth, async (req: Request, res: Response) => {
	const userId = req.userId;
	const result = await db.query(
		`DELETE FROM registrations WHERE meetup_id = $1 AND user_id = $2`,
		[req.params.id, userId]
	);
	if (result.rowCount === 0)
		return res.status(403).json({ error: "Not registered or not owner" });
	res.json({ message: "Unregistered" });
});

export default router;

