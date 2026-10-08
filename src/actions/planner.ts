"use server";

import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, initializeDb } from "@/db";
import { lessons, sessions, settings, subjects, topics, updateItems, updates, users } from "@/db/schema";
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
import { ensureStudentHasPersonalCurriculum } from "@/lib/studentCurriculum";
import { NCTB_CURRICULUM_DATA } from "@/lib/nctbCurriculum";

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
    let userSubjects = await db
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
      await ensureStudentHasPersonalCurriculum(user.id);
      userSubjects = await db
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
    }

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
  notes?: string | null;
  status: string; // 'not_started' | 'in_progress' | 'completed' | 'not_completed'
  isCompletedToday: boolean;
  isBacklog: boolean; // carry-forward/unfinished topic from previous days
  isMultiDay: boolean; // Bangla 1st paper 3-day topic rule
  multiDayTargetDays?: number; // 3
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
  hasBacklog: boolean;
  isBanglaFirstPaper: boolean;
}

let curriculumNotesCache: Map<string, string> | null = null;

export function getCurriculumNotesFallback(
  subjectName?: string | null,
  chapter?: string | null,
  topicName?: string | null
): string | null {
  if (!topicName) return null;
  if (!curriculumNotesCache) {
    curriculumNotesCache = new Map();
    for (const sub of NCTB_CURRICULUM_DATA) {
      for (const ch of sub.chaptersOrModules) {
        for (const top of ch.topics) {
          if (typeof top !== "string" && top.notes) {
            const tName = top.name.trim().toLowerCase();
            const sName = sub.name.trim().toLowerCase();
            const sBn = (sub.nameBn || "").trim().toLowerCase();
            const cName = ch.name.trim().toLowerCase();

            curriculumNotesCache.set(`${sName}:::${cName}:::${tName}`, top.notes);
            curriculumNotesCache.set(`${sName}:::${tName}`, top.notes);
            if (sBn) {
              curriculumNotesCache.set(`${sBn}:::${cName}:::${tName}`, top.notes);
              curriculumNotesCache.set(`${sBn}:::${tName}`, top.notes);
            }
            if (!curriculumNotesCache.has(`:::${tName}`)) {
              curriculumNotesCache.set(`:::${tName}`, top.notes);
            }
          }
        }
      }
    }
  }

  const cleanTop = topicName.trim().toLowerCase();
  const cleanSub = (subjectName || "").trim().toLowerCase();
  const cleanCh = (chapter || "").trim().toLowerCase();

  return (
    (cleanSub && cleanCh ? curriculumNotesCache.get(`${cleanSub}:::${cleanCh}:::${cleanTop}`) : null) ||
    (cleanSub ? curriculumNotesCache.get(`${cleanSub}:::${cleanTop}`) : null) ||
    curriculumNotesCache.get(`:::${cleanTop}`) ||
    null
  );
}

function isBangla1stPaper(subjectName: string, subjectNameBn?: string | null): boolean {
  const n = (subjectName + " " + (subjectNameBn || "")).toLowerCase();
  return (
    n.includes("bangla 1") ||
    n.includes("বাংলা ১ম") ||
    n.includes("bangla first") ||
    n.includes("২৩৬")
  );
}

function isBanglaMultiDayTopic(chapter?: string | null, topicName?: string | null): boolean {
  const text = ((chapter || "") + " " + (topicName || "")).toLowerCase();
  return (
    text.includes("গদ্য") ||
    text.includes("গদ্যাংশ") ||
    text.includes("পদ্য") ||
    text.includes("পদ্যাংশ") ||
    text.includes("উপন্যাস") ||
    text.includes("নাটক") ||
    text.includes("সহপাঠ") ||
    true // all literature topics in Bangla 1st paper benefit from multi-day allocation
  );
}

export interface WeeklyFridayTopicItem {
  id: number;
  name: string;
  chapter: string | null;
  notes?: string | null;
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
  totalBacklogCount: number; // accumulated in-progress or not-completed topics
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

    const settingRows = await db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(
        inArray(settings.key, [
          SETTING_EXAM_DATE,
          SETTING_TARGET_DATE,
          SETTING_TARGET_START_DATE,
        ])
      );
    const settingMap = new Map(settingRows.map((s) => [s.key, s.value]));

    const examDate = userRow[0]?.examDate || settingMap.get(SETTING_EXAM_DATE) || "2027-04-15";
    const targetDate = userRow[0]?.targetDate || settingMap.get(SETTING_TARGET_DATE) || "2027-02-28";
    const targetStartDate = userRow[0]?.targetStartDate || settingMap.get(SETTING_TARGET_START_DATE) || today;

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

