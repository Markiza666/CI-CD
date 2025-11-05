import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../db';
import auth from '../middleware/authMiddleware';

const router = Router();

router.get('/meetups', auth, async (req, res) => {
	const result = await db.query(`
    SELECT m.* FROM meetups m
    JOIN registrations r ON r.meetup_id = m.id
    WHERE r.user_id = $1
  `, [req.userId]);
	res.json(result.rows);
});

export default router;

