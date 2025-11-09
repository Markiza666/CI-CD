/// <reference path="../types/express/index.d.ts" />

import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../db';
import auth from '../middleware/authMiddleware';

const router = Router();

router.get('/', auth, async (req: Request, res: Response) => {
    // 1. Hämta användardetaljer
    const userResult = await db.query(
        `SELECT id, email, name, city FROM users WHERE id = $1`, 
        [req.userId]
    );
    const user = userResult.rows[0];

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // 2. Hämta meetups användaren är anmäld till (attendingMeetups)
    const attendingMeetupsResult = await db.query(`
        SELECT m.id AS _id, m.title, m.location, m.date 
        FROM meetups m
        JOIN registrations r ON r.meetup_id = m.id
        WHERE r.user_id = $1
    `, [req.userId]);

    // 3. Hämta meetups användaren har skapat (createdMeetups)
    // OBS: Antag att skaparen lagras i kolumnen 'creator_id' eller liknande.
    // Jag använder 'creator_id' här som ett standardantagande.
    const createdMeetupsResult = await db.query(`
        SELECT id AS _id, title, location, date 
        FROM meetups 
        WHERE creator_id = $1
    `, [req.userId]);


    // AC 7.3: Returnera den strukturen som frontend (ProfileData) förväntar sig
    res.json({
        user: { 
            _id: user.id, 
            email: user.email, 
            firstName: user.name, // Mappar 'name' från DB till 'firstName' i frontend
            city: user.city 
        },
        attendingMeetups: attendingMeetupsResult.rows.map(row => ({ 
            ...row, 
            _id: row._id,
            // (Om date heter 'date' eller 'startAt', anpassa här)
        })), 
        createdMeetups: createdMeetupsResult.rows.map(row => ({ 
            ...row, 
            _id: row._id 
        }))
    });
});

// router.get('/meetups', auth, async (req: Request, res: Response) => {
// 	const result = await db.query(`
//     SELECT m.* FROM meetups m
//     JOIN registrations r ON r.meetup_id = m.id
//     WHERE r.user_id = $1
//   `, [req.userId]);
// 	res.json(result.rows);
// });

export default router;

