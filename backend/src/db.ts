import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL saknas i miljövariabler.");
}

// Kolla om vi ansluter till en Render-databas
const isProduction = connectionString.includes('render.com'); 

const connectionConfig: PoolConfig = {
    connectionString: connectionString,
    // Om det är en Render-databas, tvinga SSL och acceptera icke-verifierade certifikat (standardlösning för moln-DB).
    ssl: isProduction ? { rejectUnauthorized: false } : undefined, 
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
