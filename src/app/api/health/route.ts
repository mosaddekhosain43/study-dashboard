import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb(true);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const quranSubs = (await db.execute(
      sql`SELECT id, name, slug, user_id FROM subjects WHERE slug = 'alim-quran-mazid'`
    )) as any;
    const allLessons = (await db.execute(
      sql`SELECT id, subject_id, name, user_id FROM lessons`
    )) as any;
    const allTopics = (await db.execute(
      sql`SELECT t.id, t.subject_id, t.lesson_id, t.name, t.user_id FROM topics t`
    )) as any;

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      totalTopics: Number(topCount),
      quranSubs: quranSubs?.rows ?? [],
      allLessons: allLessons?.rows ?? [],
      allTopics: allTopics?.rows ?? [],
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
