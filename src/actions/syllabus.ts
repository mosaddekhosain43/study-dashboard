"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { batches, lessons, subjects, topics, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export interface MasterTopicView {
  id: number;
  name: string;
  sortOrder: number;
}

export interface MasterChapterView {
  id: number;
  name: string;
  sortOrder: number;
  topics: MasterTopicView[];
}

export interface MasterBookView {
  id: number;
  batchId: number | null;
  name: string;
  nameBn: string | null;
  slug: string;
  sortOrder: number;
  chapters: MasterChapterView[];
}

export async function getStudentCurriculumStatusAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please sign in to access syllabus setup." };
  }

  // Check personal syllabus count
  const [personalSubRows, allBatches] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .where(eq(subjects.userId, user.id)),
    db.select().from(batches).orderBy(batches.name),
  ]);

  const personalSubjectCount = Number(personalSubRows[0]?.count ?? 0);
  const hasPersonalSyllabus = personalSubjectCount > 0;

  // Determine effective batchId
  let effectiveBatchId = user.batchId;
  if (!effectiveBatchId && allBatches.length > 0) {
    effectiveBatchId = allBatches[0].id;
  }

  // Fetch Master Curriculum for this batch (or all master books if no batch assigned)
  const masterSubQuery = effectiveBatchId
    ? and(isNull(subjects.userId), eq(subjects.batchId, effectiveBatchId))
    : isNull(subjects.userId);

  const [masterSubs, masterLessons, masterTops] = await Promise.all([
    db.select().from(subjects).where(masterSubQuery).orderBy(subjects.sortOrder, subjects.id),
    db.select().from(lessons).where(isNull(lessons.userId)).orderBy(lessons.sortOrder, lessons.id),
    db.select().from(topics).where(isNull(topics.userId)).orderBy(topics.sortOrder, topics.id),
  ]);

  // If no master books found for this specific batch, fallback to all master books
  let finalMasterSubs = masterSubs;
  if (finalMasterSubs.length === 0) {
    finalMasterSubs = await db
      .select()
      .from(subjects)
      .where(isNull(subjects.userId))
      .orderBy(subjects.sortOrder, subjects.id);
  }

  const masterBooks: MasterBookView[] = finalMasterSubs.map((sub) => {
    const subChapters = masterLessons.filter((l) => l.subjectId === sub.id);
    return {
      id: sub.id,
      batchId: sub.batchId,
      name: sub.name,
      nameBn: sub.nameBn,
      slug: sub.slug,
      sortOrder: sub.sortOrder,
      chapters: subChapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        sortOrder: ch.sortOrder,
        topics: masterTops
          .filter((t) => t.lessonId === ch.id)
          .map((t) => ({
            id: t.id,
            name: t.name,
            sortOrder: t.sortOrder,
          })),
      })),
    };
  });

  const currentBatch = allBatches.find((b) => b.id === effectiveBatchId) || null;

  return {
    ok: true,
    hasPersonalSyllabus,
    personalSubjectCount,
    userBatch: currentBatch,
    availableBatches: allBatches,
    masterBooks,
  };
}

export interface SelectionPayload {
  batchId?: number;
  selections: {
    subjectId: number;
    chapterIds: number[];
  }[];
}

export async function initializeStudentSyllabusAction(payload: SelectionPayload) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in to initialize your syllabus." };
  }

  const { selections, batchId } = payload;
  if (!selections || selections.length === 0) {
    return { ok: false, error: "Please select at least one book to begin." };
  }

  // Update user batchId if specified
  if (batchId && batchId !== user.batchId) {
    await db.update(users).set({ batchId }).where(eq(users.id, user.id));
  }

  try {
    // For each selected master subject
    for (const sel of selections) {
      const masterSubRows = await db
        .select()
        .from(subjects)
        .where(and(eq(subjects.id, sel.subjectId), isNull(subjects.userId)))
        .limit(1);

      const mSub = masterSubRows[0];
      if (!mSub) continue;

      // Clone subject for student
      const userSubSlug = `${mSub.slug}-${user.id}-${Date.now().toString(36)}`;
      const [personalSub] = await db
        .insert(subjects)
        .values({
          batchId: batchId || mSub.batchId,
          userId: user.id,
          name: mSub.name,
          slug: userSubSlug,
          nameBn: mSub.nameBn,
          sortOrder: mSub.sortOrder,
        })
        .returning();

      // For each selected chapter
      for (const chId of sel.chapterIds) {
        const masterChapterRows = await db
          .select()
          .from(lessons)
          .where(and(eq(lessons.id, chId), isNull(lessons.userId)))
          .limit(1);

        const mChapter = masterChapterRows[0];
        if (!mChapter) continue;

        // Clone chapter for student
        const [personalLesson] = await db
          .insert(lessons)
          .values({
            subjectId: personalSub.id,
            userId: user.id,
            name: mChapter.name,
            sortOrder: mChapter.sortOrder,
          })
          .returning();

        // Clone all topics belonging to this chapter
        const masterTopicRows = await db
          .select()
          .from(topics)
          .where(and(eq(topics.lessonId, chId), isNull(topics.userId)))
          .orderBy(topics.sortOrder, topics.id);

        for (const mT of masterTopicRows) {
          await db.insert(topics).values({
            subjectId: personalSub.id,
            lessonId: personalLesson.id,
            userId: user.id,
            name: mT.name,
            sortOrder: mT.sortOrder,
            status: "not_started",
          });
        }
      }
    }

    revalidatePath("/syllabus");
    revalidatePath("/subjects");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    console.error("initializeStudentSyllabusAction error:", err);
    return { ok: false, error: err?.message || "Failed to initialize syllabus." };
  }
}

export async function resetStudentSyllabusAction() {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  try {
    // Delete personal topics, lessons, subjects
    await db.delete(topics).where(eq(topics.userId, user.id));
    await db.delete(lessons).where(eq(lessons.userId, user.id));
    await db.delete(subjects).where(eq(subjects.userId, user.id));

    revalidatePath("/syllabus");
    revalidatePath("/subjects");
    revalidatePath("/");
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to reset syllabus." };
  }
}
