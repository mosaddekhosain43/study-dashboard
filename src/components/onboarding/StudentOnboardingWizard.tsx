"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Atom,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Library,
  Palette,
  Sparkles,
  Target,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
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

type Step = "welcome" | "group" | "books" | "exam_date" | "target_date" | "summary";

const GROUPS = [
  {
    id: "science",
    name: "Science",
    nameBn: "বিজ্ঞান বিভাগ",
    desc: "Physics, Chemistry, Biology, Higher Math & Core Subjects",
    icon: Atom,
    gradient: "from-sky-500/20 to-blue-600/20 text-sky-600 border-sky-200",
    activeBorder: "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40",
  },
  {
    id: "general_madrasah",
    name: "Arts",
    nameBn: "মানবিক / সাধারণ বিভাগ",
    desc: "Islamic History, Balaghat & Mantiq, Civics, Economics & Core Subjects",
    icon: Palette,
    gradient: "from-emerald-500/20 to-teal-600/20 text-emerald-600 border-emerald-200",
    activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40",
  },
  {
    id: "business_studies",
    name: "Commerce",
    nameBn: "ব্যবসায় শিক্ষা বিভাগ",
    desc: "Business Studies, Accounting, Economics, ICT & Core Subjects",
    icon: Briefcase,
    gradient: "from-amber-500/20 to-orange-600/20 text-amber-600 border-amber-200",
    activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40",
  },
];

export default function StudentOnboardingWizard({ initialData }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedGroup, setSelectedGroup] = useState<string>(
    initialData.user.streamGroup || "science"
  );

  // Filter master books based on group
  const groupBooks = useMemo(() => {
    const all = initialData.masterBooks || [];

    if (selectedGroup === "science") {
      // Science includes science electives + compulsory (with Arabic Science)
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
      // Arts includes arts electives + compulsory (with Arabic 1 & 2, not Arabic Science)
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

  // When group changes, auto-select all books belonging to the group
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

  // Initialize books on mount
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

  // Dates
  const [examDate, setExamDate] = useState<string>(
    initialData.defaultExamDate || "2027-04-15"
  );
  const [targetDate, setTargetDate] = useState<string>(
    initialData.defaultTargetDate || "2027-02-28"
  );

  // Preparation time calculation
  const prepDays = useMemo(() => {
    if (!examDate || !targetDate) return 0;
    // Difference between target date and exam date as requested:
    // e.g. 15 Dec 2026 - 30 Nov 2026 = 15 Days
    const diff = calculateDaysBetween(targetDate, examDate);
    return diff;
  }, [examDate, targetDate]);

  const daysUntilTarget = useMemo(() => {
    if (!targetDate) return 0;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    return calculateDaysBetween(todayStr, targetDate);
  }, [targetDate]);

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
    { key: "target_date", title: "Target Date", num: 5 },
    { key: "summary", title: "Ready", num: 6 },
  ];

  const currentStepIndex = stepList.findIndex((s) => s.key === step);

  // Actions
  const handleSkip = () => {
    setError(null);
    startTransition(async () => {
      const res = await completeOnboardingAction({
        streamGroup: selectedGroup,
        bookIds: chosenBooks.map((b) => b.id),
        examDate,
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
    if (targetDate > examDate) {
      setError("Your target date should be before your exam date.");
      return;
    }

    startTransition(async () => {
      const res = await completeOnboardingAction({
        streamGroup: selectedGroup,
        bookIds: chosenBooks.map((b) => b.id),
        examDate,
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
              Personal Onboarding
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

      {/* Main Content Card Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-rise">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {step === "welcome" && (
          <div className="text-center py-6 sm:py-10 animate-rise">
            {/* Animated Welcome Badge */}
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-leaf/10 text-leaf ring-1 ring-leaf/20 shadow-sm mb-6 animate-scale-in">
              <Sparkles className="size-8" />
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
              Welcome, {initialData.user.name || "Student"}! 👋
            </h1>

            <p className="mt-3 text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
              Let&apos;s personalize your study experience in less than 2 minutes. We&apos;ll configure your group, books, and study timeline.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
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
                    Showing official curriculum books tailored for{" "}
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

            {/* Books List Grid */}
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

            {/* Selected Count Notice */}
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
                Select your board examination starting date using the calendar below.
              </p>
            </div>

            {/* Calendar Picker Box */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs space-y-4">
              <DatePickerCalendar
                label="Exam Date"
                value={examDate}
                onChange={(d) => {
                  setExamDate(d);
                  setError(null);
                }}
                minDate={new Date().toISOString().split("T")[0]}
                placeholder="Select Exam Date"
                required
              />

              {examDate && (
                <div className="p-3.5 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-ink-soft font-medium">Selected Exam Date:</span>
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
                onClick={() => setStep("target_date")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ASK TARGET DATE SECOND + DYNAMIC PREPARATION TIME */}
        {step === "target_date" && (
          <div className="space-y-6 animate-rise">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">
                Step 4 of 5
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2">
                <span>When do you want to complete preparation?</span>
                <span>🎯</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Choose a completion target before your exams for full revisions.
              </p>
            </div>

            {/* Target Date Picker Box */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-line shadow-xs space-y-4">
              <DatePickerCalendar
                label="Target Completion Date"
                value={targetDate}
                onChange={(d) => {
                  setTargetDate(d);
                  if (examDate && d > examDate) {
                    setError("Your target date should be before your exam date.");
                  } else {
                    setError(null);
                  }
                }}
                minDate={new Date().toISOString().split("T")[0]}
                placeholder="Select Target Date"
                required
              />

              {/* Dynamic Preparation Days Calculation Card */}
              {targetDate && examDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-paper border border-line">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      Exam Date
                    </span>
                    <span className="block mt-0.5 text-xs sm:text-sm font-bold text-ink">
                      {formatDisplayDate(examDate)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-leaf/10 border border-leaf/20">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-leaf">
                      Your Preparation Time
                    </span>
                    <span className="block mt-0.5 text-base sm:text-lg font-display font-bold text-leaf">
                      {prepDays} Days
                    </span>
                    <span className="block text-[10px] text-ink-faint mt-0.5">
                      Revision window before exam starts
                    </span>
                  </div>
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
                disabled={!targetDate || targetDate > examDate}
                onClick={() => setStep("summary")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2.5 rounded-xl bg-leaf hover:bg-leaf-deep shadow-md shadow-leaf/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Review Summary</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: FINAL SETUP SUMMARY */}
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
                Here is a quick overview of your personalized study plan.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-line/60">
                <div>
                  <span className="text-[11px] font-semibold text-ink-faint block">
                    Exam Date
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-ink">
                    {formatDisplayDate(examDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-ink-faint block">
                    Target Completion Date
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-ink">
                    {formatDisplayDate(targetDate)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-leaf block">
                    Preparation Time
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    Buffer for revisions & model tests
                  </span>
                </div>
                <span className="font-display text-lg font-bold text-leaf">
                  {prepDays} Days
                </span>
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
