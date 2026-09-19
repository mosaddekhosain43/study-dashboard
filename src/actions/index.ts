"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  lessons,
  sessions,
  settings,
  subjects,
  topics,
  updateItems,
  updates,
} from "@/db/schema";
import {
  SETTING_ACTIVE_TIMER,
  SETTING_EXAM_DATE,
  SETTING_TARGET_DATE,
  STATUSES,
  SUBJECT_DEFS,
  type StudyStatus,
  type TimerState,
} from "@/lib/constants";
import { addDays, dateKey, todayKey } from "@/lib/dates";
import { canonicalTopic, parseStudyUpdate, type ParseResult } from "@/lib/parser";
import { ensureSeeded } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

function refresh() {
  revalidatePath("/", "layout");
}

function ok<T extends object>(extra?: T) {
  return { ok: true as const, ...(extra ?? ({} as T)) };
}
function fail(error: string) {
  return { ok: false as const, error };
}

// ── Natural-language parsing ────────────────────────────────────────────────

export async function parseUpdateAction(rawText: string): Promise<ParseResult> {
  await ensureSeeded();
  const [subs, tops] = await Promise.all([
    db.select().from(subjects).orderBy(subjects.sortOrder),
    db.select().from(topics),
  ]);
  return parseStudyUpdate(rawText, subs, tops);
}

// ── Saving a study update ───────────────────────────────────────────────────

export interface IncomingItem {
  subjectId: number | null;
  topicId: number | null;
  topicText: string;
  status: string;
  minutes: number | null;
  notes?: string | null;
}

export interface SavePayload {
  rawText: string;
  date: string;
  addToSyllabus: boolean;
  items: IncomingItem[];
}

function validStatus(s: string): StudyStatus {
  return (STATUSES as string[]).includes(s) ? (s as StudyStatus) : "in_progress";
}

async function applyStatusToTopic(topicId: number, status: StudyStatus, date: string) {
  await db
    .update(topics)
    .set({
      status,
      completedAt: status === "completed" ? date : null,
      updatedAt: new Date(),
    })
    .where(eq(topics.id, topicId));
}

export async function saveUpdateAction(payload: SavePayload) {
  await ensureSeeded();
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(payload.date) ? payload.date : todayKey();
  const items = (payload.items ?? []).filter(
    (i) => i.subjectId !== null || i.topicText.trim().length > 0,
  );
  if (!payload.rawText.trim() && items.length === 0) return fail("Nothing to save.");

  const [upd] = await db
    .insert(updates)
    .values({ userId, rawText: payload.rawText.trim() || "(manual entry)", date })
    .returning();

  const allTopics = await db.select().from(topics);

  for (const raw of items.slice(0, 40)) {
    const status = validStatus(raw.status);
    let topicId = raw.topicId ?? null;
    const topicText = raw.topicText.trim();

    if (!topicId && payload.addToSyllabus && raw.subjectId && topicText) {
      const canon = canonicalTopic(topicText);
      const existing = allTopics.find(
        (t) => t.subjectId === raw.subjectId && canonicalTopic(t.name) === canon,
      );
      if (existing) {
        topicId = existing.id;
      } else {
        const [created] = await db
          .insert(topics)
          .values({ userId, subjectId: raw.subjectId, name: topicText, status })
          .returning();
        created.sortOrder = created.id;
        await db.update(topics).set({ sortOrder: created.id }).where(eq(topics.id, created.id));
        allTopics.push(created);
        topicId = created.id;
        await applyStatusToTopic(topicId, status, date);
      }
    }

    const [item] = await db
      .insert(updateItems)
      .values({
        userId,
        updateId: upd.id,
        subjectId: raw.subjectId,
        topicId,
        topicText: topicText || null,
        status,
        minutes: raw.minutes && raw.minutes > 0 ? Math.round(raw.minutes) : null,
        notes: raw.notes?.trim() || null,
        date,
      })
      .returning();

    if (topicId) await applyStatusToTopic(topicId, status, date);
    void item;
  }

  refresh();
  return ok({ updateId: upd.id });
}

// ── Update / item editing ───────────────────────────────────────────────────

export async function deleteUpdateAction(updateId: number) {
  await db.delete(updates).where(eq(updates.id, updateId));
  refresh();
  return ok();
}

