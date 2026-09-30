"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, initializeDb } from "@/db";
import { batches, lessons, settings, subjects, topics, users } from "@/db/schema";
import { getCurrentUser, setSessionCookie } from "@/lib/auth";
import {
  SETTING_EXAM_DATE,
  SETTING_TARGET_DATE,
  SETTING_TARGET_START_DATE,
} from "@/lib/constants";
import { getStudentCurriculumStatusAction, type MasterBookView } from "./syllabus";

export interface OnboardingData {
  user: {
    id: number;
    name: string;
    email: string;
    streamGroup: string | null;
    onboardingCompleted: boolean;
    examDate: string | null;
    targetStartDate: string | null;
    targetDate: string | null;
    batchId: number | null;
  };
  masterBooks: MasterBookView[];
  defaultExamDate: string;
  defaultTargetStartDate: string;
  defaultTargetDate: string;
}

export async function getOnboardingDataAction(): Promise<{
  ok: boolean;
  data?: OnboardingData;
  error?: string;
}> {
  await initializeDb();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { ok: false, error: "Please log in to continue." };
  }

  // Get full user row
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);

  const user = userRows[0];
  if (!user) {
    return { ok: false, error: "User account not found." };
  }

  // Get curriculum data
  const statusRes = await getStudentCurriculumStatusAction();
  const masterBooks = statusRes.masterBooks || [];

  // Get existing settings if user hasn't set custom dates
  const [examSettingRow, targetSettingRow, targetStartSettingRow] = await Promise.all([
    db.select().from(settings).where(eq(settings.key, SETTING_EXAM_DATE)).limit(1),
    db.select().from(settings).where(eq(settings.key, SETTING_TARGET_DATE)).limit(1),
    db.select().from(settings).where(eq(settings.key, SETTING_TARGET_START_DATE)).limit(1),
  ]);

  const defaultExamDate =
    user.examDate || examSettingRow[0]?.value || "2027-04-15";
  const defaultTargetDate =
    user.targetDate || targetSettingRow[0]?.value || "2027-02-28";
  const defaultTargetStartDate =
    user.targetStartDate || targetStartSettingRow[0]?.value || new Date().toISOString().split("T")[0];

  return {
    ok: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        streamGroup: user.streamGroup,
        onboardingCompleted: user.onboardingCompleted ?? false,
        examDate: user.examDate,
        targetStartDate: user.targetStartDate,
        targetDate: user.targetDate,
        batchId: user.batchId,
      },
      masterBooks,
      defaultExamDate,
      defaultTargetStartDate,
      defaultTargetDate,
    },
  };
}

export interface CompleteOnboardingPayload {
  streamGroup?: string;
  bookIds?: number[];
  examDate?: string;
  targetStartDate?: string;
  targetDate?: string;
  skip?: boolean;
}

