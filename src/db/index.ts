import { mkdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Local development uses PGlite (real Postgres, stored in .data/). Production will point
// the same schema at a hosted Postgres (e.g. Supabase) by swapping this driver.
const DATA_DIR = process.env.PGLITE_DIR ?? ".data/pglite";

const globalForDb = globalThis as unknown as { pglite?: PGlite };
if (!globalForDb.pglite) mkdirSync(DATA_DIR, { recursive: true });
const client = globalForDb.pglite ?? new PGlite(DATA_DIR);
if (process.env.NODE_ENV !== "production") globalForDb.pglite = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
export { schema };
