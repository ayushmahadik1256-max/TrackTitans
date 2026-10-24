import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool, query } from '../config/db.js';
import logger from '../utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  logger.info('Starting TrackTitans Neon PostgreSQL database seeding...');

  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      logger.info('Applying schema migrations...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      logger.info('Schema migration executed successfully.');
    }

    if (fs.existsSync(seedPath)) {
      logger.info('Applying 10 realistic test records...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedSql);
      logger.info('Database seeded with 10 test records, users, and audit logs.');
    }

    logger.info('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed database', { error: error.message });
    process.exit(1);
  }
}

seedDatabase();
