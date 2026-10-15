import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

/**
 * Lazy-initialized database client.
 * Does not attempt to establish a database connection unless explicitly accessed,
 * allowing unit tests, type checking, and static generation to run seamlessly
 * without an active PostgreSQL instance.
 */
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required to execute database operations.'
      );
    }
    dbInstance = drizzle({ connection: connectionString, schema });
  }
  return dbInstance;
}

export type Database = ReturnType<typeof getDb>;
