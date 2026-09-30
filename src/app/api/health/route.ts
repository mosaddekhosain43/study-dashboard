import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb();

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const lessRes = (await db.execute(
      sql`SELECT l.id, l.name, count(t.id) as topic_count FROM lessons l LEFT JOIN topics t ON t.lesson_id = l.id GROUP BY l.id, l.name ORDER BY l.id`
    )) as any;

    const topCount = (topRes as any)?.rows?.[0]?.count ?? 0;
    const subCount = (subRes as any)?.rows?.[0]?.count ?? 0;
    const lessonsList = lessRes?.rows ?? [];

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      totalTopics: Number(topCount),
      chapters: lessonsList.map((l: any) => ({
        chapterName: l.name,
        topicCount: Number(l.topic_count),
      })),
      message: "Curriculum initialized and verified successfully.",
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
