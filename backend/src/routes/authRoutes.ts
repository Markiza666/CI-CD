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
		//const { v4: uuidv4 } = await import("uuid"); // 👈 funkar i CJS
		const uuidMod = await (eval('import("uuid")') as Promise<
			typeof import("uuid")
		>);
		const uuidv4 = uuidMod.v4;

		// 🧼 Normalisera e-post
		const email = req.body.email.trim().toLowerCase();
		const { password, name } = req.body;
		
		//const { email, password, name } = req.body;

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

		console.log("Registering:", { email, userId }); // Debugging

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
	//const { email, password } = req.body;
	const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
		email,
	]);
	const user = result.rows[0];
	//console.log("Login attempt:", email);
	console.log("User from DB:", user);
	console.log("Password provided:", password);
	
	

	if (!user || !(await bcrypt.compare(password, user.password_hash))) {
		return res.status(401).json({ error: "Invalid credentials" });
	}
	console.log("Password hash from DB:", user.password_hash);

	// 🔍 Testa JWT_SECRET innan du skapar riktig token
	try {
		const testToken = jwt.sign({ test: true }, JWT_SECRET, { expiresIn: "1h" });
		console.log("✅ Test token:", testToken);
	} catch (err) {
		console.error("❌ Token creation failed:", err);
	}
	console.log("🔍 Kontroll före token-skapning:");
	console.log("JWT_SECRET:", JWT_SECRET);
	console.log("Typ av JWT_SECRET:", typeof JWT_SECRET);
	console.log("User ID:", user.id);
	// 🔐 Skapa riktig token
	console.log("🔐 Signing token with secret:", JWT_SECRET);
	const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
		expiresIn: "1h",
	});
	console.log("✅ Token skapad:", token);

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

router.get("/debug-token", (req, res) => {
	try {
		if (!JWT_SECRET) {
			console.error("❌ JWT_SECRET is missing");
			return res.status(500).json({ error: "JWT_SECRET is not set" });
		}

		const dummyPayload = { userId: "debug-user", role: "tester" };
		const token = jwt.sign(dummyPayload, JWT_SECRET, { expiresIn: "1h" });

		console.log("✅ Debug token created:", token);
		return res.json({ token });
	} catch (error) {
		const err = error as Error;
		console.error("🔥 Token creation failed:", err.message);
		console.error(err.stack);
		return res.status(500).json({ error: "Token generation failed" });
	}
});
//test route to verify token
router.get("/verify-token", (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Missing or invalid Authorization header" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, JWT_SECRET);

		console.log("✅ Token verified:", decoded);
		return res.json({ decoded });
	} catch (error) {
		const err = error as Error;
		console.error("❌ Token verification failed:", err.message);
		return res.status(401).json({ error: "Invalid or expired token" });
	}
});

//test ping route
router.get("/ping", (req, res) => {
	console.log("✅ /api/auth/ping route triggered");
	res.json({ message: "pong" });
});

export default router;
