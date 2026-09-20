import { addDays, diffDays, formatMinutes, todayKey } from "@/lib/dates";
import type { StudyStatus } from "@/lib/constants";

export type TimeSlot = "morning" | "afternoon" | "night";

export interface PlannerTopicItem {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectNameBn?: string | null;
  lessonId?: number | null;
  lessonName?: string | null;
  name: string;
  status: StudyStatus;
  completedAt?: string | null;
  lastRevisedAt?: string | null;
  revisionCount: number;
  nextRevisionDue?: string | null;
}

export interface PlannerSlotData {
  slot: TimeSlot;
  title: string;
  titleBn: string;
  timeRange: string;
  cognitiveFocus: string;
  cognitiveFocusBn: string;
  recommendedMinutes: number;
  subjects: {
    id: number;
    name: string;
    nameBn?: string | null;
    pendingTopics: PlannerTopicItem[];
    suggestedToday: PlannerTopicItem[];
  }[];
}

export interface DueRevisionItem {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectNameBn?: string | null;
  name: string;
  lessonName?: string | null;
  completedAt: string;
  lastRevisedAt?: string | null;
  revisionCount: number;
  nextRevisionDue: string;
  isOverdue: boolean;
  stageBadge: {
    stage: number;
    label: string;
    labelBn: string;
    color: string;
  };
}

export interface StudentStudyPlan {
  pace: {
    totalTopics: number;
    completedTopics: number;
    remainingTopics: number;
    daysLeft: number;
    targetDate: string;
    examDate: string;
    topicsPerDay: number;
    recommendedDailyMinutes: number;
    recommendedDailyHoursStr: string;
    intensity: "light" | "balanced" | "intensive" | "critical";
    intensityLabelBn: string;
  };
  slots: {
    morning: PlannerSlotData;
    afternoon: PlannerSlotData;
    night: PlannerSlotData;
  };
  revisions: {
    dueToday: DueRevisionItem[];
    upcomingWeek: DueRevisionItem[];
    totalMastered: number;
    totalInRevisionPipeline: number;
  };
  dailyRoutineSteps: {
    time: string;
    title: string;
    titleBn: string;
    activity: string;
    activityBn: string;
    slot: TimeSlot | "break";
  }[];
  examGuidelines: {
    title: string;
    detail: string;
    category: "focus" | "memory" | "health";
  }[];
}

/**
 * Categorize subjects into optimal cognitive time windows
 */
export function getSubjectTimeSlot(
  name: string,
  nameBn?: string | null,
  streamGroup?: string | null
): TimeSlot {
  const n = (name + " " + (nameBn || "")).toLowerCase();

  // 1. Morning (সকাল): High cognitive load, mathematical, analytical, heavy memorization
  if (
    n.includes("math") ||
    n.includes("গণিত") ||
    n.includes("physics") ||
    n.includes("পদার্থ") ||
    n.includes("chemistry") ||
    n.includes("রসায়ন") ||
    n.includes("quran") ||
    n.includes("কুরআন") ||
    n.includes("aqaid") ||
    n.includes("আকাইদ") ||
    n.includes("fiqh") ||
    n.includes("ফিকহ") ||
    n.includes("tajweed") ||
    n.includes("তাজবিদ") ||
    n.includes("qawaid") ||
    n.includes("কাওয়াইদ")
  ) {
    return "morning";
  }

  // 2. Afternoon (দুপুর ও বিকেল): Reading comprehension, descriptive sciences, history, literature
  if (
    n.includes("biology") ||
    n.includes("জীববিজ্ঞান") ||
    n.includes("general science") ||
    n.includes("সাধারণ বিজ্ঞান") ||
    n.includes("bangla 1") ||
    n.includes("বাংলা ১ম") ||
    n.includes("english 1") ||
    n.includes("ইংরেজি ১ম") ||
    n.includes("history") ||
    n.includes("ইতিহাস") ||
    n.includes("geography") ||
    n.includes("ভূগোল") ||
    n.includes("civics") ||
    n.includes("পৌরনীতি") ||
    n.includes("economics") ||
    n.includes("অর্থনীতি") ||
    n.includes("balaghat") ||
    n.includes("বালাগাত")
  ) {
    return "afternoon";
  }

  // 3. Night (রাত): Applied exercises, accounting, grammar exercises, problem sets, written composition
  if (
    n.includes("accounting") ||
    n.includes("হিসাববিজ্ঞান") ||
    n.includes("finance") ||
    n.includes("ফিন্যান্স") ||
    n.includes("business") ||
    n.includes("উদ্যোগ") ||
    n.includes("bangla 2") ||
    n.includes("বাংলা ২য়") ||
    n.includes("english 2") ||
    n.includes("ইংরেজি ২য়") ||
    n.includes("ict") ||
    n.includes("তথ্য ও যোগাযোগ")
  ) {
    return "night";
  }

  // Fallback distribution
  return "afternoon";
}

