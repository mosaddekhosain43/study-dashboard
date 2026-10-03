import { eq, sql } from "drizzle-orm";
import SettingsClient from "@/components/SettingsClient";
import { db, initializeDb } from "@/db";
import { batches, sessions, subjects, topics, updateItems, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Student Profile & Settings — Study Dashboard" };

export default async function SettingsPage() {
  await initializeDb();
  const sessionUser = await getCurrentUser().catch(() => null);

  let userRow: any = null;
  let batchRow: any = null;
  let totalSubjects = 0;
  let totalTopics = 0;
  let completedTopics = 0;

  if (sessionUser) {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .limit(1);
    userRow = userRows[0] || null;

    if (userRow?.batchId) {
      const bRows = await db
        .select()
        .from(batches)
        .where(eq(batches.id, userRow.batchId))
        .limit(1);
      batchRow = bRows[0] || null;
    }

    const [userSubs, userTops] = await Promise.all([
      db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.userId, sessionUser.id)),
      db
        .select({ id: topics.id, status: topics.status })
        .from(topics)
        .where(eq(topics.userId, sessionUser.id)),
    ]);

    totalSubjects = userSubs.length;
    totalTopics = userTops.length;
    completedTopics = userTops.filter((t) => t.status === "completed").length;
  }

  const [t] = await db.select({ c: sql<number>`count(*)` }).from(topics);
  const [u] = await db.select({ c: sql<number>`count(*)` }).from(updateItems);
  const [s] = await db.select({ c: sql<number>`count(*)` }).from(sessions);

  const profile = {
    id: userRow?.id ?? sessionUser?.id ?? 0,
    name: userRow?.name || sessionUser?.name || "Student",
    email: userRow?.email || sessionUser?.email || "",
    phone: userRow?.phone || "",
    role: userRow?.role || sessionUser?.role || "student",
    batchName: batchRow?.name || "Alim 2027",
    board: userRow?.board || "madrasah",
    classLevel: userRow?.classLevel || "alim",
    streamGroup: userRow?.streamGroup || "general_madrasah",
    institution: userRow?.institution || "",
    rollNumber: userRow?.rollNumber || "",
    targetGoal: userRow?.targetGoal || "",
    bio: userRow?.bio || "",
    avatarUrl: userRow?.avatarUrl || "male",
    gender: userRow?.gender || sessionUser?.gender || "male",
    createdAt: userRow?.createdAt ? new Date(userRow.createdAt).toISOString() : null,
    stats: {
      totalSubjects,
      totalTopics,
      completedTopics,
      progressPercent: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    },
  };

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">
          Student Profile & Settings
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          Manage your personal details, academic information, and account security.
        </p>
      </header>
      <div className="rise rise-1">
        <SettingsClient
          profile={profile}
          userRole={profile.role}
          counts={{
            topics: Number(t?.c ?? 0),
            updates: Number(u?.c ?? 0),
            sessions: Number(s?.c ?? 0),
          }}
        />
      </div>
    </div>
  );
}
