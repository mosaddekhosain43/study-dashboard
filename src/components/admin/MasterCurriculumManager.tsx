"use client";

import { useState, useTransition, useMemo } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Trash2,
  X,
  BookPlus,
  Filter,
  School,
  Building2,
  Compass,
  Atom,
  Briefcase,
  BookMarked,
  Tag,
  RefreshCw,
} from "lucide-react";
import {
  createMasterSubjectAction,
  updateMasterSubjectAction,
  deleteMasterSubjectAction,
  createMasterChapterAction,
  updateMasterChapterAction,
  deleteMasterChapterAction,
  createMasterTopicAction,
  updateMasterTopicAction,
  deleteMasterTopicAction,
  createBatchAction,
  updateBatchAction,
  deleteBatchAction,
  syncNctbCurriculumAction,
} from "@/actions/admin";

interface TopicItem {
  id: number;
  name: string;
  sortOrder: number;
}

interface ChapterItem {
  id: number;
  name: string;
  sortOrder: number;
  topics: TopicItem[];
}

interface SubjectItem {
  id: number;
  batchId: number | null;
  name: string;
  nameBn: string | null;
  slug: string;
  sortOrder: number;
  board?: string | null;
  classLevel?: string | null;
  streamGroup?: string | null;
  subjectType?: "compulsory" | "group_elective" | "optional";
  structureType?: "chapter" | "module";
  lessons: ChapterItem[];
}

interface Batch {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface Props {
  batches: Batch[];
  initialCurriculum: SubjectItem[];
}

export default function MasterCurriculumManager({
  batches,
  initialCurriculum,
}: Props) {
  const [selectedBatchId, setSelectedBatchId] = useState<number>(
    batches[0]?.id || 1
  );

  // Filter controls
  const [filterBoard, setFilterBoard] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");

  // Expanded book IDs: Record<subjectId, boolean>
  const [expandedBooks, setExpandedBooks] = useState<Record<number, boolean>>({});

  // Expanded chapter IDs: Record<chapterId, boolean>
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  // Add Book Modal State
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookName, setBookName] = useState("");
  const [bookNameBn, setBookNameBn] = useState("");
  const [bookBoard, setBookBoard] = useState<string>("general");
  const [bookClassLevel, setBookClassLevel] = useState<string>("ssc");
  const [bookStreamGroup, setBookStreamGroup] = useState<string>("all");
  const [bookSubjectType, setBookSubjectType] = useState<
    "compulsory" | "group_elective" | "optional"
  >("compulsory");
  const [bookStructureType, setBookStructureType] = useState<"chapter" | "module">("chapter");

  // Edit Book Modal State
  const [editingBook, setEditingBook] = useState<SubjectItem | null>(null);
  const [editBookName, setEditBookName] = useState("");
  const [editBookNameBn, setEditBookNameBn] = useState("");
  const [editBookBoard, setEditBookBoard] = useState<string>("general");
  const [editBookClassLevel, setEditBookClassLevel] = useState<string>("ssc");
  const [editBookStreamGroup, setEditBookStreamGroup] = useState<string>("all");
  const [editBookSubjectType, setEditBookSubjectType] = useState<
    "compulsory" | "group_elective" | "optional"
  >("compulsory");
  const [editBookStructureType, setEditBookStructureType] = useState<"chapter" | "module">("chapter");

