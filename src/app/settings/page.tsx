import { sql } from "drizzle-orm";
import SettingsClient from "@/components/SettingsClient";
import { db } from "@/db";
import { sessions, topics, updateItems } from "@/db/schema";
import { getExamConfig } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Study Dashboard" };

export default async function SettingsPage() {
  const cfg = await getExamConfig();
  const [t] = await db.select({ c: sql<number>`count(*)` }).from(topics);
  const [u] = await db.select({ c: sql<number>`count(*)` }).from(updateItems);
  const [s] = await db.select({ c: sql<number>`count(*)` }).from(sessions);

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          Exam dates, data safety, backup and restore.
        </p>
      </header>
      <div className="rise rise-1">
        <SettingsClient
          examDate={cfg.examDate}
          targetDate={cfg.targetDate}
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
