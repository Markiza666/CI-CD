import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet'; // 👈 Importera Helmet

import authRoutes from './routes/authRoutes';
import meetupRoutes from './routes/meetups';
import profileRoutes from './routes/profile';

dotenv.config();
const app = express();

const allowedOrigins = [
	'http://localhost:5173',
	'https://github-deploy-key.onrender.com',
];

const corsOptions = {
	origin: allowedOrigins,
	methods: ['GET,HEAD,PUT,PATCH,POST,DELETE','OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	next();
});

// ✅ Lägg till Helmet med CSP
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			fontSrc: ["'self'", 'https://backend-api-latest-5mz4.onrender.com'],
		},
	})
);

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/profile', profileRoutes);

app.listen(process.env.PORT || 5000, () => {
	console.log('API running...');
});

