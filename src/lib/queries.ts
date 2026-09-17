import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db, initializeDb } from "@/db";
import {
  batches,
  batchMaterials,
  batchMessages,
  sessions,
  settings,
  subjects,
  topics,
  updateItems,
  updates,
  users,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  SETTING_EXAM_DATE,
  SETTING_TARGET_DATE,
  SUBJECT_DEFS,
  type StudyStatus,
} from "@/lib/constants";
import {
  addDays,
  dateKey,
  diffDays,
  examDefaults,
  startOfWeek,
  todayKey,
  weekDates,
} from "@/lib/dates";

// ── Seeding ─────────────────────────────────────────────────────────────────

export async function ensureSeeded() {
  await initializeDb();
  const g = globalThis as { __alimSeeded?: boolean };
  if (g.__alimSeeded) return;
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .limit(1);
  if (rows.length === 0) {
    await db.insert(subjects).values(
      SUBJECT_DEFS.map((s, i) => ({
        name: s.name,
        slug: s.slug,
        nameBn: s.nameBn,
        sortOrder: i + 1,
      })),
    );
  }
  g.__alimSeeded = true;
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? null;
}

export interface ExamConfig {
  examDate: string;
  targetDate: string;
  daysToExam: number;
  daysToTarget: number;
}

export async function getExamConfig(): Promise<ExamConfig> {
  await ensureSeeded();
  const d = examDefaults();
  const examDate = (await getSetting(SETTING_EXAM_DATE)) ?? d.examDate;
  const targetDate = (await getSetting(SETTING_TARGET_DATE)) ?? d.targetDate;
  const t = todayKey();
  return {
    examDate,
    targetDate,
    daysToExam: Math.max(0, diffDays(t, examDate)),
    daysToTarget: Math.max(0, diffDays(t, targetDate)),
  };
}

// ── Shared DTOs ─────────────────────────────────────────────────────────────

export interface SubjectDto {
  id: number;
  name: string;
  slug: string;
  nameBn: string | null;
  sortOrder: number;
}