export async function updateItemAction(
  itemId: number,
  fields: {
    subjectId?: number | null;
    topicId?: number | null;
    topicText?: string;
    status?: string;
    minutes?: number | null;
    notes?: string | null;
    date?: string;
  },
) {
  const [existing] = await db.select().from(updateItems).where(eq(updateItems.id, itemId));
  if (!existing) return fail("Record not found.");

  const status = fields.status !== undefined ? validStatus(fields.status) : (existing.status as StudyStatus);
  await db
    .update(updateItems)
    .set({
      subjectId: fields.subjectId !== undefined ? fields.subjectId : existing.subjectId,
      topicId: fields.topicId !== undefined ? fields.topicId : existing.topicId,
      topicText: fields.topicText !== undefined ? fields.topicText : existing.topicText,
      status,
      minutes: fields.minutes !== undefined ? fields.minutes : existing.minutes,
      notes: fields.notes !== undefined ? fields.notes : existing.notes,
      date: fields.date && /^\d{4}-\d{2}-\d{2}$/.test(fields.date) ? fields.date : existing.date,
    })
    .where(eq(updateItems.id, itemId));

  const finalTopicId = fields.topicId !== undefined ? fields.topicId : existing.topicId;
  if (finalTopicId && (fields.status !== undefined || fields.date !== undefined)) {
    await applyStatusToTopic(finalTopicId, status, existing.date);
  }
  refresh();
  return ok();
}

export async function deleteItemAction(itemId: number) {
  await db.delete(updateItems).where(eq(updateItems.id, itemId));
  refresh();
  return ok();
}

// ── Lesson Management ───────────────────────────────────────────────────────

export async function addLessonAction(subjectId: number, name: string) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const clean = name.trim();
  if (!clean) return fail("Lesson name cannot be empty.");

  const max = await db
    .select({ m: sql<number>`coalesce(max(${lessons.sortOrder}), 0)` })
    .from(lessons)
    .where(eq(lessons.subjectId, subjectId));

  const [created] = await db
    .insert(lessons)
    .values({
      userId,
      subjectId,
      name: clean,
      sortOrder: Number(max[0]?.m ?? 0) + 1,
    })
    .returning();

  refresh();
  return ok({ lesson: created });
}

export async function renameLessonAction(lessonId: number, name: string) {
  const clean = name.trim();
  if (!clean) return fail("Lesson name cannot be empty.");
  await db
    .update(lessons)
    .set({ name: clean, updatedAt: new Date() })
    .where(eq(lessons.id, lessonId));
  refresh();
  return ok();
}

export async function deleteLessonAction(lessonId: number) {
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  refresh();
  return ok();
}

// ── Custom Subject Management ──────────────────────────────────────────────

export async function createCustomSubjectAction(name: string, nameBn?: string) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const clean = name.trim();
  if (!clean) return fail("Subject name is required.");

  const slug = clean
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") + `-${Date.now().toString(36)}`;

  const max = await db
    .select({ m: sql<number>`coalesce(max(${subjects.sortOrder}), 0)` })
    .from(subjects);

  const [created] = await db
    .insert(subjects)
    .values({
      userId,
      name: clean,
      nameBn: nameBn?.trim() || null,
      slug,
      sortOrder: Number(max[0]?.m ?? 0) + 1,
    })
    .returning();

  // Create default first lesson for this subject
  await db.insert(lessons).values({
    userId,
    subjectId: created.id,
    name: "Chapter 1 / অধ্যায় ১",
    sortOrder: 1,
  });

  refresh();
  return ok({ subject: created });
}

export async function deleteCustomSubjectAction(subjectId: number) {
  await db.delete(subjects).where(eq(subjects.id, subjectId));
  refresh();
  return ok();
}

// ── Topics / syllabus ───────────────────────────────────────────────────────

export async function setTopicStatusAction(topicId: number, status: string) {
  await applyStatusToTopic(topicId, validStatus(status), todayKey());
  refresh();
  return ok();
}

