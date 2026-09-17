import fs from "fs";
import path from "path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import { runInitAndSeed } from "./init";

import os from "os";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.NEON_DATABASE_URL;

const isVercel = Boolean(process.env.VERCEL);

// Determine if we should use remote PostgreSQL or local embedded PGlite
const shouldUsePg =
  isVercel ||
  (Boolean(databaseUrl) &&
    !databaseUrl?.includes("127.0.0.1:5432") &&
    !databaseUrl?.includes("localhost:5432") &&
    process.env.USE_PGLITE !== "true");

export const dbDriverType: "postgres" | "pglite" =
  shouldUsePg && databaseUrl ? "postgres" : "pglite";

if (isVercel && !databaseUrl) {
  console.warn(
    "⚠️ CRITICAL: Running on Vercel without DATABASE_URL / POSTGRES_URL! Serverless Lambda container will use ephemeral in-memory database and data will not persist. Please configure Neon / Postgres on Vercel."
  );
}

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
      ssl: { rejectUnauthorized: false },
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

  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const dataDir = isVercel
    ? path.join(os.tmpdir(), "pgdata")
    : path.join(process.cwd(), "data", "pgdata");

  if (!isBuildPhase && !fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  const pglite =
    globalForPglite.__pgliteInstance ??
    (isBuildPhase || isVercel ? new PGlite() : new PGlite(dataDir));

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
