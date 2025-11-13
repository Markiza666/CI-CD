// import {  } from 'express';
import { Request, Response, Router } from "express";
import db from "../db";
import authMiddleware from "../middleware/authMiddleware";
// import { v4 as uuidv4 } from 'uuid';


const router = Router();

router.get("/", async (req, res) => {
	try {
		console.log("🔍 Incoming query params:", req.query);

		// Hantera q så att det alltid blir en string
		const rawQ = req.query.q ?? req.query.searchQuery ?? "";
		const q = Array.isArray(rawQ) ? rawQ[0] : rawQ; // om q är en array, ta första elementet
		const term = String(q).trim(); // konvertera till string och trimma

		const whereParts: string[] = [];
		const params: any[] = [];

		if (term) {
			params.push(`%${term}%`);
			whereParts.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
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
		/*const result = await db.query(
			`SELECT * FROM meetups WHERE id = $1`,
			[req.params.id]
		);*/
		const result = await db.query(
			`SELECT m.*, 
          COALESCE(array_agg(r.user_id), '{}') AS participants
   FROM meetups m
   LEFT JOIN registrations r ON r.meetup_id = m.id
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

		// Hämta alla meetups som användaren är registrerad på
		const meetups = await db.query(
			`SELECT m.id, m.title, m.description, m.date_time, m.location, m.category, m.max_capacity, r.registered_at
       FROM registrations r
       JOIN meetups m ON r.meetup_id = m.id
       WHERE r.user_id = $1
       ORDER BY m.date_time ASC`,
			[userId]
		);

		return res.json({
			user_id: userId,
			meetups: meetups.rows
		});
	} catch (err: any) {
		console.error("GET /users/:id/registrations failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to fetch user registrations" });
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
		const capacityCheck = await db.query(
			`SELECT max_capacity,
              (SELECT COUNT(*) FROM registrations WHERE meetup_id = $1) AS current
       FROM meetups
       WHERE id = $1`,
			[meetupId]
		);

		if (capacityCheck.rowCount === 0) {
			return res.status(404).json({ error: "Meetup not found" });
		}

		const { max_capacity, current } = capacityCheck.rows[0];

		if (current >= max_capacity) {
			return res.status(400).json({ error: "Meetup is full" });
		}

		// Kontrollera om användaren redan är registrerad
		const existing = await db.query(
			`SELECT 1 FROM registrations WHERE user_id = $1 AND meetup_id = $2`,
			[userId, meetupId]
		);

		if ((existing.rowCount ?? 0) > 0) {
			return res.status(400).json({ error: "Already registered" });
		}

		// Lägg till registrering
		await db.query(
			`INSERT INTO registrations (user_id, meetup_id, registered_at)
       VALUES ($1, $2, NOW())`,
			[userId, meetupId]
		);
		
		return res.status(201).json({ message: "Registered successfully" });
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

	const { v4: uuidv4 } = await import("uuid");

	try {
		const newMeetupId = uuidv4();

		/*await db.query(
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			[newMeetupId, title, description, date_time, max_capacity, hostId, category, location]
		);*/
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

		// Kontrollera att meetup finns
		const meetupCheck = await db.query(
			`SELECT 1 FROM meetups WHERE id = $1`,
			[meetupId]
		);
		if (meetupCheck.rowCount === 0) {
			return res.status(404).json({ error: "Meetup not found" });
		}

		// Kontrollera att användaren är registrerad
		const registrationCheck = await db.query(
			`SELECT 1 FROM registrations WHERE meetup_id = $1 AND user_id = $2`,
			[meetupId, userId]
		);
		if (registrationCheck.rowCount === 0) {
			return res.status(400).json({ error: "Not registered for this meetup" });
		}

		// Ta bort registreringen
		await db.query(
			`DELETE FROM registrations WHERE meetup_id = $1 AND user_id = $2`,
			[meetupId, userId]
		);

		return res.json({ message: "Unregistered successfully" });
	} catch (err: any) {
		console.error("DELETE /:id/register failed:", err?.code, err?.message, err?.detail);
		return res.status(500).json({ error: "Failed to unregister from meetup" });
	}
});





export default router;

