import { db, dbDriverType } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    let userCount = 0;
    try {
      const res = await db.execute(sql`select count(*) as count from users`);
      userCount = Number((res as any)?.rows?.[0]?.count ?? (res as any)?.[0]?.count ?? 0);
    } catch (e: any) {
      userCount = -1;
    }
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
      driver: dbDriverType,
      isPersistentPostgres: dbDriverType === "postgres",
      userCount,
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
