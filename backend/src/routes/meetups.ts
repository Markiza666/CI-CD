// import {  } from 'express';
import { Request, Response, Router } from "express";
import db from "../db";
import authMiddleware from "../middleware/authMiddleware";
// import { v4 as uuidv4 } from 'uuid';


const router = Router();

router.get("/", async (req: Request, res: Response) => {
	try {
		console.log("🔍 Incoming query params:", req.query);

		const rawQ = req.query.q ?? req.query.searchQuery ?? "";
		const q = Array.isArray(rawQ) ? rawQ[0] : rawQ;
		const term = String(q).trim();

		const whereParts: string[] = [];
		const params: any[] = [];

		// Sök i titel/description
		if (term) {
			params.push(`%${term}%`);
			whereParts.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
		}

		// Filtrera på location
		if (req.query.location) {
			params.push(`%${req.query.location}%`);
			whereParts.push(`location ILIKE $${params.length}`);
		}

		// Filtrera på meetups som användaren deltar i
		if (req.query.attending && req.userId) {
			params.push(req.userId);
			whereParts.push(`location ILIKE $${params.length}`); // Felaktig rad, bör ändras nedan//ändrad nedan
            // whereParts.push(`id IN (SELECT meetup_id FROM registrations WHERE user_id = $${params.length})`);
		}

		const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
		const orderSQL = `ORDER BY date_time ASC NULLS LAST`;

		const sql = `SELECT * FROM meetups ${whereSQL} ${orderSQL}`;
		console.log("🔍 Running query:", sql, params);

		const result = await db.query(sql, params);
		return res.json(result.rows);
	} catch (err: any) {
		console.error("GET /meetups failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch meetups" });
	}
});


router.get("/:id", async (req: Request, res: Response) => {
	try {
		const result = await db.query(
			`SELECT m.id, m.title, m.description, m.date_time, m.location, m.category, m.max_capacity, m.host_id,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'registered_at', r.registered_at
                  )
                ) FILTER (WHERE u.id IS NOT NULL),
                '[]'
              ) AS participants
       FROM meetups m
       LEFT JOIN registrations r ON r.meetup_id = m.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE m.id = $1
       GROUP BY m.id`,
			[req.params.id]
		);
	

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Meetup not found" });
		}

		res.json(result.rows[0]);
	} catch (err: any) {
		console.error("GET /meetups/:id failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch meetup" });
	}
});

// GET /api/meetups/:id/registrations
router.get("/:id/registrations", authMiddleware, async (req: Request, res: Response) => {
	try {
		const meetupId = req.params.id;

		// Kontrollera att meetup finns
		const meetupCheck = await db.query(
			`SELECT 1 FROM meetups WHERE id = $1`,
			[meetupId]
		);
		if (meetupCheck.rowCount === 0) {
			return res.status(404).json({ error: "Meetup not found" });
		}

		// Hämta alla registreringar för meetupen
		const registrations = await db.query(
			`SELECT r.user_id, u.username, r.registered_at
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.meetup_id = $1
       ORDER BY r.registered_at ASC`,
			[meetupId]
		);

		return res.json({
			meetup_id: meetupId,
			participants: registrations.rows
		});
	} catch (err: any) {
		console.error("GET /:id/registrations failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch registrations" });
	}
});

// GET /api/users/:id/registrations
router.get("/users/:id/registrations", authMiddleware, async (req: Request, res: Response) => {
	try {
		const userId = req.params.id;

		// Kontrollera att användaren finns
		const userCheck = await db.query(
			`SELECT 1 FROM users WHERE id = $1`,
			[userId]
		);
		if (userCheck.rowCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		// Hämta framtida meetups
		const upcomingResult = await db.query(
			`SELECT m.id, m.title, m.description, m.date_time, m.location, m.category, m.max_capacity, r.registered_at
       FROM registrations r
       JOIN meetups m ON r.meetup_id = m.id
       WHERE r.user_id = $1 AND m.date_time > NOW()
       ORDER BY m.date_time ASC`,
			[userId]
		);

		// Hämta tidigare meetups
		const pastResult = await db.query(
			`SELECT m.id, m.title, m.description, m.date_time, m.location, m.category, m.max_capacity, r.registered_at
       FROM registrations r
       JOIN meetups m ON r.meetup_id = m.id
       WHERE r.user_id = $1 AND m.date_time <= NOW()
       ORDER BY m.date_time DESC`,
			[userId]
		);

		return res.json({
			user_id: userId,
			upcoming: upcomingResult.rows,
			past: pastResult.rows
		});
	} catch (err: any) {
		console.error("GET /users/:id/meetups failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch user meetups" });
	}
});


