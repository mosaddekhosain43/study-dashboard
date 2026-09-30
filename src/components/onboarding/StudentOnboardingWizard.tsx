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

export default function StudentOnboardingWizard({ initialData }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Group State
  const [selectedGroup, setSelectedGroup] = useState<string>(
    initialData.user.streamGroup || "science"
  );

  // Filter master books based on group
  const groupBooks = useMemo(() => {
    const all = initialData.masterBooks || [];

    if (selectedGroup === "science") {
      return all.filter((b) => {
        const slug = b.slug.toLowerCase();
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
        const slug = b.slug.toLowerCase();
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
      const slug = b.slug.toLowerCase();
      const isScienceSpecific =
        slug.includes("physics") ||
        slug.includes("chemistry") ||
        slug.includes("biology") ||
        slug.includes("higher-math") ||
        slug.includes("arabic-science");
      return !isScienceSpecific;
    });
  }, [initialData.masterBooks, selectedGroup]);

  // Selected books record: Record<bookId, boolean>
  const [selectedBookIds, setSelectedBookIds] = useState<Record<number, boolean>>({});

  const resetBooksForGroup = (groupId: string) => {
    const nextGroupBooks = (initialData.masterBooks || []).filter((b) => {
      const slug = b.slug.toLowerCase();
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
      initMap[b.id] = true;
    }
    setSelectedBookIds(initMap);
  };

  // Initialize books once
  useState(() => {
    resetBooksForGroup(selectedGroup);
  });

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
    initialData.defaultExamDate || "2027-04-15"
  );
  const [targetStartDate, setTargetStartDate] = useState<string>(
    initialData.defaultTargetStartDate ||
      new Date().toISOString().split("T")[0]
  );
  const [targetDate, setTargetDate] = useState<string>(
    initialData.defaultTargetDate || "2027-02-28"
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
    return groupBooks.filter((b) => selectedBookIds[b.id]);
  }, [groupBooks, selectedBookIds]);

  const chosenGroupObj = GROUPS.find((g) => g.id === selectedGroup) || GROUPS[0];

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
      const res = await completeOnboardingAction({
        streamGroup: selectedGroup,
        bookIds: chosenBooks.map((b) => b.id),
        examDate,
        targetStartDate,
        targetDate,
        skip: true,
      });
      if (res.ok) {
        router.push(res.redirectUrl || "/");
        router.refresh();
      } else {
        setError(res.error || "Failed to skip onboarding.");
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
      const res = await completeOnboardingAction({
        streamGroup: selectedGroup,
        bookIds: chosenBooks.map((b) => b.id),
        examDate,
        targetStartDate,
        targetDate,
        skip: false,
      });
      if (res.ok) {
        router.push(res.redirectUrl || "/");
        router.refresh();
      } else {
        setError(res.error || "Failed to save onboarding setup.");
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
              Personal Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step !== "welcome" && (
            <span className="text-xs font-semibold text-ink-faint hidden sm:inline">
              Step {currentStepIndex} of {stepList.length - 1}
            </span>
          )}
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending}
            className="text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg border border-line bg-white/70 hover:bg-white shadow-2xs transition"
          >
            Skip for now
          </button>
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
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center">
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
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 1 of 5
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Select Your Group
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Choose your academic stream to unlock your relevant syllabus books.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {GROUPS.map((g) => {
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
                    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-leaf bg-white shadow-md shadow-leaf/10 ring-2 ring-leaf/20 scale-[1.02]"
                        : "border-line bg-white/70 hover:bg-white hover:border-ink-faint/60 hover:shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`grid size-11 place-items-center rounded-xl transition ${
                            isSelected
                              ? "bg-leaf text-white shadow-sm shadow-leaf/30"
                              : "bg-paper text-ink-soft"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        {isSelected && (
                          <span className="flex items-center justify-center size-6 rounded-full bg-leaf text-white shadow-xs">
                            <Check className="size-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base font-bold text-ink">
                        {g.name}
                      </h3>
                      <p className="text-xs font-medium text-ink-faint mt-0.5">
                        {g.nameBn}
                      </p>
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed text-ink-faint border-t border-line/50 pt-2.5">
                      {g.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => setStep("welcome")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-3.5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!selectedGroup}
                onClick={() => setStep("books")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT YOUR BOOKS */}
        {step === "books" && (
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 2 of 5
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    Select Your Books
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-soft">
                    Curriculum subjects for{" "}
                    <strong className="text-ink font-semibold">{chosenGroupObj.name}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={selectAllBooks}
                    className="text-xs font-semibold text-leaf hover:underline px-2 py-1"
                  >
                    Select All
                  </button>
                  <span className="text-line">•</span>
                  <button
                    type="button"
                    onClick={clearAllBooks}
                    className="text-xs font-semibold text-ink-faint hover:text-ink px-2 py-1"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {groupBooks.map((book) => {
                const isChecked = !!selectedBookIds[book.id];
                return (
                  <div
                    key={book.id}
                    onClick={() => toggleBookSelection(book.id)}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "border-leaf bg-leaf/[0.04] text-ink ring-1 ring-leaf/20"
                        : "border-line bg-white/70 hover:bg-white text-ink-soft hover:border-ink-faint/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-leaf border-leaf text-white"
                            : "border-line bg-white"
                        }`}
                      >
                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-ink truncate">
                          {book.name}
                        </p>
                        {book.nameBn && (
                          <p className="text-[11px] text-ink-faint truncate">
                            {book.nameBn}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-ink-faint bg-paper px-2 py-0.5 rounded border border-line shrink-0">
                      {book.chapters.length} Chapters
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-paper border border-line text-xs font-medium text-ink-soft flex items-center justify-between">
              <span>Selected Books</span>
              <span className="font-bold text-leaf">
                {chosenBooks.length} of {groupBooks.length} Books
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-line/60">
              <button
                type="button"
                onClick={() => setStep("group")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink px-3.5 py-2.5 rounded-xl border border-line bg-white hover:bg-paper transition"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={chosenBooks.length === 0}
                onClick={() => setStep("exam_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="space-y-6 animate-rise">
            <div className="text-center">
              <span className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-leaf/10 text-leaf mb-2">
                <Sparkles className="size-6" />
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                You&apos;re All Set! 🎉
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Here is a summary of your study setup and dashboard countdowns.
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line/60">
                <span className="text-xs font-semibold text-ink-soft">Study Group</span>
                <span className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                  <Check className="size-3.5 text-leaf stroke-[3]" />
                  <span>{chosenGroupObj.name}</span>
                </span>
              </div>

              <div className="pb-3 border-b border-line/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-ink-soft">Selected Books</span>
                  <span className="text-xs font-bold text-leaf">
                    {chosenBooks.length} Books
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {chosenBooks.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center text-[11px] font-medium bg-paper border border-line px-2 py-0.5 rounded-md text-ink"
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3 Dates Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-line/60">
                <div className="p-2.5 rounded-xl bg-paper/60 border border-line">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block">
                    Target Start Date
                  </span>
                  <span className="text-xs font-bold text-ink mt-0.5 block">
                    {formatDisplayDate(targetStartDate)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-paper/60 border border-line">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block">
                    Target Date
                  </span>
                  <span className="text-xs font-bold text-ink mt-0.5 block">
                    {formatDisplayDate(targetDate)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-paper/60 border border-line">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint block">
                    Exam Date
                  </span>
                  <span className="text-xs font-bold text-ink mt-0.5 block">
                    {formatDisplayDate(examDate)}
                  </span>
                </div>
              </div>

              {/* Dashboard Countdowns Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-brand">
                    <Target className="size-4.5" />
                  </span>
                  <div>
                    <span className="font-display text-lg font-bold tabular-nums text-ink block leading-none">
                      {daysToTarget}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                      {daysToTarget === 1 ? "DAY TO TARGET" : "DAYS TO TARGET"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-brand">
                    <AlarmClockCheck className="size-4.5" />
                  </span>
                  <div>
                    <span className="font-display text-lg font-bold tabular-nums text-ink block leading-none">
                      {daysToExam}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                      {daysToExam === 1 ? "DAY TO EXAM" : "DAYS TO EXAM"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={pending}
                onClick={handleFinish}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-leaf py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-leaf/30 hover:bg-leaf-deep transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {pending ? (
                  <span>Saving Your Personalized Syllabus...</span>
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
                  className="text-xs font-semibold text-ink-faint hover:text-ink transition"
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
