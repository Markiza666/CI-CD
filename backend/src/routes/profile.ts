/// <reference path="../types/express/index.d.ts" />

import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../db';
import auth from '../middleware/authMiddleware';

const router = Router();

router.get('/meetups', auth, async (req: Request, res: Response) => {
    const result = await db.query(`
    SELECT m.* FROM meetups m
    JOIN registrations r ON r.meetup_id = m.id
    WHERE r.user_id = $1`
  , [req.userId]);
    res.json(result.rows);
});

/*router.get("/", auth, async (req: Request, res: Response) => {
    try {
        const result = await db.query(`
            SELECT id, email, name FROM users WHERE id = $1`
            ,
            [req.userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("GET /profile failed:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});*/
router.get("/", auth, async (req: Request, res: Response) => {
	try {
		const userId = req.userId;

		// 1. Hämta användardata
		const userResult = await db.query(
			`SELECT id AS "_id", email, name AS "firstName", city FROM users WHERE id = $1`,
			[userId]
		);
		if (userResult.rowCount === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		const user = userResult.rows[0];

		// 2. Hämta meetups som användaren har skapat
		const createdMeetupsResult = await db.query(
			`SELECT * FROM meetups WHERE created_by = $1 ORDER BY date DESC`,
			[userId]
		);
		const createdMeetups = createdMeetupsResult.rows;

		// 3. Hämta meetups som användaren deltar i (men inte har skapat)
		const attendingMeetupsResult = await db.query(
			`SELECT m.* FROM meetups m
             JOIN registrations r ON r.meetup_id = m.id
             WHERE r.user_id = $1 AND m.created_by != $1
             ORDER BY m.date DESC`,
			[userId]
		);
		const attendingMeetups = attendingMeetupsResult.rows;

		// 4. Returnera allt i ett objekt
		res.json({
			user,
			createdMeetups,
			attendingMeetups
		});
	} catch (error) {
		console.error("GET /profile failed:", error);
		res.status(500).json({ error: "Failed to fetch profile" });
	}
});


export default router;
