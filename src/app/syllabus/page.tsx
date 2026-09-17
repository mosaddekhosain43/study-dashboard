import { eq } from "drizzle-orm";
import SyllabusManager from "@/components/SyllabusManager";
import { db } from "@/db";
import { subjects, topics } from "@/db/schema";
import { ensureSeeded, type SubjectDto, type TopicDto } from "@/lib/queries";
import type { StudyStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = { title: "Syllabus Setup — Alim Study Dashboard" };

function toStatus(s: string): StudyStatus {
  return s === "completed" || s === "in_progress" || s === "not_completed" ? s : "not_started";
}

export default async function SyllabusPage() {
  await ensureSeeded();
  const subs = (await db.select().from(subjects).orderBy(subjects.sortOrder, subjects.id)) as SubjectDto[];
  const topicRows = await db
    .select({
      id: topics.id,
      subjectId: topics.subjectId,
      name: topics.name,
      chapter: topics.chapter,
      status: topics.status,
      notes: topics.notes,
      completedAt: topics.completedAt,
      updatedAt: topics.updatedAt,
      subjectName: subjects.name,
    })
    .from(topics)
    .leftJoin(subjects, eq(topics.subjectId, subjects.id))
    .orderBy(topics.subjectId, topics.sortOrder, topics.id);

  const groups = subs.map((s) => ({
    subject: s,
    topics: topicRows
      .filter((t) => t.subjectId === s.id)
      .map(
        (t): TopicDto => ({
          id: t.id,
          subjectId: t.subjectId,
          subjectName: t.subjectName ?? s.name,
          name: t.name,
          chapter: t.chapter,
          status: toStatus(t.status),
          notes: t.notes,
          completedAt: t.completedAt,
          updatedAt: t.updatedAt.toISOString(),
        }),
      ),
  }));

  const totalTopics = topicRows.length;

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Syllabus Setup</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-faint">
          Enter your <span className="font-semibold text-ink">real</span> syllabus — chapter by chapter, topic by
          topic. Nothing is invented for you: these exact names power progress tracking, the remaining list, and the
          natural-language matcher. {totalTopics > 0 && <span className="font-semibold text-leaf">{totalTopics} topics entered.</span>}
        </p>
      </header>
      <div className="rise rise-1">
        <SyllabusManager groups={groups} />
      </div>
    </div>
  );
}