export async function addTopicAction(
  subjectId: number,
  name: string,
  lessonId?: number | null,
  chapter?: string
) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const clean = name.trim();
  if (!clean) return fail("Topic name is empty.");

  let finalLessonId = lessonId ?? null;
  if (!finalLessonId) {
    const firstLesson = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.subjectId, subjectId))
      .orderBy(lessons.sortOrder)
      .limit(1);
    if (firstLesson[0]) {
      finalLessonId = firstLesson[0].id;
    } else {
      const [newLesson] = await db
        .insert(lessons)
        .values({
          userId,
          subjectId,
          name: chapter?.trim() || "Chapter 1 / অধ্যায় ১",
          sortOrder: 1,
        })
        .returning();
      finalLessonId = newLesson.id;
    }
  }

  const max = await db
    .select({ m: sql<number>`coalesce(max(${topics.sortOrder}), 0)` })
    .from(topics)
    .where(eq(topics.subjectId, subjectId));

  await db.insert(topics).values({
    userId,
    subjectId,
    lessonId: finalLessonId,
    name: clean,
    chapter: chapter?.trim() || null,
    sortOrder: Number(max[0]?.m ?? 0) + 1,
  });
  refresh();
  return ok();
}

export async function bulkAddTopicsAction(
  subjectId: number,
  text: string,
  lessonId?: number | null
) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 200);
  if (lines.length === 0) return fail("No topics found.");

  let finalLessonId = lessonId ?? null;
  if (!finalLessonId) {
    const firstLesson = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.subjectId, subjectId))
      .orderBy(lessons.sortOrder)
      .limit(1);
    if (firstLesson[0]) {
      finalLessonId = firstLesson[0].id;
    } else {
      const [newLesson] = await db
        .insert(lessons)
        .values({
          userId,
          subjectId,
          name: "Chapter 1 / অধ্যায় ১",
          sortOrder: 1,
        })
        .returning();
      finalLessonId = newLesson.id;
    }
  }

  const existing = await db.select().from(topics).where(eq(topics.subjectId, subjectId));
  const canon = new Set(existing.map((t) => canonicalTopic(t.name)));
  let maxOrder = existing.reduce((a, t) => Math.max(a, t.sortOrder), 0);
  let created = 0;
  for (const line of lines) {
    if (canon.has(canonicalTopic(line))) continue;
    await db.insert(topics).values({
      userId,
      subjectId,
      lessonId: finalLessonId,
      name: line,
      sortOrder: ++maxOrder,
    });
    canon.add(canonicalTopic(line));
    created++;
  }
  refresh();
  return ok({ created, skipped: lines.length - created });
}

export async function renameTopicAction(topicId: number, name: string) {
  const clean = name.trim();
  if (!clean) return fail("Name cannot be empty.");
  await db.update(topics).set({ name: clean, updatedAt: new Date() }).where(eq(topics.id, topicId));
  refresh();
  return ok();
}

export async function updateTopicNotesAction(topicId: number, notes: string) {
  await db.update(topics).set({ notes: notes.trim() || null, updatedAt: new Date() }).where(eq(topics.id, topicId));
  refresh();
  return ok();
}

export async function deleteTopicAction(topicId: number) {
  await db.delete(topics).where(eq(topics.id, topicId));
  refresh();
  return ok();
}

export async function moveTopicAction(topicId: number, direction: "up" | "down") {
  const [t] = await db.select().from(topics).where(eq(topics.id, topicId));
  if (!t) return fail("Topic not found.");
  const siblings = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, t.subjectId))
    .orderBy(topics.sortOrder, topics.id);
  const idx = siblings.findIndex((s) => s.id === topicId);
  const swapWith = direction === "up" ? siblings[idx - 1] : siblings[idx + 1];
  if (!swapWith) return ok();
  await db.update(topics).set({ sortOrder: swapWith.sortOrder }).where(eq(topics.id, t.id));
  await db.update(topics).set({ sortOrder: t.sortOrder }).where(eq(topics.id, swapWith.id));
  refresh();
  return ok();
}

// ── Study timer ─────────────────────────────────────────────────────────────

async function readTimer(): Promise<TimerState | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, SETTING_ACTIVE_TIMER));
  if (!rows[0]) return null;
  try {
    return JSON.parse(rows[0].value) as TimerState;
  } catch {
    return null;
  }
}
async function writeTimer(state: TimerState | null) {
  if (state === null) {
    await db.delete(settings).where(eq(settings.key, SETTING_ACTIVE_TIMER));
  } else {
    await db
      .insert(settings)
      .values({ key: SETTING_ACTIVE_TIMER, value: JSON.stringify(state) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(state) } });
  }
}