export interface TopicDto {
  id: number;
  subjectId: number;
  subjectName: string;
  name: string;
  chapter: string | null;
  status: StudyStatus;
  notes: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface ItemDto {
  id: number;
  updateId: number;
  subjectId: number | null;
  subjectName: string;
  topicId: number | null;
  label: string; // topicName or topicText or "General study"
  status: StudyStatus;
  minutes: number | null;
  notes: string | null;
  date: string;
}

export async function getSubjects(): Promise<SubjectDto[]> {
  await ensureSeeded();
  return db.select().from(subjects).orderBy(subjects.sortOrder, subjects.id);
}

function toStatus(s: string): StudyStatus {
  return s === "completed" || s === "in_progress" || s === "not_completed"
    ? s
    : "not_started";
}

// ── Subject stats ───────────────────────────────────────────────────────────

export interface SubjectStats {
  subject: SubjectDto;
  total: number;
  completed: number;
  inProgress: number;
  notCompleted: number;
  notStarted: number;
  remaining: number;
  progress: number; // 0..1
  lastStudied: string | null; // date key
  minutes: number;
}

export async function getSubjectStats(): Promise<SubjectStats[]> {
  await ensureSeeded();
  const [subs, tops, itemActs, sessActs, sessMins] = await Promise.all([
    db.select().from(subjects).orderBy(subjects.sortOrder, subjects.id),
    db.select().from(topics),
    db
      .select({
        subjectId: updateItems.subjectId,
        lastDate: sql<string | null>`max(${updateItems.date})`,
      })
      .from(updateItems)
      .groupBy(updateItems.subjectId),
    db
      .select({
        subjectId: sessions.subjectId,
        lastDate: sql<string | null>`max(${sessions.date})`,
        minutes: sql<number>`coalesce(sum(${sessions.minutes}), 0)`,
      })
      .from(sessions)
      .groupBy(sessions.subjectId),
    db
      .select({
        subjectId: updateItems.subjectId,
        minutes: sql<number>`coalesce(sum(${updateItems.minutes}), 0)`,
      })
      .from(updateItems)
      .groupBy(updateItems.subjectId),
  ]);

  const lastMap = new Map<number, string>();
  for (const r of itemActs) {
    if (r.subjectId && r.lastDate) lastMap.set(r.subjectId, r.lastDate);
  }
  const minutesMap = new Map<number, number>();
  for (const r of sessActs) {
    if (r.subjectId) {
      minutesMap.set(r.subjectId, Number(r.minutes));
      const prev = lastMap.get(r.subjectId);
      if (r.lastDate && (!prev || r.lastDate > prev)) lastMap.set(r.subjectId, r.lastDate);
    }
  }
  for (const r of sessMins) {
    if (r.subjectId)
      minutesMap.set(r.subjectId, (minutesMap.get(r.subjectId) ?? 0) + Number(r.minutes));
  }

  return subs.map((s) => {
    const mine = tops.filter((t) => t.subjectId === s.id);
    const completed = mine.filter((t) => t.status === "completed").length;
    const inProgress = mine.filter((t) => t.status === "in_progress").length;
    const notCompleted = mine.filter((t) => t.status === "not_completed").length;
    const notStarted = mine.filter((t) => t.status === "not_started").length;
    const total = mine.length;
    return {
      subject: s,
      total,
      completed,
      inProgress,
      notCompleted,
      notStarted,
      remaining: total - completed,
      progress: total > 0 ? completed / total : 0,
      lastStudied: lastMap.get(s.id) ?? null,
      minutes: minutesMap.get(s.id) ?? 0,
    };
  });
}

// ── Streak ──────────────────────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  const [irows, srows] = await Promise.all([
    db.selectDistinct({ date: updateItems.date }).from(updateItems),
    db.selectDistinct({ date: sessions.date }).from(sessions),
  ]);
  const days = new Set<string>([...irows.map((r) => r.date), ...srows.map((r) => r.date)]);
  if (days.size === 0) return 0;
  let cursor = todayKey();
  // allow the streak to be "alive" from yesterday if today has no entry yet
  if (!days.has(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function getActiveDatesLastNDays(n: number): Promise<Map<string, number>> {
  const from = addDays(todayKey(), -(n - 1));
  const [irows, srows] = await Promise.all([
    db
      .select({ date: updateItems.date, c: sql<number>`count(*)` })
      .from(updateItems)
      .where(gte(updateItems.date, from))
      .groupBy(updateItems.date),
    db
      .select({ date: sessions.date, m: sql<number>`coalesce(sum(${sessions.minutes}),0)` })
      .from(sessions)
      .where(gte(sessions.date, from))
      .groupBy(sessions.date),
  ]);
  const map = new Map<string, number>();
  for (const r of irows) map.set(r.date, Number(r.c));
  for (const r of srows) {
    map.set(r.date, (map.get(r.date) ?? 0) + (Number(r.m) > 0 ? 1 : 0));
  }
  return map;
}

// ── Minutes per day / week ──────────────────────────────────────────────────

export async function getMinutesForDate(date: string): Promise<number> {
  const [s, i] = await Promise.all([
    db
      .select({ m: sql<number>`coalesce(sum(${sessions.minutes}),0)` })
      .from(sessions)
      .where(eq(sessions.date, date)),
    db
      .select({ m: sql<number>`coalesce(sum(${updateItems.minutes}),0)` })
      .from(updateItems)
      .where(eq(updateItems.date, date)),
  ]);
  return Number(s[0]?.m ?? 0) + Number(i[0]?.m ?? 0);
}

export async function getMinutesByDay(from: string, to: string): Promise<Map<string, number>> {
  const [srows, irows] = await Promise.all([
    db
      .select({ date: sessions.date, m: sql<number>`coalesce(sum(${sessions.minutes}),0)` })
      .from(sessions)
      .where(and(gte(sessions.date, from), lte(sessions.date, to)))
      .groupBy(sessions.date),
    db
      .select({ date: updateItems.date, m: sql<number>`coalesce(sum(${updateItems.minutes}),0)` })
      .from(updateItems)
      .where(and(gte(updateItems.date, from), lte(updateItems.date, to)))
      .groupBy(updateItems.date),
  ]);
  const map = new Map<string, number>();
  for (const r of srows) map.set(r.date, Number(r.m));
  for (const r of irows) map.set(r.date, (map.get(r.date) ?? 0) + Number(r.m));
  return map;
}

// ── Recent updates ──────────────────────────────────────────────────────────

export interface UpdateDto {
  id: number;
  rawText: string;
  date: string;
  createdAt: string;
  items: ItemDto[];
}

function itemToDto(r: {
  id: number; updateId: number; subjectId: number | null;
  topicId: number | null; topicText: string | null; status: string;
  minutes: number | null; notes: string | null; date: string;
  subjectName?: string | null; topicName?: string | null;
}): ItemDto {
  return {
    id: r.id,
    updateId: r.updateId,
    subjectId: r.subjectId,
    subjectName: r.subjectName ?? "—",
    topicId: r.topicId,
    label: r.topicName ?? (r.topicText?.trim() ? r.topicText : "General study"),
    status: toStatus(r.status),
    minutes: r.minutes,
    notes: r.notes,
    date: r.date,
  };
}

export async function getRecentUpdates(limit = 10): Promise<UpdateDto[]> {
  const rows = await db
    .select()
    .from(updates)
    .orderBy(desc(updates.date), desc(updates.createdAt))
    .limit(limit);
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const items = await db
    .select({
      id: updateItems.id, updateId: updateItems.updateId,
      subjectId: updateItems.subjectId, topicId: updateItems.topicId,
      topicText: updateItems.topicText, status: updateItems.status,
      minutes: updateItems.minutes, notes: updateItems.notes, date: updateItems.date,
      subjectName: subjects.name, topicName: topics.name,
    })
    .from(updateItems)
    .leftJoin(subjects, eq(updateItems.subjectId, subjects.id))
    .leftJoin(topics, eq(updateItems.topicId, topics.id))
    .where(inArray(updateItems.updateId, ids));
  return rows.map((u) => ({
    id: u.id,
    rawText: u.rawText,
    date: u.date,
    createdAt: u.createdAt.toISOString(),
    items: items.filter((i) => i.updateId === u.id).map(itemToDto),
  }));
}

// ── Targets, pace, alerts ───────────────────────────────────────────────────

export interface TargetInfo {
  remainingTopics: number;
  remainingDays: number;
  perDay: number;
  todayTarget: number;
  doneToday: number;
  weekTarget: number;
  doneThisWeek: number;
  behindThisWeek: number;
  catchUpPerDay: number; // extra topics/day over remaining week days
  projectedDate: string | null;
  onTrack: boolean;
}

export async function getTargetInfo(): Promise<TargetInfo> {
  const cfg = await getExamConfig();
  const [tops, todayDoneRows, weekDoneRows, last14Rows] = await Promise.all([
    db.select().from(topics),
    db
      .select({ c: sql<number>`count(*)` })
      .from(updateItems)
      .where(and(eq(updateItems.date, todayKey()), eq(updateItems.status, "completed"))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(updateItems)
      .where(and(gte(updateItems.date, startOfWeek(todayKey())), eq(updateItems.status, "completed"))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(updateItems)
      .where(and(gte(updateItems.date, addDays(todayKey(), -13)), eq(updateItems.status, "completed"))),
  ]);

  const total = tops.length;
  const remaining = tops.filter((t) => t.status !== "completed").length;
  const remainingDays = Math.max(1, cfg.daysToTarget);
  const perDay = total === 0 ? 0 : remaining / remainingDays;
  const todayTarget = remaining > 0 ? Math.max(1, Math.ceil(perDay)) : 0;
  const doneToday = Number(todayDoneRows[0]?.c ?? 0);
  const weekTarget = Math.ceil(perDay * 7);
  const doneThisWeek = Number(weekDoneRows[0]?.c ?? 0);
  const behindThisWeek = Math.max(0, weekTarget - doneThisWeek);
  const dayOfWeek = (new Date().getDay() + 1) % 7; // 0 = Saturday
  const daysLeftInWeek = Math.max(1, 7 - dayOfWeek);
  const catchUpPerDay = Math.min(2, Math.ceil(behindThisWeek / daysLeftInWeek));

  // pace: completions in last 14 days → projected finish
  const recent = Number(last14Rows[0]?.c ?? 0);
  const velocity = recent / 14;
  let projectedDate: string | null = null;
  let onTrack = true;
  if (total > 0 && remaining > 0) {
    if (velocity > 0) {
      projectedDate = addDays(todayKey(), Math.ceil(remaining / velocity));
      onTrack = projectedDate <= cfg.targetDate;
    } else {
      onTrack = false;
    }
  }

  return {
    remainingTopics: remaining,
    remainingDays,
    perDay: Math.round(perDay * 10) / 10,
    todayTarget,
    doneToday,
    weekTarget,
    doneThisWeek,
    behindThisWeek,
    catchUpPerDay,
    projectedDate,
    onTrack,
  };
}

export interface Alert {
  id: string;
  kind: "warn" | "info" | "success";
  title: string;
  detail: string;
}

export async function getAlerts(): Promise<Alert[]> {
  const [stats, cfg, target, streak] = await Promise.all([
    getSubjectStats(),
    getExamConfig(),
    getTargetInfo(),
    getStreak(),
  ]);
  const t = todayKey();
  const alerts: Alert[] = [];
  const anyActivity = stats.some((s) => s.lastStudied !== null);

  if (anyActivity) {
    for (const s of stats) {
      if (s.lastStudied) {
        const daysSince = diffDays(s.lastStudied, t);
        if (daysSince >= 3) {
          alerts.push({
            id: `stale-${s.subject.id}`,
            kind: "warn",
            title: `${s.subject.name} untouched for ${daysSince} days`,
            detail: "A short session today will keep the subject fresh.",
          });
        }
      }
    }
  }

  const overall = overallFromStats(stats);
  for (const s of stats) {
    if (s.total >= 3 && overall > 0 && s.progress < Math.max(0, overall - 0.25)) {
      alerts.push({
        id: `behind-${s.subject.id}`,
        kind: "warn",
        title: `${s.subject.name} is falling behind`,
        detail: `${Math.round(s.progress * 100)}% vs overall ${Math.round(overall * 100)}%.`,
      });
    }
  }

  if (target.remainingTopics > 0) {
    if (target.onTrack && target.projectedDate) {
      alerts.push({
        id: "pace-ok",
        kind: "success",
        title: "You are on track",
        detail: `At your current pace you finish around ${target.projectedDate}, before your ${cfg.targetDate} target.`,
      });
    } else if (target.behindThisWeek > 0) {
      const extra = target.catchUpPerDay;
      alerts.push({
        id: "pace-behind",
        kind: "info",
        title: `Catch-up: ${target.behindThisWeek} topic${target.behindThisWeek === 1 ? "" : "s"} behind this week`,
        detail: extra > 0
          ? `Add ~${extra} extra topic${extra === 1 ? "" : "s"} per remaining day of this week.`
          : "A small daily push will close the gap.",
      });
    }
  }

  if (streak >= 3) {
    alerts.push({
      id: "streak",
      kind: "success",
      title: `${streak}-day study streak`,
      detail: "Consistency wins exams — keep it alive today.",
    });
  }

  const order = { warn: 0, info: 1, success: 2 };
  return alerts.sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 6);
}

function overallFromStats(stats: SubjectStats[]): number {
  const total = stats.reduce((a, s) => a + s.total, 0);
  const done = stats.reduce((a, s) => a + s.completed, 0);
  return total > 0 ? done / total : 0;
}

// ── Page payloads ───────────────────────────────────────────────────────────

export interface DashboardData {
  stats: SubjectStats[];
  total: number;
  completed: number;
  inProgress: number;
  notCompleted: number;
  notStarted: number;
  remaining: number;
  progress: number;
  todayMinutes: number;
  streak: number;
  exam: ExamConfig;
  target: TargetInfo;
  alerts: Alert[];
  recent: UpdateDto[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const stats = await getSubjectStats();
  const total = stats.reduce((a, s) => a + s.total, 0);
  const completed = stats.reduce((a, s) => a + s.completed, 0);
  const inProgress = stats.reduce((a, s) => a + s.inProgress, 0);
  const notCompleted = stats.reduce((a, s) => a + s.notCompleted, 0);
  const notStarted = stats.reduce((a, s) => a + s.notStarted, 0);
  const [todayMinutes, streak, exam, target, alerts, recent] = await Promise.all([
    getMinutesForDate(todayKey()),
    getStreak(),
    getExamConfig(),
    getTargetInfo(),
    getAlerts(),
    getRecentUpdates(6),
  ]);
  return {
    stats,
    total,
    completed,
    inProgress,
    notCompleted,
    notStarted,
    remaining: total - completed,
    progress: total > 0 ? completed / total : 0,
    todayMinutes,
    streak,
    exam,
    target,
    alerts,
    recent,
  };
}

export async function getSubjectDetail(subjectId: number) {
  await ensureSeeded();
  const sub = await db.select().from(subjects).where(eq(subjects.id, subjectId));
  if (sub.length === 0) return null;
  const tops = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, subjectId))
    .orderBy(topics.sortOrder, topics.id);
  const subjectName = sub[0].name;
  const items = await db
    .select({
      id: updateItems.id, updateId: updateItems.updateId,
      subjectId: updateItems.subjectId, topicId: updateItems.topicId,
      topicText: updateItems.topicText, status: updateItems.status,
      minutes: updateItems.minutes, notes: updateItems.notes, date: updateItems.date,
      topicName: topics.name,
    })
    .from(updateItems)
    .leftJoin(topics, eq(updateItems.topicId, topics.id))
    .where(eq(updateItems.subjectId, subjectId))
    .orderBy(desc(updateItems.date), desc(updateItems.id))
    .limit(30);
  const mins = await db
    .select({ m: sql<number>`coalesce(sum(${sessions.minutes}),0)` })
    .from(sessions)
    .where(eq(sessions.subjectId, subjectId));

  return {
    subject: sub[0] as SubjectDto,
    topics: tops.map((t): TopicDto => ({
      id: t.id, subjectId: t.subjectId, subjectName,
      name: t.name, chapter: t.chapter, status: toStatus(t.status),
      notes: t.notes, completedAt: t.completedAt,
      updatedAt: t.updatedAt.toISOString(),
    })),
    recentItems: items.map((r) => itemToDto({ ...r, subjectName })),
    totalMinutes: Number(mins[0]?.m ?? 0),
  };
}

export interface RemainingGroup {
  subject: SubjectDto;
  items: TopicDto[];
}

export async function getRemaining(): Promise<RemainingGroup[]> {
  await ensureSeeded();
  const subs = await db.select().from(subjects).orderBy(subjects.sortOrder, subjects.id);
  const tops = await db
    .select()
    .from(topics)
    .where(inArray(topics.status, ["not_started", "in_progress", "not_completed"]))
    .orderBy(topics.sortOrder, topics.id);
  const groups: RemainingGroup[] = [];
  for (const s of subs) {
    const mine = tops.filter((t) => t.subjectId === s.id).map((t): TopicDto => ({
      id: t.id, subjectId: t.subjectId, subjectName: s.name,
      name: t.name, chapter: t.chapter, status: toStatus(t.status),
      notes: t.notes, completedAt: t.completedAt, updatedAt: t.updatedAt.toISOString(),
    }));
    if (mine.length > 0) groups.push({ subject: s, items: mine });
  }
  return groups;
}

// ── Daily log ───────────────────────────────────────────────────────────────

export interface DayLog {
  date: string;
  minutes: number;
  updates: UpdateDto[];
  sessions: { id: number; subjectName: string; minutes: number; note: string | null }[];
  completed: number;
  inProgress: number;
  notCompleted: number;
  notStarted: number;
  subjectsStudied: string[];
}

export async function getDayLog(date: string): Promise<DayLog> {
  const updRows = await db
    .select()
    .from(updates)
    .where(eq(updates.date, date))
    .orderBy(desc(updates.createdAt));
  const ids = updRows.map((r) => r.id);
  let items: (typeof updateItems.$inferSelect & { subjectName: string | null; topicName: string | null })[] = [];
  if (ids.length) {
    items = (await db
      .select({
        id: updateItems.id, updateId: updateItems.updateId,
        subjectId: updateItems.subjectId, topicId: updateItems.topicId,
        topicText: updateItems.topicText, status: updateItems.status,
        minutes: updateItems.minutes, notes: updateItems.notes, date: updateItems.date,
        createdAt: updateItems.createdAt,
        subjectName: subjects.name, topicName: topics.name,
      })
      .from(updateItems)
      .leftJoin(subjects, eq(updateItems.subjectId, subjects.id))
      .leftJoin(topics, eq(updateItems.topicId, topics.id))
      .where(inArray(updateItems.updateId, ids))) as typeof items;
  }
  const sess = await db
    .select({
      id: sessions.id, minutes: sessions.minutes, note: sessions.note,
      subjectName: subjects.name,
    })
    .from(sessions)
    .leftJoin(subjects, eq(sessions.subjectId, subjects.id))
    .where(eq(sessions.date, date))
    .orderBy(sessions.startedAt);

  const statusOf = (s: string) => toStatus(s);
  const byStatus = { completed: 0, in_progress: 0, not_completed: 0, not_started: 0 };
  const subjSet = new Set<string>();
  for (const it of items) {
    if (it.status !== "not_started") byStatus[statusOf(it.status) as keyof typeof byStatus]++;
    if (it.subjectName && it.status !== "not_started") subjSet.add(it.subjectName);
  }
  for (const s of sess) if (s.subjectName) subjSet.add(s.subjectName);

  const minutes =
    sess.reduce((a, s) => a + s.minutes, 0) +
    items.reduce((a, i) => a + (i.minutes ?? 0), 0);

  return {
    date,
    minutes,
    updates: updRows.map((u) => ({
      id: u.id, rawText: u.rawText, date: u.date,
      createdAt: u.createdAt.toISOString(),
      items: items.filter((i) => i.updateId === u.id).map(itemToDto),
    })),
    sessions: sess.map((s) => ({
      id: s.id, subjectName: s.subjectName ?? "—", minutes: s.minutes, note: s.note,
    })),
    completed: byStatus.completed,
    inProgress: byStatus.in_progress,
    notCompleted: byStatus.not_completed,
    notStarted: byStatus.not_started,
    subjectsStudied: Array.from(subjSet),
  };
}

// ── Weekly review ───────────────────────────────────────────────────────────

export interface WeekReview {
  weekStart: string;
  days: { date: string; minutes: number }[];
  totalMinutes: number;
  prevTotalMinutes: number;
  topicsCompleted: { subjectName: string; label: string; date: string }[];
  subjectsStudied: { id: number; name: string; minutes: number }[];
  subjectsNeglected: { id: number; name: string }[];
  remainingTotal: number;
  progressDelta: number; // fraction of syllabus completed this week
  isCurrentWeek: boolean;
}

export async function getWeekReview(weekStart: string): Promise<WeekReview> {
  await ensureSeeded();
  const days = weekDates(weekStart);
  const to = days[6];
  const minuteMap = await getMinutesByDay(days[0], to);
  const prevStart = addDays(weekStart, -7);
  const prevMap = await getMinutesByDay(prevStart, addDays(prevStart, 6));
  const prevTotal = Array.from(prevMap.values()).reduce((a, b) => a + b, 0);

  const completedRows = await db
    .select({
      subjectName: subjects.name,
      topicName: topics.name,
      topicText: updateItems.topicText,
      date: updateItems.date,
    })
    .from(updateItems)
    .leftJoin(subjects, eq(updateItems.subjectId, subjects.id))
    .leftJoin(topics, eq(updateItems.topicId, topics.id))
    .where(and(gte(updateItems.date, days[0]), lte(updateItems.date, to), eq(updateItems.status, "completed")))
    .orderBy(updateItems.date);

  const subs = await db.select().from(subjects).orderBy(subjects.sortOrder, subjects.id);
  const activeRows = await db
    .select({
      subjectId: updateItems.subjectId,
      m: sql<number>`coalesce(sum(${updateItems.minutes}),0)`,
    })
    .from(updateItems)
    .where(and(gte(updateItems.date, days[0]), lte(updateItems.date, to)))
    .groupBy(updateItems.subjectId);
  const sessRows = await db
    .select({ subjectId: sessions.subjectId, m: sql<number>`coalesce(sum(${sessions.minutes}),0)` })
    .from(sessions)
    .where(and(gte(sessions.date, days[0]), lte(sessions.date, to)))
    .groupBy(sessions.subjectId);

  const minutesBySubject = new Map<number, number>();
  for (const r of activeRows) if (r.subjectId) minutesBySubject.set(r.subjectId, Number(r.m));
  for (const r of sessRows)
    if (r.subjectId) minutesBySubject.set(r.subjectId, (minutesBySubject.get(r.subjectId) ?? 0) + Number(r.m));

  const studied: { id: number; name: string; minutes: number }[] = [];
  const neglected: { id: number; name: string }[] = [];
  for (const s of subs) {
    const m = minutesBySubject.get(s.id);
    if (m !== undefined) studied.push({ id: s.id, name: s.name, minutes: m });
    else neglected.push({ id: s.id, name: s.name });
  }

  const allTopics = await db.select({ status: topics.status }).from(topics);
  const total = allTopics.length;
  const remaining = allTopics.filter((t) => t.status !== "completed").length;

  return {
    weekStart,
    days: days.map((d) => ({ date: d, minutes: minuteMap.get(d) ?? 0 })),
    totalMinutes: days.reduce((a, d) => a + (minuteMap.get(d) ?? 0), 0),
    prevTotalMinutes: prevTotal,
    topicsCompleted: completedRows.map((r) => ({
      subjectName: r.subjectName ?? "—",
      label: r.topicName ?? r.topicText ?? "General study",
      date: r.date,
    })),
    subjectsStudied: studied.sort((a, b) => b.minutes - a.minutes),
    subjectsNeglected: neglected,
    remainingTotal: remaining,
    progressDelta: total > 0 ? completedRows.length / total : 0,
    isCurrentWeek: weekStart === startOfWeek(todayKey()),
  };
}

// ── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsData {
  stats: SubjectStats[];
  overall: number;
  statusDist: { status: StudyStatus; count: number }[];
  last7: { date: string; minutes: number }[];
  weeklyHours: { weekStart: string; minutes: number }[];
  mostStudied: { name: string; minutes: number } | null;
  leastStudied: { name: string; minutes: number } | null;
  fallingBehind: SubjectStats[];
  totalMinutes: number;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const stats = await getSubjectStats();
  const total = stats.reduce((a, s) => a + s.total, 0);
  const done = stats.reduce((a, s) => a + s.completed, 0);
  const overall = total > 0 ? done / total : 0;

  const weekStart = startOfWeek(todayKey());
  const from = addDays(weekStart, -7 * 5);
  const minuteMap = await getMinutesByDay(from, todayKey());
  const last7 = weekDates(addDays(todayKey(), -6)).map((d) => ({
    date: d, minutes: minuteMap.get(d) ?? 0,
  }));
  const weekly: { weekStart: string; minutes: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const ws = addDays(weekStart, -7 * i);
    const ds = weekDates(ws);
    weekly.push({
      weekStart: ws,
      minutes: ds.reduce((a, d) => a + (minuteMap.get(d) ?? 0), 0),
    });
  }

  const withMin = stats.filter((s) => s.minutes > 0);
  const most = withMin.length ? withMin.reduce((a, b) => (a.minutes >= b.minutes ? a : b)) : null;
  const least = withMin.length ? withMin.reduce((a, b) => (a.minutes <= b.minutes ? a : b)) : null;

  const statusDist = [
    { status: "completed" as StudyStatus, count: stats.reduce((a, s) => a + s.completed, 0) },
    { status: "in_progress" as StudyStatus, count: stats.reduce((a, s) => a + s.inProgress, 0) },
    { status: "not_completed" as StudyStatus, count: stats.reduce((a, s) => a + s.notCompleted, 0) },
    { status: "not_started" as StudyStatus, count: stats.reduce((a, s) => a + s.notStarted, 0) },
  ];

  const fallingBehind = stats.filter(
    (s) => s.total >= 3 && overall > 0 && s.progress < Math.max(0, overall - 0.2),
  );

  return {
    stats,
    overall,
    statusDist,
    last7,
    weeklyHours: weekly,
    mostStudied: most ? { name: most.subject.name, minutes: most.minutes } : null,
    leastStudied: least ? { name: least.subject.name, minutes: least.minutes } : null,
    fallingBehind,
    totalMinutes: stats.reduce((a, s) => a + s.minutes, 0),
  };
}

// ── Search ──────────────────────────────────────────────────────────────────

export interface SearchResults {
  topics: TopicDto[];
  items: ItemDto[];
}

export async function searchAll(
  query: string,
  status?: string,
  subjectId?: number,
): Promise<SearchResults> {
  await ensureSeeded();
  const q = query.trim();
  const like = `%${q}%`;
  const topicConds = [];
  if (q) topicConds.push(ilike(topics.name, like));
  if (status) topicConds.push(eq(topics.status, status));
  if (subjectId) topicConds.push(eq(topics.subjectId, subjectId));

  const topicRows = topicConds.length
    ? await db
        .select({ t: topics, subjectName: subjects.name })
        .from(topics)
        .leftJoin(subjects, eq(topics.subjectId, subjects.id))
        .where(topicConds.length === 1 ? topicConds[0] : and(...topicConds))
        .limit(50)
    : [];

  const itemConds = [];
  if (q) {
    itemConds.push(
      or(
        ilike(updateItems.topicText, like),
        ilike(updateItems.notes, like),
        ilike(subjects.name, like),
        ilike(topics.name, like),
        ilike(updateItems.date, like),
      )!,
    );
  }
  if (status) itemConds.push(eq(updateItems.status, status));
  if (subjectId) itemConds.push(eq(updateItems.subjectId, subjectId));

  const itemRows = itemConds.length
    ? await db
        .select({
          id: updateItems.id, updateId: updateItems.updateId,
          subjectId: updateItems.subjectId, topicId: updateItems.topicId,
          topicText: updateItems.topicText, status: updateItems.status,
          minutes: updateItems.minutes, notes: updateItems.notes, date: updateItems.date,
          subjectName: subjects.name, topicName: topics.name,
        })
        .from(updateItems)
        .leftJoin(subjects, eq(updateItems.subjectId, subjects.id))
        .leftJoin(topics, eq(updateItems.topicId, topics.id))
        .where(itemConds.length === 1 ? itemConds[0] : and(...itemConds))
        .orderBy(desc(updateItems.date), desc(updateItems.id))
        .limit(80)
    : [];

  return {
    topics: topicRows.map(({ t, subjectName }) => ({
      id: t.id, subjectId: t.subjectId, subjectName: subjectName ?? "—",
      name: t.name, chapter: t.chapter, status: toStatus(t.status),
      notes: t.notes, completedAt: t.completedAt, updatedAt: t.updatedAt.toISOString(),
    })),
    items: itemRows.map(itemToDto),
  };
}

// ── Timer & syllabus helpers used by actions ────────────────────────────────

export async function getStudentClassroomData() {
  const user = await getCurrentUser();
  if (!user || !user.batchId) {
    return null;
  }

  const [batchRows, materials, rawMessages, allUsers] = await Promise.all([
    db.select().from(batches).where(eq(batches.id, user.batchId)).limit(1),
    db
      .select()
      .from(batchMaterials)
      .where(eq(batchMaterials.batchId, user.batchId))
      .orderBy(desc(batchMaterials.createdAt))
      .limit(10),
    db
      .select()
      .from(batchMessages)
      .where(eq(batchMessages.batchId, user.batchId))
      .orderBy(desc(batchMessages.createdAt))
      .limit(50),
    db.select({ id: users.id, name: users.name, role: users.role }).from(users),
  ]);

  const batch = batchRows[0] || null;
  if (!batch) return null;

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const messages = rawMessages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    senderName: userMap.get(m.userId)?.name || "User",
    senderRole: userMap.get(m.userId)?.role || "student",
    isSelf: m.userId === user.id,
  }));

  return {
    user,
    batch,
    materials,
    messages,
  };
}

export { dateKey };
