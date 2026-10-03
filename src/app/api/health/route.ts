import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb(false);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const personalTopRes = await db.execute(sql`SELECT count(*) as count FROM topics WHERE user_id IS NOT NULL`);
    const masterTopRes = await db.execute(sql`SELECT count(*) as count FROM topics WHERE user_id IS NULL`);
    const completedTopRes = await db.execute(sql`SELECT count(*) as count FROM topics WHERE status = 'completed'`);
    const inProgressTopRes = await db.execute(sql`SELECT count(*) as count FROM topics WHERE status = 'in_progress'`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const userRes = await db.execute(sql`SELECT count(*) as count FROM users`);

    const topCount = (topRes as any)?.rows?.[0]?.count ?? 0;
    const personalCount = (personalTopRes as any)?.rows?.[0]?.count ?? 0;
    const masterCount = (masterTopRes as any)?.rows?.[0]?.count ?? 0;
    const completedCount = (completedTopRes as any)?.rows?.[0]?.count ?? 0;
    const inProgressCount = (inProgressTopRes as any)?.rows?.[0]?.count ?? 0;
    const subCount = (subRes as any)?.rows?.[0]?.count ?? 0;
    const userCount = (userRes as any)?.rows?.[0]?.count ?? 0;

    return Response.json({
      ok: true,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      userCount: Number(userCount),
      subjectCount: Number(subCount),
      totalTopics: Number(topCount),
      masterTopics: Number(masterCount),
      personalTopics: Number(personalCount),
      completedTopics: Number(completedCount),
      inProgressTopics: Number(inProgressCount),
      message: "Diagnostics retrieved.",
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
