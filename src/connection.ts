// import user postresql info from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import and require Pool (node-postgres)
import pg from 'pg';
const { Pool } = pg;

// create new instance with credentials
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  database: process.env.DB_NAME,
  port: 5432,
});

//establish connection to the database
const connectToDb = async () => {
  try {
    await pool.connect();
    console.log('Connected to the database.');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

export { pool, connectToDb };