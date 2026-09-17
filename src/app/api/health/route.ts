import { db, dbDriverType } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    let userCount = 0;
    let usersList: any[] = [];
    try {
      const res = await db.execute(sql`select id, email, role, name from users`);
      usersList = (res as any)?.rows ?? (res as any) ?? [];
    } catch (e: any) {
      // ignore
    }

    return Response.json({
      ok: true,
      driver: dbDriverType,
      isPersistentPostgres: dbDriverType === "postgres",
      userCount: usersList.length,
      users: usersList,
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
