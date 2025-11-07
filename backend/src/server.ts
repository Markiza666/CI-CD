import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet"; // 👈 Importera Helmet

import authRoutes from "../src/routes/authRoutes.js";
import meetupRoutes from "../src/routes/meetups.js";
import profileRoutes from "../src/routes/profile.js";

const app = express();

app.use(cors({
    origin: '*', // Tillåt ALLA origins för att lösa CORS-problemet
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const allowedOrigins = [
  "http://localhost:5173",
  "https://github-deploy-key.onrender.com", // Ändra denna till din frontend-domän om den deployats separat!
];

const corsOptions = {
  origin: allowedOrigins, // Använd listan här!
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors({
    origin: '*', // Tillåt ALLA origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// app.options(/.*/, cors(corsOptions)); // regex-variant

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/meetups", meetupRoutes);
app.use("/api/profile", profileRoutes);

// ✅ Lägg till Helmet med CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://backend-api-latest-5mz4.onrender.com"],
    },
  })
);

app.listen(process.env.PORT || 5000, () => {
  console.log("API running...");
});
