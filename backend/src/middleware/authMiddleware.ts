import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function auth(req: Request, res: Response, next: NextFunction) {
	const header = req.headers.authorization;
	if (!header) return res.status(401).json({ error: 'Missing token' });

	try {
		const token = header.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
		req.userId = decoded.userId;
		next();
	} catch {
		res.status(401).json({ error: 'Invalid token' });
	}
}

