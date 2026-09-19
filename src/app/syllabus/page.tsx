import { and, eq } from "drizzle-orm";
import SyllabusClientView from "@/components/SyllabusClientView";
import { db } from "@/db";
import { subjects, topics } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded, type SubjectDto, type TopicDto } from "@/lib/queries";
import type { StudyStatus } from "@/lib/constants";
import { getStudentCurriculumStatusAction } from "@/actions/syllabus";

export const dynamic = "force-dynamic";

export const metadata = { title: "Syllabus Setup — Study Dashboard" };

function toStatus(s: string): StudyStatus {
  return s === "completed" || s === "in_progress" || s === "not_completed" ? s : "not_started";
}

export default async function SyllabusPage() {
  await ensureSeeded();
  const user = await getCurrentUser();

  const status = await getStudentCurriculumStatusAction();

  // If student has personal syllabus, fetch their personal subjects and topics
  let subs: SubjectDto[] = [];
  let topicRows: any[] = [];

  if (user && status.hasPersonalSyllabus) {
    subs = (await db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, user.id))
      .orderBy(subjects.sortOrder, subjects.id)) as SubjectDto[];

    topicRows = await db
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
      .where(eq(topics.userId, user.id))
      .orderBy(topics.subjectId, topics.sortOrder, topics.id);
  } else {
    // Fallback: master or default subjects
    subs = (await db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, user ? user.id : 0))
      .orderBy(subjects.sortOrder, subjects.id)) as SubjectDto[];
  }

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
          updatedAt: t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString(),
        })
      ),
  }));

  const totalTopics = topicRows.length;

  return (
    <SyllabusClientView
      hasPersonalSyllabus={status.hasPersonalSyllabus ?? false}
      userBatch={status.userBatch ?? null}
      availableBatches={status.availableBatches ?? []}
      masterBooks={status.masterBooks ?? []}
      groups={groups}
      totalTopics={totalTopics}
    />
  );
}
