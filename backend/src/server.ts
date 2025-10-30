import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import meetupRoutes from './routes/meetups';
import profileRoutes from './routes/profile';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meetups', meetupRoutes);
app.use('/api/profile', profileRoutes);

app.listen(process.env.PORT || 3000, () => {
	console.log('API running...');
});