/**
 * Spaced repetition interval calculator (Ebbinghaus Forgetting Curve prevention)
 * Revision 1: +2 days
 * Revision 2: +7 days
 * Revision 3: +21 days
 * Revision 4+: +45 days
 */
export function calculateNextRevisionDue(
  baseDate: string,
  currentRevisionCount: number
): string {
  if (currentRevisionCount === 0) {
    return addDays(baseDate, 2);
  } else if (currentRevisionCount === 1) {
    return addDays(baseDate, 7);
  } else if (currentRevisionCount === 2) {
    return addDays(baseDate, 21);
  } else {
    return addDays(baseDate, 45);
  }
}

export function getRevisionStageBadge(revisionCount: number): {
  stage: number;
  label: string;
  labelBn: string;
  color: string;
} {
  switch (revisionCount) {
    case 0:
      return {
        stage: 1,
        label: "1st Review (Day 2)",
        labelBn: "১ম রিভিশন (২ দিন পর)",
        color: "amber",
      };
    case 1:
      return {
        stage: 2,
        label: "2nd Review (Day 7)",
        labelBn: "২য় রিভিশন (৭ দিন পর)",
        color: "blue",
      };
    case 2:
      return {
        stage: 3,
        label: "3rd Review (Day 21)",
        labelBn: "৩য় রিভিশন (২১ দিন পর)",
        color: "indigo",
      };
    default:
      return {
        stage: 4,
        label: "Mastered Memory (Day 45+)",
        labelBn: "স্থায়ী স্মৃতি (Mastered)",
        color: "emerald",
      };
  }
}

/**
 * Builds the complete intelligent study guide & routine
 */
