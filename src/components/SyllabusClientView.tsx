"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Pencil,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import StudentOnboardingWizard from "@/components/onboarding/StudentOnboardingWizard";
import SyllabusManager from "@/components/SyllabusManager";
import AddSubjectButton from "@/components/AddSubjectButton";
import { restoreOfficialSyllabusAction, type MasterBookView } from "@/actions/syllabus";
import type { OnboardingData } from "@/actions/onboarding";
import type { SubjectDto, TopicDto } from "@/lib/queries";
import { calculateDaysBetween } from "@/components/ui/DatePickerCalendar";

interface Batch {
  id: number;
  name: string;
  slug: string;
}

interface UserProfile {
  board?: string;
  classLevel?: string;
  streamGroup?: string;
  examDate?: string;
  targetStartDate?: string;
  targetDate?: string;
}

interface Props {
  hasPersonalSyllabus: boolean;
  userBatch: Batch | null;
  userProfile?: UserProfile;
  availableBatches: Batch[];
  masterBooks: MasterBookView[];
  groups: { subject: SubjectDto; topics: TopicDto[] }[];
  totalTopics: number;
  onboardingData?: OnboardingData;
  currentBookIds?: number[];
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || "Not set";
  const [y, m, d] = dateStr.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ""} ${y}`;
}

export default function SyllabusClientView({
  hasPersonalSyllabus,
  userBatch,
  userProfile,
  availableBatches,
  masterBooks,
  groups,
  totalTopics,
  onboardingData,
  currentBookIds,
}: Props) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(!hasPersonalSyllabus);
  const [restoring, startRestore] = useTransition();
  const [restoreStatus, setRestoreStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // If student hasn't completed setup (or skipped) OR wants to reconfigure/edit setup
  if ((!hasPersonalSyllabus || showOnboarding) && onboardingData) {
    return (
      <StudentOnboardingWizard
        initialData={onboardingData}
        isReconfiguring={hasPersonalSyllabus}
        initialBookIds={currentBookIds}
        onCancel={hasPersonalSyllabus ? () => setShowOnboarding(false) : undefined}
        onSuccess={() => {
          setShowOnboarding(false);
          router.refresh();
        }}
        skipRedirectUrl="/syllabus"
      />
    );
  }

  // Group label
  const groupLabel =
    userProfile?.streamGroup === "science"
      ? "Science"
      : userProfile?.streamGroup === "business_studies"
      ? "Commerce"
      : userProfile?.streamGroup === "general_madrasah"
      ? "Arts"
      : userProfile?.streamGroup || "Arts";

  // Today string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const examDateStr =
    userProfile?.examDate || onboardingData?.defaultExamDate || "";
  const targetDateStr =
    userProfile?.targetDate || onboardingData?.defaultTargetDate || "";
  const targetStartDateStr =
    userProfile?.targetStartDate || onboardingData?.defaultTargetStartDate || "";

  const daysToExam = examDateStr ? calculateDaysBetween(todayStr, examDateStr) : 0;
  const daysToTarget = targetDateStr ? calculateDaysBetween(todayStr, targetDateStr) : 0;

  const handleRestore = () => {
    if (
      !confirm(
        "Are you sure you want to restore the official default syllabus for your group? Any customized or removed topics will revert back to official curriculum defaults."
      )
    ) {
      return;
    }
    setRestoreStatus(null);
    startRestore(async () => {
      const res = await restoreOfficialSyllabusAction();
      if (res.ok) {
        setRestoreStatus({
          type: "success",
          message: res.message || "Default syllabus restored successfully.",
        });
        router.refresh();
      } else {
        setRestoreStatus({
          type: "error",
          message: res.error || "Failed to restore syllabus.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Header with Quick Actions */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf">
            <Sparkles className="size-3.5" />
            <span>Personal Syllabus Setup ({userBatch?.name || "My Class"})</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            My Study Setup &amp; Syllabus
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-[13px] leading-relaxed text-ink-faint">
            Manage your personal stream, enrolled books, countdown target dates, and exam topics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-leaf hover:text-leaf transition shadow-2xs cursor-pointer"
          >
            <Pencil className="size-3.5 text-leaf" />
            <span>Edit Setup / Books</span>
          </button>

          <button
            type="button"
            disabled={restoring}
            onClick={handleRestore}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-amber-500 hover:text-amber-700 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`size-3.5 ${restoring ? "animate-spin" : ""}`} />
            <span>{restoring ? "Restoring..." : "Restore Default Syllabus"}</span>
          </button>

          <AddSubjectButton />
        </div>
      </header>

      {/* Restore status banner */}
      {restoreStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-rise ${
            restoreStatus.type === "success"
              ? "border-leaf/30 bg-leaf/10 text-leaf"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {restoreStatus.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-leaf" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
          )}
          <span>{restoreStatus.message}</span>
        </div>
      )}

      {/* Saved Setup Summary Card */}
      <div className="bg-white rounded-2xl border border-line p-4 sm:p-5 shadow-xs space-y-3.5 max-w-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-leaf flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            <span>Current Saved Setup</span>
          </span>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="text-xs font-semibold text-leaf hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Group & Books */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-line/60">
          <div>
            <span className="text-ink-faint block text-[11px] font-medium uppercase tracking-wider">
              Group
            </span>
            <span className="font-bold text-ink text-sm sm:text-base mt-0.5 block">
              {groupLabel}
            </span>
          </div>
          <div>
            <span className="text-ink-faint block text-[11px] font-medium uppercase tracking-wider">
              Books
            </span>
            <span className="font-bold text-leaf text-sm sm:text-base mt-0.5 block">
              {groups.length} Books ({totalTopics} Topics)
            </span>
          </div>
        </div>

        {/* Dates overview */}
        <div className="space-y-1.5 pb-3 border-b border-line/60 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-ink-soft">Target Start:</span>
            <span className="font-semibold text-ink">
              {formatShortDate(targetStartDateStr)}
            </span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-ink-soft">Target Date:</span>
            <span className="font-semibold text-ink">
              {formatShortDate(targetDateStr)}
            </span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-ink-soft">Exam Date:</span>
            <span className="font-semibold text-ink">
              {formatShortDate(examDateStr)}
            </span>
          </div>
        </div>

        {/* Dashboard Countdowns Preview */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
            <span className="font-display text-lg sm:text-xl font-bold tabular-nums text-amber-900 block leading-tight">
              {daysToTarget}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mt-0.5">
              {daysToTarget === 1 ? "DAY TO TARGET" : "DAYS TO TARGET"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-center">
            <span className="font-display text-lg sm:text-xl font-bold tabular-nums text-rose-900 block leading-tight">
              {daysToExam}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mt-0.5">
              {daysToExam === 1 ? "DAY TO EXAM" : "DAYS TO EXAM"}
            </span>
          </div>
        </div>
      </div>

      {/* Topics & Chapters Manager */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink tracking-tight flex items-center gap-2">
            <BookOpen className="size-4.5 text-leaf" />
            <span>Your Personal Syllabus Topics</span>
          </h2>
          <span className="text-xs font-semibold text-ink-faint">
            {groups.length} Subjects • {totalTopics} Topics
          </span>
        </div>

        <SyllabusManager groups={groups} />
      </div>
    </div>
  );
}
