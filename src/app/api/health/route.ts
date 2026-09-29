import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb(true);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const masterTopics = (await db.execute(
      sql`SELECT id, name, user_id, subject_id, lesson_id FROM topics WHERE user_id IS NULL`
    )) as any;
    const userTopics = (await db.execute(
      sql`SELECT id, name, user_id, subject_id, lesson_id FROM topics WHERE user_id IS NOT NULL`
    )) as any;

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      masterTopicsCount: masterTopics?.rows?.length ?? 0,
      userTopicsCount: userTopics?.rows?.length ?? 0,
      masterTopics: masterTopics?.rows ?? [],
      userTopics: userTopics?.rows ?? [],
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
