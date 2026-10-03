"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  Atom,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Palette,
  Sparkles,
  Target,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Rocket,
} from "lucide-react";
import DatePickerCalendar, {
  formatDisplayDate,
  calculateDaysBetween,
} from "@/components/ui/DatePickerCalendar";
import {
  completeOnboardingAction,
  type OnboardingData,
} from "@/actions/onboarding";
import type { MasterBookView } from "@/actions/syllabus";

interface WizardProps {
  initialData: OnboardingData;
  isReconfiguring?: boolean;
  initialBookIds?: number[];
  onCancel?: () => void;
  onSuccess?: () => void;
  skipRedirectUrl?: string;
}

type Step =
  | "welcome"
  | "group"
  | "books"
  | "exam_date"
  | "target_start_date"
  | "target_date"
  | "summary";

const GROUPS = [
  {
    id: "science",
    name: "Science",
    nameBn: "বিজ্ঞান বিভাগ",
    desc: "Physics, Chemistry, Biology, Higher Math & Core Subjects",
    icon: Atom,
  },
  {
    id: "general_madrasah",
    name: "Arts",
    nameBn: "মানবিক / সাধারণ বিভাগ",
    desc: "Islamic History, Balaghat & Mantiq, Civics, Economics & Core Subjects",
    icon: Palette,
  },
  {
    id: "business_studies",
    name: "Commerce",
    nameBn: "ব্যবসায় শিক্ষা বিভাগ",
    desc: "Business Studies, Accounting, Economics, ICT & Core Subjects",
    icon: Briefcase,
  },
];

