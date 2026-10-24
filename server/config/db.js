import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.warn('DATABASE_URL is not defined in environment variables. Database queries will fail without valid connection.');
}

export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: process.env.NODE_ENV === 'production' || (connectionString && connectionString.includes('sslmode=require'))
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected to database pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', { error: err });
});

/**
 * Execute parameterized query safely
 * @param {string} text 
 * @param {Array<any>} params 
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query execution failed', { text, error: error.message });
    throw error;
  }
}

/**
 * Transaction helper with automatic rollback on error
 * @param {Function} callback 
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back due to error', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

export default {
  pool,
  query,
  withTransaction,
};