router.post("/:id/register", authMiddleware, async (req: Request, res: Response) => {
	try {
		const meetupId = req.params.id;
		const userId = req.userId; // sätts av authMiddleware via JWT

		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		// Kontrollera att meetup finns och hämta kapacitet
		//Lagt till datumkontroll här
		const capacityCheck = await db.query(
			`SELECT max_capacity,
			date_time,
              (SELECT COUNT(*) FROM registrations WHERE meetup_id = $1) AS current
       FROM meetups
       WHERE id = $1`,
			[meetupId]
		);

		if (capacityCheck.rowCount === 0) {
			return res.status(404).json({ error: "Meetup not found" });
		}

		const { max_capacity, current, date_time } = capacityCheck.rows[0];

		// 🔹 Ny validering: tillåt inte registrering på gamla meetups
		const meetupDate = new Date(date_time);
		const now = new Date();
		if (meetupDate < now) {
			return res.status(400).json({ error: "Cannot register for past meetups." });
		}

		if (current >= max_capacity) {
			return res.status(400).json({ error: "Meetup is full" });
		}
		/*const { max_capacity, current } = capacityCheck.rows[0];
		if (current >= max_capacity) {
			return res.status(400).json({ error: "Meetup is full" });
		}*/

		// Kontrollera om användaren redan är registrerad
		const existing = await db.query(
			`SELECT 1 FROM registrations WHERE user_id = $1 AND meetup_id = $2`,
			[userId, meetupId]
		);

		if ((existing.rowCount ?? 0) > 0) {
			return res.status(400).json({ error: "Already registered" });
		}


		// Lägg till registrering
		const insertResult = await db.query(
			`INSERT INTO registrations (user_id, meetup_id, registered_at)
       VALUES ($1, $2, NOW())
			RETURNING registered_at`,
			[userId, meetupId]
		);
		//test
		const registeredAt = insertResult.rows[0].registered_at;
		const userResult = await db.query(
			`SELECT id, name, email FROM users WHERE id = $1`,
			[userId]
		);

		if (userResult.rowCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		const { id, name, email } = userResult.rows[0];

		const participant = {
			id,
			name,
			email,
			registered_at: registeredAt
		};
		//test
		//return res.status(201).json({ message: "Registered successfully" });
		return res.status(201).json(participant);
	} catch (err: any) {
		console.error("POST /:id/register failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to register for meetup" });
	}
});

// Route to create a new meetup 
router.post("/", authMiddleware, async (req: Request, res: Response) => {
	const { title, description, date_time, max_capacity, category, location } = req.body;
	const hostId = req.userId; // sätts av authMiddleware

	// Validera category mot tillåtna värden
	const allowedCategories = ["Technology", "Nature", "Art & Culture", "Food & Drink"];
	if (!allowedCategories.includes(category)) {
		return res.status(400).json({ error: "Invalid category" });
	}

	// 🔹 Ny validering: datumet måste vara idag eller framåt
	const meetupDate = new Date(date_time);
	const now = new Date();
	if (meetupDate < now) {
		return res.status(400).json({ error: "Meetup date must be today or in the future." });
	}

	const { v4: uuidv4 } = await import("uuid");

	try {
		const newMeetupId = uuidv4();

		//TEST börjar här
		const query = `
      INSERT INTO meetups (id, title, description, date_time, max_capacity, host_id, category, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
		const values = [newMeetupId, title, description, date_time, max_capacity, hostId, category, location];

		// 🔍 Lägg loggen här
		console.log("Running INSERT:", query, values);

		await db.query(query, values);
		//TEST slutar här

		res.status(201).json({ message: "✅ Meetup skapad", id: newMeetupId });
	} catch (err) {
		console.error("POST /meetups failed:", err);
		res.status(500).json({ error: "⛔ Kunde inte skapa meetup" });
	}
});

router.delete("/:id/register", authMiddleware, async (req: Request, res: Response) => {
	try {
		const meetupId = req.params.id;
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		// Kontrollera att registreringen finns
		const existing = await db.query(
			`SELECT r.registered_at, u.id, u.name, u.email
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1 AND r.meetup_id = $2`,
			[userId, meetupId]
		);

		if (existing.rowCount === 0) {
			return res.status(404).json({ error: "Not registered for this meetup" });
		}

		const participant = existing.rows[0];

		// Ta bort registreringen
		await db.query(
			`DELETE FROM registrations WHERE user_id = $1 AND meetup_id = $2`,
			[userId, meetupId]
		);

		// Returnera det borttagna Participant‑objektet
		return res.status(200).json({
			id: participant.id,
			name: participant.name,
			email: participant.email,
			registered_at: participant.registered_at
		});
	} catch (err: any) {
		console.error("DELETE /:id/register failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to unregister from meetup" });
	}
});

		export default router;







