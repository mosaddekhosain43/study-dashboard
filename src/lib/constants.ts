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

// ── Official Alim subjects and papers (BOM / Madrasah Board) ─────────────────

export interface SubjectDef {
  name: string;
  slug: string;
  nameBn: string;
  code?: string;
}

export const SUBJECT_DEFS: SubjectDef[] = [
  { name: "Quran Mazid", slug: "alim-quran-mazid", nameBn: "কুরআন মাজিদ (২০১)", code: "201" },
  { name: "Hadith & Usulul Hadith", slug: "alim-hadith", nameBn: "হাদিস ও উসূলুল হাদিস (২০২)", code: "202" },
  { name: "Fiqh 1st Paper", slug: "alim-fiqh-1", nameBn: "আল ফিকহ ১ম পত্র (২০৩)", code: "203" },
  { name: "Fiqh 2nd Paper", slug: "alim-fiqh-2", nameBn: "আল ফিকহ ২য় পত্র (২০৪)", code: "204" },
  { name: "Arabic 1st Paper", slug: "alim-arabic-1", nameBn: "আরবি ১ম পত্র (২০৫)", code: "205" },
  { name: "Arabic 2nd Paper", slug: "alim-arabic-2", nameBn: "আরবি ২য় পত্র (২০৬)", code: "206" },
  { name: "Arabic (Science)", slug: "alim-arabic-science", nameBn: "আরবি (বিজ্ঞান বিভাগ) (২২৩)", code: "223" },
  { name: "Balaghat & Mantiq", slug: "alim-balaghat-mantiq", nameBn: "বালাগাত ও মানতিক (২১০)", code: "210" },
  { name: "Islamic History", slug: "alim-islamic-history", nameBn: "ইসলামের ইতিহাস (২০৯)", code: "209" },
  { name: "Bangla 1st Paper", slug: "alim-bangla-1", nameBn: "বাংলা ১ম পত্র (২৩৬)", code: "236" },
  { name: "Bangla 2nd Paper", slug: "alim-bangla-2", nameBn: "বাংলা ২য় পত্র (২৩৭)", code: "237" },
  { name: "English 1st Paper", slug: "alim-english-1", nameBn: "ইংরেজি ১ম পত্র (২৩৮)", code: "238" },
  { name: "English 2nd Paper", slug: "alim-english-2", nameBn: "ইংরেজি ২য় পত্র (২৩৯)", code: "239" },
  { name: "ICT", slug: "alim-ict", nameBn: "তথ্য ও যোগাযোগ প্রযুক্তি (২৪০)", code: "240" },
  { name: "Civics 1st Paper", slug: "alim-civics-1", nameBn: "পৌরনীতি ও সুশাসন ১ম পত্র (২৪১)", code: "241" },
  { name: "Civics 2nd Paper", slug: "alim-civics-2", nameBn: "পৌরনীতি ও সুশাসন ২য় পত্র (২৪২)", code: "242" },
  { name: "Economics 1st Paper", slug: "alim-economics-1", nameBn: "অর্থনীতি ১ম পত্র (২১৩)", code: "213" },
  { name: "Economics 2nd Paper", slug: "alim-economics-2", nameBn: "অর্থনীতি ২য় পত্র (২১৪)", code: "214" },
  { name: "Physics 1st Paper", slug: "alim-physics-1", nameBn: "পদার্থবিজ্ঞান ১ম পত্র (২২৪)", code: "224" },
  { name: "Physics 2nd Paper", slug: "alim-physics-2", nameBn: "পদার্থবিজ্ঞান ২য় পত্র (২২৫)", code: "225" },
  { name: "Chemistry 1st Paper", slug: "alim-chemistry-1", nameBn: "রসায়ন ১ম পত্র (২২৬)", code: "226" },
  { name: "Chemistry 2nd Paper", slug: "alim-chemistry-2", nameBn: "রসায়ন ২য় পত্র (২২৭)", code: "227" },
  { name: "Biology 1st Paper", slug: "alim-biology-1", nameBn: "জীববিজ্ঞান ১ম পত্র (২৩০)", code: "230" },
  { name: "Biology 2nd Paper", slug: "alim-biology-2", nameBn: "জীববিজ্ঞান ২য় পত্র (২৩১)", code: "231" },
  { name: "Higher Math 1st Paper", slug: "alim-higher-math-1", nameBn: "উচ্চতর গণিত ১ম পত্র (২২৮)", code: "228" },
  { name: "Higher Math 2nd Paper", slug: "alim-higher-math-2", nameBn: "উচ্চতর গণিত ২য় পত্র (২২৯)", code: "229" },
];

// ── Settings keys ───────────────────────────────────────────────────────────

export const SETTING_EXAM_DATE = "exam_date";
export const SETTING_TARGET_DATE = "target_date";
export const SETTING_TARGET_START_DATE = "target_start_date";
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
