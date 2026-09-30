import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb(true);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const subs = (await db.execute(
      sql`SELECT id, user_id, name, slug FROM subjects ORDER BY id`
    )) as any;
    const less = (await db.execute(
      sql`SELECT id, user_id, subject_id, name FROM lessons ORDER BY id`
    )) as any;

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      totalTopics: Number(topCount),
      subjects: subs?.rows ?? [],
      lessons: less?.rows ?? [],
      message: "Inspection query.",
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
