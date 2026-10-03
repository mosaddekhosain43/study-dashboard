"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, initializeDb } from "@/db";
import { lessons, sessions, settings, subjects, topics, updateItems, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getExamConfig } from "@/lib/queries";
import {
  calculateNextRevisionDue,
  generateStudentStudyPlan,
  type PlannerTopicItem,
  type StudentStudyPlan,
} from "@/lib/studyPlanner";
import { addDays, diffDays, parseKey, startOfWeek, todayKey } from "@/lib/dates";
import {
  SETTING_EXAM_DATE,
  SETTING_TARGET_DATE,
  SETTING_TARGET_START_DATE,
} from "@/lib/constants";

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

export interface RecommendedBookTopic {
  id: number;
  name: string;
  chapter: string | null;
  status: string;
  isCompletedToday: boolean;
}

export interface RecommendedBookItem {
  subjectId: number;
  subjectName: string;
  subjectNameBn: string | null;
  sortOrder: number;
  totalTopics: number;
  completedTopics: number;
  progress: number;
  topics: RecommendedBookTopic[];
  targetTopicCount: number;
}

export interface WeeklyFridayTopicItem {
  id: number;
  name: string;
  chapter: string | null;
  completedAt: string;
  revisionCount: number;
  lastRevisedAt: string | null;
  isRevisedToday: boolean;
}

export interface WeeklyFridaySubjectGroup {
  subjectId: number;
  subjectName: string;
  subjectNameBn: string | null;
  topics: WeeklyFridayTopicItem[];
}

export interface StudentDailyTargetPlanData {
  examDate: string;
  targetDate: string;
  targetStartDate: string;
  daysToExam: number;
  daysToTarget: number;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  overallProgress: number;
  requiredTopicsPerDay: number;
  exactPacePerDay: number;
  doneToday: number;
  isTargetMetToday: boolean;
  recommendedBooks: RecommendedBookItem[];
  allActiveSubjects: { id: number; name: string; nameBn: string | null }[];
  fridayRevision: {
    isFriday: boolean;
    weekStart: string;
    weekEnd: string;
    totalCompletedThisWeek: number;
    totalRevisedThisWeek: number;
    subjects: WeeklyFridaySubjectGroup[];
  };
}

