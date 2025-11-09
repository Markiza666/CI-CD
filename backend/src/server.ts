import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet"; 

import authRoutes from "./routes/authRoutes";
import meetupRoutes from "./routes/meetups";
import db from "./db";
import auth from "./middleware/authMiddleware";
import profileRoutes from "./routes/profile";

const app = express();

// --------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/meetups", meetupRoutes);

// app.use("/api/profile", profileRoutes); // <-- UTKOMMENTERAD/BORTTAGEN

// 🛑 TEST: Montera routern direkt i server.ts för att se om den laddas.
app.get("/api/profile", auth, async (req: express.Request, res: express.Response) => {
    try {
        console.log("SUCCESS: Profile route reached directly!"); // Logga detta till Render!
        
        // Returnera minimal men korrekt formaterad data
        const userResult = await db.query(`SELECT id, email, name FROM users WHERE id = $1`, [req.userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Returnera den datastruktur som frontend (ProfileData) förväntar sig
        res.json({
            user: { 
                _id: user.id, 
                email: user.email, 
                firstName: user.name || 'Unknown', 
                city: 'N/A' 
            },
            attendingMeetups: [], // Tom array
            createdMeetups: []     // Tom array
        });
        
    } catch (error) {
        console.error("🔥 PROFILE ROUTE CRASHED:", error);
        res.status(500).json({ error: "Failed to fetch profile during test" });
    }
});
// --------------------------------------------------------------------------

const allowedOrigins = [
	"http://localhost:5173",
	"https://backend-api-latest-5mz4.onrender.com",
];

const corsOptions = {
	origin(origin: any, callback: any) {
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},

	methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"], 
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			fontSrc: ["'self'", "https://backend-api-latest-5mz4.onrender.com"],
		},
	})
);

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); 

app.use(express.json());

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	next();
});

app.use("/api/auth", authRoutes);
app.use("/api/meetups", meetupRoutes);
app.use("/api/profile", profileRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("🔥 Uncaught error:", err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 5000, () => {
	console.log("🚀 API running on port", process.env.PORT || 5000);
});
