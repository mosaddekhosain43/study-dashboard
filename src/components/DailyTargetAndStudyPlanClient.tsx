"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlarmClockCheck,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Compass,
  Flame,
  Hourglass,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  StudentDailyTargetPlanData,
  RecommendedBookItem,
  RecommendedBookTopic,
  WeeklyFridaySubjectGroup,
} from "@/actions/planner";
import {
  toggleTopicCompleteAction,
  markTopicRevisedAction,
} from "@/actions/planner";
import { formatLong, toBnDigits } from "@/lib/dates";

interface Props {
  initialData: StudentDailyTargetPlanData;
}

export default function DailyTargetAndStudyPlanClient({ initialData }: Props) {
  const [data, setData] = useState<StudentDailyTargetPlanData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [showPreviewFriday, setShowPreviewFriday] = useState(false);
  const [swappingSubjectId, setSwappingSubjectId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle topic completion (Today's recommendations)
  const handleToggleTopic = (subjectId: number, topicId: number, currentStatus: string) => {
    const isCurrentlyDone = currentStatus === "completed";
    const nextStatus = isCurrentlyDone ? "not_started" : "completed";

    // Optimistic state update
    setData((prev) => {
      const updatedBooks = prev.recommendedBooks.map((book) => {
        if (book.subjectId !== subjectId) return book;
        const updatedTopics = book.topics.map((t) => {
          if (t.id !== topicId) return t;
          return {
            ...t,
            status: nextStatus,
            isCompletedToday: !isCurrentlyDone,
          };
        });
        const completedDelta = isCurrentlyDone ? -1 : 1;
        const newCompleted = Math.max(0, book.completedTopics + completedDelta);
        return {
          ...book,
          completedTopics: newCompleted,
          progress: book.totalTopics > 0 ? newCompleted / book.totalTopics : 0,
          topics: updatedTopics,
        };
      });

      const todayDelta = isCurrentlyDone ? -1 : 1;
      const newDoneToday = Math.max(0, prev.doneToday + todayDelta);
      const newCompletedTopics = Math.max(0, prev.completedTopics + todayDelta);
      const newRemaining = Math.max(0, prev.remainingTopics - todayDelta);

      return {
        ...prev,
        doneToday: newDoneToday,
        completedTopics: newCompletedTopics,
        remainingTopics: newRemaining,
        isTargetMetToday: newDoneToday >= prev.requiredTopicsPerDay,
        recommendedBooks: updatedBooks,
      };
    });

    startTransition(async () => {
      const res = await toggleTopicCompleteAction(topicId);
      if (res.ok) {
        showToast(
          res.newStatus === "completed"
            ? "টপিকটি সম্পন্ন হয়েছে হিসেবে চিহ্নিত করা হয়েছে! 🎉"
            : "টপিকটি আবার অপঠিত হিসেবে চিহ্নিত করা হয়েছে।"
        );
      } else {
        showToast(res.error || "আপডেট করা সম্ভব হয়নি।");
      }
    });
  };

  // Mark topic as revised (Friday Revision)
  const handleMarkRevised = (subjectId: number, topicId: number) => {
    // Optimistic update
    setData((prev) => {
      const updatedSubjects = prev.fridayRevision.subjects.map((sub) => {
        if (sub.subjectId !== subjectId) return sub;
        return {
          ...sub,
          topics: sub.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  isRevisedToday: true,
                  revisionCount: t.revisionCount + 1,
                  lastRevisedAt: new Date().toISOString().split("T")[0],
                }
              : t
          ),
        };
      });
      return {
        ...prev,
        fridayRevision: {
          ...prev.fridayRevision,
          totalRevisedThisWeek: prev.fridayRevision.totalRevisedThisWeek + 1,
          subjects: updatedSubjects,
        },
      };
    });

    startTransition(async () => {
      const res = await markTopicRevisedAction(topicId);
      if (res.ok) {
        showToast("টপিকটির রিভিশন সফলভাবে রেকর্ড করা হয়েছে! 🔄");
      } else {
        showToast(res.error || "রিভিশন আপডেট ব্যর্থ হয়েছে।");
      }
    });
  };

  const isFriday = data.fridayRevision.isFriday;
  const fridaySubjects = data.fridayRevision.subjects;
  const totalWeeklyCompleted = data.fridayRevision.totalCompletedThisWeek;
  const totalWeeklyRevised = data.fridayRevision.totalRevisedThisWeek;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. WEEKLY FRIDAY REVISION SECTION                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isFriday ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-card to-emerald-50/20 p-5 sm:p-6 shadow-sm dark:from-emerald-950/30 dark:to-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                <RotateCcw className="size-3.5" />
                <span>আজ শুক্রবার — সাপ্তাহিক রিভিশন দিন 🔄</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-ink">
                এই সপ্তাহের পড়া বিষয় ও টপিকগুলো আজ রিভিশন দিন
              </h2>
              <p className="text-xs sm:text-[13px] text-ink-faint leading-relaxed max-w-2xl">
                সপ্তাহে যা পড়েছেন তা শুক্রবারে রিভিশন দিলে স্মৃতি স্থায়ী হয়। এই সপ্তাহে আপনি{" "}
                <strong className="text-ink font-bold font-bengali">
                  {toBnDigits(fridaySubjects.length)}
                </strong>{" "}
                টি বিষয়ের মোট{" "}
                <strong className="text-ink font-bold font-bengali">
                  {toBnDigits(totalWeeklyCompleted)}
                </strong>{" "}
                টি টপিক সম্পন্ন করেছেন। নতুন পড়ার চেয়ে এগুলো রিভিশন দেওয়া আজ বেশি জরুরি।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl border border-emerald-200 bg-white dark:bg-card px-4 py-2.5 text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  রিভিশন সম্পন্ন
                </p>
                <p className="font-display text-lg font-bold text-ink font-bengali">
                  {toBnDigits(totalWeeklyRevised)} / {toBnDigits(totalWeeklyCompleted)}
                </p>
              </div>
            </div>
          </div>

          {/* Topics completed this week grouped by Subject */}
          <div className="mt-5 space-y-3">
            {fridaySubjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white/60 dark:bg-card/60 p-4 text-center text-xs text-ink-faint">
                এই সপ্তাহে (শনিবার থেকে বৃহস্পতিবার) এখনো কোনো টপিক সম্পন্ন হিসেবে রেকর্ড করা হয়নি।
                আগের কোনো টপিক রিভিশন দিতে চাইলে সিলেবাস সেকশন দেখুন।
              </div>
            ) : (
              fridaySubjects.map((sub) => (
                <div
                  key={sub.subjectId}
                  className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white/80 dark:bg-card/80 p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        📖
                      </span>
                      <span className="font-display text-xs sm:text-sm font-bold text-ink">
                        {sub.subjectNameBn || sub.subjectName}
                      </span>
                      {sub.subjectNameBn && (
                        <span className="text-[11px] text-ink-faint hidden sm:inline">
                          ({sub.subjectName})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 font-bengali">
                      {toBnDigits(sub.topics.length)}টি টপিক
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sub.topics.map((top) => (
                      <div
                        key={top.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper/50 dark:bg-card/50 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink truncate">{top.name}</p>
                          {top.chapter && (
                            <p className="text-[10.5px] text-ink-faint truncate">
                              অধ্যায়: {top.chapter}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {top.isRevisedToday ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                              <Check className="size-3" />
                              <span>রিভিশন সম্পন্ন</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkRevised(sub.subjectId, top.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-[11px] font-bold transition shadow-2xs active:scale-95 disabled:opacity-50"
                            >
                              <RotateCcw className="size-3" />
                              <span>রিভিশন সম্পন্ন করুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Not Friday: Compact Weekly Revision Queue Preview */
        <div className="rounded-2xl border border-line bg-gradient-to-r from-paper via-card to-paper p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <RotateCcw className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">
                  শুক্রবার সাপ্তাহিক রিভিশন প্রস্তুতি
                </p>
                <p className="text-[11.5px] text-ink-faint truncate">
                  এই সপ্তাহে ইতোমধ্যে{" "}
                  <strong className="text-ink font-semibold font-bengali">
                    {toBnDigits(totalWeeklyCompleted)}
                  </strong>{" "}
                  টি টপিক সম্পন্ন হয়েছে (যা আগামী শুক্রবারে রিভিশন দিতে হবে)
                </p>
              </div>
            </div>

            {totalWeeklyCompleted > 0 && (
              <button
                onClick={() => setShowPreviewFriday(!showPreviewFriday)}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-leaf hover:underline shrink-0"
              >
                <span>{showPreviewFriday ? "লুকান" : "রিভিশন তালিকা দেখুন"}</span>
                {showPreviewFriday ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Collapsible preview */}
          {showPreviewFriday && fridaySubjects.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-line/60 space-y-2 animate-in fade-in">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                শুক্রবার রিভিশনের জন্য নির্ধারিত তালিকা ({toBnDigits(totalWeeklyCompleted)}টি টপিক):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fridaySubjects.map((sub) => (
                  <div
                    key={sub.subjectId}
                    className="rounded-xl border border-line/80 bg-paper/50 p-2.5 text-xs"
                  >
                    <p className="font-bold text-ink truncate mb-1">
                      {sub.subjectNameBn || sub.subjectName} ({toBnDigits(sub.topics.length)})
                    </p>
                    <ul className="space-y-1 text-ink-faint text-[11px]">
                      {sub.topics.slice(0, 3).map((t) => (
                        <li key={t.id} className="truncate flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-emerald-500" />
                          <span className="truncate">{t.name}</span>
                        </li>
                      ))}
                      {sub.topics.length > 3 && (
                        <li className="text-[10px] text-ink-faint font-semibold pl-2.5">
                          + আরো {toBnDigits(sub.topics.length - 3)}টি টপিক
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. TARGET STUDY PACE & COUNTDOWN SECTION                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-line/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-xl bg-leaf text-white shadow-2xs">
                <Target className="size-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                টার্গেট স্টাডি পেস (Target Study Pace)
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
              টার্গেটে পৌঁছাতে প্রতিদিন গড়ে{" "}
              <span className="text-leaf font-extrabold font-bengali">
                {toBnDigits(data.requiredTopicsPerDay || 1)}
              </span>
              টি টপিক শেষ করতে হবে
            </h2>
            <p className="text-xs sm:text-[13px] text-ink-faint">
              আপনার টার্গেট তারিখ:{" "}
              <strong className="text-ink font-semibold">{data.targetDate}</strong> · বাকি সময়:{" "}
              <strong className="text-ink font-semibold font-bengali">
                {toBnDigits(data.daysToTarget)}
              </strong>{" "}
              দিন · অবশিষ্ট সিলেবাস:{" "}
              <strong className="text-ink font-semibold font-bengali">
                {toBnDigits(data.remainingTopics)}
              </strong>{" "}
              টি টপিক
            </p>
          </div>

          {/* Today's Target Progress Indicator */}
          <div className="rounded-2xl border border-leaf/30 bg-leaf-soft/20 p-4 text-center shrink-0 min-w-[200px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-leaf-deep">
              আজকের পড়ার অগ্রগতি
            </p>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="font-display text-2xl sm:text-3xl font-bold text-ink font-bengali">
                {toBnDigits(data.doneToday)}
              </span>
              <span className="text-sm font-bold text-ink-faint font-bengali">
                / {toBnDigits(data.requiredTopicsPerDay || 1)}
              </span>
              <span className="text-xs text-ink-faint font-medium ml-1">টপিক</span>
            </div>
            {data.isTargetMetToday ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5">
                <Check className="size-3" /> আজকের টার্গেট পূরণ! 🎉
              </span>
            ) : (
              <span className="mt-1 inline-block text-[11px] text-ink-faint font-bengali">
                আজ আরো {toBnDigits(Math.max(0, (data.requiredTopicsPerDay || 1) - data.doneToday))}টি বাকি
              </span>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* 3. TODAY'S RECOMMENDED BOOKS & TOPICS                      */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <BookOpen className="size-4 text-leaf" />
                <span>আজকের পড়ার জন্য প্রস্তাবিত বই ও টপিক</span>
              </h3>
              <p className="text-xs text-ink-faint">
                সবগুলো বিষয় যেন ধারাবাহিকভাবে পড়া হয় সেজন্য আজকের নির্বাচিত বইসমূহ:
              </p>
            </div>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1 text-xs font-semibold text-leaf hover:underline shrink-0"
            >
              <span>পূর্ণাঙ্গ সিলেবাস রুটিন</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Book Cards Grid */}
          {data.recommendedBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-ink-faint">
              সিলেবাসে কোনো টপিক পাওয়া যায়নি। আপনার সিলেবাস সেটআপ করতে{" "}
              <Link href="/syllabus" className="text-leaf font-bold underline">
                সিলেবাস পেজে যান
              </Link>
              ।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.recommendedBooks.map((book) => {
                const bookCompletedTopics = book.topics.filter(
                  (t) => t.status === "completed"
                ).length;
                return (
                  <div
                    key={book.subjectId}
                    className="card flex flex-col justify-between p-4 transition-all hover:border-leaf/50 hover:shadow-xs group"
                  >
                    <div>
                      {/* Book Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-line/60 pb-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-ink truncate group-hover:text-leaf transition-colors">
                            {book.subjectNameBn || book.subjectName}
                          </p>
                          {book.subjectNameBn && (
                            <p className="text-[11px] text-ink-faint truncate">
                              {book.subjectName}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-lg bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf font-bengali">
                          {toBnDigits(Math.round(book.progress * 100))}% সম্পন্ন
                        </span>
                      </div>

                      {/* Recommended Topics for this book */}
                      <div className="mt-3 space-y-2">
                        {book.topics.map((topic) => {
                          const isDone = topic.status === "completed";
                          return (
                            <div
                              key={topic.id}
                              className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-colors ${
                                isDone
                                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                                  : "border-line bg-paper/40 hover:bg-paper"
                              }`}
                            >
                              <button
                                onClick={() =>
                                  handleToggleTopic(book.subjectId, topic.id, topic.status)
                                }
                                disabled={isPending}
                                className={`mt-0.5 grid size-5 place-items-center rounded-lg border transition-all shrink-0 ${
                                  isDone
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-line bg-white hover:border-leaf text-transparent hover:text-leaf/40"
                                }`}
                                aria-label="Toggle completion"
                              >
                                <Check className="size-3.5 stroke-[3]" />
                              </button>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-medium leading-snug ${
                                    isDone
                                      ? "line-through text-ink-faint font-normal"
                                      : "text-ink"
                                  }`}
                                >
                                  {topic.name}
                                </p>
                                {topic.chapter && (
                                  <p className="text-[10px] text-ink-faint mt-0.5 truncate">
                                    {topic.chapter}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="text-ink-faint font-bengali">
                        মোট {toBnDigits(book.totalTopics)}টি টপিক
                      </span>
                      <Link
                        href={`/timer?subjectId=${book.subjectId}`}
                        className="inline-flex items-center gap-1 text-leaf font-semibold hover:underline"
                      >
                        <Timer className="size-3.5" />
                        <span>পড়তে শুরু করুন</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