export async function getStudentDailyTargetPlanAction(): Promise<{
  ok: boolean;
  data?: StudentDailyTargetPlanData;
  error?: string;
}> {
  await initializeDb();
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in to view your daily plan." };
  }

  try {
    const today = todayKey();
    const isFriday = new Date().getDay() === 5;
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 6);

    // 1. Fetch user dates
    const userRow = await db
      .select({
        examDate: users.examDate,
        targetStartDate: users.targetStartDate,
        targetDate: users.targetDate,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const [examSetting, targetSetting, targetStartSetting] = await Promise.all([
      db.select().from(settings).where(eq(settings.key, SETTING_EXAM_DATE)).limit(1),
      db.select().from(settings).where(eq(settings.key, SETTING_TARGET_DATE)).limit(1),
      db.select().from(settings).where(eq(settings.key, SETTING_TARGET_START_DATE)).limit(1),
    ]);

    const examDate = userRow[0]?.examDate || examSetting[0]?.value || "2027-04-15";
    const targetDate = userRow[0]?.targetDate || targetSetting[0]?.value || "2027-02-28";
    const targetStartDate = userRow[0]?.targetStartDate || targetStartSetting[0]?.value || today;

    const daysToExam = Math.max(0, diffDays(today, examDate));
    const daysToTarget = Math.max(1, diffDays(today, targetDate));

    // 2. Fetch subjects for user (or fallback to master if not cloned yet)
    let userSubs = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        nameBn: subjects.nameBn,
        sortOrder: subjects.sortOrder,
        subjectType: subjects.subjectType,
      })
      .from(subjects)
      .where(eq(subjects.userId, user.id))
      .orderBy(subjects.sortOrder, subjects.id);

    const isPersonal = userSubs.length > 0;
    if (!isPersonal) {
      userSubs = await db
        .select({
          id: subjects.id,
          name: subjects.name,
          nameBn: subjects.nameBn,
          sortOrder: subjects.sortOrder,
          subjectType: subjects.subjectType,
        })
        .from(subjects)
        .where(isNull(subjects.userId))
        .orderBy(subjects.sortOrder, subjects.id);
    }

    // 3. Fetch topics for user
    const userTopics = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
        lessonId: topics.lessonId,
        name: topics.name,
        chapter: topics.chapter,
        sortOrder: topics.sortOrder,
        status: topics.status,
        completedAt: topics.completedAt,
        lastRevisedAt: topics.lastRevisedAt,
        revisionCount: topics.revisionCount,
        nextRevisionDue: topics.nextRevisionDue,
      })
      .from(topics)
      .where(isPersonal ? eq(topics.userId, user.id) : isNull(topics.userId))
      .orderBy(topics.sortOrder, topics.id);

    // 4. Activity history for subjects (lastStudied date)
    const [subLastItemRows, subLastSessionRows] = await Promise.all([
      db
        .select({
          subjectId: updateItems.subjectId,
          lastDate: sql<string | null>`max(${updateItems.date})`,
        })
        .from(updateItems)
        .where(eq(updateItems.userId, user.id))
        .groupBy(updateItems.subjectId),
      db
        .select({
          subjectId: sessions.subjectId,
          lastDate: sql<string | null>`max(${sessions.date})`,
        })
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .groupBy(sessions.subjectId),
    ]);

    const lastStudiedMap = new Map<number, string>();
    for (const r of subLastItemRows) {
      if (r.subjectId && r.lastDate) lastStudiedMap.set(r.subjectId, r.lastDate);
    }
    for (const r of subLastSessionRows) {
      if (r.subjectId && r.lastDate) {
        const prev = lastStudiedMap.get(r.subjectId);
        if (!prev || r.lastDate > prev) lastStudiedMap.set(r.subjectId, r.lastDate);
      }
    }
    for (const t of userTopics) {
      if (t.completedAt) {
        const prev = lastStudiedMap.get(t.subjectId);
        if (!prev || t.completedAt > prev) lastStudiedMap.set(t.subjectId, t.completedAt);
      }
    }

    // 5. Total, Completed, Remaining
    const totalTopics = userTopics.length;
    const completedTopics = userTopics.filter((t) => t.status === "completed").length;
    const remainingTopics = totalTopics - completedTopics;
    const overallProgress = totalTopics > 0 ? completedTopics / totalTopics : 0;

    // Pace calculation: exactly how many topics per day are needed to hit the student's target!
    const exactPacePerDay = remainingTopics > 0 ? remainingTopics / daysToTarget : 0;
    const requiredTopicsPerDay =
      remainingTopics <= 0 ? 0 : Math.max(1, Math.ceil(exactPacePerDay));

    // Today's completed topics
    const doneToday = userTopics.filter(
      (t) => t.status === "completed" && t.completedAt === today
    ).length;
    const isTargetMetToday = remainingTopics === 0 || doneToday >= requiredTopicsPerDay;

    // 6. Group topics by subject and pick recommended books for today
    const topicsBySub = new Map<number, typeof userTopics>();
    for (const t of userTopics) {
      const list = topicsBySub.get(t.subjectId) || [];
      list.push(t);
      topicsBySub.set(t.subjectId, list);
    }

    interface SubjectCandidate {
      subject: (typeof userSubs)[0];
      total: number;
      completed: number;
      remaining: number;
      progress: number;
      lastStudied: string | null;
      daysSinceLastStudied: number;
      pendingTopics: typeof userTopics;
      completedTodayTopics: typeof userTopics;
      score: number;
    }

    const candidateSubjects: SubjectCandidate[] = [];
    const dayOfYear = Math.floor(
      (parseKey(today).getTime() - new Date(2026, 0, 1).getTime()) / 86400000
    );

    for (let i = 0; i < userSubs.length; i++) {
      const s = userSubs[i];
      const sTopics = topicsBySub.get(s.id) || [];
      const sCompleted = sTopics.filter((t) => t.status === "completed").length;
      const sPending = sTopics.filter((t) => t.status !== "completed");
      const sCompletedToday = sTopics.filter(
        (t) => t.status === "completed" && t.completedAt === today
      );
      const sTotal = sTopics.length;
      const sProgress = sTotal > 0 ? sCompleted / sTotal : 0;
      const lastDate = lastStudiedMap.get(s.id) || null;
      const daysSince = lastDate ? diffDays(lastDate, today) : 999;

      if (sPending.length > 0 || sCompletedToday.length > 0) {
        // Balanced rotation score:
        // Priority 1: Subjects untouched longest (prevents subject neglect)
        // Priority 2: Lower progress subjects
        // Priority 3: Systematic daily rotation through all subjects
        const rotationTurn = (i + dayOfYear) % Math.max(1, userSubs.length);
        const score =
          daysSince * 20 +
          (1 - sProgress) * 50 +
          rotationTurn * 5 +
          (sCompletedToday.length > 0 ? 300 : 0);

        candidateSubjects.push({
          subject: s,
          total: sTotal,
          completed: sCompleted,
          remaining: sPending.length,
          progress: sProgress,
          lastStudied: lastDate,
          daysSinceLastStudied: daysSince,
          pendingTopics: sPending,
          completedTodayTopics: sCompletedToday,
          score,
        });
      }
    }

    candidateSubjects.sort((a, b) => b.score - a.score);

    // Number of books to suggest today (2 to 4 subjects)
    const bookCount = Math.min(
      candidateSubjects.length,
      Math.max(2, Math.min(4, requiredTopicsPerDay || 2))
    );

    const selectedCandidates = candidateSubjects.slice(0, bookCount);

    const recommendedBooks: RecommendedBookItem[] = selectedCandidates.map((cand) => {
      const recTopics: RecommendedBookTopic[] = [];

      for (const ct of cand.completedTodayTopics) {
        recTopics.push({
          id: ct.id,
          name: ct.name,
          chapter: ct.chapter,
          status: "completed",
          isCompletedToday: true,
        });
      }

      const pendingNeeded = Math.max(1, 2 - recTopics.length);
      for (let p = 0; p < Math.min(pendingNeeded, cand.pendingTopics.length); p++) {
        const pt = cand.pendingTopics[p];
        recTopics.push({
          id: pt.id,
          name: pt.name,
          chapter: pt.chapter,
          status: pt.status,
          isCompletedToday: false,
        });
      }

      return {
        subjectId: cand.subject.id,
        subjectName: cand.subject.name,
        subjectNameBn: cand.subject.nameBn,
        sortOrder: cand.subject.sortOrder,
        totalTopics: cand.total,
        completedTopics: cand.completed,
        progress: cand.progress,
        topics: recTopics,
        targetTopicCount: Math.max(1, Math.floor(requiredTopicsPerDay / (bookCount || 1)) || 1),
      };
    });

    // 7. Weekly Friday Revision: Gather all topics completed this week
    const completedThisWeekTopics = userTopics.filter(
      (t) =>
        t.status === "completed" &&
        t.completedAt &&
        t.completedAt >= weekStart &&
        t.completedAt <= weekEnd
    );

    const fridaySubMap = new Map<number, WeeklyFridayTopicItem[]>();
    for (const t of completedThisWeekTopics) {
      const list = fridaySubMap.get(t.subjectId) || [];
      list.push({
        id: t.id,
        name: t.name,
        chapter: t.chapter,
        completedAt: t.completedAt!,
        revisionCount: t.revisionCount || 0,
        lastRevisedAt: t.lastRevisedAt,
        isRevisedToday: t.lastRevisedAt === today,
      });
      fridaySubMap.set(t.subjectId, list);
    }

    const fridaySubjects: WeeklyFridaySubjectGroup[] = [];
    for (const s of userSubs) {
      const subTops = fridaySubMap.get(s.id);
      if (subTops && subTops.length > 0) {
        fridaySubjects.push({
          subjectId: s.id,
          subjectName: s.name,
          subjectNameBn: s.nameBn,
          topics: subTops,
        });
      }
    }

    const totalCompletedThisWeek = completedThisWeekTopics.length;
    const totalRevisedThisWeek = completedThisWeekTopics.filter(
      (t) => t.lastRevisedAt && t.lastRevisedAt >= weekStart
    ).length;

    const allActiveSubjects = userSubs.map((s) => ({
      id: s.id,
      name: s.name,
      nameBn: s.nameBn,
    }));

    return {
      ok: true,
      data: {
        examDate,
        targetDate,
        targetStartDate,
        daysToExam,
        daysToTarget,
        totalTopics,
        completedTopics,
        remainingTopics,
        overallProgress,
        requiredTopicsPerDay,
        exactPacePerDay: Math.round(exactPacePerDay * 10) / 10,
        doneToday,
        isTargetMetToday,
        recommendedBooks,
        allActiveSubjects,
        fridayRevision: {
          isFriday,
          weekStart,
          weekEnd,
          totalCompletedThisWeek,
          totalRevisedThisWeek,
          subjects: fridaySubjects,
        },
      },
    };
  } catch (err: any) {
    console.error("getStudentDailyTargetPlanAction error:", err);
    return { ok: false, error: err?.message || "Failed to load daily target plan." };
  }
}

export async function toggleTopicCompleteAction(topicId: number): Promise<{
  ok: boolean;
  newStatus?: string;
  completedAt?: string | null;
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

    const today = todayKey();
    const newStatus = topic.status === "completed" ? "not_started" : "completed";
    const completedAt = newStatus === "completed" ? today : null;

    await db
      .update(topics)
      .set({
        status: newStatus,
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, topicId));

    revalidatePath("/");
    revalidatePath("/planner");
    revalidatePath("/weekly");
    revalidatePath("/subjects");

    return { ok: true, newStatus, completedAt };
  } catch (err: any) {
    console.error("toggleTopicCompleteAction error:", err);
    return { ok: false, error: err?.message || "Failed to update topic status." };
  }
}
