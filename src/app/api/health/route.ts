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

    return Response.json({
      ok: true,
      driver: dbDriverType,
      isPersistentPostgres: dbDriverType === "postgres",
      dbEnvKeysFound: envKeys,
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
