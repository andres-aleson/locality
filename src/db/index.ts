import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * DATABASE_URL should use the `locality_app` role, which can only read and
 * write rows in the `locality` schema. Tables are managed by drizzle-kit
 * migrations in /drizzle.
 */

// Reuse one pool across hot reloads in dev and warm invocations on Vercel.
const globalForDb = globalThis as unknown as {
  localityDb?: NodePgDatabase<typeof schema>;
};

export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.localityDb) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    const pool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: 5,
    });
    globalForDb.localityDb = drizzle(pool, { schema });
  }
  return globalForDb.localityDb;
}
