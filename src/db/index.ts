import fs from "fs";
import path from "path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import { runInitAndSeed } from "./init";

const databaseUrl = process.env.DATABASE_URL;

// Determine if we should use remote PostgreSQL or local embedded PGlite
const shouldUsePg =
  Boolean(databaseUrl) &&
  !databaseUrl?.includes("127.0.0.1:5432") &&
  !databaseUrl?.includes("localhost:5432") &&
  process.env.USE_PGLITE !== "true";

let dbInstance: any;
let rawQueryFn: (sqlText: string, params?: any[]) => Promise<any>;
let rawExecFn: (sqlText: string) => Promise<any>;

if (shouldUsePg && databaseUrl) {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("neon.tech") || databaseUrl.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  dbInstance = drizzlePg(pool, { schema });
  rawQueryFn = async (text: string, params?: any[]) => {
    return await pool.query(text, params);
  };
  rawExecFn = async (text: string) => {
    return await pool.query(text);
  };
} else {
  // Local embedded PGlite (Zero configuration, offline-first)
  const globalForPglite = globalThis as typeof globalThis & {
    __pgliteInstance?: PGlite;
  };

  const dataDir = path.join(process.cwd(), "data", "pgdata");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const pglite =
    globalForPglite.__pgliteInstance ??
    (isBuildPhase ? new PGlite() : new PGlite(dataDir));

  if (process.env.NODE_ENV !== "production") {
    globalForPglite.__pgliteInstance = pglite;
  }

  dbInstance = drizzlePglite(pglite, { schema });
  rawQueryFn = async (text: string, params?: any[]) => {
    return await pglite.query(text, params);
  };
  rawExecFn = async (text: string) => {
    return await pglite.exec(text);
  };
}

// Auto-run schema creation & seeding on first boot
let initPromise: Promise<void> | null = null;
export async function initializeDb() {
  if (!initPromise) {
    initPromise = (async () => {
      await runInitAndSeed(rawQueryFn, rawExecFn);
    })();
  }
  return initPromise;
}

if (process.env.NEXT_PHASE !== "phase-production-build") {
  initializeDb().catch((err) => {
    console.error("DB auto-init failed:", err);
  });
}

export const db = dbInstance as NodePgDatabase<typeof schema>;
export { rawQueryFn };
