/// <reference path="../types/express/index.d.ts" />

import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../db';
import auth from '../middleware/authMiddleware';

const router = Router();

// 1. GET /api/profile
router.get("/", auth, async (req: Request, res: Response) => {
    try {
        // 1a. Hämta användardetaljer
        const userResult = await db.query(
            `SELECT id, email, name, city FROM users WHERE id = $1`, 
            [req.userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 1b. Hämta meetups användaren är anmäld till (attendingMeetups)
        const attendingMeetupsResult = await db.query(`
            SELECT m.id AS _id, m.title, m.location, m.date 
            FROM meetups m
            JOIN registrations r ON r.meetup_id = m.id
            WHERE r.user_id = $1
        `, [req.userId]);

        // 1c. Hämta meetups användaren har skapat (createdMeetups)
        // OBS: Jag antar kolumnnamnet 'creator_id' för skaparens ID här.
        const createdMeetupsResult = await db.query(`
            SELECT id AS _id, title, location, date 
            FROM meetups 
            WHERE creator_id = $1
        `, [req.userId]);

        // 2. Skicka tillbaka data i det format frontenden förväntar sig (ProfileData)
        res.json({
            user: { 
                _id: user.id, 
                email: user.email, 
                firstName: user.name || '', // Mappar 'name' till 'firstName'
                city: user.city || 'N/A' 
            },
            attendingMeetups: attendingMeetupsResult.rows,
            createdMeetups: createdMeetupsResult.rows
        });
        
    } catch (error) {
        console.error("GET /profile failed:", error);
        // Ett 500-svar är nu mer informativt om SQL-frågan kraschar.
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Denna rutt (GET /api/profile/meetups) kan vara kvar, men den är redundant nu:
// router.get('/meetups', auth, async (req: Request, res: Response) => {
//     const result = await db.query(`...`);
//     res.json(result.rows);
// });

export default router;
