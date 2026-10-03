import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { lessons, subjects, topics, users } from "@/db/schema";

const initializedUserSet = new Set<number>();

/**
 * Ensures a student has their own cloned copy of subjects, chapters, and topics.
 * If they already have personal subjects, this is a fast no-op.
 */
export async function ensureStudentHasPersonalCurriculum(userId: number): Promise<boolean> {
  if (initializedUserSet.has(userId)) return true;

  try {
    // 1. Check if user already has personal subjects
    const existingPersonalSubs = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.userId, userId))
      .limit(1);

    if (existingPersonalSubs.length > 0) {
      initializedUserSet.add(userId);
      return true;
    }

    // 2. Fetch user information (streamGroup, batchId)
    const [userRow] = await db
      .select({
        id: users.id,
        batchId: users.batchId,
        streamGroup: users.streamGroup,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRow) return false;

    const userStream = userRow.streamGroup || "general_madrasah";

    // 3. Fetch master subjects
    const allMasterSubs = await db
      .select()
      .from(subjects)
      .where(isNull(subjects.userId))
      .orderBy(subjects.sortOrder, subjects.id);

    if (allMasterSubs.length === 0) {
      return false;
    }

    // Filter relevant subjects for student's streamGroup
    const relevantMasterSubs = allMasterSubs.filter((b) => {
      const slug = b.slug.toLowerCase();
      if (userStream === "science") {
        return (
          !slug.includes("balaghat") &&
          !slug.includes("islamic-history") &&
          !slug.includes("civics") &&
          !slug.includes("economics") &&
          slug !== "alim-arabic-1" &&
          slug !== "alim-arabic-2"
        );
      }
      return (
        !slug.includes("physics") &&
        !slug.includes("chemistry") &&
        !slug.includes("biology") &&
        !slug.includes("higher-math") &&
        !slug.includes("arabic-science")
      );
    });

    if (relevantMasterSubs.length === 0) {
      return false;
    }

    // 4. Clone subjects for student
    const newSubjectValues = relevantMasterSubs.map((mSub) => ({
      batchId: userRow.batchId || mSub.batchId,
      userId: userId,
      name: mSub.name,
      slug: `${mSub.slug || "subject"}-${userId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
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

    const masterToPersonalSubMap = new Map<number, number>();
    for (let i = 0; i < relevantMasterSubs.length; i++) {
      masterToPersonalSubMap.set(relevantMasterSubs[i].id, insertedPersonalSubs[i].id);
    }

    // 5. Clone chapters/lessons
    const relevantSubIds = relevantMasterSubs.map((s) => s.id);
    const allMasterChapters = await db
      .select()
      .from(lessons)
      .where(and(inArray(lessons.subjectId, relevantSubIds), isNull(lessons.userId)))
      .orderBy(lessons.sortOrder, lessons.id);

    const masterToPersonalLessonMap = new Map<number, number>();

    if (allMasterChapters.length > 0) {
      const newLessonValues = allMasterChapters
        .map((mCh) => {
          const personalSubId = masterToPersonalSubMap.get(mCh.subjectId);
          if (!personalSubId) return null;
          return {
            masterChapterId: mCh.id,
            subjectId: personalSubId,
            userId: userId,
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

      for (let i = 0; i < newLessonValues.length; i++) {
        masterToPersonalLessonMap.set(
          newLessonValues[i].masterChapterId,
          insertedPersonalLessons[i].id
        );
      }
    }

    // 6. Clone all topics for student's subjects (linked by subjectId)
    const allMasterTopics = await db
      .select()
      .from(topics)
      .where(and(inArray(topics.subjectId, relevantSubIds), isNull(topics.userId)))
      .orderBy(topics.sortOrder, topics.id);

    if (allMasterTopics.length > 0) {
      const newTopicValues = allMasterTopics
        .map((mT) => {
          const personalSubId = masterToPersonalSubMap.get(mT.subjectId);
          if (!personalSubId) return null;
          const personalLessonId = mT.lessonId
            ? masterToPersonalLessonMap.get(mT.lessonId) || null
            : null;
          return {
            subjectId: personalSubId,
            lessonId: personalLessonId,
            userId: userId,
            name: mT.name,
            chapter: mT.chapter,
            notes: mT.notes,
            sortOrder: mT.sortOrder,
            status: "not_started" as const,
          };
        })
        .filter(Boolean) as Array<{
          subjectId: number;
          lessonId: number | null;
          userId: number;
          name: string;
          chapter: string | null;
          notes: string | null;
          sortOrder: number;
          status: "not_started";
        }>;

      const CHUNK_SIZE = 150;
      for (let i = 0; i < newTopicValues.length; i += CHUNK_SIZE) {
        const chunk = newTopicValues.slice(i, i + CHUNK_SIZE);
        await db.insert(topics).values(chunk);
      }
    }

    initializedUserSet.add(userId);
    return true;
  } catch (err) {
    console.error("ensureStudentHasPersonalCurriculum error:", err);
    return false;
  }
}
