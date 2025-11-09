import { Router } from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
// import { v4 as uuidv4 } from 'uuid';
import db from "../db";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
	try {
		
		const uuidMod = await (eval('import("uuid")') as Promise<
			typeof import("uuid")
		>);
		const uuidv4 = uuidMod.v4;

		// 🧼 Normalisera e-post
		const email = req.body.email.trim().toLowerCase();
		const { password, name } = req.body;
		
		

		// Extra/valfritt
		if (!email || !password || !name) {
			return res.status(400).json({ error: "email, password och name krävs" });
		}

		const exists = await db.query(
			"SELECT 1 FROM users WHERE email = $1 LIMIT 1",
			[email]
		);
		if (exists.rowCount && exists.rowCount > 0) {
			return res.status(409).json({ error: "E-post används redan" });
		}

		const hashed = await bcrypt.hash(password, 10);
		const userId = uuidv4();

		//console.log("Registering:", { email, userId }); // Debugging

		await db.query(
			`INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)`,
			[userId, email, hashed, name]
		);

		return res.status(201).json({ message: "User created" });
	} catch (error) {
		console.error("Register error:", error);

		return res.status(500).json({ error: "Registration failed" });
	}
});

router.post("/login", async (req, res) => {
try {
	const email = req.body.email.trim().toLowerCase();
	const { password } = req.body;
	
	const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
		email,
	]);
	const user = result.rows[0];
	

	if (!user || !(await bcrypt.compare(password, user.password_hash))) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	
	// 🔐 Skapa riktig token
	
	const token = jwt.sign(
        { 
            userId: user.id,
            name: user.name,
            email: user.email
        }, 
        JWT_SECRET, 
        {
		expiresIn: "1h",
	});
	

	// 👇 Skicka tillbaka token till frontend
	return res.status(200).json({ token });
} catch (error) {
	console.error("Login error:", error);
	if (error instanceof Error) {
	console.error(error.stack);
	}
	return res.status(500).json({ error: "Login failed" });
}
});


export default router;
