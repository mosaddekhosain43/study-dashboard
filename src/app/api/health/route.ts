import { db, dbDriverType } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const envKeys = Object.keys(process.env).filter(
      (k) =>
        k.includes("DATABASE") ||
        k.includes("POSTGRES") ||
        k.includes("PG") ||
        k.includes("NEON")
    );

    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    return Response.json({
      ok: true,
      build: "v2-commit-03958bd",
      driver: dbDriverType,
      isPersistentPostgres: dbDriverType === "postgres",
      dbEnvKeysFound: envKeys,
      urlLength: dbUrl ? dbUrl.length : 0,
      urlPrefix: dbUrl ? dbUrl.slice(0, 15) : null,
      rawDatabaseUrlEnv: typeof process.env.DATABASE_URL,
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
