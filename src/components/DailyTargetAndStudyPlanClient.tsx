"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  Clock,
  PlayCircle,
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
import { setTopicStatusAction } from "@/actions/index";
import { enqueueOfflineAction } from "@/lib/offlineSync";
import { formatLong, toBnDigits } from "@/lib/dates";

interface Props {
  initialData: StudentDailyTargetPlanData;
}

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed", labelBn: "সম্পন্ন", color: "emerald", dot: "bg-emerald-500" },
  { value: "in_progress", label: "In Progress", labelBn: "চলমান", color: "amber", dot: "bg-amber-500" },
  { value: "not_completed", label: "Not Completed", labelBn: "অসম্পূর্ণ", color: "rose", dot: "bg-rose-500" },
  { value: "not_started", label: "Not Started", labelBn: "শুরু হয়নি", color: "slate", dot: "bg-slate-400" },
];

export default function DailyTargetAndStudyPlanClient({ initialData }: Props) {
  const [data, setData] = useState<StudentDailyTargetPlanData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [openStatusMenuTopicId, setOpenStatusMenuTopicId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modeOverride, setModeOverride] = useState<"auto" | "friday" | "daily">("auto");

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".status-dropdown-container")) {
        setOpenStatusMenuTopicId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Change topic status to any of the 4 options: completed, in_progress, not_completed, not_started
  const handleSetTopicStatus = (subjectId: number, topicId: number, newStatus: string) => {
    setOpenStatusMenuTopicId(null);

    // Optimistic state update
    setData((prev) => {
      let isNewlyCompleted = false;
      let wasPreviouslyCompleted = false;

      const updatedBooks = prev.recommendedBooks.map((book) => {
        if (book.subjectId !== subjectId) return book;
        const updatedTopics = book.topics.map((t) => {
          if (t.id !== topicId) return t;
          wasPreviouslyCompleted = t.status === "completed";
          isNewlyCompleted = newStatus === "completed";
          return {
            ...t,
            status: newStatus,
            isCompletedToday: isNewlyCompleted,
            isBacklog: newStatus === "in_progress" || newStatus === "not_completed",
          };
        });

        const completedDelta =
          isNewlyCompleted && !wasPreviouslyCompleted
            ? 1
            : !isNewlyCompleted && wasPreviouslyCompleted
            ? -1
            : 0;
        const newCompleted = Math.max(0, book.completedTopics + completedDelta);

        return {
          ...book,
          completedTopics: newCompleted,
          progress: book.totalTopics > 0 ? newCompleted / book.totalTopics : 0,
          topics: updatedTopics,
          hasBacklog: updatedTopics.some((t) => t.isBacklog),
        };
      });

      const todayDelta =
        isNewlyCompleted && !wasPreviouslyCompleted
          ? 1
          : !isNewlyCompleted && wasPreviouslyCompleted
          ? -1
          : 0;
      const newDoneToday = Math.max(0, prev.doneToday + todayDelta);
      const newCompletedTopics = Math.max(0, prev.completedTopics + todayDelta);
      const newRemaining = Math.max(0, prev.remainingTopics - todayDelta);

      // Re-count total backlog
      const newBacklogCount = updatedBooks.reduce(
        (acc, b) =>
          acc +
          b.topics.filter(
            (t) => t.status === "in_progress" || t.status === "not_completed"
          ).length,
        0
      );

      return {
        ...prev,
        doneToday: newDoneToday,
        completedTopics: newCompletedTopics,
        remainingTopics: newRemaining,
        totalBacklogCount: newBacklogCount,
        isTargetMetToday: newDoneToday >= prev.requiredTopicsPerDay,
        recommendedBooks: updatedBooks,
      };
    });

    startTransition(async () => {
      if (typeof window !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction("SET_TOPIC_STATUS", { topicId, status: newStatus });
        showToast("Saved offline! Will auto-sync when online. 📱");
        return;
      }

      try {
        const res = await setTopicStatusAction(topicId, newStatus);
        if (res.ok) {
          const labels: Record<string, string> = {
            completed: "Topic marked as Completed! 🎉",
            in_progress: "Topic marked as In Progress.",
            not_completed: "Topic marked as Not Completed.",
            not_started: "Topic status reset to Not Started.",
          };
          showToast(labels[newStatus] || "Topic status updated.");
        } else {
          enqueueOfflineAction("SET_TOPIC_STATUS", { topicId, status: newStatus });
          showToast("Saved offline! Will auto-sync when online. 📱");
        }
      } catch {
        enqueueOfflineAction("SET_TOPIC_STATUS", { topicId, status: newStatus });
        showToast("Saved offline! Will auto-sync when online. 📱");
      }
    });
  };

  // Quick toggle between completed and not_started / in_progress
  const handleQuickToggle = (subjectId: number, topicId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "not_started" : "completed";
    handleSetTopicStatus(subjectId, topicId, nextStatus);
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
      if (typeof window !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction("MARK_REVISED", { topicId });
        showToast("Revision saved offline! Will auto-sync when online. 🔄");
        return;
      }

      try {
        const res = await markTopicRevisedAction(topicId);
        if (res.ok) {
          showToast("Topic marked as revised! 🔄");
        } else {
          enqueueOfflineAction("MARK_REVISED", { topicId });
          showToast("Revision saved offline! Will auto-sync when online. 🔄");
        }
      } catch {
        enqueueOfflineAction("MARK_REVISED", { topicId });
        showToast("Revision saved offline! Will auto-sync when online. 🔄");
      }
    });
  };

  const isFriday = data.fridayRevision.isFriday;
  const isFridayActive =
    modeOverride === "friday" ? true : modeOverride === "daily" ? false : isFriday;
  const fridaySubjects = data.fridayRevision.subjects;
  const totalWeeklyCompleted = data.fridayRevision.totalCompletedThisWeek;
  const totalWeeklyRevised = data.fridayRevision.totalRevisedThisWeek;
  const totalBacklog = data.totalBacklogCount || 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {isFridayActive ? (
        /* ─────────────────────────────────────────────────────────── */
        /* FRIDAY WEEKLY REVISION (NO NEW LESSONS ON FRIDAY)           */
        /* ─────────────────────────────────────────────────────────── */
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/90 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-line/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <RotateCcw className="size-4" />
                </span>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                    Friday Weekly Revision
                  </h2>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Weekly revision day — no new lessons today. Review all topics completed throughout this week.
                  </p>
                </div>
              </div>
            </div>

            {/* Friday Revision Progress Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center shrink-0 min-w-[200px]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Revision Progress
              </p>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
                  {totalWeeklyRevised}
                </span>
                <span className="text-sm font-bold text-ink-faint">
                  / {totalWeeklyCompleted}
                </span>
                <span className="text-xs text-ink-faint font-medium ml-1">Topics</span>
              </div>
              {totalWeeklyCompleted > 0 && totalWeeklyRevised >= totalWeeklyCompleted ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5">
                  <Check className="size-3" /> All Revised! 🎉
                </span>
              ) : (
                <span className="mt-1 inline-block text-[11px] text-ink-faint">
                  {Math.max(0, totalWeeklyCompleted - totalWeeklyRevised)} remaining to revise
                </span>
              )}
            </div>
          </div>

          {/* Topics completed this week grouped by Subject */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <RotateCcw className="size-4 text-emerald-600" />
                <span>This Week&apos;s Completed Topics</span>
              </h3>
              {!isFriday && (
                <button
                  onClick={() => setModeOverride("daily")}
                  className="text-xs font-semibold text-leaf hover:underline"
                >
                  ← Back to Daily Study
                </button>
              )}
            </div>

            {fridaySubjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-8 text-center text-xs text-ink-faint space-y-1.5">
                <p className="text-sm font-semibold text-ink">No topics completed this week yet</p>
                <p className="text-ink-faint max-w-md mx-auto">
                  Topics you mark as Completed from Saturday to Thursday will automatically appear here on Friday for revision.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {fridaySubjects.map((sub) => (
                  <div
                    key={sub.subjectId}
                    className="card flex flex-col justify-between p-4 transition-all hover:border-emerald-500/50 hover:shadow-xs group"
                  >
                    <div>
                      {/* Subject Header: English name top, Bengali name subtitle */}
                      <div className="flex items-start justify-between gap-2 border-b border-line/60 pb-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-ink truncate group-hover:text-emerald-600 transition-colors">
                            {sub.subjectName}
                          </p>
                          {sub.subjectNameBn && (
                            <p className="text-[11px] text-ink-faint truncate">
                              {sub.subjectNameBn}
                            </p>
                          )}
                        </div>
                        <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-bold shrink-0">
                          {sub.topics.length} {sub.topics.length === 1 ? "topic" : "topics"}
                        </span>
                      </div>

                      {/* Topic list */}
                      <div className="mt-3 space-y-2.5">
                        {sub.topics.map((top) => (
                          <div
                            key={top.id}
                            className={`relative rounded-xl border p-2.5 text-xs transition-all ${
                              top.isRevisedToday
                                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                                : "border-line bg-paper/40 hover:bg-paper"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium truncate ${top.isRevisedToday ? "text-emerald-900 dark:text-emerald-200 font-semibold" : "text-ink"}`}>
                                  {top.name}
                                </p>
                                {top.chapter && (
                                  <p className="text-[10.5px] text-ink-faint truncate">
                                    {top.chapter}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleMarkRevised(sub.subjectId, top.id)}
                                disabled={isPending}
                                className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition shadow-2xs ${
                                  top.isRevisedToday
                                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                                }`}
                              >
                                {top.isRevisedToday ? (
                                  <>
                                    <Check className="size-3" />
                                    <span>Revised</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="size-3" />
                                    <span>Mark Revised</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────── */
        /* SATURDAY - THURSDAY: REGULAR DAILY STUDY & TOPICS           */
        /* ─────────────────────────────────────────────────────────── */
        <div className="relative rounded-3xl border border-line bg-gradient-to-br from-paper via-card to-paper/90 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-line/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-leaf text-white shadow-2xs">
                  <Target className="size-4" />
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Daily reach your target
                </h2>
                {totalWeeklyCompleted > 0 && (
                  <button
                    onClick={() => setModeOverride("friday")}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors ml-1"
                    title="Preview Friday Weekly Revision"
                  >
                    <RotateCcw className="size-3" />
                    <span>Friday Revision ({totalWeeklyCompleted})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Today's Target Progress Indicator */}
            <div className="rounded-2xl border border-leaf/30 bg-leaf-soft/20 p-4 text-center shrink-0 min-w-[200px]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-leaf-deep">
                Today&apos;s Progress
              </p>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
                  {data.doneToday}
                </span>
                <span className="text-sm font-bold text-ink-faint">
                  / {data.requiredTopicsPerDay || 1}
                </span>
                <span className="text-xs text-ink-faint font-medium ml-1">Topics</span>
              </div>
              {data.isTargetMetToday ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5">
                  <Check className="size-3" /> Target Met Today! 🎉
                </span>
              ) : (
                <span className="mt-1 inline-block text-[11px] text-ink-faint">
                  {Math.max(0, (data.requiredTopicsPerDay || 1) - data.doneToday)} remaining today
                </span>
              )}
            </div>
          </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* 4. TODAY'S RECOMMENDED BOOKS & TOPICS                      */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <BookOpen className="size-4 text-leaf" />
              <span>Today&apos;s Recommended Books & Topics</span>
            </h3>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1 text-xs font-semibold text-leaf hover:underline shrink-0"
            >
              <span>Full Routine</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Book Cards Grid */}
          {data.recommendedBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-ink-faint">
              No topics found in your syllabus. Set up your subjects in the{" "}
              <Link href="/syllabus" className="text-leaf font-bold underline">
                Syllabus
              </Link>{" "}
              page.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.recommendedBooks.map((book) => {
                const isAnyMenuOpenInThisCard = book.topics.some(
                  (t) => t.id === openStatusMenuTopicId
                );
                return (
                  <div
                    key={book.subjectId}
                    className={`card !overflow-visible flex flex-col justify-between p-4 transition-all hover:border-leaf/50 hover:shadow-xs group ${
                      isAnyMenuOpenInThisCard ? "relative z-30" : "relative z-0"
                    }`}
                  >
                    <div>
                      {/* Book Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-line/60 pb-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-ink truncate group-hover:text-leaf transition-colors">
                            {book.subjectName}
                          </p>
                          {book.subjectNameBn && (
                            <p className="text-[11px] text-ink-faint truncate">
                              {book.subjectNameBn}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="rounded-lg bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf">
                            {Math.round(book.progress * 100)}% done
                          </span>
                        </div>
                      </div>

                      {/* Recommended Topics for this book */}
                      <div className="mt-3 space-y-2.5">
                        {book.topics.map((topic) => {
                          const isDone = topic.status === "completed";
                          const isInProgress = topic.status === "in_progress";
                          const isNotCompleted = topic.status === "not_completed";
                          const isMenuOpen = openStatusMenuTopicId === topic.id;

                          // Current status label and colors
                          const currentOpt =
                            STATUS_OPTIONS.find((o) => o.value === topic.status) ||
                            STATUS_OPTIONS[3];

                          return (
                            <div
                              key={topic.id}
                              className={`relative rounded-xl border p-2.5 text-xs transition-all ${
                                isDone
                                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                                  : "border-line bg-paper/40 hover:bg-paper"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {/* Quick toggle completion button */}
                                <button
                                  onClick={() =>
                                    handleQuickToggle(book.subjectId, topic.id, topic.status)
                                  }
                                  disabled={isPending}
                                  className={`mt-0.5 grid size-5 place-items-center rounded-lg border transition-all shrink-0 ${
                                    isDone
                                      ? "border-emerald-600 bg-emerald-600 text-white"
                                      : "border-line bg-white hover:border-leaf text-transparent hover:text-leaf/40"
                                  }`}
                                  aria-label="Toggle completion"
                                  title="Click to toggle complete"
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
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                                      <span className="text-ink-faint truncate">
                                        {topic.chapter}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Status Dropdown Menu */}
                                <div className="status-dropdown-container relative shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenStatusMenuTopicId(
                                        isMenuOpen ? null : topic.id
                                      );
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition shadow-2xs ${
                                      isDone
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                        : isInProgress
                                        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                        : isNotCompleted
                                        ? "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                        : "border-line bg-white text-ink-soft hover:bg-paper dark:bg-card dark:text-ink-faint"
                                    }`}
                                  >
                                    <span className={`size-1.5 rounded-full ${currentOpt.dot}`} />
                                    <span>{currentOpt.label}</span>
                                    <ChevronDown className="size-3 text-ink-faint ml-0.5" />
                                  </button>

                                  {/* Dropdown popup menu */}
                                  {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-xl border border-line bg-white dark:bg-card p-1 shadow-xl animate-in fade-in zoom-in-95">
                                      {STATUS_OPTIONS.map((opt) => {
                                        const isSelected = topic.status === opt.value;
                                        return (
                                          <button
                                            key={opt.value}
                                            onClick={() =>
                                              handleSetTopicStatus(
                                                book.subjectId,
                                                topic.id,
                                                opt.value
                                              )
                                            }
                                            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                                              isSelected
                                                ? "bg-paper font-bold text-ink"
                                                : "text-ink-soft hover:bg-paper/70 hover:text-ink"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`size-2 rounded-full ${opt.dot}`}
                                              />
                                              <span>{opt.label}</span>
                                            </div>
                                            {isSelected && (
                                              <Check className="size-3 text-leaf" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="text-ink-faint">
                        {book.totalTopics} {book.totalTopics === 1 ? "topic" : "topics"}
                      </span>
                      <Link
                        href={`/timer?subjectId=${book.subjectId}`}
                        className="inline-flex items-center gap-1 text-leaf font-semibold hover:underline"
                      >
                        <Timer className="size-3.5" />
                        <span>Start Study</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
