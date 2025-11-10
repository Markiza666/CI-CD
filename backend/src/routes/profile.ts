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

router.get("/", auth, async (req: Request, res: Response) => {
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
});

export default router;
