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
  board?: string | null;
  classLevel?: string | null;
  streamGroup?: string | null;
  subjectType: "compulsory" | "group_elective" | "optional";
  structureType: "chapter" | "module";
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

  // Fetch all master subjects, lessons, and topics
  const [masterSubs, masterLessons, masterTops] = await Promise.all([
    db
      .select()
      .from(subjects)
      .where(isNull(subjects.userId))
      .orderBy(subjects.sortOrder, subjects.id),
    db.select().from(lessons).where(isNull(lessons.userId)).orderBy(lessons.sortOrder, lessons.id),
    db.select().from(topics).where(isNull(topics.userId)).orderBy(topics.sortOrder, topics.id),
  ]);

  const masterBooks: MasterBookView[] = masterSubs.map((sub) => {
    const subChapters = masterLessons.filter((l) => l.subjectId === sub.id);
    return {
      id: sub.id,
      batchId: sub.batchId,
      name: sub.name,
      nameBn: sub.nameBn,
      slug: sub.slug,
      sortOrder: sub.sortOrder,
      board: sub.board,
      classLevel: sub.classLevel,
      streamGroup: sub.streamGroup,
      subjectType: (sub.subjectType as any) || "compulsory",
      structureType: (sub.structureType as any) || "chapter",
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

  // Retrieve latest student profile from DB
  const userRows = await db
    .select({
      board: users.board,
      classLevel: users.classLevel,
      streamGroup: users.streamGroup,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const dbUser = userRows[0];

  return {
    ok: true,
    hasPersonalSyllabus,
    personalSubjectCount,
    userBatch: currentBatch,
    userProfile: {
      board: dbUser?.board || user.board || "general",
      classLevel: dbUser?.classLevel || user.classLevel || "ssc",
      streamGroup: dbUser?.streamGroup || user.streamGroup || "science",
    },
    availableBatches: allBatches,
    masterBooks,
  };
}

export interface SelectionPayload {
  batchId?: number;
  board?: string;
  classLevel?: string;
  streamGroup?: string;
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

  const { selections, batchId, board, classLevel, streamGroup } = payload;
  if (!selections || selections.length === 0) {
    return { ok: false, error: "Please select at least one book to begin." };
  }

  // Update user profile info (batch, board, class, stream)
  const userUpdates: Record<string, any> = {};
  if (batchId && batchId !== user.batchId) userUpdates.batchId = batchId;
  if (board) userUpdates.board = board;
  if (classLevel) userUpdates.classLevel = classLevel;
  if (streamGroup) userUpdates.streamGroup = streamGroup;

  if (Object.keys(userUpdates).length > 0) {
    await db.update(users).set(userUpdates).where(eq(users.id, user.id));
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
          board: mSub.board,
          classLevel: mSub.classLevel,
          streamGroup: mSub.streamGroup,
          subjectType: mSub.subjectType,
          structureType: mSub.structureType,
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