  // Add Chapter state: { [subjectId]: string }
  const [chapterInputs, setChapterInputs] = useState<Record<number, string>>({});
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editChapterName, setEditChapterName] = useState("");

  // Add Topic state: { [chapterId]: string }
  const [topicInputs, setTopicInputs] = useState<Record<number, string>>({});
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editTopicName, setEditTopicName] = useState("");

  // Class / Batch Edit Modal
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [editBatchName, setEditBatchName] = useState("");
  const [editBatchDesc, setEditBatchDesc] = useState("");

  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const toggleBookExpand = (id: number) => {
    setExpandedBooks((p) => ({ ...p, [id]: !p[id] }));
  };

  const toggleChapterExpand = (id: number) => {
    setExpandedChapters((p) => ({ ...p, [id]: !p[id] }));
  };

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  // Filter books by board, class, group and active batch
  const currentBooks = useMemo(() => {
    return initialCurriculum.filter((s) => {
      // Board filter
      if (filterBoard !== "all") {
        if (s.board && s.board !== "both" && s.board !== filterBoard) return false;
      }
      // Class filter
      if (filterClass !== "all") {
        if (s.classLevel && s.classLevel !== "all" && s.classLevel !== filterClass) return false;
      }
      // Group filter
      if (filterGroup !== "all") {
        if (s.streamGroup && s.streamGroup !== "all" && s.streamGroup !== filterGroup) return false;
      }
      return true;
    });
  }, [initialCurriculum, filterBoard, filterClass, filterGroup]);

  // ── Book Handlers ──
  const handleCreateBook = () => {
    if (!bookName.trim()) return;
    startTransition(async () => {
      const res = await createMasterSubjectAction({
        batchId: selectedBatchId,
        name: bookName.trim(),
        nameBn: bookNameBn.trim() || undefined,
        board: bookBoard,
        classLevel: bookClassLevel,
        streamGroup: bookStreamGroup,
        subjectType: bookSubjectType,
        structureType: bookStructureType,
      });
      if (res.ok) {
        setBookName("");
        setBookNameBn("");
        setShowAddBook(false);
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to create book");
      }
    });
  };

  const handleUpdateBook = () => {
    if (!editingBook || !editBookName.trim()) return;
    startTransition(async () => {
      const res = await updateMasterSubjectAction(editingBook.id, {
        name: editBookName.trim(),
        nameBn: editBookNameBn.trim() || undefined,
        batchId: selectedBatchId,
        board: editBookBoard,
        classLevel: editBookClassLevel,
        streamGroup: editBookStreamGroup,
        subjectType: editBookSubjectType,
        structureType: editBookStructureType,
      });
      if (res.ok) {
        setEditingBook(null);
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to update book");
      }
    });
  };

  const handleDeleteBook = (id: number) => {
    if (!confirm("Delete this master book and all its chapters & topics?")) return;
    startTransition(async () => {
      const res = await deleteMasterSubjectAction(id);
      if (res.ok) {
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to delete book");
      }
    });
  };

  const handleSyncNctb = () => {
    if (
      !confirm(
        "This will verify and synchronize all 40 official NCTB curriculum books, chapters, and topics for SSC, HSC, Dakhil, and Alim. Proceed?"
      )
    )
      return;
    startTransition(async () => {
      const res = await syncNctbCurriculumAction({ forceReset: true });
      if (res.ok) {
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to sync NCTB curriculum");
      }
    });
  };

  // ── Chapter Handlers ──
  const handleAddChapter = (subjectId: number) => {
    const val = chapterInputs[subjectId]?.trim();
    if (!val) return;
    startTransition(async () => {
      const res = await createMasterChapterAction(subjectId, val);
      if (res.ok) {
        setChapterInputs((p) => ({ ...p, [subjectId]: "" }));
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to add chapter");
      }
    });
  };

  const handleUpdateChapter = (chapterId: number) => {
    if (!editChapterName.trim()) return;
    startTransition(async () => {
      const res = await updateMasterChapterAction(chapterId, editChapterName.trim());
      if (res.ok) {
        setEditingChapterId(null);
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to rename chapter");
      }
    });
  };

  const handleDeleteChapter = (chapterId: number) => {
    if (!confirm("Delete this chapter and all its topics?")) return;
    startTransition(async () => {
      const res = await deleteMasterChapterAction(chapterId);
      if (res.ok) {
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to delete chapter");
      }
    });
  };

  // ── Topic Handlers ──
  const handleAddTopic = (subjectId: number, chapterId: number) => {
    const val = topicInputs[chapterId]?.trim();
    if (!val) return;
    startTransition(async () => {
      const res = await createMasterTopicAction(subjectId, chapterId, val);
      if (res.ok) {
        setTopicInputs((p) => ({ ...p, [chapterId]: "" }));
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to add topic");
      }
    });
  };

  const handleUpdateTopic = (topicId: number) => {
    if (!editTopicName.trim()) return;
    startTransition(async () => {
      const res = await updateMasterTopicAction(topicId, editTopicName.trim());
      if (res.ok) {
        setEditingTopicId(null);
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to rename topic");
      }
    });
  };

  const handleDeleteTopic = (topicId: number) => {
    if (!confirm("Delete this topic?")) return;
    startTransition(async () => {
      const res = await deleteMasterTopicAction(topicId);
      if (res.ok) {
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to delete topic");
      }
    });
  };

  // ── Batch Edit Handlers ──
  const handleUpdateBatch = () => {
    if (!currentBatch || !editBatchName.trim()) return;
    startTransition(async () => {
      const res = await updateBatchAction(
        currentBatch.id,
        editBatchName.trim(),
        editBatchDesc.trim() || null
      );
      if (res.ok) {
        setShowEditBatchModal(false);
        window.location.reload();
      } else {
        setMsg(res.error || "Failed to update class/batch");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-xs text-sky-900 flex items-start gap-3">
        <GraduationCap className="size-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sky-950">
            Official NCTB & Master Curriculum Management
          </p>
          <p className="text-sky-800 leading-relaxed">
            Manage books, chapters, modules, and sub-topics across General School and Madrasah boards.
            You can configure Chapter-based vs. Module/Skills-based structures and assign Compulsory, Group Elective, or Optional tags.
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {msg}
        </div>
      )}

      {/* Top Filter & Control Bar */}
      <div className="card p-4 sm:p-5 border border-line bg-card shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-leaf-soft text-leaf">
              <Layers className="size-5" />
            </div>
            <div>
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                Active Batch
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                  className="font-display text-sm sm:text-base font-bold text-ink bg-transparent cursor-pointer outline-none border-b border-line pb-0.5 hover:border-leaf"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  title="Edit class name or description"
                  onClick={() => {
                    if (currentBatch) {
                      setEditBatchName(currentBatch.name);
                      setEditBatchDesc(currentBatch.description || "");
                      setShowEditBatchModal(true);
                    }
                  }}
                  className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-paper hover:text-leaf transition"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNctb}
              disabled={pending}
              title="Verify and synchronize all official NCTB books, chapters, and topics"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-800 shadow-xs transition hover:bg-sky-100 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
              <span>Sync NCTB Curriculum</span>
            </button>

            <button
              onClick={() => setShowAddBook(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-deep shrink-0"
            >
              <BookPlus className="size-4" />
              <span>+ Add Master Book</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filters Row */}
        <div className="pt-3 border-t border-line/60 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-ink-faint font-semibold mr-1">
            <Filter className="size-3.5 text-leaf" />
            <span>Filter Curriculum:</span>
          </div>

          {/* Board Filter */}
          <div className="flex items-center gap-1 bg-paper/60 rounded-xl p-1 border border-line">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint px-1.5">
              Board:
            </span>
            <select
              value={filterBoard}
              onChange={(e) => {
                const newBoard = e.target.value;
                setFilterBoard(newBoard);
                if (newBoard === "general" && (filterClass === "dakhil" || filterClass === "alim")) {
                  setFilterClass("all");
                } else if (newBoard === "madrasah" && (filterClass === "ssc" || filterClass === "hsc")) {
                  setFilterClass("all");
                }
              }}
              className="bg-white rounded-lg px-2 py-1 text-xs font-semibold text-ink border border-line/60 outline-none"
            >
              <option value="all">All Boards</option>
              <option value="general">General (School)</option>
              <option value="madrasah">Madrasah Board</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1 bg-paper/60 rounded-xl p-1 border border-line">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint px-1.5">
              Class:
            </span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-white rounded-lg px-2 py-1 text-xs font-semibold text-ink border border-line/60 outline-none"
            >
              <option value="all">All Classes</option>
              {filterBoard === "madrasah" ? (
                <>
                  <option value="dakhil">Dakhil</option>
                  <option value="alim">Alim</option>
                </>
              ) : filterBoard === "general" ? (
                <>
                  <option value="ssc">SSC</option>
                  <option value="hsc">HSC</option>
                </>
              ) : (
                <>
                  <option value="ssc">SSC</option>
                  <option value="hsc">HSC</option>
                  <option value="dakhil">Dakhil</option>
                  <option value="alim">Alim</option>
                </>
              )}
            </select>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 bg-paper/60 rounded-xl p-1 border border-line">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint px-1.5">
              Stream:
            </span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-white rounded-lg px-2 py-1 text-xs font-semibold text-ink border border-line/60 outline-none"
            >
              <option value="all">All Streams</option>
              <option value="science">Science</option>
              <option value="humanities">Humanities</option>
              <option value="business_studies">Commerce / Business</option>
              <option value="general_madrasah">General Madrasah</option>
              <option value="quran_hadith">Quran/Hadith Track</option>
            </select>
          </div>

          <span className="text-ink-faint text-[11px] font-semibold ml-auto">
            Showing {currentBooks.length} books
          </span>
        </div>
      </div>

      {/* Books, Chapters & Topics Accordion */}
      <div className="space-y-4">
        {currentBooks.length === 0 ? (
          <div className="card p-12 text-center text-xs text-ink-faint border-dashed">
            No master books found matching the active filters. Click{" "}
            <strong className="text-leaf">+ Add Master Book</strong> above to create a new book.
          </div>
        ) : (
          currentBooks.map((book) => {
            const isBookExpanded = Boolean(expandedBooks[book.id]);
            const isModuleBased = book.structureType === "module";

            return (
              <div
                key={book.id}
                className="card overflow-hidden border border-line bg-card shadow-xs transition"
              >
                {/* Book Header */}
                <div className="flex items-center justify-between gap-3 p-3.5 sm:px-5 bg-paper/60 border-b border-line/60">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleBookExpand(book.id)}
                      className="grid size-7 place-items-center rounded-lg border border-line bg-white text-ink-soft hover:text-leaf transition shrink-0"
                    >
                      {isBookExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          onClick={() => toggleBookExpand(book.id)}
                          className="font-display text-sm sm:text-base font-bold text-ink hover:text-leaf cursor-pointer truncate"
                        >
                          {book.name}
                        </h3>
                        {book.nameBn && (
                          <span className="font-bengali text-xs text-ink-faint">
                            ({book.nameBn})
                          </span>
                        )}

                        {/* Badges for board, class, group, and types */}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            book.board === "madrasah"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-sky-50 text-sky-800 border border-sky-200"
                          }`}
                        >
                          {book.board === "madrasah" ? "Madrasah" : "General"}
                        </span>

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                          {book.classLevel || "all"}
                        </span>

                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            book.subjectType === "compulsory"
                              ? "bg-leaf-soft text-leaf-deep font-bold"
                              : book.subjectType === "group_elective"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-purple-50 text-purple-800"
                          }`}
                        >
                          {book.subjectType || "compulsory"}
                        </span>

                        <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-faint border border-line">
                          {isModuleBased ? "Module-Based" : "Chapter-Based"}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-faint mt-0.5">
                        {book.lessons.length} {isModuleBased ? "modules/parts" : "chapters"} •{" "}
                        {book.lessons.reduce((acc, l) => acc + l.topics.length, 0)} total topics
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      title="Edit book details"
                      onClick={() => {
                        setEditingBook(book);
                        setEditBookName(book.name);
                        setEditBookNameBn(book.nameBn || "");
                        setEditBookBoard(book.board || "general");
                        setEditBookClassLevel(book.classLevel || "ssc");
                        setEditBookStreamGroup(book.streamGroup || "all");
                        setEditBookSubjectType(book.subjectType || "compulsory");
                        setEditBookStructureType(book.structureType || "chapter");
                      }}
                      className="grid size-7 place-items-center rounded-lg border border-line bg-white text-ink-faint hover:text-leaf transition"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      title="Delete master book"
                      onClick={() => handleDeleteBook(book.id)}
                      className="grid size-7 place-items-center rounded-lg border border-line bg-white text-ink-faint hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Book Body: Chapters & Topics */}
                {isBookExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Inline Add Chapter / Module Form */}
                    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper/40 p-2">
                      <FolderPlus className="size-4 text-leaf shrink-0 ml-1" />
                      <input
                        value={chapterInputs[book.id] ?? ""}
                        onChange={(e) =>
                          setChapterInputs((p) => ({
                            ...p,
                            [book.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleAddChapter(book.id)}
                        placeholder={
                          isModuleBased
                            ? `Add module/part (e.g. Part A: Grammar Skills or Unit 1)…`
                            : `Add new chapter (e.g. Chapter 1: Dynamics)…`
                        }
                        className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-ink-faint/60"
                      />
                      <button
                        onClick={() => handleAddChapter(book.id)}
                        disabled={pending || !chapterInputs[book.id]?.trim()}
                        className="shrink-0 rounded-lg bg-leaf px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                      >
                        {isModuleBased ? "+ Add Module / Part" : "+ Add Chapter"}
                      </button>
                    </div>

                    {/* Chapters List */}
                    {book.lessons.length === 0 ? (
                      <p className="text-center text-xs text-ink-faint py-3">
                        No {isModuleBased ? "modules" : "chapters"} added yet. Add your first above.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {book.lessons.map((chapter, chIdx) => {
                          const isChapterExpanded = Boolean(expandedChapters[chapter.id]);
                          const isEditingThisChapter = editingChapterId === chapter.id;

                          return (
                            <div
                              key={chapter.id}
                              className="rounded-xl border border-line/80 bg-white shadow-2xs overflow-hidden"
                            >
                              {/* Chapter Bar */}
                              <div className="flex items-center justify-between gap-3 p-3 bg-paper/30 border-b border-line/40">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <button
                                    onClick={() => toggleChapterExpand(chapter.id)}
                                    className="grid size-6 place-items-center rounded text-ink-soft hover:text-leaf transition shrink-0"
                                  >
                                    {isChapterExpanded ? (
                                      <ChevronDown className="size-3.5" />
                                    ) : (
                                      <ChevronRight className="size-3.5" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    {isEditingThisChapter ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          autoFocus
                                          value={editChapterName}
                                          onChange={(e) => setEditChapterName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") handleUpdateChapter(chapter.id);
                                            if (e.key === "Escape") setEditingChapterId(null);
                                          }}
                                          className="min-w-0 flex-1 rounded border border-leaf px-2 py-0.5 text-xs"
                                        />
                                        <button
                                          onClick={() => handleUpdateChapter(chapter.id)}
                                          className="grid size-6 place-items-center rounded bg-leaf text-white"
                                        >
                                          <Check className="size-3" />
                                        </button>
                                        <button
                                          onClick={() => setEditingChapterId(null)}
                                          className="grid size-6 place-items-center rounded bg-slate-200 text-slate-600"
                                        >
                                          <X className="size-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {!isModuleBased && (
                                          <span className="text-[10px] font-bold text-leaf uppercase">
                                            CH{chIdx + 1}
                                          </span>
                                        )}
                                        <span
                                          onClick={() => toggleChapterExpand(chapter.id)}
                                          className="text-xs font-bold text-ink cursor-pointer hover:text-leaf truncate"
                                        >
                                          {chapter.name}
                                        </span>
                                        <span className="text-[10.5px] text-ink-faint">
                                          ({chapter.topics.length} topics)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {!isEditingThisChapter && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      title="Rename item"
                                      onClick={() => {
                                        setEditingChapterId(chapter.id);
                                        setEditChapterName(chapter.name);
                                      }}
                                      className="grid size-6 place-items-center rounded text-ink-faint hover:text-leaf transition"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                    <button
                                      title="Delete item"
                                      onClick={() => handleDeleteChapter(chapter.id)}
                                      className="grid size-6 place-items-center rounded text-ink-faint hover:text-rose-600 transition"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Chapter Body: Topic List & Add Topic */}
                              {isChapterExpanded && (
                                <div className="p-3 space-y-2.5">
                                  {/* Quick Add Topic */}
                                  <div className="flex items-center gap-2 rounded-lg border border-line bg-paper/20 p-1.5">
                                    <Plus className="size-3.5 text-leaf shrink-0 ml-1" />
                                    <input
                                      value={topicInputs[chapter.id] ?? ""}
                                      onChange={(e) =>
                                        setTopicInputs((p) => ({
                                          ...p,
                                          [chapter.id]: e.target.value,
                                        }))
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddTopic(book.id, chapter.id)
                                      }
                                      placeholder={`Add topic or practice item…`}
                                      className="min-w-0 flex-1 bg-transparent px-1 text-[11.5px] outline-none placeholder:text-ink-faint/60"
                                    />
                                    <button
                                      onClick={() => handleAddTopic(book.id, chapter.id)}
                                      disabled={pending || !topicInputs[chapter.id]?.trim()}
                                      className="shrink-0 rounded bg-leaf px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                                    >
                                      Add Topic
                                    </button>
                                  </div>

                                  {/* Topics list */}
                                  {chapter.topics.length === 0 ? (
                                    <p className="text-center text-[11px] text-ink-faint py-1.5">
                                      No topics under this item yet.
                                    </p>
                                  ) : (
                                    <ul className="space-y-1.5">
                                      {chapter.topics.map((topic, tIdx) => {
                                        const isEditingThisTopic = editingTopicId === topic.id;

                                        return (
                                          <li
                                            key={topic.id}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-paper/20 px-2.5 py-1.5 text-xs hover:bg-paper/40 transition"
                                          >
                                            {isEditingThisTopic ? (
                                              <div className="flex items-center gap-2 flex-1">
                                                <input
                                                  autoFocus
                                                  value={editTopicName}
                                                  onChange={(e) => setEditTopicName(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdateTopic(topic.id);
                                                    if (e.key === "Escape") setEditingTopicId(null);
                                                  }}
                                                  className="min-w-0 flex-1 rounded border border-leaf px-2 py-0.5 text-xs"
                                                />
                                                <button
                                                  onClick={() => handleUpdateTopic(topic.id)}
                                                  className="grid size-6 place-items-center rounded bg-leaf text-white"
                                                >
                                                  <Check className="size-3" />
                                                </button>
                                                <button
                                                  onClick={() => setEditingTopicId(null)}
                                                  className="grid size-6 place-items-center rounded bg-slate-200 text-slate-600"
                                                >
                                                  <X className="size-3" />
                                                </button>
                                              </div>
                                            ) : (
                                              <>
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <span className="text-[10px] font-bold text-ink-faint tabular-nums">
                                                    {tIdx + 1}.
                                                  </span>
                                                  <span className="font-medium text-ink truncate">
                                                    {topic.name}
                                                  </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                  <button
                                                    title="Rename topic"
                                                    onClick={() => {
                                                      setEditingTopicId(topic.id);
                                                      setEditTopicName(topic.name);
                                                    }}
                                                    className="grid size-5 place-items-center rounded text-ink-faint hover:text-leaf transition"
                                                  >
                                                    <Pencil className="size-2.5" />
                                                  </button>
                                                  <button
                                                    title="Delete topic"
                                                    onClick={() => handleDeleteTopic(topic.id)}
                                                    className="grid size-5 place-items-center rounded text-ink-faint hover:text-rose-600 transition"
                                                  >
                                                    <Trash2 className="size-2.5" />
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Master Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-lg p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <BookPlus className="size-4.5 text-leaf" />
                <span>Add Master Book ({currentBatch?.name})</span>
              </h3>
              <button
                onClick={() => setShowAddBook(false)}
                className="grid size-7 place-items-center rounded-lg text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Book Name (English / Primary) *
                </label>
                <input
                  autoFocus
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="e.g. Physics, Higher Math, Bangla 2nd Paper"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Bangla / Arabic Name (Optional)
                </label>
                <input
                  value={bookNameBn}
                  onChange={(e) => setBookNameBn(e.target.value)}
                  placeholder="e.g. পদার্থবিজ্ঞান, উচ্চতর গণিত"
                  className="w-full font-bengali rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Education Board
                </label>
                <select
                  value={bookBoard}
                  onChange={(e) => {
                    const b = e.target.value;
                    setBookBoard(b);
                    if (b === "madrasah" && (bookClassLevel === "ssc" || bookClassLevel === "hsc")) {
                      setBookClassLevel("dakhil");
                    } else if (b === "general" && (bookClassLevel === "dakhil" || bookClassLevel === "alim")) {
                      setBookClassLevel("ssc");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="general">General Education (School)</option>
                  <option value="madrasah">Madrasah Board</option>
                  <option value="both">Both Boards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Class / Level
                </label>
                <select
                  value={bookClassLevel}
                  onChange={(e) => setBookClassLevel(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  {bookBoard === "madrasah" ? (
                    <>
                      <option value="dakhil">Dakhil</option>
                      <option value="alim">Alim</option>
                    </>
                  ) : bookBoard === "general" ? (
                    <>
                      <option value="ssc">SSC</option>
                      <option value="hsc">HSC</option>
                    </>
                  ) : (
                    <>
                      <option value="ssc">SSC</option>
                      <option value="hsc">HSC</option>
                      <option value="dakhil">Dakhil</option>
                      <option value="alim">Alim</option>
                      <option value="all">All Classes</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Stream / Group
                </label>
                <select
                  value={bookStreamGroup}
                  onChange={(e) => setBookStreamGroup(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="all">All Groups / Universal</option>
                  <option value="science">Science</option>
                  <option value="humanities">Humanities</option>
                  <option value="business_studies">Business Studies / Commerce</option>
                  <option value="general_madrasah">General Madrasah</option>
                  <option value="quran_hadith">Quran/Hadith Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Subject Category
                </label>
                <select
                  value={bookSubjectType}
                  onChange={(e) => setBookSubjectType(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="compulsory">Compulsory (আবশ্যিক)</option>
                  <option value="group_elective">Group Elective (নৈর্বাচনিক)</option>
                  <option value="optional">Optional / 4th (ঐচ্ছিক / ৪র্থ)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Structure Type
                </label>
                <select
                  value={bookStructureType}
                  onChange={(e) => setBookStructureType(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="chapter">Chapter-Based (অধ্যায় ১, অধ্যায় ২...)</option>
                  <option value="module">Skills / Module-Based (Part A: Grammar, Part B: Writing...)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                onClick={() => setShowAddBook(false)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBook}
                disabled={pending || !bookName.trim()}
                className="rounded-xl bg-leaf px-4.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                {pending ? "Adding…" : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-lg p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <Pencil className="size-4 text-leaf" />
                <span>Edit Master Book</span>
              </h3>
              <button
                onClick={() => setEditingBook(null)}
                className="grid size-7 place-items-center rounded-lg text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Book Name *
                </label>
                <input
                  autoFocus
                  value={editBookName}
                  onChange={(e) => setEditBookName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Bangla / Arabic Name
                </label>
                <input
                  value={editBookNameBn}
                  onChange={(e) => setEditBookNameBn(e.target.value)}
                  className="w-full font-bengali rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Education Board
                </label>
                <select
                  value={editBookBoard}
                  onChange={(e) => {
                    const b = e.target.value;
                    setEditBookBoard(b);
                    if (b === "madrasah" && (editBookClassLevel === "ssc" || editBookClassLevel === "hsc")) {
                      setEditBookClassLevel("dakhil");
                    } else if (b === "general" && (editBookClassLevel === "dakhil" || editBookClassLevel === "alim")) {
                      setEditBookClassLevel("ssc");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="general">General Education (School)</option>
                  <option value="madrasah">Madrasah Board</option>
                  <option value="both">Both Boards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Class / Level
                </label>
                <select
                  value={editBookClassLevel}
                  onChange={(e) => setEditBookClassLevel(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  {editBookBoard === "madrasah" ? (
                    <>
                      <option value="dakhil">Dakhil</option>
                      <option value="alim">Alim</option>
                    </>
                  ) : editBookBoard === "general" ? (
                    <>
                      <option value="ssc">SSC</option>
                      <option value="hsc">HSC</option>
                    </>
                  ) : (
                    <>
                      <option value="ssc">SSC</option>
                      <option value="hsc">HSC</option>
                      <option value="dakhil">Dakhil</option>
                      <option value="alim">Alim</option>
                      <option value="all">All Classes</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Stream / Group
                </label>
                <select
                  value={editBookStreamGroup}
                  onChange={(e) => setEditBookStreamGroup(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="all">All Groups / Universal</option>
                  <option value="science">Science</option>
                  <option value="humanities">Humanities</option>
                  <option value="business_studies">Business Studies / Commerce</option>
                  <option value="general_madrasah">General Madrasah</option>
                  <option value="quran_hadith">Quran/Hadith Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Subject Category
                </label>
                <select
                  value={editBookSubjectType}
                  onChange={(e) => setEditBookSubjectType(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="compulsory">Compulsory (আবশ্যিক)</option>
                  <option value="group_elective">Group Elective (নৈর্বাচনিক)</option>
                  <option value="optional">Optional / 4th (ঐচ্ছিক / ৪র্থ)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Structure Type
                </label>
                <select
                  value={editBookStructureType}
                  onChange={(e) => setEditBookStructureType(e.target.value as any)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                >
                  <option value="chapter">Chapter-Based (অধ্যায় ১, অধ্যায় ২...)</option>
                  <option value="module">Skills / Module-Based (Part A: Grammar, Part B: Writing...)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-line">
              <button
                onClick={() => setEditingBook(null)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBook}
                disabled={pending || !editBookName.trim()}
                className="rounded-xl bg-leaf px-4.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class / Batch Modal */}
      {showEditBatchModal && currentBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <GraduationCap className="size-4.5 text-leaf" />
                <span>Edit Class / Batch</span>
              </h3>
              <button
                onClick={() => setShowEditBatchModal(false)}
                className="grid size-7 place-items-center rounded-lg text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Batch Name
                </label>
                <input
                  autoFocus
                  value={editBatchName}
                  onChange={(e) => setEditBatchName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editBatchDesc}
                  onChange={(e) => setEditBatchDesc(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowEditBatchModal(false)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBatch}
                disabled={pending || !editBatchName.trim()}
                className="rounded-xl bg-leaf px-4.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
