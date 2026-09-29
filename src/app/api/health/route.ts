import { db, dbDriverType } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`DELETE FROM topics`);
    await db.execute(sql`DELETE FROM lessons`);

    const topRes = await db.execute(sql`SELECT count(*) as count FROM topics`);
    const subRes = await db.execute(sql`SELECT count(*) as count FROM subjects`);
    const topCount = (topRes as any)?.rows?.[0]?.count ?? 0;
    const subCount = (subRes as any)?.rows?.[0]?.count ?? 0;

    return Response.json({
      ok: true,
      subjectCount: Number(subCount),
      topicCount: Number(topCount),
      message: "All topics and lessons removed successfully.",
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
