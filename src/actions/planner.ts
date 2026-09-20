"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, initializeDb } from "@/db";
import { lessons, settings, subjects, topics } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getExamConfig } from "@/lib/queries";
import {
  calculateNextRevisionDue,
  generateStudentStudyPlan,
  type PlannerTopicItem,
  type StudentStudyPlan,
} from "@/lib/studyPlanner";
import { todayKey } from "@/lib/dates";

export async function getStudentStudyPlanAction(): Promise<{
  ok: boolean;
  plan?: StudentStudyPlan;
  error?: string;
}> {
  await initializeDb();
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in to view your study planner." };
  }

  try {
    const examConfig = await getExamConfig();

    // Fetch user subjects
    const userSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        nameBn: subjects.nameBn,
        streamGroup: subjects.streamGroup,
        sortOrder: subjects.sortOrder,
      })
      .from(subjects)
      .where(eq(subjects.userId, user.id))
      .orderBy(subjects.sortOrder, subjects.id);

    if (userSubjects.length === 0) {
      // Return empty plan if no syllabus set up yet
      return {
        ok: true,
        plan: generateStudentStudyPlan({
          allTopics: [],
          allSubjects: [],
          examDate: examConfig.examDate,
          targetDate: examConfig.targetDate,
        }),
      };
    }

    // Fetch user topics with lesson and subject metadata
    const userTopics = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
        lessonId: topics.lessonId,
        name: topics.name,
        status: topics.status,
        completedAt: topics.completedAt,
        lastRevisedAt: topics.lastRevisedAt,
        revisionCount: topics.revisionCount,
        nextRevisionDue: topics.nextRevisionDue,
        subjectName: subjects.name,
        subjectNameBn: subjects.nameBn,
        lessonName: lessons.name,
      })
      .from(topics)
      .leftJoin(subjects, eq(topics.subjectId, subjects.id))
      .leftJoin(lessons, eq(topics.lessonId, lessons.id))
      .where(eq(topics.userId, user.id))
      .orderBy(topics.sortOrder, topics.id);

    const mappedTopics: PlannerTopicItem[] = userTopics.map((t) => ({
      id: t.id,
      subjectId: t.subjectId,
      subjectName: t.subjectName || "Subject",
      subjectNameBn: t.subjectNameBn,
      lessonId: t.lessonId,
      lessonName: t.lessonName,
      name: t.name,
      status: (t.status as any) || "not_started",
      completedAt: t.completedAt,
      lastRevisedAt: t.lastRevisedAt,
      revisionCount: t.revisionCount || 0,
      nextRevisionDue: t.nextRevisionDue,
    }));

    const plan = generateStudentStudyPlan({
      allTopics: mappedTopics,
      allSubjects: userSubjects,
      examDate: examConfig.examDate,
      targetDate: examConfig.targetDate,
    });

    return { ok: true, plan };
  } catch (err: any) {
    console.error("getStudentStudyPlanAction error:", err);
    return { ok: false, error: err?.message || "Failed to load study plan." };
  }
}

export async function markTopicRevisedAction(topicId: number): Promise<{
  ok: boolean;
  newRevisionCount?: number;
  nextRevisionDue?: string;
  error?: string;
}> {
  await initializeDb();
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const [topic] = await db
      .select()
      .from(topics)
      .where(and(eq(topics.id, topicId), eq(topics.userId, user.id)))
      .limit(1);

    if (!topic) {
      return { ok: false, error: "Topic not found." };
    }

    const currentCount = topic.revisionCount || 0;
    const newCount = currentCount + 1;
    const today = todayKey();
    const nextDue = calculateNextRevisionDue(today, newCount);

    await db
      .update(topics)
      .set({
        lastRevisedAt: today,
        revisionCount: newCount,
        nextRevisionDue: nextDue,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, topicId));

    revalidatePath("/");
    revalidatePath("/planner");
    revalidatePath("/subjects");
    return { ok: true, newRevisionCount: newCount, nextRevisionDue: nextDue };
  } catch (err: any) {
    console.error("markTopicRevisedAction error:", err);
    return { ok: false, error: err?.message || "Failed to mark revision." };
  }
}
