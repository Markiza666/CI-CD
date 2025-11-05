import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
};

if (isProduction) {
    connectionConfig.ssl = {
        rejectUnauthorized: false
    };
} 

const pool = new Pool(connectionConfig);

// Detta block är nyckeln för att få ett tydligt fel i terminalen:
pool.connect()
    .then(client => {
        console.log("PostgreSQL Database connected successfully!");
        client.release();
    })
    .catch(err => {
        console.error("ERROR: Database connection failed! Message:", err.message);
        // Tvinga processen att avslutas med felkod 1 för att visa felet
        process.exit(1); 
    });


export default {
    query: (text: string, params?: any[]) => pool.query(text, params)
};
