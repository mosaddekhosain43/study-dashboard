"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlarmClock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  Hourglass,
  Layers,
  Lightbulb,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { StudentStudyPlan, TimeSlot } from "@/lib/studyPlanner";
import { markTopicRevisedAction } from "@/actions/planner";
import { ProgressBar } from "@/components/ui";

interface Props {
  initialPlan: StudentStudyPlan;
}

export default function StudyGuidePlannerClient({ initialPlan }: Props) {
  const [plan, setPlan] = useState<StudentStudyPlan>(initialPlan);
  const [activeSlot, setActiveSlot] = useState<TimeSlot | "all">("all");
  const [revisionTab, setRevisionTab] = useState<"due" | "upcoming">("due");
  const [revisedTopicIds, setRevisedTopicIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleMarkRevised = (topicId: number) => {
    startTransition(async () => {
      const res = await markTopicRevisedAction(topicId);
      if (res.ok) {
        setRevisedTopicIds((prev) => new Set(prev).add(topicId));
        setMsg("টপিকটি সফলভাবে রিভিশন সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে!");
        setTimeout(() => setMsg(null), 4000);
      } else {
        alert(res.error || "Failed to mark revision.");
      }
    });
  };

  const dueRevisions = plan.revisions.dueToday.filter(
    (t) => !revisedTopicIds.has(t.id)
  );

  return (
    <div className="space-y-8">
      {/* ── Notification Banner ───────────────────────────────── */}
      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
          <button
            onClick={() => setMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Header / Hero Section ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/80 p-6 sm:p-8 shadow-xs">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-leaf/5 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf-soft/40 px-3 py-1 text-[11px] font-bold text-leaf">
              <Compass className="size-3.5" />
              <span>স্মার্ট পরীক্ষার প্রস্তুতি ও রুটিন গাইড</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              পরীক্ষায় সর্বোচ্চ প্রস্তুতির দৈনিক কর্মপরিকল্পনা
            </h1>
            <p className="text-xs sm:text-sm text-ink-faint leading-relaxed">
              আপনার সিলেবাসের অবশিষ্ট টপিক ও পরীক্ষার দিন গণনা করে সময়ভিত্তিক
              পড়ার রুটিন (সকাল, দুপুর, রাত) এবং পড়া মনে রাখার বৈজ্ঞানিক
              রিভিশন চার্ট নিচে সাজানো হলো।
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="card p-3.5 border-line/80 bg-white/70 shadow-2xs">
              <div className="flex items-center gap-2 text-leaf mb-1">
                <Target className="size-4" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider">
                  দৈনিক টার্গেট
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-ink">
                {plan.pace.topicsPerDay}{" "}
                <span className="text-xs font-semibold text-ink-faint">
                  টি টপিক
                </span>
              </p>
              <span className="inline-block mt-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {plan.pace.intensityLabelBn}
              </span>
            </div>

            <div className="card p-3.5 border-line/80 bg-white/70 shadow-2xs">
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Clock className="size-4" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider">
                  পড়ার সময়
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-ink">
                {plan.pace.recommendedDailyHoursStr}
              </p>
              <p className="text-[10.5px] text-ink-faint mt-1">
                প্রতিদিন বরাদ্দকৃত
              </p>
            </div>

            <div className="card p-3.5 border-line/80 bg-white/70 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Hourglass className="size-4" />
                <span className="text-[10.5px] font-bold uppercase tracking-wider">
                  বাকি সময়
                </span>
              </div>
              <p className="font-display text-2xl font-bold text-ink">
                {plan.pace.daysLeft}{" "}
                <span className="text-xs font-semibold text-ink-faint">দিন</span>
              </p>
              <p className="text-[10.5px] text-ink-faint mt-1 truncate">
                টার্গেট: {plan.pace.targetDate}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar in Hero */}
        <div className="mt-6 pt-5 border-t border-line/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-ink">
              সিলেবাস সমাপ্তি:{" "}
              <strong className="text-leaf">
                {plan.pace.totalTopics > 0
                  ? Math.round(
                      (plan.pace.completedTopics / plan.pace.totalTopics) * 100
                    )
                  : 0}
                %
              </strong>
            </span>
            <span className="text-ink-faint">
              ({plan.pace.completedTopics} সম্পন্ন · {plan.pace.remainingTopics} টি
              বাকি)
            </span>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar
              value={
                plan.pace.totalTopics > 0
                  ? plan.pace.completedTopics / plan.pace.totalTopics
                  : 0
              }
            />
          </div>
        </div>
      </div>

      {/* ── Spaced Repetition Alert (Due For Revision Today) ───────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Brain className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <span>পড়া মনে রাখার রিভিশন সিস্টেম (Spaced Repetition)</span>
                {dueRevisions.length > 0 && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5">
                    {dueRevisions.length} টি প্রস্তুত
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink-faint">
                বৈজ্ঞানিক নিয়মে নির্ধারিত দিনে রিভিশন দিলে পড়া সরাসরি দীর্ঘস্থায়ী
                স্মৃতিতে (Long-term memory) সংরক্ষিত হয়।
              </p>
            </div>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center bg-paper rounded-xl p-1 border border-line text-xs font-semibold">
            <button
              onClick={() => setRevisionTab("due")}
              className={`rounded-lg px-3 py-1.5 transition ${
                revisionTab === "due"
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              আজকের রিভিশন ({dueRevisions.length})
            </button>
            <button
              onClick={() => setRevisionTab("upcoming")}
              className={`rounded-lg px-3 py-1.5 transition ${
                revisionTab === "upcoming"
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              আসন্ন ৭ দিন ({plan.revisions.upcomingWeek.length})
            </button>
          </div>
        </div>

        {revisionTab === "due" ? (
          dueRevisions.length === 0 ? (
            <div className="card p-6 border-dashed border-line text-center space-y-2">
              <div className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="font-display text-sm font-bold text-ink">
                আজকের নির্ধারিত কোনো রিভিশন বকেয়া নেই!
              </p>
              <p className="text-xs text-ink-faint max-w-md mx-auto">
                অসাধারণ! পূর্বে পড়া টপিকগুলো সঠিক সময়ে রিভিশন দেওয়া হয়েছে।
                আজকে নতুন টপিকগুলো মনোযোগ দিয়ে পড়ুন।
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dueRevisions.map((t) => (
                <div
                  key={t.id}
                  className="card p-4 border-line/80 bg-white hover:border-amber-400/80 transition flex flex-col justify-between shadow-2xs space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-leaf bg-leaf-soft px-2 py-0.5 rounded">
                        {t.subjectNameBn || t.subjectName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.stageBadge.color === "amber"
                            ? "bg-amber-100 text-amber-800"
                            : t.stageBadge.color === "blue"
                            ? "bg-sky-100 text-sky-800"
                            : t.stageBadge.color === "indigo"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.stageBadge.labelBn}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-ink leading-snug">
                      {t.name}
                    </h3>
                    {t.lessonName && (
                      <p className="text-[11px] text-ink-faint">
                        অধ্যায়: {t.lessonName}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                    <span className="text-[11px] text-ink-faint">
                      পড়েছিলেন: {t.completedAt}
                    </span>
                    <button
                      onClick={() => handleMarkRevised(t.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition disabled:opacity-50"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>রিভিশন সম্পন্ন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : plan.revisions.upcomingWeek.length === 0 ? (
          <div className="card p-6 border-dashed border-line text-center text-xs text-ink-faint">
            আগামী ৭ দিনের জন্য কোনো রিভিশন পাইপলাইনে নেই।
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.revisions.upcomingWeek.map((t) => (
              <div
                key={t.id}
                className="card p-4 border-line/70 bg-paper/40 flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-ink-faint">
                      {t.subjectNameBn || t.subjectName}
                    </span>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {t.nextRevisionDue} তারিখে রিভিশন
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-ink">{t.name}</h3>
                </div>
                <p className="text-[11px] text-ink-faint pt-1 border-t border-line/50">
                  পরবর্তী ধাপ: {t.stageBadge.labelBn}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Time-of-Day Routine (সকাল, দুপুর, রাত) ─────────────── */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-leaf-soft text-leaf">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                সময়ভিত্তিক স্মার্ট রুটিন ও বিষয় বণ্টন
              </h2>
              <p className="text-xs text-ink-faint">
                মস্তিষ্কের এনার্জি লেভেল ও মনোযোগ ক্ষমতার বৈজ্ঞানিক মিল রেখে বিষয়গুলো
                সকাল, দুপুর ও রাতে ভাগ করা হয়েছে।
              </p>
            </div>
          </div>

          {/* Slot Filter Buttons */}
          <div className="flex items-center bg-paper rounded-xl p-1 border border-line text-xs font-semibold">
            <button
              onClick={() => setActiveSlot("all")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeSlot === "all"
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              সবগুলো (All)
            </button>
            <button
              onClick={() => setActiveSlot("morning")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeSlot === "morning"
                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              🌅 সকাল
            </button>
            <button
              onClick={() => setActiveSlot("afternoon")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeSlot === "afternoon"
                  ? "bg-white text-sky-700 shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              ☀️ দুপুর
            </button>
            <button
              onClick={() => setActiveSlot("night")}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeSlot === "night"
                  ? "bg-white text-indigo-700 shadow-2xs font-bold"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              🌙 রাত
            </button>
          </div>
        </div>

        {/* The 3 Slot Blocks */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 1. MORNING BLOCK */}
          {(activeSlot === "all" || activeSlot === "morning") && (
            <div className="card flex flex-col justify-between overflow-hidden border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-card to-card shadow-xs">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                      <Sunrise className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-ink text-sm sm:text-base">
                        সকালের সেশন (Morning)
                      </h3>
                      <p className="text-[11px] font-semibold text-amber-700">
                        {plan.slots.morning.timeRange}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full shrink-0">
                    ~{Math.round(plan.slots.morning.recommendedMinutes / 60)} ঘণ্টা
                  </span>
                </div>

                <div className="rounded-xl bg-white/80 p-3 border border-amber-100 text-xs text-amber-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Zap className="size-3.5 text-amber-600" />
                    মস্তিষ্কের পিক ফোকাস সময়
                  </p>
                  <p className="text-[11.5px] text-amber-900/80 leading-relaxed">
                    {plan.slots.morning.cognitiveFocusBn}
                  </p>
                </div>

                {/* Subjects in Morning */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    সকালের উপযুক্ত বিষয় ও প্রস্তাবিত টপিক:
                  </p>
                  {plan.slots.morning.subjects.length === 0 ? (
                    <p className="text-xs text-ink-faint">
                      কোনো সকালের বিষয় নিবন্ধিত নেই।
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {plan.slots.morning.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-line bg-paper/50 p-3 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">
                              {sub.nameBn || sub.name}
                            </span>
                            <span className="text-[10px] font-semibold text-ink-faint bg-white px-2 py-0.5 rounded border border-line">
                              {sub.pendingTopics.length} টি বাকি
                            </span>
                          </div>

                          {sub.suggestedToday.length > 0 && (
                            <ul className="space-y-1 pl-2 border-l-2 border-amber-300">
                              {sub.suggestedToday.map((t) => (
                                <li
                                  key={t.id}
                                  className="text-[11px] text-ink-soft flex items-center justify-between"
                                >
                                  <span className="truncate">{t.name}</span>
                                  <Link
                                    href={`/subjects/${sub.id}`}
                                    className="text-[10px] font-bold text-amber-700 hover:underline shrink-0 ml-2"
                                  >
                                    পড়ুন →
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. AFTERNOON BLOCK */}
          {(activeSlot === "all" || activeSlot === "afternoon") && (
            <div className="card flex flex-col justify-between overflow-hidden border-sky-200/80 bg-gradient-to-b from-sky-50/40 via-card to-card shadow-xs">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-sky-500/10 text-sky-600 shrink-0">
                      <Sun className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-ink text-sm sm:text-base">
                        দুপুর ও বিকেল (Afternoon)
                      </h3>
                      <p className="text-[11px] font-semibold text-sky-700">
                        {plan.slots.afternoon.timeRange}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded-full shrink-0">
                    ~{Math.round(plan.slots.afternoon.recommendedMinutes / 60)} ঘণ্টা
                  </span>
                </div>

                <div className="rounded-xl bg-white/80 p-3 border border-sky-100 text-xs text-sky-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-sky-600" />
                    পঠন ও বিশ্লেষণ সময়
                  </p>
                  <p className="text-[11.5px] text-sky-900/80 leading-relaxed">
                    {plan.slots.afternoon.cognitiveFocusBn}
                  </p>
                </div>

                {/* Subjects in Afternoon */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    দুপুরের উপযুক্ত বিষয় ও প্রস্তাবিত টপিক:
                  </p>
                  {plan.slots.afternoon.subjects.length === 0 ? (
                    <p className="text-xs text-ink-faint">
                      কোনো দুপুরের বিষয় নিবন্ধিত নেই।
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {plan.slots.afternoon.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-line bg-paper/50 p-3 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">
                              {sub.nameBn || sub.name}
                            </span>
                            <span className="text-[10px] font-semibold text-ink-faint bg-white px-2 py-0.5 rounded border border-line">
                              {sub.pendingTopics.length} টি বাকি
                            </span>
                          </div>

                          {sub.suggestedToday.length > 0 && (
                            <ul className="space-y-1 pl-2 border-l-2 border-sky-300">
                              {sub.suggestedToday.map((t) => (
                                <li
                                  key={t.id}
                                  className="text-[11px] text-ink-soft flex items-center justify-between"
                                >
                                  <span className="truncate">{t.name}</span>
                                  <Link
                                    href={`/subjects/${sub.id}`}
                                    className="text-[10px] font-bold text-sky-700 hover:underline shrink-0 ml-2"
                                  >
                                    পড়ুন →
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. NIGHT BLOCK */}
          {(activeSlot === "all" || activeSlot === "night") && (
            <div className="card flex flex-col justify-between overflow-hidden border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 via-card to-card shadow-xs">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                      <Moon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-ink text-sm sm:text-base">
                        রাতের সেশন (Night)
                      </h3>
                      <p className="text-[11px] font-semibold text-indigo-700">
                        {plan.slots.night.timeRange}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100/80 px-2 py-0.5 rounded-full shrink-0">
                    ~{Math.round(plan.slots.night.recommendedMinutes / 60)} ঘণ্টা
                  </span>
                </div>

                <div className="rounded-xl bg-white/80 p-3 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <RotateCcw className="size-3.5 text-indigo-600" />
                    লিখিত অনুশীলন ও রিভিশন
                  </p>
                  <p className="text-[11.5px] text-indigo-900/80 leading-relaxed">
                    {plan.slots.night.cognitiveFocusBn}
                  </p>
                </div>

                {/* Subjects in Night */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    রাতের উপযুক্ত বিষয় ও প্রস্তাবিত টপিক:
                  </p>
                  {plan.slots.night.subjects.length === 0 ? (
                    <p className="text-xs text-ink-faint">
                      কোনো রাতের বিষয় নিবন্ধিত নেই।
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {plan.slots.night.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-xl border border-line bg-paper/50 p-3 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink">
                              {sub.nameBn || sub.name}
                            </span>
                            <span className="text-[10px] font-semibold text-ink-faint bg-white px-2 py-0.5 rounded border border-line">
                              {sub.pendingTopics.length} টি বাকি
                            </span>
                          </div>

                          {sub.suggestedToday.length > 0 && (
                            <ul className="space-y-1 pl-2 border-l-2 border-indigo-300">
                              {sub.suggestedToday.map((t) => (
                                <li
                                  key={t.id}
                                  className="text-[11px] text-ink-soft flex items-center justify-between"
                                >
                                  <span className="truncate">{t.name}</span>
                                  <Link
                                    href={`/subjects/${sub.id}`}
                                    className="text-[10px] font-bold text-indigo-700 hover:underline shrink-0 ml-2"
                                  >
                                    পড়ুন →
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Daily Timetable Schedule & Exam Preparation Tips ───────── */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Full Day Timetable */}
        <div className="card p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <AlarmClock className="size-4.5 text-leaf" />
            <h3 className="font-display font-bold text-base">
              এক নজরে আদর্শ দৈনিক সময়সূচি (Daily Schedule)
            </h3>
          </div>
          <p className="text-xs text-ink-faint leading-relaxed">
            একজন পরীক্ষার্থীর জন্য দিনে পর্যাপ্ত বিশ্রাম ও নামাজের সমন্বয়ে তৈরি
            সময়সূচি:
          </p>

          <div className="space-y-3 pt-2">
            {plan.dailyRoutineSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl border border-line/70 bg-paper/30 hover:bg-paper transition"
              >
                <span className="text-[11px] font-bold font-mono text-leaf bg-leaf-soft px-2 py-1 rounded shrink-0 mt-0.5">
                  {step.time}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-ink">{step.titleBn}</p>
                  <p className="text-[11.5px] text-ink-faint">
                    {step.activityBn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory & Exam Retention Guidelines */}
        <div className="card p-6 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-ink">
              <Lightbulb className="size-4.5 text-amber-500" />
              <h3 className="font-display font-bold text-base">
                পড়া মনে রাখার বৈজ্ঞানিক টিপস
              </h3>
            </div>

            <div className="space-y-3">
              {plan.examGuidelines.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line/80 bg-white p-3.5 space-y-1 shadow-2xs"
                >
                  <p className="font-bold text-xs text-ink flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-leaf shrink-0" />
                    <span>{tip.title}</span>
                  </p>
                  <p className="text-[11.5px] text-ink-faint leading-relaxed">
                    {tip.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-leaf/30 bg-leaf-soft/30 p-4 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-leaf font-bold text-xs">
              <CalendarCheck className="size-4" />
              <span>শুক্রবার: সাপ্তাহিক মেগা রিভিশন দিবস</span>
            </div>
            <p className="text-[11.5px] text-ink-soft leading-relaxed">
              সপ্তাহে ১ দিন (যেমন শুক্রবার) নতুন কোনো বড় চ্যাপ্টার না ধরে পুরো
              সপ্তাহে যা পড়েছেন তা খাতায় লিখে বা মডেল টেস্ট দিয়ে যাচাই করুন।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
