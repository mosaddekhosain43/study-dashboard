// ── Status model ────────────────────────────────────────────────────────────

export type StudyStatus =
  | "completed"
  | "in_progress"
  | "not_completed"
  | "not_started";

export const STATUSES: StudyStatus[] = [
  "completed",
  "in_progress",
  "not_completed",
  "not_started",
];

export const STATUS_META: Record<
  StudyStatus,
  {
    label: string;
    short: string;
    color: string; // hex for charts
    text: string; // tailwind text class
    bg: string; // tailwind bg class (soft)
    ring: string;
    dot: string; // tailwind bg for dots
  }
> = {
  completed: {
    label: "Completed",
    short: "Done",
    color: "#0f9d6e",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  in_progress: {
    label: "In Progress",
    short: "Doing",
    color: "#e5a100",
    text: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  not_completed: {
    label: "Not Completed",
    short: "Missed",
    color: "#e4574c",
    text: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
  not_started: {
    label: "Not Started",
    short: "Todo",
    color: "#94a3b8",
    text: "text-slate-600",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
    dot: "bg-slate-400",
  },
};

// ── The 13 Alim 2nd-year papers ─────────────────────────────────────────────

export interface SubjectDef {
  name: string;
  slug: string;
  nameBn: string;
}

export const SUBJECT_DEFS: SubjectDef[] = [
  { name: "Bangla 1st Paper", slug: "bangla-1", nameBn: "বাংলা ১ম পত্র" },
  { name: "Bangla 2nd Paper", slug: "bangla-2", nameBn: "বাংলা ২য় পত্র" },
  { name: "English 1st Paper", slug: "english-1", nameBn: "ইংরেজি ১ম পত্র" },
  { name: "English 2nd Paper", slug: "english-2", nameBn: "ইংরেজি ২য় পত্র" },
  { name: "Aqaid 1st Paper", slug: "aqaid-1", nameBn: "আকাইদ ১ম পত্র" },
  { name: "Aqaid 2nd Paper", slug: "aqaid-2", nameBn: "আকাইদ ২য় পত্র" },
  { name: "Hadith", slug: "hadith", nameBn: "হাদিস" },
  { name: "Quran", slug: "quran", nameBn: "কুরআন" },
  { name: "ICT", slug: "ict", nameBn: "আইসিটি" },
  { name: "Balaghat", slug: "balaghat", nameBn: "বালাগাত" },
  { name: "Arabic 1st Paper", slug: "arabic-1", nameBn: "আরবি ১ম পত্র" },
  { name: "Arabic 2nd Paper", slug: "arabic-2", nameBn: "আরবি ২য় পত্র" },
  { name: "Civics (Pouroniti)", slug: "civics", nameBn: "পৌরনীতি" },
];

// ── Settings keys ───────────────────────────────────────────────────────────

export const SETTING_EXAM_DATE = "exam_date";
export const SETTING_TARGET_DATE = "target_date";
export const SETTING_ACTIVE_TIMER = "active_timer";

export interface TimerState {
  subjectId: number | null;
  startedAt: number; // epoch ms of last (re)start
  accumulatedMs: number; // paused accumulated ms
  running: boolean;
}

// ── Bangla month map (for date parsing) ─────────────────────────────────────

export const BN_MONTHS: Record<string, number> = {
  জানুয়ারি: 1, জানু: 1, january: 1, jan: 1,
  ফেব্রুয়ারি: 2, ফেব্রু: 2, february: 2, feb: 2,
  মার্চ: 3, march: 3, mar: 3,
  এপ্রিল: 4, april: 4, apr: 4,
  মে: 5, may: 5,
  জুন: 6, june: 6, jun: 6,
  জুলাই: 7, july: 7, jul: 7,
  আগস্ট: 8, august: 8, aug: 8,
  সেপ্টেম্বর: 9, september: 9, sep: 9, sept: 9,
  অক্টোবর: 10, october: 10, oct: 10,
  নভেম্বর: 11, november: 11, nov: 11,
  ডিসেম্বর: 12, december: 12, dec: 12,
};