    if (userSubs.length === 0) {
      await ensureStudentHasPersonalCurriculum(user.id);
      userSubs = await db
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
    }

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

    // Deduplicate userSubs by name, mapping duplicate subject IDs to the primary subject ID
    const seenSubjectNames = new Map<string, (typeof userSubs)[0]>();
    const subIdAliasMap = new Map<number, number>();

    for (const s of userSubs) {
      const key = s.name.trim().toLowerCase();
      if (!seenSubjectNames.has(key)) {
        seenSubjectNames.set(key, s);
      } else {
        const primary = seenSubjectNames.get(key)!;
        subIdAliasMap.set(s.id, primary.id);
      }
    }
    userSubs = Array.from(seenSubjectNames.values());

    // 3. Fetch topics for user
    let userTopics = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
        lessonId: topics.lessonId,
        name: topics.name,
        chapter: topics.chapter,
        sortOrder: topics.sortOrder,
        status: topics.status,
        notes: topics.notes,
        completedAt: topics.completedAt,
        lastRevisedAt: topics.lastRevisedAt,
        revisionCount: topics.revisionCount,
        nextRevisionDue: topics.nextRevisionDue,
      })
      .from(topics)
      .where(isPersonal ? eq(topics.userId, user.id) : isNull(topics.userId))
      .orderBy(topics.sortOrder, topics.id);

    // Guaranteed fallback: If personal topics are not yet available, immediately fall back to master topics
    if (userTopics.length === 0) {
      userTopics = await db
        .select({
          id: topics.id,
          subjectId: topics.subjectId,
          lessonId: topics.lessonId,
          name: topics.name,
          chapter: topics.chapter,
          sortOrder: topics.sortOrder,
          status: topics.status,
          notes: topics.notes,
          completedAt: topics.completedAt,
          lastRevisedAt: topics.lastRevisedAt,
          revisionCount: topics.revisionCount,
          nextRevisionDue: topics.nextRevisionDue,
        })
        .from(topics)
        .where(isNull(topics.userId))
        .orderBy(topics.sortOrder, topics.id);

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

    // Ensure all topics have full question notes (using curriculum lookup if DB note is empty)
    const userSubNameMap = new Map(userSubs.map((s) => [s.id, s.name]));
    for (const t of userTopics) {
      if (!t.notes || t.notes.trim() === "") {
        const subName = userSubNameMap.get(t.subjectId);
        t.notes = getCurriculumNotesFallback(subName, t.chapter, t.name);
      }
    }

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

    // Merge lastStudiedMap entries for any aliased duplicate subjects
    for (const [dupId, primId] of subIdAliasMap.entries()) {
      const dDate = lastStudiedMap.get(dupId);
      if (dDate) {
        const pDate = lastStudiedMap.get(primId);
        if (!pDate || dDate > pDate) lastStudiedMap.set(primId, dDate);
      }
    }

    // 5. Total, Completed, Remaining, Backlog
    const totalTopics = userTopics.length;
    const completedTopics = userTopics.filter((t) => t.status === "completed").length;
    const remainingTopics = totalTopics - completedTopics;
    const overallProgress = totalTopics > 0 ? completedTopics / totalTopics : 0;

    // Count accumulated backlog (in_progress or not_completed from previous study)
    const backlogTopics = userTopics.filter(
      (t) => t.status === "in_progress" || t.status === "not_completed"
    );
    const totalBacklogCount = backlogTopics.length;

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
      const targetSubId = subIdAliasMap.get(t.subjectId) || t.subjectId;
      const list = topicsBySub.get(targetSubId) || [];
      list.push({ ...t, subjectId: targetSubId });
      topicsBySub.set(targetSubId, list);
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
      backlogTopics: typeof userTopics;
      completedTodayTopics: typeof userTopics;
      isBanglaFirstPaper: boolean;
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
      const sBacklog = sTopics.filter(
        (t) => t.status === "in_progress" || t.status === "not_completed"
      );
      const sCompletedToday = sTopics.filter(
        (t) => t.status === "completed" && t.completedAt === today
      );
      const sTotal = sTopics.length;
      const sProgress = sTotal > 0 ? sCompleted / sTotal : 0;
      const lastDate = lastStudiedMap.get(s.id) || null;
      const daysSince = lastDate ? diffDays(lastDate, today) : 999;
      const isBangla = isBangla1stPaper(s.name, s.nameBn);

      if (sPending.length > 0 || sCompletedToday.length > 0) {
        // Balanced rotation score:
        // Priority 0: Backlog topics that the student started earlier MUST accumulate (+1000)
        // Priority 1: Subjects untouched longest (prevents subject neglect)
        // Priority 2: Lower progress subjects
        // Priority 3: Systematic daily rotation through all subjects
        const rotationTurn = (i + dayOfYear) % Math.max(1, userSubs.length);
        const score =
          (sBacklog.length > 0 ? 1000 : 0) +
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
          backlogTopics: sBacklog,
          completedTodayTopics: sCompletedToday,
          isBanglaFirstPaper: isBangla,
          score,
        });
      }
    }

    candidateSubjects.sort((a, b) => b.score - a.score);

    // Number of books to suggest today (3 to 5 subjects depending on candidates and daily target)
    const bookCount = Math.min(
      candidateSubjects.length,
      Math.max(3, Math.min(5, requiredTopicsPerDay || 3))
    );

    const selectedCandidates = candidateSubjects.slice(0, bookCount);

    // Distribute the exact requiredTopicsPerDay quota across selected books
    // so the total suggested topics matches the student's daily target!
    const targetMap = new Map<number, number>();
    for (const cand of selectedCandidates) {
      targetMap.set(cand.subject.id, 1);
    }

    let allocatedTotal = selectedCandidates.length;
    let extraNeeded = Math.max(0, requiredTopicsPerDay - allocatedTotal);

    let loopGuard = 0;
    while (extraNeeded > 0 && loopGuard < 50) {
      loopGuard++;
      let anyAdded = false;

      // 1st priority: distribute among non-Bangla subjects that have more pending topics
      for (const cand of selectedCandidates) {
        if (extraNeeded <= 0) break;
        if (cand.isBanglaFirstPaper) continue; // Keep Bangla 1st paper at 1 topic per day
        const currentCount = targetMap.get(cand.subject.id) || 1;
        if (currentCount < cand.pendingTopics.length) {
          targetMap.set(cand.subject.id, currentCount + 1);
          extraNeeded--;
          anyAdded = true;
        }
      }

      // 2nd fallback: if non-Bangla reached pending topics limit, distribute to any candidate with pending topics
      if (!anyAdded && extraNeeded > 0) {
        for (const cand of selectedCandidates) {
          if (extraNeeded <= 0) break;
          const currentCount = targetMap.get(cand.subject.id) || 1;
          if (currentCount < cand.pendingTopics.length) {
            targetMap.set(cand.subject.id, currentCount + 1);
            extraNeeded--;
            anyAdded = true;
          }
        }
      }

      if (!anyAdded) break;
    }

    const recommendedBooks: RecommendedBookItem[] = selectedCandidates.map((cand) => {
      const recTopics: RecommendedBookTopic[] = [];
      const isBangla = cand.isBanglaFirstPaper;

      // 1. Add completed today topics (if any)
      for (const ct of cand.completedTodayTopics) {
        recTopics.push({
          id: ct.id,
          name: ct.name,
          chapter: ct.chapter,
          notes: ct.notes,
          status: "completed",
          isCompletedToday: true,
          isBacklog: false,
          isMultiDay: isBangla,
          multiDayTargetDays: isBangla ? 3 : undefined,
        });
      }

      // 2. Add accumulated backlog topics (in_progress or not_completed) - NEVER disappear until completed
      for (const bt of cand.backlogTopics) {
        // Avoid duplicating if already added in completed today
        if (!recTopics.some((r) => r.id === bt.id)) {
          recTopics.push({
            id: bt.id,
            name: bt.name,
            chapter: bt.chapter,
            notes: bt.notes,
            status: bt.status,
            isCompletedToday: false,
            isBacklog: true,
            isMultiDay: isBangla,
            multiDayTargetDays: isBangla ? 3 : undefined,
          });
        }
      }

      // 3. Add fresh not_started topics to meet this book's allocated quota
      const targetCount = targetMap.get(cand.subject.id) || 1;
      const freshPending = cand.pendingTopics.filter(
        (t) => t.status === "not_started" && !recTopics.some((r) => r.id === t.id)
      );

      const maxFreshToAdd = Math.max(0, targetCount - recTopics.filter((t) => t.status !== "completed").length);
      for (let p = 0; p < Math.min(maxFreshToAdd, freshPending.length); p++) {
        const pt = freshPending[p];
        recTopics.push({
          id: pt.id,
          name: pt.name,
          chapter: pt.chapter,
          notes: pt.notes,
          status: pt.status,
          isCompletedToday: false,
          isBacklog: false,
          isMultiDay: isBangla,
          multiDayTargetDays: isBangla ? 3 : undefined,
        });
      }

      // Fallback: if no topics added yet, add at least 1 pending topic
      if (recTopics.length === 0 && cand.pendingTopics.length > 0) {
        const pt = cand.pendingTopics[0];
        recTopics.push({
          id: pt.id,
          name: pt.name,
          chapter: pt.chapter,
          notes: pt.notes,
          status: pt.status,
          isCompletedToday: false,
          isBacklog: pt.status === "in_progress" || pt.status === "not_completed",
          isMultiDay: isBangla,
          multiDayTargetDays: isBangla ? 3 : undefined,
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
        targetTopicCount: targetCount,
        hasBacklog: cand.backlogTopics.length > 0,
        isBanglaFirstPaper: isBangla,
      };
    });

    // Top-up pass: ensure total suggested topics matches requiredTopicsPerDay exactly
    let totalSuggestedActive = recommendedBooks.reduce(
      (sum, b) => sum + b.topics.filter((t) => t.status !== "completed").length,
      0
    );

    if (totalSuggestedActive < requiredTopicsPerDay) {
      for (const book of recommendedBooks) {
        if (totalSuggestedActive >= requiredTopicsPerDay) break;
        const cand = selectedCandidates.find((c) => c.subject.id === book.subjectId);
        if (!cand) continue;
        const freshPending = cand.pendingTopics.filter(
          (t) => t.status === "not_started" && !book.topics.some((r) => r.id === t.id)
        );
        for (const pt of freshPending) {
          if (totalSuggestedActive >= requiredTopicsPerDay) break;
          book.topics.push({
            id: pt.id,
            name: pt.name,
            chapter: pt.chapter,
            notes: pt.notes,
            status: pt.status,
            isCompletedToday: false,
            isBacklog: false,
            isMultiDay: book.isBanglaFirstPaper,
            multiDayTargetDays: book.isBanglaFirstPaper ? 3 : undefined,
          });
          book.targetTopicCount++;
          totalSuggestedActive++;
        }
      }
    }

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
      const targetSubId = subIdAliasMap.get(t.subjectId) || t.subjectId;
      const list = fridaySubMap.get(targetSubId) || [];
      list.push({
        id: t.id,
        name: t.name,
        chapter: t.chapter,
        notes: t.notes,
        completedAt: t.completedAt!,
        revisionCount: t.revisionCount || 0,
        lastRevisedAt: t.lastRevisedAt,
        isRevisedToday: t.lastRevisedAt === today,
      });
      fridaySubMap.set(targetSubId, list);
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
        totalBacklogCount,
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
    let [topic] = await db
      .select()
      .from(topics)
      .where(and(eq(topics.id, topicId), eq(topics.userId, user.id)))
      .limit(1);

    if (!topic) {
      [topic] = await db
        .select()
        .from(topics)
        .where(eq(topics.id, topicId))
        .limit(1);
    }

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
      .where(eq(topics.id, topic.id));

    // Keep activity log & streak synced
    const effectiveUserId = user?.id ?? topic.userId;
    if (effectiveUserId) {
      if (newStatus === "completed") {
        const existingItem = await db
          .select()
          .from(updateItems)
          .where(
            and(
              eq(updateItems.topicId, topic.id),
              eq(updateItems.userId, effectiveUserId),
              eq(updateItems.date, today)
            )
          )
          .limit(1);

        if (!existingItem.length) {
          let [upd] = await db
            .select()
            .from(updates)
            .where(and(eq(updates.userId, effectiveUserId), eq(updates.date, today)))
            .limit(1);

          if (!upd) {
            const [newUpd] = await db
              .insert(updates)
              .values({
                userId: effectiveUserId,
                rawText: "Daily target topic completion",
                date: today,
              })
              .returning();
            upd = newUpd;
          }

          if (upd) {
            await db.insert(updateItems).values({
              updateId: upd.id,
              userId: effectiveUserId,
              subjectId: topic.subjectId,
              topicId: topic.id,
              topicText: topic.name,
              status: "completed",
              date: today,
            });
          }
        }
      } else {
        await db
          .delete(updateItems)
          .where(
            and(
              eq(updateItems.topicId, topic.id),
              eq(updateItems.userId, effectiveUserId),
              eq(updateItems.date, today)
            )
          );
      }
    }

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
