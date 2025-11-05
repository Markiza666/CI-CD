import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import meetupRoutes from './routes/meetups';
import profileRoutes from './routes/profile';

dotenv.config();
const app = express();

const allowedOrigins = [
	'http://localhost:5173',
	'https://github-deploy-key.onrender.com', // din frontend på Render
];

const corsOptions = {
	origin: allowedOrigins,
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/profile', profileRoutes);

app.listen(process.env.PORT || 3000, () => {
	console.log('API running...');
});
