import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import logger from './logger.js';

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'drizzle');

/**
 * Apply pending SQL migrations (same set as `drizzle-kit migrate`).
 * Skipped when NODE_ENV=test or AUTO_MIGRATE is 0/false.
 */
export async function runMigrationsIfEnabled() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  const off = process.env.AUTO_MIGRATE === '0' || process.env.AUTO_MIGRATE === 'false';
  if (off) {
    logger.info('Skipping migrations (AUTO_MIGRATE disabled)');
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when AUTO_MIGRATE is enabled');
  }

  logger.info('Running database migrations…');
  await migrate(db, { migrationsFolder });
  logger.info('Database migrations finished');
}
