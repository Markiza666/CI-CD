import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet"; // 👈 Importera Helmet

import authRoutes from "./routes/authRoutes";
import meetupRoutes from "./routes/meetups";
import profileRoutes from "./routes/profile";

const app = express();

const allowedOrigins = [
	"http://localhost:5173",
	"https://backend-api-latest-5mz4.onrender.com",
];

const corsOptions = {
	// origin: allowedOrigins,
	origin(origin: any, callback: any) {
		// Tillåt Postman/CLI (ingen origin) och whitelistan
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},

	// methods: ["GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"],
	methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"], // ✅ each method as its own string

	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

// ✅ Lägg till Helmet med CSP
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			fontSrc: ["'self'", "https://backend-api-latest-5mz4.onrender.com"],
		},
	})
);

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // regex-variant

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/meetups", meetupRoutes);
app.use("/api/profile", profileRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("🔥 Uncaught error:", err);
	res.status(500).json({ error: "Internal server error" });
});

//Test route
app.get("/api/debug", (req, res) => {
	res.json({
		message: "Server is alive!",
		timestamp: new Date().toISOString(),
		ip: req.ip,
		headers: req.headers,
	});
});
app.get("/api/ping", (req, res) => {
	console.log("✅ /api/ping route triggered");
	res.json({ message: "pong from server.ts" });
});

app.listen(process.env.PORT || 5000, () => {
	console.log("API running...");
});