export async function getTimerAction(): Promise<TimerState | null> {
  await ensureSeeded();
  return readTimer();
}

export async function timerStartAction(subjectId: number | null) {
  const now = Date.now();
  const existing = await readTimer();
  if (existing?.running) {
    await writeTimer({ ...existing, subjectId, startedAt: now });
  } else {
    await writeTimer({ subjectId, startedAt: now, accumulatedMs: 0, running: true });
  }
  refresh();
  return ok();
}

export async function timerPauseAction() {
  const t = await readTimer();
  if (!t || !t.running) return fail("No running timer.");
  const now = Date.now();
  await writeTimer({
    ...t,
    running: false,
    accumulatedMs: t.accumulatedMs + (now - t.startedAt),
    startedAt: now,
  });
  refresh();
  return ok();
}

export async function timerResumeAction() {
  const t = await readTimer();
  if (!t || t.running) return fail("Nothing to resume.");
  await writeTimer({ ...t, running: true, startedAt: Date.now() });
  refresh();
  return ok();
}

export async function timerStopAction(note?: string) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const t = await readTimer();
  if (!t) return fail("No timer running.");
  const now = Date.now();
  const totalMs = t.accumulatedMs + (t.running ? now - t.startedAt : 0);
  await writeTimer(null);
  if (totalMs >= 30_000) {
    const minutes = Math.max(1, Math.round(totalMs / 60_000));
    await db.insert(sessions).values({
      userId,
      subjectId: t.subjectId,
      startedAt: new Date(now - totalMs),
      endedAt: new Date(now),
      minutes,
      date: dateKey(new Date(now - totalMs)),
      note: note?.trim() || null,
    });
  }
  refresh();
  return ok({ minutes: Math.round(totalMs / 60_000) });
}

export async function saveStudySessionAction(payload: {
  subjectId: number | null;
  minutes: number;
  note?: string;
}) {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const now = Date.now();
  const minutes = Math.max(1, Math.round(payload.minutes));
  const totalMs = minutes * 60_000;

  await writeTimer(null);

  await db.insert(sessions).values({
    userId,
    subjectId: payload.subjectId,
    startedAt: new Date(now - totalMs),
    endedAt: new Date(now),
    minutes,
    date: dateKey(new Date()),
    note: payload.note?.trim() || null,
  });

  refresh();
  return ok({ minutes });
}

// ── Settings ────────────────────────────────────────────────────────────────

async function upsertSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function saveExamSettingsAction(examDate: string, targetDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) return fail("Exam date is invalid.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return fail("Target date is invalid.");
  await upsertSetting(SETTING_EXAM_DATE, examDate);
  await upsertSetting(SETTING_TARGET_DATE, targetDate);
  refresh();
  return ok();
}

// ── Backup / restore ────────────────────────────────────────────────────────

export async function getBackupJsonAction(): Promise<string> {
  await ensureSeeded();
  const [subs, tops, upds, its, sess, sets] = await Promise.all([
    db.select().from(subjects).orderBy(subjects.id),
    db.select().from(topics).orderBy(topics.id),
    db.select().from(updates).orderBy(updates.id),
    db.select().from(updateItems).orderBy(updateItems.id),
    db.select().from(sessions).orderBy(sessions.id),
    db.select().from(settings),
  ]);
  return JSON.stringify(
    {
      meta: {
        app: "alim-study-dashboard",
        version: 1,
        exportedAt: new Date().toISOString(),
      },
      subjects: subs,
      topics: tops,
      updates: upds,
      updateItems: its,
      sessions: sess,
      settings: sets.filter((s) => s.key !== SETTING_ACTIVE_TIMER),
    },
    null,
    2,
  );
}

interface BackupShape {
  meta?: { app?: string; version?: number };
  subjects?: (typeof subjects.$inferSelect)[];
  topics?: (typeof topics.$inferSelect)[];
  updates?: (typeof updates.$inferSelect)[];
  updateItems?: (typeof updateItems.$inferSelect)[];
  sessions?: (typeof sessions.$inferSelect)[];
  settings?: { key: string; value: string }[];
}

