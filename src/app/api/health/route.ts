import { db, initializeDb } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDb(true);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const quranTopicsRes = (await db.execute(
      sql`SELECT t.id, t.name, t.notes FROM topics t JOIN subjects s ON t.subject_id = s.id WHERE s.slug = 'alim-quran-mazid' ORDER BY t.sort_order`
    )) as any;

    const topCount = (topRes as any)?.rows?.[0]?.count ?? 0;
    const subCount = (subRes as any)?.rows?.[0]?.count ?? 0;
    const quranTopics = quranTopicsRes?.rows ?? [];

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      totalTopics: Number(topCount),
      quranTopicsCount: quranTopics.length,
      quranTopics: quranTopics.map((t: any) => ({ name: t.name, hasNotes: !!t.notes })),
      message: "Curriculum initialized and verified successfully.",
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
