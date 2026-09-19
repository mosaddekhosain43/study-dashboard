"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  GraduationCap,
  Layers,
  Sparkles,
  Square,
  ArrowRight,
  RotateCcw,
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

interface Props {
  userBatch: Batch | null;
  availableBatches: Batch[];
  masterBooks: MasterBookView[];
  isReconfiguring?: boolean;
  onCancel?: () => void;
}

export default function SyllabusOnboarding({
  userBatch,
  availableBatches,
  masterBooks,
  isReconfiguring = false,
  onCancel,
}: Props) {
  const router = useRouter();
  const [selectedBatchId, setSelectedBatchId] = useState<number>(
    userBatch?.id || availableBatches[0]?.id || 1
  );

  // Filter books for currently selected batch (or general master books)
  const currentBooks = useMemo(() => {
    const matched = masterBooks.filter(
      (b) => b.batchId === selectedBatchId || b.batchId === null
    );
    return matched.length > 0 ? matched : masterBooks;
  }, [masterBooks, selectedBatchId]);

  // Selected books: Record<bookId, boolean> (default: all checked)
  const [selectedBooks, setSelectedBooks] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    for (const b of masterBooks) {
      initial[b.id] = true;
    }
    return initial;
  });

  // Selected chapters per book: Record<bookId, Record<chapterId, boolean>> (default: all checked)
  const [selectedChapters, setSelectedChapters] = useState<
    Record<number, Record<number, boolean>>
  >(() => {
    const initial: Record<number, Record<number, boolean>> = {};
    for (const b of masterBooks) {
      initial[b.id] = {};
      for (const ch of b.chapters) {
        initial[b.id][ch.id] = true;
      }
    }
    return initial;
  });

  // Currently active/expanded book for chapter selection
  const [activeBookId, setActiveBookId] = useState<number | null>(
    currentBooks[0]?.id ?? null
  );

  // Expanded chapters to view topics inside: Record<chapterId, boolean>
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Toggle book selection
  const toggleBook = (bookId: number) => {
    setSelectedBooks((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Toggle chapter selection
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

  // Toggle topic expansion inside a chapter
  const toggleTopicExpand = (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Quick stats calculations
  const stats = useMemo(() => {
    let bookCount = 0;
    let chapterCount = 0;
    let topicCount = 0;

    for (const b of currentBooks) {
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
  }, [currentBooks, selectedBooks, selectedChapters]);

  // Submit and initialize syllabus
  const handleSaveSyllabus = () => {
    setError(null);

    const selections = currentBooks
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
      setError("Please select at least one book and at least one chapter.");
      return;
    }

    startTransition(async () => {
      const res = await initializeStudentSyllabusAction({
        batchId: selectedBatchId,
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

  const activeBook = currentBooks.find((b) => b.id === activeBookId) || currentBooks[0];

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="card rise relative overflow-hidden p-5 sm:p-7 border border-line bg-card shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-leaf to-glow" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf">
              <Sparkles className="size-4" />
              <span>Personalized Syllabus Setup</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Choose Your Curriculum & Chapters
            </h1>
            <p className="mt-1 text-xs sm:text-[13px] text-ink-faint max-w-2xl">
              Select the books and specific exam chapters you are preparing for. You can
              add custom subjects or modify chapters anytime later from your personal dashboard.
            </p>
          </div>

          {/* Class / Batch Selector */}
          <div className="shrink-0 flex items-center gap-2 rounded-2xl border border-line bg-paper/60 p-2 sm:p-2.5">
            <GraduationCap className="size-4 text-leaf shrink-0 ml-1" />
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                Your Class / Batch
              </span>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-ink outline-none cursor-pointer"
              >
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Selection Summary Banner */}
        <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-ink">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4 text-leaf" />
              <strong className="text-leaf font-bold">{stats.bookCount}</strong> Books Selected
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600" />
              <strong className="text-emerald-700 font-bold">{stats.chapterCount}</strong> Chapters
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

      {/* Main Layout: Left = Books Selection, Right = Chapter & Topic Selection */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Step 1: Books List (4 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-sm font-bold tracking-tight text-ink flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-leaf text-white text-[11px] font-bold">
                1
              </span>
              <span>Available Books for Your Class</span>
            </h2>
            <span className="text-[11px] font-semibold text-ink-faint">
              {currentBooks.filter((b) => selectedBooks[b.id]).length}/{currentBooks.length} Selected
            </span>
          </div>

          <div className="space-y-2">
            {currentBooks.map((book, idx) => {
              const isChecked = Boolean(selectedBooks[book.id]);
              const isActive = activeBook?.id === book.id;
              const bookChs = selectedChapters[book.id] || {};
              const selectedChCount = book.chapters.filter((ch) => bookChs[ch.id]).length;

              return (
                <div
                  key={book.id}
                  onClick={() => setActiveBookId(book.id)}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border p-3 sm:px-4 cursor-pointer transition ${
                    isActive
                      ? "border-leaf bg-leaf-soft/30 shadow-xs"
                      : "border-line bg-card hover:border-leaf/50 hover:bg-paper/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-ink-faint tabular-nums">
                          #{idx + 1}
                        </span>
                        <p
                          className={`text-[13.5px] font-semibold truncate ${
                            isChecked ? "text-ink" : "text-ink-faint line-through"
                          }`}
                        >
                          {book.name}
                        </p>
                      </div>
                      <p className="font-bengali text-[11px] text-ink-faint truncate">
                        {book.nameBn || "সাধারণ বিষয়"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10.5px] font-semibold ${
                        selectedChCount > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {selectedChCount}/{book.chapters.length} ch
                    </span>
                    <ChevronRight
                      className={`size-4 transition-transform ${
                        isActive ? "text-leaf translate-x-0.5" : "text-ink-faint"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3: Chapter & Topic Level View (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          {activeBook ? (
            <div className="card p-4 sm:p-5 border border-line bg-card shadow-sm space-y-4">
              {/* Active Book Chapter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-leaf">
                    <span className="grid size-4 place-items-center rounded-full bg-leaf text-white text-[10px]">
                      2
                    </span>
                    <span>Select Exam Chapters</span>
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

                {/* "Select All" Toggle Button */}
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
                        <span>Select All Chapters</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Chapters List */}
              {activeBook.chapters.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-faint border border-dashed border-line rounded-xl">
                  No chapters defined yet for this book.
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
                        {/* Chapter Header */}
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
                                {ch.name}
                              </p>
                              <p className="text-[10.5px] text-ink-faint">
                                {ch.topics.length} study topic{ch.topics.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>

                          {/* Step 3: Topic-Level View Accordion Toggle */}
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

                        {/* Topics View Inside Chapter */}
                        {isTopicsExpanded && ch.topics.length > 0 && (
                          <div className="border-t border-line/60 bg-white/80 p-3 sm:px-4 rounded-b-2xl">
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mb-2">
                              Included Sub-topics / Lessons:
                            </p>
                            <ul className="space-y-1.5">
                              {ch.topics.map((tp, tIdx) => (
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
              Select a book on the left to review and customize chapters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