function parseDate(v: unknown): Date | null {
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}

export async function importBackupAction(json: string) {
  let data: BackupShape;
  try {
    data = JSON.parse(json) as BackupShape;
  } catch {
    return fail("Invalid JSON file.");
  }
  if (!Array.isArray(data.subjects) || data.subjects.length === 0) {
    return fail("Backup file does not contain subjects.");
  }

  await db.delete(updateItems);
  await db.delete(updates);
  await db.delete(topics);
  await db.delete(sessions);
  await db.delete(subjects);
  await db.delete(settings);

  const revive = <T extends Record<string, unknown>>(row: T): T => {
    const out: Record<string, unknown> = { ...row };
    for (const [k, v] of Object.entries(out)) {
      if (/At$/.test(k) && typeof v === "string" && k !== "completedAt") {
        const d = parseDate(v);
        if (d) out[k] = d;
      }
    }
    return out as T;
  };

  if (data.subjects?.length) await db.insert(subjects).values(data.subjects.map(revive));
  if (data.topics?.length) await db.insert(topics).values(data.topics.map(revive));
  if (data.updates?.length) await db.insert(updates).values(data.updates.map(revive));
  if (data.updateItems?.length) await db.insert(updateItems).values(data.updateItems.map(revive));
  if (data.sessions?.length) await db.insert(sessions).values(data.sessions.map(revive));
  if (data.settings?.length) await db.insert(settings).values(data.settings);

  // Reset sequences so new rows don't collide with restored ids.
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('subjects','id'), GREATEST((SELECT MAX(id) FROM subjects), 1), (SELECT COUNT(*) FROM subjects) > 0)`);
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('topics','id'), GREATEST((SELECT MAX(id) FROM topics), 1), (SELECT COUNT(*) FROM topics) > 0)`);
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('updates','id'), GREATEST((SELECT MAX(id) FROM updates), 1), (SELECT COUNT(*) FROM updates) > 0)`);
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('update_items','id'), GREATEST((SELECT MAX(id) FROM update_items), 1), (SELECT COUNT(*) FROM update_items) > 0)`);
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('sessions','id'), GREATEST((SELECT MAX(id) FROM sessions), 1), (SELECT COUNT(*) FROM sessions) > 0)`);

  const g = globalThis as { __alimSeeded?: boolean };
  g.__alimSeeded = true;
  refresh();
  return ok({
    counts: {
      subjects: data.subjects?.length ?? 0,
      topics: data.topics?.length ?? 0,
      updates: data.updates?.length ?? 0,
      sessions: data.sessions?.length ?? 0,
    },
  });
}

// ── CSV syllabus import / export ────────────────────────────────────────────

export type ActionResult<T extends object = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export async function importSyllabusCsvAction(
  csv: string,
): Promise<ActionResult<{ created: number; skipped: number; unmatched: number }>> {
  await ensureSeeded();
  const subs = await db.select().from(subjects);
  const existing = await db.select().from(topics);

  const alias = (raw: string) => canonicalTopic(raw).replace(/\s*\d+(st|nd)?\s*(paper)?/g, "").trim();
  const findSubject = (cell: string) => {
    const a = alias(cell);
    return (
      subs.find((s) => alias(s.name) === a) ??
      subs.find((s) => alias(s.name).startsWith(a) || a.startsWith(alias(s.name))) ??
      subs.find((s) => (s.nameBn ? alias(s.nameBn) === a : false)) ??
      null
    );
  };

  let created = 0;
  let skipped = 0;
  let unmatched = 0;
  const lines = csv.split(/\r?\n/).slice(0, 1000);
  for (const line of lines) {
    const cells = line.split(/[,\t|]/).map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    if (/^subject/i.test(cells[0])) continue; // header row
    const subj = findSubject(cells[0]);
    if (!subj) {
      unmatched++;
      continue;
    }
    const name = cells[1];
    const chapter = cells[2] ?? null;
    if (existing.some((t) => t.subjectId === subj.id && canonicalTopic(t.name) === canonicalTopic(name))) {
      skipped++;
      continue;
    }
    const maxOrder = existing.filter((t) => t.subjectId === subj.id).length;
    const [row] = await db
      .insert(topics)
      .values({ subjectId: subj.id, name, chapter, sortOrder: maxOrder + 1 })
      .returning();
    existing.push(row);
    created++;
  }
  refresh();
  return ok({ created, skipped, unmatched });
}

export async function exportSyllabusCsvAction(): Promise<string> {
  await ensureSeeded();
  const subs = await db.select().from(subjects).orderBy(subjects.sortOrder);
  const tops = await db.select().from(topics).orderBy(topics.subjectId, topics.sortOrder, topics.id);
  const esc = (s: string | null) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const lines = ["Subject,Topic,Chapter,Status"];
  for (const t of tops) {
    const subj = subs.find((s) => s.id === t.subjectId);
    lines.push([esc(subj?.name ?? ""), esc(t.name), esc(t.chapter), t.status].join(","));
  }
  return lines.join("\n");
}

// ── Demo data (optional, for testing) ───────────────────────────────────────

export async function clearAllDataAction() {
  await db.delete(updateItems);
  await db.delete(updates);
  await db.delete(topics);
  await db.delete(sessions);
  const g = globalThis as { __alimSeeded?: boolean };
  g.__alimSeeded = true;
  refresh();
  return ok();
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function loadDemoDataAction() {
  await ensureSeeded();
  await db.delete(updateItems);
  await db.delete(updates);
  await db.delete(topics);
  await db.delete(sessions);

  const subs = await db.select().from(subjects).orderBy(subjects.sortOrder);
  const byShort = (slug: string) => subs.find((s) => s.slug === slug)!;

  const rnd = mulberry32(42);
  const today = todayKey();
  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

  const syllabus: [string, string[]][] = [
    ["bangla-1", ["কবিতা ১", "কবিতা ২", "কবিতা ৩", "কবিতা ৪", "কবিতা ৫", "গল্প ১", "গল্প ২", "গল্প ৩", "প্রবন্ধ ১", "প্রবন্ধ ২"]],
    ["bangla-2", ["ব্যাকরণ ১", "ব্যাকরণ ২", "ব্যাকরণ ৩", "নির্মিতি ১", "রচনা ১", "রচনা ২", "সারাংশ লেখা", "ভাব-সম্প্রসারণ"]],
    ["english-1", ["Seen Passage 1", "Seen Passage 2", "Seen Passage 3", "Poem 1", "Poem 2", "Story 1"]],
    ["english-2", ["Tense", "Narration", "Voice Change", "Right Form of Verbs", "Transformation", "Paragraph", "Email Writing"]],
    ["aqaid-1", ["অধ্যায় ১", "অধ্যায় ২", "অধ্যায় ৩", "অধ্যায় ৪"]],
    ["aqaid-2", ["অধ্যায় ১", "অধ্যায় ২", "অধ্যায় ৩"]],
    ["hadith", ["হাদিস ১", "হাদিস ২", "হাদিস ৩", "হাদিস ৪", "হাদিস ৫", "হাদিস ৬", "হাদিস ৭", "হাদিস ৮", "হাদিস ৯", "হাদিস ১০", "হাদিস ১১", "হাদিস ১২"]],
    ["quran", ["তিলাওয়াত ১", "তিলাওয়াত ২", "তিলাওয়াত ৩", "তিলাওয়াত ৪", "তিলাওয়াত ৫", "নাজিরা রিভিউ"]],
    ["ict", ["অধ্যায় ১", "অধ্যায় ২", "অধ্যায় ৩", "অধ্যায় ৪", "অধ্যায় ৫", "অধ্যায় ৬"]],
    ["balaghat", ["পাঠ ১", "পাঠ ২", "পাঠ ৩", "পাঠ ৪", "পাঠ ৫", "পাঠ ৬"]],
    ["arabic-1", ["সরফ ১", "সরফ ২", "সরফ ৩", "নাহও ১", "নাহও ২", "নাহও ৩", "তাসরীফ অনুশীলন"]],
    ["arabic-2", ["কুরআন", "অধ্যায় ২", "অধ্যায় ৩", "অধ্যায় ৪", "অধ্যায় ৫", "অনুবাদ ১", "অনুবাদ ২"]],
    ["civics", ["অধ্যায় ১", "অধ্যায় ২", "অধ্যায় ৩", "অধ্যায় ৪", "অধ্যায় ৫"]],
  ];

  const bnName = (slug: string) =>
    SUBJECT_DEFS.find((d) => d.slug === slug)?.nameBn ?? slug;

  let order = 0;
  const allTopics: (typeof topics.$inferSelect & { slug: string })[] = [];
  for (const [slug, names] of syllabus) {
    const subj = byShort(slug);
    for (const name of names) {
      const [row] = await db
        .insert(topics)
        .values({ subjectId: subj.id, name, sortOrder: ++order })
        .returning();
      allTopics.push({ ...row, slug });
    }
  }

  // Randomly mark ~55% completed over the past 25 days, ~15% in progress recently.
  for (const t of allTopics) {
    const roll = rnd();
    if (roll < 0.55) {
      const daysAgo = Math.floor(rnd() * 25) + 1;
      const doneDate = addDays(today, -daysAgo);
      await db.update(topics).set({ status: "completed", completedAt: doneDate }).where(eq(topics.id, t.id));
      const [upd] = await db
        .insert(updates)
        .values({ rawText: `আজ ${bnName(t.slug)} এর ${t.name} শেষ হইছে`, date: doneDate })
        .returning();
      await db.insert(updateItems).values({
        updateId: upd.id, subjectId: t.subjectId, topicId: t.id,
        topicText: t.name, status: "completed", date: doneDate,
        minutes: 20 + Math.floor(rnd() * 60),
      });
    } else if (roll < 0.7) {
      const daysAgo = Math.floor(rnd() * 5);
      const d = addDays(today, -daysAgo);
      await db.update(topics).set({ status: "in_progress" }).where(eq(topics.id, t.id));
      const [upd] = await db
        .insert(updates)
        .values({ rawText: `${bnName(t.slug)} ${t.name} পড়ছি`, date: d })
        .returning();
      await db.insert(updateItems).values({
        updateId: upd.id, subjectId: t.subjectId, topicId: t.id,
        topicText: t.name, status: "in_progress", date: d,
      });
    }
  }

  // A couple of explicit "not completed" records.
  const hadithTopics = allTopics.filter((t) => t.slug === "hadith" && t.status === "not_started").slice(0, 1);
  for (const t of hadithTopics) {
    const [upd] = await db
      .insert(updates)
      .values({ rawText: `আজ ${t.name} পড়তে পারি নাই`, date: today })
      .returning();
    await db.insert(updateItems).values({
      updateId: upd.id, subjectId: t.subjectId, topicId: t.id,
      topicText: t.name, status: "not_completed", date: today,
    });
    await db.update(topics).set({ status: "not_completed" }).where(eq(topics.id, t.id));
  }

  // Timed sessions for the last 12 days.
  for (let d = 11; d >= 0; d--) {
    if (rnd() < 0.12) continue; // occasional rest day
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const slug = pick(syllabus)[0];
      const subj = byShort(slug);
      const minutes = 35 + Math.floor(rnd() * 120);
      const start = new Date();
      start.setDate(start.getDate() - d);
      start.setHours(6 + Math.floor(rnd() * 15), Math.floor(rnd() * 59), 0, 0);
      const end = new Date(start.getTime() + minutes * 60_000);
      await db.insert(sessions).values({
        subjectId: subj.id,
        startedAt: start,
        endedAt: end,
        minutes,
        date: addDays(today, -d),
      });
    }
  }

  refresh();
  return ok();
}

// ── Search action (thin wrapper kept here for client components) ────────────

export async function searchAction(
  query: string,
  status?: string,
  subjectId?: number,
) {
  const { searchAll } = await import("@/lib/queries");
  return searchAll(query, status, subjectId);
}

export async function getTopicsForComposer(): Promise<
  { id: number; subjectId: number; name: string }[]
> {
  await ensureSeeded();
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const whereCond = userId
    ? sql`(${topics.userId} = ${userId} OR ${topics.userId} IS NULL)`
    : sql`${topics.userId} IS NULL`;

  const rows = await db
    .select({ id: topics.id, subjectId: topics.subjectId, name: topics.name })
    .from(topics)
    .where(whereCond)
    .orderBy(topics.sortOrder, topics.id);
  return rows;
}
