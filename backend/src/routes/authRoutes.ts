import { Router } from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
	const { email, password, name } = req.body;
	const hashed = await bcrypt.hash(password, 10);
	const userId = uuidv4();

	await db.query(`INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)`, [userId, email, hashed, name]);
	res.status(201).json({ message: 'User created' });
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
	const user = result.rows[0];

	if (!user || !(await bcrypt.compare(password, user.password_hash))) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
	res.json({ token });
});

export default router;
