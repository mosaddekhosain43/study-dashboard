"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, initializeDb } from "@/db";
import { batches, lessons, settings, subjects, topics, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { NCTB_CURRICULUM_DATA } from "@/lib/nctbCurriculum";

export interface MasterTopicView {
  id: number;
  name: string;
  notes?: string | null;
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
  await initializeDb();
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
            notes: t.notes,
            sortOrder: t.sortOrder,
          })),
      })),
    };
  });

  const currentBatch = allBatches.find((b) => b.id === effectiveBatchId) || null;

  // Retrieve latest student profile from DB
  const [userRows, examSettingRow, targetSettingRow] = await Promise.all([
    db
      .select({
        board: users.board,
        classLevel: users.classLevel,
        streamGroup: users.streamGroup,
        examDate: users.examDate,
        targetDate: users.targetDate,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1),
    db.select().from(settings).where(eq(settings.key, "exam_date")).limit(1),
    db.select().from(settings).where(eq(settings.key, "target_date")).limit(1),
  ]);

  const dbUser = userRows[0];

  return {
    ok: true,
    hasPersonalSyllabus,
    personalSubjectCount,
    userBatch: currentBatch,
    userProfile: {
      board: dbUser?.board || user.board || "madrasah",
      classLevel: dbUser?.classLevel || user.classLevel || "alim",
      streamGroup: dbUser?.streamGroup || user.streamGroup || "science",
      examDate: dbUser?.examDate || user.examDate || examSettingRow[0]?.value || "2027-04-15",
      targetDate: dbUser?.targetDate || user.targetDate || targetSettingRow[0]?.value || "2027-02-28",
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
  examDate?: string;
  targetDate?: string;
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

  const { selections, batchId, streamGroup, examDate, targetDate } = payload;
  if (!selections || selections.length === 0) {
    return { ok: false, error: "Please select at least one book to begin." };
  }

  // Update user profile info (batch, board, class, stream, dates, onboarding)
  const userUpdates: Record<string, any> = {
    board: "madrasah",
    classLevel: "alim",
    onboardingCompleted: true,
  };
  if (batchId && batchId !== user.batchId) userUpdates.batchId = batchId;
  if (streamGroup) userUpdates.streamGroup = streamGroup;
  if (examDate && /^\d{4}-\d{2}-\d{2}$/.test(examDate)) userUpdates.examDate = examDate;
  if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) userUpdates.targetDate = targetDate;

  if (Object.keys(userUpdates).length > 0) {
    await db.update(users).set(userUpdates).where(eq(users.id, user.id));
  }

  // Sync exam and target dates with settings
  if (examDate && /^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    await db
      .insert(settings)
      .values({ key: "exam_date", value: examDate })
      .onConflictDoUpdate({ target: settings.key, set: { value: examDate } });
  }
  if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    await db
      .insert(settings)
      .values({ key: "target_date", value: targetDate })
      .onConflictDoUpdate({ target: settings.key, set: { value: targetDate } });
  }

  try {
    // Clear old personal syllabus so the student's fresh selection takes effect
    await db.delete(topics).where(eq(topics.userId, user.id));
    await db.delete(lessons).where(eq(lessons.userId, user.id));
    await db.delete(subjects).where(eq(subjects.userId, user.id));

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
            chapter: mChapter.name,
            notes: mT.notes,
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

export async function restoreOfficialSyllabusAction() {
  await initializeDb();
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in first." };
  }

  try {
    // 1. If student has personalized subjects, lessons, topics (or added custom ones), delete them so they revert cleanly
    await db.delete(topics).where(eq(topics.userId, user.id));
    await db.delete(lessons).where(eq(lessons.userId, user.id));
    await db.delete(subjects).where(eq(subjects.userId, user.id));

    // 2. Ensure master subjects, chapters, and topics are completely restored in the database from NCTB_CURRICULUM_DATA
    const allBatches = await db.select().from(batches);
    const batchMap: Record<string, number> = {};
    for (const b of allBatches) {
      if (b.slug?.includes("alim")) batchMap["alim"] = b.id;
    }
    const defaultBatchId = batchMap["alim"] || allBatches[0]?.id || 1;

    for (let i = 0; i < NCTB_CURRICULUM_DATA.length; i++) {
      const def = NCTB_CURRICULUM_DATA[i];
      const effectiveBatchId = batchMap[def.classLevel] || defaultBatchId;

      let [masterSub] = await db
        .select()
        .from(subjects)
        .where(and(isNull(subjects.userId), eq(subjects.slug, def.slug)))
        .limit(1);

      if (!masterSub) {
        const [inserted] = await db
          .insert(subjects)
          .values({
            batchId: effectiveBatchId,
            userId: null,
            name: def.name,
            nameBn: def.nameBn,
            slug: def.slug,
            sortOrder: i + 1,
            board: def.board,
            classLevel: def.classLevel,
            streamGroup: def.streamGroup,
            subjectType: def.subjectType,
            structureType: def.structureType,
          })
          .returning();
        masterSub = inserted;
      } else {
        await db
          .update(subjects)
          .set({
            batchId: effectiveBatchId,
            name: def.name,
            nameBn: def.nameBn,
            sortOrder: i + 1,
            board: def.board,
            classLevel: def.classLevel,
            streamGroup: def.streamGroup,
            subjectType: def.subjectType,
            structureType: def.structureType,
          })
          .where(eq(subjects.id, masterSub.id));
      }

      // Check master topics for this subject
      const existingTopics = await db
        .select({ id: topics.id })
        .from(topics)
        .where(and(isNull(topics.userId), eq(topics.subjectId, masterSub.id)));

      const expectedTopicCount = def.chaptersOrModules.reduce(
        (acc, c) => acc + c.topics.length,
        0
      );

      // If any topics were deleted or missing, re-populate chapters & topics from definition
      if (def.chaptersOrModules.length > 0 && existingTopics.length < expectedTopicCount) {
        await db.delete(topics).where(and(isNull(topics.userId), eq(topics.subjectId, masterSub.id)));
        await db.delete(lessons).where(and(isNull(lessons.userId), eq(lessons.subjectId, masterSub.id)));

        for (let chIdx = 0; chIdx < def.chaptersOrModules.length; chIdx++) {
          const ch = def.chaptersOrModules[chIdx];
          const [lesson] = await db
            .insert(lessons)
            .values({
              subjectId: masterSub.id,
              userId: null,
              name: ch.name,
              sortOrder: chIdx + 1,
            })
            .returning();

          for (let tIdx = 0; tIdx < ch.topics.length; tIdx++) {
            const topicItem = ch.topics[tIdx];
            const topicName = typeof topicItem === "string" ? topicItem : topicItem.name;
            const topicNotes = typeof topicItem === "string" ? null : topicItem.notes || null;
            await db.insert(topics).values({
              subjectId: masterSub.id,
              lessonId: lesson.id,
              userId: null,
              name: topicName,
              chapter: ch.name,
              notes: topicNotes,
              sortOrder: tIdx + 1,
              status: "not_started",
            });
          }
        }
      }
    }

    revalidatePath("/syllabus");
    revalidatePath("/subjects");
    revalidatePath("/settings");
    revalidatePath("/");
    return {
      ok: true,
      message: "অফিসিয়াল সিলেবাস সফলভাবে রিস্টোর করা হয়েছে। সকল বিষয় ও টপিক পূর্বাবস্থায় ফিরে এসেছে।",
    };
  } catch (err: any) {
    console.error("restoreOfficialSyllabusAction error:", err);
    return { ok: false, error: err?.message || "সিলেবাস রিস্টোর করতে সমস্যা হয়েছে।" };
  }
}