export async function completeOnboardingAction(payload: CompleteOnboardingPayload) {
  await initializeDb();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { ok: false, error: "Please log in to save your setup." };
  }

  const { streamGroup, bookIds = [], examDate, targetStartDate, targetDate, skip = false } = payload;

  // Handle "Skip for now"
  if (skip) {
    const updatesObj: Record<string, any> = {
      onboardingCompleted: true,
    };
    if (streamGroup) updatesObj.streamGroup = streamGroup;
    if (examDate && /^\d{4}-\d{2}-\d{2}$/.test(examDate)) updatesObj.examDate = examDate;
    if (targetStartDate && /^\d{4}-\d{2}-\d{2}$/.test(targetStartDate)) {
      updatesObj.targetStartDate = targetStartDate;
    }
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) updatesObj.targetDate = targetDate;

    await db.update(users).set(updatesObj).where(eq(users.id, sessionUser.id));

    // Update session cookie
    await setSessionCookie({
      ...sessionUser,
      onboardingCompleted: true,
      streamGroup: streamGroup || sessionUser.streamGroup,
      examDate: examDate || sessionUser.examDate,
      targetStartDate: targetStartDate || sessionUser.targetStartDate,
      targetDate: targetDate || sessionUser.targetDate,
    });

    revalidatePath("/", "layout");
    return { ok: true, redirectUrl: "/" };
  }

  // Normal flow validations
  if (!streamGroup) {
    return { ok: false, error: "Please select your study group (Science, Arts, or Commerce)." };
  }

  if (!bookIds || bookIds.length === 0) {
    return { ok: false, error: "Please select at least one book for your curriculum." };
  }

  if (!examDate || !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    return { ok: false, error: "Please select a valid Exam Date using the calendar." };
  }

  if (!targetStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetStartDate)) {
    return { ok: false, error: "Please select a valid Target Start Date using the calendar." };
  }

  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return { ok: false, error: "Please select a valid Target Date using the calendar." };
  }

  // Logical date validation: Target Start Date < Target Date < Exam Date
  if (targetStartDate >= targetDate) {
    return {
      ok: false,
      error: "Target start date must be before your target completion date.",
    };
  }

  if (targetDate >= examDate) {
    return {
      ok: false,
      error: "Target completion date must be before your exam date.",
    };
  }

  // Update user profile
  await db
    .update(users)
    .set({
      streamGroup,
      board: "madrasah",
      classLevel: "alim",
      examDate,
      targetStartDate,
      targetDate,
      onboardingCompleted: true,
    })
    .where(eq(users.id, sessionUser.id));

  // Sync with global settings for current dashboard view
  await Promise.all([
    db
      .insert(settings)
      .values({ key: SETTING_EXAM_DATE, value: examDate })
      .onConflictDoUpdate({ target: settings.key, set: { value: examDate } }),
    db
      .insert(settings)
      .values({ key: SETTING_TARGET_DATE, value: targetDate })
      .onConflictDoUpdate({ target: settings.key, set: { value: targetDate } }),
    db
      .insert(settings)
      .values({ key: SETTING_TARGET_START_DATE, value: targetStartDate })
      .onConflictDoUpdate({ target: settings.key, set: { value: targetStartDate } }),
  ]);

  // Clone selected books & all their chapters/topics into student's personal syllabus
  try {
    // 1. Clear any previous personal syllabus entries
    await db.delete(topics).where(eq(topics.userId, sessionUser.id));
    await db.delete(lessons).where(eq(lessons.userId, sessionUser.id));
    await db.delete(subjects).where(eq(subjects.userId, sessionUser.id));

    // 2. Get master subjects matching bookIds
    const masterSubs = await db
      .select()
      .from(subjects)
      .where(and(inArray(subjects.id, bookIds), isNull(subjects.userId)))
      .orderBy(subjects.sortOrder, subjects.id);

    if (masterSubs.length > 0) {
      // Batch insert personal subjects
      const newSubjectValues = masterSubs.map((mSub) => ({
        batchId: sessionUser.batchId || mSub.batchId,
        userId: sessionUser.id,
        name: mSub.name,
        slug: `${mSub.slug || "subject"}-${sessionUser.id}-${Date.now().toString(36)}`,
        nameBn: mSub.nameBn,
        sortOrder: mSub.sortOrder,
        board: mSub.board,
        classLevel: mSub.classLevel,
        streamGroup: mSub.streamGroup,
        subjectType: mSub.subjectType,
        structureType: mSub.structureType,
      }));

      const insertedPersonalSubs = await db
        .insert(subjects)
        .values(newSubjectValues)
        .returning();

      // Map master subject ID -> newly inserted personal subject ID
      const masterToPersonalSubMap = new Map<number, number>();
      for (let i = 0; i < masterSubs.length; i++) {
        masterToPersonalSubMap.set(masterSubs[i].id, insertedPersonalSubs[i].id);
      }

      // 3. Fetch all master chapters for all selected books in ONE query
      const masterSubIds = masterSubs.map((s) => s.id);
      const allMasterChapters = await db
        .select()
        .from(lessons)
        .where(and(inArray(lessons.subjectId, masterSubIds), isNull(lessons.userId)))
        .orderBy(lessons.sortOrder, lessons.id);

      if (allMasterChapters.length > 0) {
        // Prepare batch of personal lessons
        const newLessonValues = allMasterChapters
          .map((mCh) => {
            const personalSubId = masterToPersonalSubMap.get(mCh.subjectId);
            if (!personalSubId) return null;
            return {
              masterChapterId: mCh.id,
              subjectId: personalSubId,
              userId: sessionUser.id,
              name: mCh.name,
              sortOrder: mCh.sortOrder,
            };
          })
          .filter(Boolean) as Array<{
            masterChapterId: number;
            subjectId: number;
            userId: number;
            name: string;
            sortOrder: number;
          }>;

        const lessonRowsToInsert = newLessonValues.map(
          ({ masterChapterId, ...rest }) => rest
        );

        const insertedPersonalLessons =
          lessonRowsToInsert.length > 0
            ? await db.insert(lessons).values(lessonRowsToInsert).returning()
            : [];

        // Map master chapter ID -> newly inserted personal lesson ID
        const masterToPersonalLessonMap = new Map<number, number>();
        for (let i = 0; i < newLessonValues.length; i++) {
          masterToPersonalLessonMap.set(
            newLessonValues[i].masterChapterId,
            insertedPersonalLessons[i].id
          );
        }

        // 4. Fetch all master topics for all chapters in ONE query
        const masterChapterIds = allMasterChapters.map((c) => c.id);
        const allMasterTopics = await db
          .select()
          .from(topics)
          .where(and(inArray(topics.lessonId, masterChapterIds), isNull(topics.userId)))
          .orderBy(topics.sortOrder, topics.id);

        if (allMasterTopics.length > 0) {
          const newTopicValues = allMasterTopics
            .map((mT) => {
              if (!mT.lessonId) return null;
              const personalLessonId = masterToPersonalLessonMap.get(mT.lessonId);
              const personalSubId = masterToPersonalSubMap.get(mT.subjectId);
              if (!personalLessonId || !personalSubId) return null;
              return {
                subjectId: personalSubId,
                lessonId: personalLessonId,
                userId: sessionUser.id,
                name: mT.name,
                chapter: mT.chapter,
                notes: mT.notes,
                sortOrder: mT.sortOrder,
                status: "not_started" as const,
              };
            })
            .filter(Boolean) as Array<{
              subjectId: number;
              lessonId: number;
              userId: number;
              name: string;
              chapter: string | null;
              notes: string | null;
              sortOrder: number;
              status: "not_started";
            }>;

          // Insert in chunks of 200 to stay well within SQL limits
          const CHUNK_SIZE = 200;
          for (let i = 0; i < newTopicValues.length; i += CHUNK_SIZE) {
            const chunk = newTopicValues.slice(i, i + CHUNK_SIZE);
            await db.insert(topics).values(chunk);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error setting up student syllabus:", err);
    return { ok: false, error: "Failed to configure personal syllabus. Please try again." };
  }

  // Update session cookie
  await setSessionCookie({
    ...sessionUser,
    onboardingCompleted: true,
    streamGroup,
    examDate,
    targetStartDate,
    targetDate,
  });

  revalidatePath("/", "layout");
  revalidatePath("/syllabus");
  revalidatePath("/subjects");

  return { ok: true, redirectUrl: "/" };
}
