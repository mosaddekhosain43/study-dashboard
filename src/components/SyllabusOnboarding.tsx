"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  Sparkles,
  Square,
  ArrowRight,
  School,
  Building2,
  Atom,
  Briefcase,
  BookMarked,
  HelpCircle,
  Compass,
  BookmarkCheck,
} from "lucide-react";
import {
  initializeStudentSyllabusAction,
  type MasterBookView,
} from "@/actions/syllabus";

interface Batch {
  id: number;
  name: string;
  slug: string;
}

interface UserProfile {
  board?: string;
  classLevel?: string;
  streamGroup?: string;
}

interface Props {
  userBatch: Batch | null;
  userProfile?: UserProfile;
  availableBatches: Batch[];
  masterBooks: MasterBookView[];
  isReconfiguring?: boolean;
  onCancel?: () => void;
}

export type BoardType = "general" | "madrasah";
export type ClassLevel = "ssc" | "hsc" | "dakhil" | "alim";
export type StreamGroup =
  | "science"
  | "humanities"
  | "business_studies"
  | "general_madrasah"
  | "quran_hadith";

export default function SyllabusOnboarding({
  userBatch,
  userProfile,
  availableBatches,
  masterBooks,
  isReconfiguring = false,
  onCancel,
}: Props) {
  const router = useRouter();

  // ── Step A: Board Selection ──
  const [board, setBoard] = useState<BoardType>(() => {
    if (userProfile?.board === "general" || userProfile?.board === "madrasah") {
      return userProfile.board as BoardType;
    }
    // Infer from userBatch name if possible
    if (userBatch?.name.toLowerCase().includes("ssc") || userBatch?.name.toLowerCase().includes("school") || userBatch?.name.toLowerCase().includes("hsc")) {
      return "general";
    }
    return "general";
  });

  // ── Step B: Class / Level Selection ──
  const [classLevel, setClassLevel] = useState<ClassLevel>(() => {
    if (userProfile?.classLevel === "ssc" || userProfile?.classLevel === "hsc" || userProfile?.classLevel === "dakhil" || userProfile?.classLevel === "alim") {
      return userProfile.classLevel as ClassLevel;
    }
    return board === "general" ? "ssc" : "dakhil";
  });

  // When board changes, ensure valid class level
  const handleBoardChange = (newBoard: BoardType) => {
    setBoard(newBoard);
    if (newBoard === "general") {
      if (classLevel !== "ssc" && classLevel !== "hsc") {
        setClassLevel("ssc");
      }
      setStreamGroup("science");
    } else {
      if (classLevel !== "dakhil" && classLevel !== "alim") {
        setClassLevel("dakhil");
      }
      setStreamGroup("general_madrasah");
    }
  };

  // ── Step C: Stream / Group Selection ──
  const [streamGroup, setStreamGroup] = useState<StreamGroup>(() => {
    if (userProfile?.streamGroup) return userProfile.streamGroup as StreamGroup;
    return board === "general" ? "science" : "general_madrasah";
  });

  // Auto-select matching batchId
  const matchingBatchId = useMemo(() => {
    const slugKey = classLevel;
    const found = availableBatches.find((b) =>
      b.slug.toLowerCase().includes(slugKey.toLowerCase()) ||
      b.name.toLowerCase().includes(slugKey.toLowerCase())
    );
    return found ? found.id : (userBatch?.id || availableBatches[0]?.id || 1);
  }, [classLevel, availableBatches, userBatch]);

  const [selectedBatchId, setSelectedBatchId] = useState<number>(matchingBatchId);

  useEffect(() => {
    setSelectedBatchId(matchingBatchId);
  }, [matchingBatchId]);

  // ── Filtered Master Books Based on Board, Class, and Group ──
  const filteredBooks = useMemo(() => {
    return masterBooks.filter((book) => {
      // 1. Board filter
      if (book.board && book.board !== "both" && book.board !== board) {
        return false;
      }
      // 2. Class Level filter
      if (book.classLevel && book.classLevel !== "all") {
        if (book.classLevel !== classLevel) {
          return false;
        }
      }
      // 3. Stream Group filter
      if (book.streamGroup && book.streamGroup !== "all") {
        if (book.streamGroup !== streamGroup) {
          return false;
        }
      }
      return true;
    });
  }, [masterBooks, board, classLevel, streamGroup]);

  // Group books by subjectType: Compulsory, Group Elective, Optional
  const categorizedBooks = useMemo(() => {
    const compulsory = filteredBooks.filter((b) => b.subjectType === "compulsory");
    const elective = filteredBooks.filter((b) => b.subjectType === "group_elective");
    const optional = filteredBooks.filter((b) => b.subjectType === "optional");

    // If no explicit tags exist (e.g. legacy books), default them all to compulsory
    if (compulsory.length === 0 && elective.length === 0 && optional.length === 0) {
      return { compulsory: filteredBooks, elective: [], optional: [] };
    }

    return { compulsory, elective, optional };
  }, [filteredBooks]);

  // ── Selected books state: Record<bookId, boolean> ──
  // Compulsory & Elective default to TRUE, Optional defaults to TRUE for first 1
  const [selectedBooks, setSelectedBooks] = useState<Record<number, boolean>>({});

  // Reset/Initialize selection when filteredBooks change
  useEffect(() => {
    setSelectedBooks((prev) => {
      const next: Record<number, boolean> = { ...prev };
      for (const b of filteredBooks) {
        if (next[b.id] === undefined) {
          // Default compulsory and electives to checked; optional to unchecked unless configured
          next[b.id] = b.subjectType !== "optional";
        }
      }
      return next;
    });
  }, [filteredBooks]);

  // ── Selected chapters per book: Record<bookId, Record<chapterId, boolean>> ──
  const [selectedChapters, setSelectedChapters] = useState<
    Record<number, Record<number, boolean>>
  >({});

  useEffect(() => {
    setSelectedChapters((prev) => {
      const next = { ...prev };
      for (const b of filteredBooks) {
        if (!next[b.id]) {
          next[b.id] = {};
          for (const ch of b.chapters) {
            next[b.id][ch.id] = true; // all chapters checked by default
          }
        }
      }
      return next;
    });
  }, [filteredBooks]);

  // Currently active book for chapter/module inspection
  const [activeBookId, setActiveBookId] = useState<number | null>(null);

  useEffect(() => {
    if (filteredBooks.length > 0) {
      // Keep active if still in filtered list, else select first
      if (!activeBookId || !filteredBooks.some((b) => b.id === activeBookId)) {
        setActiveBookId(filteredBooks[0].id);
      }
    } else {
      setActiveBookId(null);
    }
  }, [filteredBooks, activeBookId]);

  // Expanded chapters for viewing subtopics: Record<chapterId, boolean>
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Toggle single book selection
  const toggleBook = (bookId: number) => {
    setSelectedBooks((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Toggle single chapter selection
  const toggleChapter = (bookId: number, chapterId: number) => {
    setSelectedChapters((prev) => {
      const bookChs = { ...(prev[bookId] || {}) };
      bookChs[chapterId] = !bookChs[chapterId];
      return {
        ...prev,
        [bookId]: bookChs,
      };
    });
  };

  // Select all / Deselect all chapters in a book
  const toggleAllChaptersInBook = (book: MasterBookView) => {
    const bookChs = selectedChapters[book.id] || {};
    const allSelected = book.chapters.every((ch) => bookChs[ch.id]);

    setSelectedChapters((prev) => {
      const updated: Record<number, boolean> = {};
      for (const ch of book.chapters) {
        updated[ch.id] = !allSelected;
      }
      return {
        ...prev,
        [book.id]: updated,
      };
    });
  };

  // Toggle topic accordion
  const toggleTopicExpand = (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Calculate live statistics
  const stats = useMemo(() => {
    let bookCount = 0;
    let chapterCount = 0;
    let topicCount = 0;

    for (const b of filteredBooks) {
      if (selectedBooks[b.id]) {
        bookCount++;
        const bChapters = selectedChapters[b.id] || {};
        for (const ch of b.chapters) {
          if (bChapters[ch.id]) {
            chapterCount++;
            topicCount += ch.topics.length;
          }
        }
      }
    }

    return { bookCount, chapterCount, topicCount };
  }, [filteredBooks, selectedBooks, selectedChapters]);

  // Submit and save student syllabus
  const handleSaveSyllabus = () => {
    setError(null);

    const selections = filteredBooks
      .filter((b) => selectedBooks[b.id])
      .map((b) => {
        const bChapters = selectedChapters[b.id] || {};
        const chosenChapters = b.chapters
          .filter((ch) => bChapters[ch.id])
          .map((ch) => ch.id);
        return {
          subjectId: b.id,
          chapterIds: chosenChapters,
        };
      })
      .filter((s) => s.chapterIds.length > 0);

    if (selections.length === 0) {
      setError("Please select at least one subject and at least one chapter/module.");
      return;
    }

    startTransition(async () => {
      const res = await initializeStudentSyllabusAction({
        batchId: selectedBatchId,
        board,
        classLevel,
        streamGroup,
        selections,
      });

      if (res.ok) {
        router.push("/subjects");
        router.refresh();
      } else {
        setError(res.error || "Failed to initialize syllabus.");
      }
    });
  };

  const activeBook = filteredBooks.find((b) => b.id === activeBookId) || filteredBooks[0];

  return (
    <div className="space-y-6">
      {/* ── Header Card ────────────────────────────────────────────────────────── */}
      <div className="card rise relative overflow-hidden p-5 sm:p-7 border border-line bg-card shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-leaf to-glow" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf">
              <Sparkles className="size-4" />
              <span>NCTB Curriculum & Onboarding</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Student Syllabus & Stream Setup
            </h1>
            <p className="mt-1 text-xs sm:text-[13.5px] text-ink-faint max-w-2xl">
              Select your Education Board, Class, and Stream. The system automatically organizes
              compulsory subjects, group electives, and optional subjects according to the official NCTB curriculum.
            </p>
          </div>

          {/* Quick stats counter badge */}
          <div className="shrink-0 flex items-center gap-3 rounded-2xl border border-line bg-paper/60 p-3">
            <div className="text-right">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                Total Selected
              </span>
              <p className="text-sm font-bold text-ink">
                <span className="text-leaf">{stats.bookCount}</span> Books ·{" "}
                <span className="text-emerald-700">{stats.chapterCount}</span> Chapters/Parts
              </p>
            </div>
            <BookmarkCheck className="size-6 text-leaf shrink-0" />
          </div>
        </div>

        {/* ── Step 1: Board & Stream Selectors ─────────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-line/70 grid gap-4 md:grid-cols-3">
          {/* Board Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
              <School className="size-3.5 text-leaf" />
              <span>1. Education Board</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleBoardChange("general")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                  board === "general"
                    ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                    : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                }`}
              >
                <School className="size-4 shrink-0" />
                <span>General (School)</span>
              </button>

              <button
                type="button"
                onClick={() => handleBoardChange("madrasah")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                  board === "madrasah"
                    ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                    : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                }`}
              >
                <Building2 className="size-4 shrink-0" />
                <span>Madrasah Board</span>
              </button>
            </div>
          </div>

          {/* Class / Level Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-leaf" />
              <span>2. Class / Level</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {board === "general" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setClassLevel("ssc")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition ${
                      classLevel === "ssc"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    SSC
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassLevel("hsc")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition ${
                      classLevel === "hsc"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    HSC
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setClassLevel("dakhil")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition ${
                      classLevel === "dakhil"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    Dakhil
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassLevel("alim")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition ${
                      classLevel === "alim"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    Alim
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Group / Stream Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
              <Compass className="size-3.5 text-leaf" />
              <span>3. Group / Stream</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {board === "general" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("science")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "science"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <Atom className="size-3.5" />
                    <span>Science</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("humanities")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "humanities"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <BookMarked className="size-3.5" />
                    <span>Humanities</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("business_studies")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "business_studies"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <Briefcase className="size-3.5" />
                    <span>Commerce</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("general_madrasah")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "general_madrasah"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <BookOpen className="size-3.5" />
                    <span>General</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("science")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "science"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <Atom className="size-3.5" />
                    <span>Science</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamGroup("quran_hadith")}
                    className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition ${
                      streamGroup === "quran_hadith"
                        ? "border-leaf bg-leaf-soft/40 text-leaf-deep font-bold shadow-2xs"
                        : "border-line bg-paper text-ink-soft hover:border-leaf/40"
                    }`}
                  >
                    <Building2 className="size-3.5" />
                    <span>Hifz/Special</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Action bar & Live Summary ────────────────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-ink">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4 text-leaf" />
              <strong className="text-leaf font-bold">{stats.bookCount}</strong> Books
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600" />
              <strong className="text-emerald-700 font-bold">{stats.chapterCount}</strong> Chapters/Parts
            </span>
            <span className="flex items-center gap-1.5 text-ink-faint">
              <Check className="size-4 text-amber-600" />
              <strong className="text-amber-700 font-bold">{stats.topicCount}</strong> Topics
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isReconfiguring && onCancel && (
              <button
                onClick={onCancel}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveSyllabus}
              disabled={pending || stats.bookCount === 0 || stats.chapterCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-leaf px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-leaf/25 transition hover:bg-leaf-deep disabled:opacity-50"
            >
              {pending ? (
                "Initializing Syllabus..."
              ) : (
                <>
                  <span>Save & Start Studying</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}
      </div>

      {/* ── Main Layout: Left = Books Selection, Right = Chapter/Module Drilldown ─ */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Categorized Books List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Compulsory Subjects */}
          {categorizedBooks.compulsory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-leaf" />
                  <span>Compulsory Subjects (আবশ্যিক বিষয়)</span>
                </h3>
                <span className="text-[11px] font-semibold text-leaf">
                  {categorizedBooks.compulsory.filter((b) => selectedBooks[b.id]).length}/
                  {categorizedBooks.compulsory.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {categorizedBooks.compulsory.map((book) => renderBookRow(book))}
              </div>
            </div>
          )}

          {/* Section 2: Group Elective Subjects */}
          {categorizedBooks.elective.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Group Electives (বিভাগীয় নৈর্বাচনিক বিষয়)</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {categorizedBooks.elective.filter((b) => selectedBooks[b.id]).length}/
                  {categorizedBooks.elective.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {categorizedBooks.elective.map((book) => renderBookRow(book))}
              </div>
            </div>
          )}

          {/* Section 3: Optional / 4th Subject */}
          {categorizedBooks.optional.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span>Optional / 4th Subject (ঐচ্ছিক / ৪র্থ বিষয়)</span>
                </h3>
                <span className="text-[11px] font-semibold text-amber-700">
                  {categorizedBooks.optional.filter((b) => selectedBooks[b.id]).length}/
                  {categorizedBooks.optional.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {categorizedBooks.optional.map((book) => renderBookRow(book))}
              </div>
            </div>
          )}

          {filteredBooks.length === 0 && (
            <div className="card p-8 text-center text-xs text-ink-faint border-dashed border-line">
              No subjects found for this selection. Please adjust your Board or Class filters.
            </div>
          )}
        </div>

        {/* Right Column: Chapter & Module Drilldown View (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          {activeBook ? (
            <div className="card p-4 sm:p-5 border border-line bg-card shadow-sm space-y-4">
              {/* Active Book Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-leaf">
                    <span className="grid size-4 place-items-center rounded-full bg-leaf text-white text-[10px]">
                      ✓
                    </span>
                    <span>
                      {activeBook.structureType === "module"
                        ? "Skills & Module-Based Subject (মডিউল বিন্যাস)"
                        : "Chapter-Based Curriculum (অধ্যায় বিন্যাস)"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                    <span>{activeBook.name}</span>
                    {activeBook.nameBn && (
                      <span className="font-bengali text-xs font-normal text-ink-faint">
                        ({activeBook.nameBn})
                      </span>
                    )}
                  </h3>
                </div>

                {/* "Select All" Chapters/Modules Toggle Button */}
                {activeBook.chapters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleAllChaptersInBook(activeBook)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-leaf hover:text-leaf transition shrink-0"
                  >
                    {activeBook.chapters.every(
                      (ch) => selectedChapters[activeBook.id]?.[ch.id]
                    ) ? (
                      <>
                        <CheckSquare className="size-3.5 text-leaf" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square className="size-3.5 text-ink-faint" />
                        <span>
                          {activeBook.structureType === "module"
                            ? "Select All Modules"
                            : "Select All Chapters"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Module/Skills Information Notice for Module-based Subjects */}
              {activeBook.structureType === "module" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <BookOpen className="size-4 text-emerald-600 shrink-0" />
                  <span>
                    This subject is organized by <strong>parts, skills, and grammar sections</strong> rather
                    than traditional chapters. Select the modules included in your test exam.
                  </span>
                </div>
              )}

              {/* Chapters / Modules List */}
              {activeBook.chapters.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-faint border border-dashed border-line rounded-xl">
                  No chapters or modules defined yet for this book.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeBook.chapters.map((ch, chIdx) => {
                    const isChapterSelected = Boolean(
                      selectedChapters[activeBook.id]?.[ch.id]
                    );
                    const isTopicsExpanded = Boolean(expandedChapters[ch.id]);

                    return (
                      <div
                        key={ch.id}
                        className={`rounded-2xl border transition ${
                          isChapterSelected
                            ? "border-line bg-paper/40"
                            : "border-line/60 bg-paper/10 opacity-60"
                        }`}
                      >
                        {/* Chapter / Module Header */}
                        <div className="flex items-center justify-between gap-3 p-3 sm:px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleChapter(activeBook.id, ch.id)}
                              className="grid size-5 place-items-center rounded text-leaf shrink-0"
                            >
                              {isChapterSelected ? (
                                <CheckSquare className="size-4.5 fill-leaf text-white" />
                              ) : (
                                <Square className="size-4.5 text-ink-faint" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-ink">
                                {/* If module-based, do not force CH 1 prefix */}
                                {activeBook.structureType === "chapter" && !ch.name.toLowerCase().includes("chapter") && !ch.name.includes("অধ্যায়") ? (
                                  <span className="text-leaf mr-1.5 font-bold">CH {chIdx + 1}:</span>
                                ) : null}
                                {ch.name}
                              </p>
                              <p className="text-[10.5px] text-ink-faint">
                                {ch.topics.length} study topic{ch.topics.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>

                          {/* Topic-Level Drilldown Toggle */}
                          {ch.topics.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleTopicExpand(ch.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-[11px] font-medium text-ink-faint hover:text-ink transition shrink-0"
                            >
                              <span>Topics ({ch.topics.length})</span>
                              {isTopicsExpanded ? (
                                <ChevronDown className="size-3.5" />
                              ) : (
                                <ChevronRight className="size-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Topics View Inside Chapter / Module */}
                        {isTopicsExpanded && ch.topics.length > 0 && (
                          <div className="border-t border-line/60 bg-white/80 p-3 sm:px-4 rounded-b-2xl">
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mb-2">
                              Sub-topics & Practice Items:
                            </p>
                            <ul className="space-y-1.5">
                              {ch.topics.map((tp) => (
                                <li
                                  key={tp.id}
                                  className="flex items-center gap-2 text-xs text-ink-soft py-0.5"
                                >
                                  <span className="size-1.5 rounded-full bg-leaf shrink-0" />
                                  <span className="font-medium text-[12px]">{tp.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-xs text-ink-faint border-dashed border-line">
              Select a book on the left to review and customize chapters/modules.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for a single book card
  function renderBookRow(book: MasterBookView) {
    const isChecked = Boolean(selectedBooks[book.id]);
    const isActive = activeBook?.id === book.id;
    const bookChs = selectedChapters[book.id] || {};
    const selectedChCount = book.chapters.filter((ch) => bookChs[ch.id]).length;

    return (
      <div
        key={book.id}
        onClick={() => setActiveBookId(book.id)}
        className={`group flex items-center justify-between gap-3 rounded-2xl border p-2.5 sm:px-3.5 cursor-pointer transition ${
          isActive
            ? "border-leaf bg-leaf-soft/30 shadow-xs"
            : "border-line bg-card hover:border-leaf/50 hover:bg-paper/50"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBook(book.id);
            }}
            className="grid size-6 place-items-center rounded-lg text-leaf hover:opacity-80 shrink-0"
          >
            {isChecked ? (
              <CheckSquare className="size-5 fill-leaf text-white" />
            ) : (
              <Square className="size-5 text-ink-faint" />
            )}
          </button>

          <div className="min-w-0">
            <p
              className={`text-[13px] font-semibold truncate ${
                isChecked ? "text-ink" : "text-ink-faint line-through"
              }`}
            >
              {book.name}
            </p>
            <p className="font-bengali text-[11px] text-ink-faint truncate">
              {book.nameBn || "সাধারণ পাঠ্য"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
              selectedChCount > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {selectedChCount}/{book.chapters.length}{" "}
            {book.structureType === "module" ? "parts" : "ch"}
          </span>
          <ChevronRight
            className={`size-4 transition-transform ${
              isActive ? "text-leaf translate-x-0.5" : "text-ink-faint"
            }`}
          />
        </div>
      </div>
    );
  }
}
