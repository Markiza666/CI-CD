import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const shouldUseSSL = process.env.DATABASE_SSL === 'true';

const connectionConfig: PoolConfig = {
	connectionString: process.env.DATABASE_URL,
	ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
};

const pool = new Pool(connectionConfig);

pool.connect()
	.then(client => {
		console.log("✅ PostgreSQL Database connected successfully!");
		client.release();
	})
	.catch(err => {
		console.error("❌ ERROR: Database connection failed! Message:", err.message);
		process.exit(1);
	});

export default {
	query: (text: string, params?: any[]) => pool.query(text, params),
};
