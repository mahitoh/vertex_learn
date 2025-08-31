import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse the DATABASE_URL to extract MySQL connection details
const parseDbUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not defined');
  
  console.log('DATABASE_URL:', url);
  
  // Extract connection details from MySQL URL format
  // Format: mysql://username:password@hostname:port/database
  const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*?)(?:\?|$)/;
  const match = url.match(regex);
  
  console.log('Regex match:', match);
  
  if (!match) throw new Error(`Invalid DATABASE_URL format: ${url}`);
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5].split('?')[0],
  } as const;
};

// Create a MySQL connection pool
const dbConfig = parseDbUrl();

// Ensure all required connection parameters are defined
if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error('Missing required database connection parameters');
}

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Test the connection
const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Error connecting to MySQL database', err);
    process.exit(-1);
  }
};

testConnection();

// Helper function to execute queries
export const query = async <T = any>(text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const [rows, fields] = await pool.query<T[]>(text, params || []);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: Array.isArray(rows) ? rows.length : 1 });
    return { rows, fields };
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await pool.end();
  console.log('MySQL pool has ended');
});

export default {
  query,
  pool,
};

