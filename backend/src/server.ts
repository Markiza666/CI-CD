import dotenv from "dotenv";
dotenv.config(); console.log("🌐 Render PORT:", process.env.PORT);
import express from "express";
import cors from "cors";
import helmet from "helmet"; 

import authRoutes from "./routes/authRoutes";
import meetupRoutes from "./routes/meetups";
import profileRoutes from "./routes/profile";

const app = express();

console.log("Backend v3.2 deployed")

const allowedOrigins = [
	"http://localhost:5173",
	"https://backend-api-dev-jd5g.onrender.com",
	"https://backend-api-latest-5mz4.onrender.com",
	//"https://my-frontend-dev-markiza.s3.eu-north-1.amazonaws.com",
	"http://my-frontend-dev-markiza.s3-website.eu-north-1.amazonaws.com" 
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

//Test route
app.get("/api/test", (req, res) => {
	res.json({ message: "✅ Test route works!" });
});
//End test route

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("🔥 Uncaught error:", err);
	res.status(500).json({ error: "Internal server error" });
});

/*const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
	console.log(`🚀 API running on port ${PORT}`);
});*/
const PORT = process.env.PORT || "5000";

app.listen(Number(PORT), "0.0.0.0", () => {
	console.log(`🚀 API running on port ${PORT}`);
});
// 🔻 Fånga Render’s nedstängningssignal
process.on("SIGTERM", () => {
	console.log("🛑 SIGTERM received — shutting down gracefully");
});
process.on("SIGINT", () => {
	console.log("🛑 SIGINT received — exiting via Ctrl+C");
});