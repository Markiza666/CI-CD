import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function auth(req: Request, res: Response, next: NextFunction) {
	console.log("🔐 authMiddleware triggered");
	const header = req.headers.authorization;
	console.log("Authorization header:", header);
	if (!header){ 
		console.log("❌ Missing token");
		return res.status(401).json({ error: 'Missing token' });
	}
	try {
		const token = header.split(' ')[1];
		console.log("Extracted token:", token);

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
		console.log("✅ Token verified:", decoded);

		req.userId = decoded.userId;
		next();
	} catch (err) {
		console.log("❌ Token verification failed:", err);
		res.status(401).json({ error: 'Invalid token' });
	}
}