export default function StudentOnboardingWizard({
  initialData,
  isReconfiguring = false,
  initialBookIds,
  onCancel,
  onSuccess,
  skipRedirectUrl,
}: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(isReconfiguring ? "group" : "welcome");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Group State
  const [selectedGroup, setSelectedGroup] = useState<string>(() => {
    const raw = initialData?.user?.streamGroup || "general_madrasah";
    if (raw === "science") return "science";
    if (raw === "business_studies" || raw === "commerce") return "business_studies";
    return "general_madrasah";
  });

  // Filter master books based on group
  const groupBooks = useMemo(() => {
    const all = (initialData?.masterBooks || []).filter(Boolean);

    if (selectedGroup === "science") {
      return all.filter((b) => {
        const slug = (b?.slug || "").toLowerCase();
        const isArtsSpecific =
          slug.includes("balaghat") ||
          slug.includes("islamic-history") ||
          slug.includes("civics") ||
          slug.includes("economics") ||
          slug === "alim-arabic-1" ||
          slug === "alim-arabic-2";
        return !isArtsSpecific;
      });
    }

    if (selectedGroup === "general_madrasah") {
      return all.filter((b) => {
        const slug = (b?.slug || "").toLowerCase();
        const isScienceSpecific =
          slug.includes("physics") ||
          slug.includes("chemistry") ||
          slug.includes("biology") ||
          slug.includes("higher-math") ||
          slug.includes("arabic-science");
        return !isScienceSpecific;
      });
    }

    // Commerce
    return all.filter((b) => {
      const slug = (b?.slug || "").toLowerCase();
      const isScienceSpecific =
        slug.includes("physics") ||
        slug.includes("chemistry") ||
        slug.includes("biology") ||
        slug.includes("higher-math") ||
        slug.includes("arabic-science");
      return !isScienceSpecific;
    });
  }, [initialData?.masterBooks, selectedGroup]);

  // Selected books record: Record<bookId, boolean>
  const [selectedBookIds, setSelectedBookIds] = useState<Record<number, boolean>>(() => {
    if (initialBookIds && initialBookIds.length > 0) {
      const map: Record<number, boolean> = {};
      for (const id of initialBookIds) {
        if (id) map[id] = true;
      }
      return map;
    }
    const nextGroupBooks = (initialData?.masterBooks || []).filter((b) => {
      const slug = (b?.slug || "").toLowerCase();
      const groupId = initialData?.user?.streamGroup || "general_madrasah";
      if (groupId === "science") {
        return (
          !slug.includes("balaghat") &&
          !slug.includes("islamic-history") &&
          !slug.includes("civics") &&
          !slug.includes("economics") &&
          slug !== "alim-arabic-1" &&
          slug !== "alim-arabic-2"
        );
      }
      return (
        !slug.includes("physics") &&
        !slug.includes("chemistry") &&
        !slug.includes("biology") &&
        !slug.includes("higher-math") &&
        !slug.includes("arabic-science")
      );
    });
    const initMap: Record<number, boolean> = {};
    for (const b of nextGroupBooks) {
      if (b?.id) initMap[b.id] = true;
    }
    return initMap;
  });

  const resetBooksForGroup = (groupId: string) => {
    const nextGroupBooks = (initialData?.masterBooks || []).filter((b) => {
      const slug = (b?.slug || "").toLowerCase();
      if (groupId === "science") {
        return (
          !slug.includes("balaghat") &&
          !slug.includes("islamic-history") &&
          !slug.includes("civics") &&
          !slug.includes("economics") &&
          slug !== "alim-arabic-1" &&
          slug !== "alim-arabic-2"
        );
      }
      return (
        !slug.includes("physics") &&
        !slug.includes("chemistry") &&
        !slug.includes("biology") &&
        !slug.includes("higher-math") &&
        !slug.includes("arabic-science")
      );
    });

    const initMap: Record<number, boolean> = {};
    for (const b of nextGroupBooks) {
      if (b?.id) initMap[b.id] = true;
    }
    setSelectedBookIds(initMap);
  };

  const toggleBookSelection = (id: number) => {
    setSelectedBookIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectAllBooks = () => {
    const map: Record<number, boolean> = {};
    for (const b of groupBooks) {
      map[b.id] = true;
    }
    setSelectedBookIds(map);
  };

  const clearAllBooks = () => {
    setSelectedBookIds({});
  };

  // 3 Target Setup Dates
  const [examDate, setExamDate] = useState<string>(
    initialData?.defaultExamDate || "2027-04-15"
  );
  const [targetStartDate, setTargetStartDate] = useState<string>(
    initialData?.defaultTargetStartDate ||
      new Date().toISOString().split("T")[0]
  );
  const [targetDate, setTargetDate] = useState<string>(
    initialData?.defaultTargetDate || "2027-02-28"
  );

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // Countdowns:
  // DAYS TO EXAM = Exam Date - Current Date
  // DAYS TO TARGET = Target Date - Current Date
  const daysToExam = useMemo(() => {
    if (!examDate) return 0;
    return calculateDaysBetween(todayStr, examDate);
  }, [todayStr, examDate]);

  const daysToTarget = useMemo(() => {
    if (!targetDate) return 0;
    return calculateDaysBetween(todayStr, targetDate);
  }, [todayStr, targetDate]);

  // Selected books array
  const chosenBooks = useMemo(() => {
    return groupBooks.filter((b) => b && selectedBookIds[b.id]);
  }, [groupBooks, selectedBookIds]);

  const chosenGroupObj =
    GROUPS.find((g) => g.id === selectedGroup) ||
    GROUPS.find((g) => g.id === "general_madrasah") ||
    GROUPS[0];

  // Navigation steps
  const stepList: { key: Step; title: string; num: number }[] = [
    { key: "welcome", title: "Welcome", num: 1 },
    { key: "group", title: "Group", num: 2 },
    { key: "books", title: "Books", num: 3 },
    { key: "exam_date", title: "Exam Date", num: 4 },
    { key: "target_start_date", title: "Target Start", num: 5 },
    { key: "target_date", title: "Target Date", num: 6 },
    { key: "summary", title: "Ready", num: 7 },
  ];

  const currentStepIndex = stepList.findIndex((s) => s.key === step);

  // Validate dates: Target Start Date < Target Date < Exam Date
  const validateDates = (): string | null => {
    if (!examDate) return "Please select your Exam Date.";
    if (!targetStartDate) return "Please select your Target Start Date.";
    if (!targetDate) return "Please select your Target Date.";

    if (targetStartDate >= targetDate) {
      return "Target start date must be before your target completion date.";
    }
    if (targetDate >= examDate) {
      return "Target completion date must be before your exam date.";
    }
    return null;
  };

  // Actions
  const handleSkip = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await completeOnboardingAction({
          streamGroup: selectedGroup,
          bookIds: chosenBooks.map((b) => b.id),
          examDate,
          targetStartDate,
          targetDate,
          skip: true,
        });
        if (res.ok) {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = skipRedirectUrl || res.redirectUrl || "/";
          }
        } else {
          setError(res.error || "Failed to skip onboarding.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to skip onboarding. Please try again.");
      }
    });
  };

  const handleFinish = () => {
    setError(null);
    if (chosenBooks.length === 0) {
      setError("Please select at least one book.");
      return;
    }
    const dateErr = validateDates();
    if (dateErr) {
      setError(dateErr);
      return;
    }

    startTransition(async () => {
      try {
        const res = await completeOnboardingAction({
          streamGroup: selectedGroup,
          bookIds: chosenBooks.map((b) => b.id),
          examDate,
          targetStartDate,
          targetDate,
          skip: false,
        });
        if (res.ok) {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = res.redirectUrl || "/";
          }
        } else {
          setError(res.error || "Failed to save onboarding setup.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to save onboarding setup. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-paper text-ink selection:bg-leaf/20">
      {/* Top Bar with Brand & Skip Option */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between border-b border-line/60">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-md shadow-leaf/25">
            <BookOpenCheck className="size-4.5" strokeWidth={2.2} />
          </span>
          <div>
            <span className="block font-display text-sm font-bold tracking-tight text-ink leading-none">
              Study Dashboard
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              {isReconfiguring ? "Syllabus Setup" : "Personal Setup"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step !== "welcome" && (
            <span className="text-xs font-semibold text-ink-faint hidden sm:inline">
              Step {currentStepIndex} of {stepList.length - 1}
            </span>
          )}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg border border-line bg-white/70 hover:bg-white shadow-xs transition cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              disabled={pending}
              className="text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg border border-line bg-white/70 hover:bg-white shadow-xs transition cursor-pointer"
            >
              Skip for now
            </button>
          )}
        </div>
      </header>

      {/* Progress Line */}
      {step !== "welcome" && (
        <div className="w-full bg-line/40 h-1">
          <div
            className="bg-gradient-to-r from-leaf to-leaf-deep h-1 transition-all duration-300 ease-out"
            style={{
              width: `${(currentStepIndex / (stepList.length - 1)) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-rise">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {step === "welcome" && (
          <div className="text-center py-6 sm:py-10 animate-rise">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-leaf/10 text-leaf ring-1 ring-leaf/20 shadow-sm mb-6 animate-scale-in">
              <Sparkles className="size-8" />
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
              Welcome, {initialData.user.name || "Student"}! 👋
            </h1>

            <p className="mt-3 text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
              Let&apos;s personalize your study experience. We&apos;ll configure your study group, books, and target countdown dates.
            </p>

            <div className="mt-8 sm:mt-10 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setStep("group")}
                className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-2 rounded-xl bg-leaf px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-leaf/25 hover:bg-leaf-deep transition active:scale-[0.99]"
              >
                <span>Continue</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT YOUR GROUP */}
        {step === "group" && (
          <div className="space-y-4 sm:space-y-5 animate-rise max-w-md mx-auto w-full">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 1 of 5
              </span>
              <h2 className="mt-0.5 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Select Your Group
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { id: "science", name: "Science", icon: Atom },
                { id: "general_madrasah", name: "Arts", icon: Palette },
                { id: "business_studies", name: "Commerce", icon: Briefcase },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGroup === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(g.id);
                      resetBooksForGroup(g.id);
                    }}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-leaf bg-leaf/10 ring-1 ring-leaf text-ink shadow-xs"
                        : "border-line bg-white hover:border-ink-faint/60 hover:bg-paper/40 text-ink-soft"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-9 place-items-center rounded-lg transition ${
                          isSelected
                            ? "bg-leaf text-white shadow-xs"
                            : "bg-paper text-ink-soft"
                        }`}
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <span className="font-display text-base font-bold text-ink">
                        {g.name}
                      </span>
                    </div>

                    <div
                      className={`size-6 rounded-full flex items-center justify-center transition ${
                        isSelected
                          ? "bg-leaf text-white shadow-xs"
                          : "border border-line bg-white"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => {
                  if (isReconfiguring && onCancel) {
                    onCancel();
                  } else {
                    setStep("welcome");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>{isReconfiguring && onCancel ? "Cancel" : "Back"}</span>
              </button>

              <button
                type="button"
                disabled={!selectedGroup}
                onClick={() => setStep("books")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-6 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT YOUR BOOKS */}
        {step === "books" && (
          <div className="space-y-3 sm:space-y-3.5 animate-rise max-w-md mx-auto w-full">
            {/* Compact Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-leaf">
                  Step 2 of 5
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={selectAllBooks}
                    className="text-leaf hover:text-leaf-deep hover:underline transition px-1 py-0.5"
                  >
                    Select All
                  </button>
                  <span className="text-line text-xs">•</span>
                  <button
                    type="button"
                    onClick={clearAllBooks}
                    className="text-ink-faint hover:text-ink transition px-1 py-0.5"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Select Your Books
                </h2>
                <span className="text-xs font-semibold text-leaf shrink-0 tabular-nums">
                  {chosenBooks.length} of {groupBooks.length} selected
                </span>
              </div>

              <p className="text-xs text-ink-soft mt-0.5">
                Choose your books for <strong className="text-ink font-semibold">{chosenGroupObj.name}</strong>.
              </p>
            </div>

            {/* Compact Checklist Rows */}
            <div className="border-t border-b border-line/70 py-1.5 max-h-[50vh] sm:max-h-[380px] overflow-y-auto space-y-1 pr-1 overscroll-contain">
              {groupBooks.map((book) => {
                const isChecked = !!selectedBookIds[book.id];
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBookSelection(book.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none ${
                      isChecked
                        ? "border-leaf/60 bg-leaf/10 text-ink shadow-xs"
                        : "border-line/70 bg-white hover:bg-paper/50 hover:border-ink-faint/40 text-ink"
                    }`}
                  >
                    <div
                      className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-leaf border-leaf text-white shadow-xs"
                          : "border-line bg-white"
                      }`}
                    >
                      {isChecked && <Check className="size-3 stroke-[3]" />}
                    </div>

                    <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {book.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("group")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={chosenBooks.length === 0}
                onClick={() => setStep("exam_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-6 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ASK EXAM DATE FIRST */}
        {step === "exam_date" && (
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 3 of 5
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2">
                <span>When is your exam?</span>
                <span>📅</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Select your board examination start date using the calendar.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs space-y-4">
              <DatePickerCalendar
                label="Exam Date"
                value={examDate}
                onChange={(d) => {
                  setExamDate(d);
                  setError(null);
                }}
                minDate={todayStr}
                placeholder="Select Exam Date"
                required
              />

              {examDate && (
                <div className="p-3.5 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-ink-soft font-medium">Exam Date:</span>
                  <span className="font-bold text-leaf flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>{formatDisplayDate(examDate)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => setStep("books")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-3.5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!examDate}
                onClick={() => setStep("target_start_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ASK TARGET START DATE */}
        {step === "target_start_date" && (
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 4 of 5
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2">
                <span>When do you want to start your preparation?</span>
                <span>🚀</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Choose the kickoff date for your personal study routine.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs space-y-4">
              <DatePickerCalendar
                label="Target Start Date"
                value={targetStartDate}
                onChange={(d) => {
                  setTargetStartDate(d);
                  setError(null);
                }}
                placeholder="Select Target Start Date"
                required
              />

              {targetStartDate && (
                <div className="p-3.5 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-ink-soft font-medium">Target Start Date:</span>
                  <span className="font-bold text-leaf flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>{formatDisplayDate(targetStartDate)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => setStep("exam_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-3.5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!targetStartDate}
                onClick={() => setStep("target_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: ASK TARGET DATE */}
        {step === "target_date" && (
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 5 of 5
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2">
                <span>By when do you want to reach your target?</span>
                <span>🎯</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Choose your personal syllabus completion deadline before the exam.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs space-y-4">
              <DatePickerCalendar
                label="Target Date"
                value={targetDate}
                onChange={(d) => {
                  setTargetDate(d);
                  if (targetStartDate && d <= targetStartDate) {
                    setError("Target date must be after your target start date.");
                  } else if (examDate && d >= examDate) {
                    setError("Target completion date must be before your exam date.");
                  } else {
                    setError(null);
                  }
                }}
                minDate={targetStartDate || todayStr}
                placeholder="Select Target Date"
                required
              />

              {/* Dynamic Live Countdown Previews */}
              {targetDate && examDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center gap-1.5 text-amber-800 mb-1">
                      <Target className="size-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Countdown to Target
                      </span>
                    </div>
                    <span className="block text-xl font-display font-bold text-ink">
                      {daysToTarget}{" "}
                      <span className="text-xs font-bold uppercase text-ink-faint">
                        {daysToTarget === 1 ? "DAY" : "DAYS"} TO TARGET
                      </span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div className="flex items-center gap-1.5 text-rose-800 mb-1">
                      <AlarmClockCheck className="size-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Countdown to Exam
                      </span>
                    </div>
                    <span className="block text-xl font-display font-bold text-ink">
                      {daysToExam}{" "}
                      <span className="text-xs font-bold uppercase text-ink-faint">
                        {daysToExam === 1 ? "DAY" : "DAYS"} TO EXAM
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => setStep("target_start_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-3.5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={
                  !targetDate ||
                  (targetStartDate ? targetDate <= targetStartDate : false) ||
                  (examDate ? targetDate >= examDate : false)
                }
                onClick={() => {
                  const err = validateDates();
                  if (err) {
                    setError(err);
                  } else {
                    setStep("summary");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Review Summary</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: FINAL SETUP SUMMARY */}
        {step === "summary" && (
          <div className="space-y-4 sm:space-y-5 animate-rise max-w-md mx-auto w-full">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                You&apos;re All Set! 🎉
              </h2>
            </div>

            {/* Compact Summary Card */}
            <div className="bg-white rounded-2xl border border-line p-4 sm:p-5 shadow-xs space-y-3.5">
              {/* Group & Books */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-line/60">
                <div>
                  <span className="text-ink-faint block text-[11px] font-medium uppercase tracking-wider">
                    Group
                  </span>
                  <span className="font-bold text-ink text-sm sm:text-base mt-0.5 block">
                    {chosenGroupObj.name}
                  </span>
                </div>
                <div>
                  <span className="text-ink-faint block text-[11px] font-medium uppercase tracking-wider">
                    Books
                  </span>
                  <span className="font-bold text-leaf text-sm sm:text-base mt-0.5 block">
                    {chosenBooks.length} Books
                  </span>
                </div>
              </div>

              {/* Compact Dates List */}
              <div className="space-y-1.5 pb-3 border-b border-line/60 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-ink-soft">Target Start:</span>
                  <span className="font-semibold text-ink">
                    {(() => {
                      if (!targetStartDate) return "";
                      const [y, m, d] = targetStartDate.split("-");
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ""} ${y}`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-ink-soft">Target Date:</span>
                  <span className="font-semibold text-ink">
                    {(() => {
                      if (!targetDate) return "";
                      const [y, m, d] = targetDate.split("-");
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ""} ${y}`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-ink-soft">Exam Date:</span>
                  <span className="font-semibold text-ink">
                    {(() => {
                      if (!examDate) return "";
                      const [y, m, d] = examDate.split("-");
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || ""} ${y}`;
                    })()}
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

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={pending}
                onClick={handleFinish}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-leaf py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md shadow-leaf/25 hover:bg-leaf-deep transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {pending ? (
                  <span>Saving Your Setup...</span>
                ) : (
                  <>
                    <span>Let&apos;s Start Learning</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStep("target_date")}
                  className="text-xs font-semibold text-ink-faint hover:text-ink transition py-1"
                >
                  Edit Dates & Books
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