export function generateStudentStudyPlan(params: {
  allTopics: PlannerTopicItem[];
  allSubjects: {
    id: number;
    name: string;
    nameBn?: string | null;
    streamGroup?: string | null;
  }[];
  examDate: string;
  targetDate: string;
  customDailyHours?: number;
}): StudentStudyPlan {
  const today = todayKey();
  const daysLeft = Math.max(1, diffDays(today, params.targetDate));
  const totalTopics = params.allTopics.length;
  const completedTopics = params.allTopics.filter(
    (t) => t.status === "completed"
  ).length;
  const remainingTopics = totalTopics - completedTopics;

  // Pace calculation
  const topicsPerDay =
    remainingTopics <= 0 ? 0 : Math.max(1, Math.ceil(remainingTopics / daysLeft));

  // Study hours estimation: ~45 mins per new topic + ~35 mins revision
  const avgMinsPerTopic = 50;
  const recommendedDailyMinutes =
    topicsPerDay === 0
      ? 60
      : Math.min(
          14 * 60,
          Math.max(120, topicsPerDay * avgMinsPerTopic + 45)
        );

  let intensity: "light" | "balanced" | "intensive" | "critical" = "balanced";
  let intensityLabelBn = "ভারসাম্যপূর্ণ গতি (Balanced)";
  if (topicsPerDay <= 2) {
    intensity = "light";
    intensityLabelBn = "সহজ গতি (Light)";
  } else if (topicsPerDay >= 3 && topicsPerDay <= 5) {
    intensity = "balanced";
    intensityLabelBn = "মানসম্মত লক্ষ্য (Balanced)";
  } else if (topicsPerDay >= 6 && topicsPerDay <= 8) {
    intensity = "intensive";
    intensityLabelBn = "কঠোর পরিশ্রম প্রয়োজন (Intensive)";
  } else if (topicsPerDay > 8) {
    intensity = "critical";
    intensityLabelBn = "জরুরি অতিরিক্ত সময় প্রয়োজন (High Workload)";
  }

  // ── 1. Distribute Subjects into Morning / Afternoon / Night Slots ──
  const morningSubjects: {
    id: number;
    name: string;
    nameBn?: string | null;
    pendingTopics: PlannerTopicItem[];
    suggestedToday: PlannerTopicItem[];
  }[] = [];

  const afternoonSubjects: {
    id: number;
    name: string;
    nameBn?: string | null;
    pendingTopics: PlannerTopicItem[];
    suggestedToday: PlannerTopicItem[];
  }[] = [];

  const nightSubjects: {
    id: number;
    name: string;
    nameBn?: string | null;
    pendingTopics: PlannerTopicItem[];
    suggestedToday: PlannerTopicItem[];
  }[] = [];

  // Group pending topics by subject
  const pendingBySub = new Map<number, PlannerTopicItem[]>();
  for (const t of params.allTopics) {
    if (t.status !== "completed") {
      const list = pendingBySub.get(t.subjectId) || [];
      list.push(t);
      pendingBySub.set(t.subjectId, list);
    }
  }

  for (const s of params.allSubjects) {
    const slot = getSubjectTimeSlot(s.name, s.nameBn, s.streamGroup);
    const pending = pendingBySub.get(s.id) || [];
    const suggested = pending.slice(0, 2);

    const data = {
      id: s.id,
      name: s.name,
      nameBn: s.nameBn,
      pendingTopics: pending,
      suggestedToday: suggested,
    };

    if (slot === "morning") {
      morningSubjects.push(data);
    } else if (slot === "afternoon") {
      afternoonSubjects.push(data);
    } else {
      nightSubjects.push(data);
    }
  }

  // ── 2. Spaced Repetition Queue ──
  const dueToday: DueRevisionItem[] = [];
  const upcomingWeek: DueRevisionItem[] = [];
  let totalMastered = 0;
  let totalInPipeline = 0;

  for (const t of params.allTopics) {
    if (t.status === "completed" && t.completedAt) {
      totalInPipeline++;
      if (t.revisionCount >= 3) {
        totalMastered++;
      }

      // Next revision due date
      const dueDate =
        t.nextRevisionDue ||
        calculateNextRevisionDue(t.completedAt, t.revisionCount);

      const isDue = dueDate <= today;
      const isWithin7Days = dueDate > today && dueDate <= addDays(today, 7);
      const isOverdue = dueDate < today;

      const item: DueRevisionItem = {
        id: t.id,
        subjectId: t.subjectId,
        subjectName: t.subjectName,
        subjectNameBn: t.subjectNameBn,
        name: t.name,
        lessonName: t.lessonName,
        completedAt: t.completedAt,
        lastRevisedAt: t.lastRevisedAt,
        revisionCount: t.revisionCount,
        nextRevisionDue: dueDate,
        isOverdue,
        stageBadge: getRevisionStageBadge(t.revisionCount),
      };

      if (isDue) {
        dueToday.push(item);
      } else if (isWithin7Days) {
        upcomingWeek.push(item);
      }
    }
  }

  // Sort revisions: overdue first, then earlier due dates
  dueToday.sort((a, b) => (a.nextRevisionDue > b.nextRevisionDue ? 1 : -1));
  upcomingWeek.sort((a, b) => (a.nextRevisionDue > b.nextRevisionDue ? 1 : -1));

  // ── 3. Daily Routine Schedule ──
  const dailyRoutineSteps = [
    {
      time: "06:00 AM – 06:45 AM",
      title: "Morning Routine & Focus Setup",
      titleBn: "ফজর, সকালের নাশতা ও দিনের লক্ষ্য নির্ধারণ",
      activity: "Wake up, morning prayer/exercise, review today's targets",
      activityBn: "সকালের ফ্রেশ মাইন্ডে আজকের দিনের ৩টি প্রধান লক্ষ্য ড্যাশবোর্ডে দেখে নিন।",
      slot: "break" as const,
    },
    {
      time: "06:45 AM – 10:30 AM",
      title: "Morning Deep Focus Block (Analytical & Memorization)",
      titleBn: "সকালের গভীর মনোযোগ সেশন (গণিত, বিজ্ঞান ও ধর্মীয় মূল বিষয়)",
      activity: "Study complex formulas, math problems, Quran/Hadith, physics/chemistry",
      activityBn: "মস্তিষ্ক সবচেয়ে সতেজ থাকে। কঠিন অংক, সূত্র ও মুখস্থ করার বিষয়গুলো শেষ করুন।",
      slot: "morning" as const,
    },
    {
      time: "10:30 AM – 02:00 PM",
      title: "Class / Rest / Lunch Break",
      titleBn: "ক্লাস / গোসল, জোহর ও দুপুরের খাবার",
      activity: "Institutional classes, rest, prayer and nutritious meal",
      activityBn: "মস্তিষ্ককে বিশ্রাম দিন। হালকা বিরতি পরবর্তী সেশনে মনোযোগ দ্বিগুণ করে।",
      slot: "break" as const,
    },
    {
      time: "02:30 PM – 05:30 PM",
      title: "Afternoon Reading & Comprehension Block",
      titleBn: "দুপুর ও বিকেলের পঠন সেশন (সাহিত্য, বায়োলজি ও সামাজিক বিজ্ঞান)",
      activity: "Bangla & English text reading, biology diagrams, history & geography",
      activityBn: "বই রিডিং পড়া, গুরুত্বপূর্ণ লাইন দাগানো, নোট তৈরি ও বহুনির্বাচনী অনুশীলন।",
      slot: "afternoon" as const,
    },
    {
      time: "05:30 PM – 07:00 PM",
      title: "Physical Exercise, Asr-Maghrib & Family",
      titleBn: "আসর-মাগরিব, শারীরিক ব্যায়াম ও রিফ্রেশমেন্ট",
      activity: "Outdoor walk, sports, tea and refreshing break",
      activityBn: "শারীরিক সুস্থতা ও চোখের আরামের জন্য স্ক্রিন থেকে দূরে থাকুন।",
      slot: "break" as const,
    },
    {
      time: "07:00 PM – 10:30 PM",
      title: "Night Problem Solving & Spaced Revision Block",
      titleBn: "রাতের লিখিত অনুশীলন ও স্পেসড রিভিশন সেশন",
      activity: "Accounting math, writing practice, and reviewing previous completed topics",
      activityBn: "হিসাববিজ্ঞান, গ্রামার প্র্যাকটিস এবং আজকে নির্ধারিত রিভিশন টপিকগুলো রিভাইজ করুন।",
      slot: "night" as const,
    },
    {
      time: "10:30 PM – 11:00 PM",
      title: "Daily Study Log & Sleep Preparation",
      titleBn: "দৈনিক স্টাডি লগ পূরণ ও নিশ্চিন্ত ঘুম",
      activity: "Log completed topics, celebrate streak, and get 7 hours of peaceful sleep",
      activityBn: "আজকের অগ্রগতি সিস্টেমে মার্ক করুন এবং পরবর্তী দিনের মানসিক প্রস্তুতি নিয়ে ঘুমান।",
      slot: "break" as const,
    },
  ];

  // ── 4. Exam Prep Guidelines ──
  const examGuidelines = [
    {
      title: "পড়া মনে রাখার বৈজ্ঞানিক নিয়ম (Spaced Repetition)",
      detail:
        "কোনো নতুন টপিক পড়ার পর ২৪-৪৮ ঘণ্টার মধ্যে একবার, ৭ দিন পর ২য় বার এবং ২১ দিন পর ৩য় বার রিভিশন না দিলে মস্তিষ্কের স্মৃতি ৮০% হারিয়ে যায়। আমাদের সিস্টেমের 'Due Revision' বাটন ফলো করুন।",
      category: "memory" as const,
    },
    {
      title: "পোমোডোরো টেকনিক (৫০ মিনিট পড়া + ১০ মিনিট বিরতি)",
      detail:
        "টানা ঘণ্টার পর ঘণ্টা না পড়ে ৫০ মিনিট পূর্ণ মনোযোগে পড়ুন, এরপর ১০ মিনিটের বিরতি নিন। এতে ক্লান্তি আসে না এবং দীর্ঘক্ষণ গভীর মনোযোগ বজায় থাকে।",
      category: "focus" as const,
    },
    {
      title: "অ্যাক্টিভ রিকল (বই বন্ধ করে নিজে নিজে মনে করা)",
      detail:
        "শুধু বারবার রিডিং পড়ার চেয়ে পড়ার পর বই বন্ধ করে খাতায় মূল পয়েন্ট বা সূত্রগুলো লেখার চেষ্টা করুন। এটি পরীক্ষায় দ্রুত উত্তর লেখার ক্ষমতা বহুগুণ বাড়ায়।",
      category: "memory" as const,
    },
    {
      title: "পর্যাপ্ত ঘুম ও শারীরিক সুস্থতা",
      detail:
        "পরীক্ষার ভালো ফলাফলের জন্য দৈনিক কমপক্ষে ৭ ঘণ্টা ঘুম অপরিহার্য। ঘুমের সময়ই মস্তিষ্কে সারাদিনের পড়া স্থায়ী স্মৃতিতে রূপান্তরিত হয়।",
      category: "health" as const,
    },
  ];

  return {
    pace: {
      totalTopics,
      completedTopics,
      remainingTopics,
      daysLeft,
      targetDate: params.targetDate,
      examDate: params.examDate,
      topicsPerDay,
      recommendedDailyMinutes,
      recommendedDailyHoursStr: formatMinutes(recommendedDailyMinutes),
      intensity,
      intensityLabelBn,
    },
    slots: {
      morning: {
        slot: "morning",
        title: "Morning High-Focus Session",
        titleBn: "সকালের গভীর মনোযোগ সেশন (৬:৪৫ AM – ১০:৩০ AM)",
        timeRange: "06:45 AM – 10:30 AM",
        cognitiveFocus: "Analytical Reasoning & Core Formulations",
        cognitiveFocusBn: "গণিত, বিজ্ঞান ও কোর ধর্মীয় মূল তত্ত্ব (মস্তিষ্কের সর্বোচ্চ সতেজ সময়)",
        recommendedMinutes: Math.round(recommendedDailyMinutes * 0.4),
        subjects: morningSubjects,
      },
      afternoon: {
        slot: "afternoon",
        title: "Afternoon Reading & Comprehension",
        titleBn: "দুপুর ও বিকেলের পঠন সেশন (২:৩০ PM – ৫:৩০ PM)",
        timeRange: "02:30 PM – 05:30 PM",
        cognitiveFocus: "Descriptive Literature & Conceptual Sciences",
        cognitiveFocusBn: "সাহিত্য, জীববিদ্যা ও সামাজিক বিজ্ঞান (পঠন ও নোট তৈরির উপযুক্ত সময়)",
        recommendedMinutes: Math.round(recommendedDailyMinutes * 0.3),
        subjects: afternoonSubjects,
      },
      night: {
        slot: "night",
        title: "Night Practice & Spaced Revision",
        titleBn: "রাতের লিখিত অনুশীলন ও রিভিশন সেশন (৭:০০ PM – ১০:৩০ PM)",
        timeRange: "07:00 PM – 10:30 PM",
        cognitiveFocus: "Writing, Calculations & Memory Consolidation",
        cognitiveFocusBn: "হিসাববিজ্ঞান, গ্রামার, লিখিত অনুশীলন ও পূর্বের পড়া রিভিশন",
        recommendedMinutes: Math.round(recommendedDailyMinutes * 0.3),
        subjects: nightSubjects,
      },
    },
    revisions: {
      dueToday,
      upcomingWeek,
      totalMastered,
      totalInRevisionPipeline: totalInPipeline,
    },
    dailyRoutineSteps,
    examGuidelines,
  };
}
