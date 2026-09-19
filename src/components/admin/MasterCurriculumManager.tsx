"use client";

import { useState, useTransition } from "react";
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
  HelpCircle,
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

  // Expanded book IDs: Record<subjectId, boolean>
  const [expandedBooks, setExpandedBooks] = useState<Record<number, boolean>>({});

  // Expanded chapter IDs: Record<chapterId, boolean>
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  // Add Book Modal
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookName, setBookName] = useState("");
  const [bookNameBn, setBookNameBn] = useState("");

  // Edit Book Modal
  const [editingBook, setEditingBook] = useState<SubjectItem | null>(null);
  const [editBookName, setEditBookName] = useState("");
  const [editBookNameBn, setEditBookNameBn] = useState("");

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

  // Filter books for this batch (or general master)
  const currentBooks = initialCurriculum.filter(
    (s) => s.batchId === selectedBatchId || s.batchId === null
  );

  // ── Book Handlers ──
  const handleCreateBook = () => {
    if (!bookName.trim()) return;
    startTransition(async () => {
      const res = await createMasterSubjectAction({
        batchId: selectedBatchId,
        name: bookName.trim(),
        nameBn: bookNameBn.trim() || undefined,
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
    if (!confirm("Delete this chapter and its topics from the master template?")) return;
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
    if (!confirm("Delete this topic from the master template?")) return;
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
            Master Curriculum Template (Default for New Students)
          </p>
          <p className="text-sky-800 leading-relaxed">
            All subjects, chapters, and topics managed here serve as the official curriculum template.
            When newly registered students in this class set up their syllabus, they can select and clone
            these books into their personal dashboards.
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {msg}
        </div>
      )}

      {/* Top Class/Grade Control Bar */}
      <div className="card p-4 sm:p-5 border border-line bg-card shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-leaf-soft text-leaf">
            <Layers className="size-5" />
          </div>
          <div>
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
              Active Class / Grade
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="font-display text-base font-bold text-ink bg-transparent cursor-pointer outline-none border-b border-line pb-0.5 hover:border-leaf"
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
            onClick={() => setShowAddBook(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-leaf-deep shrink-0"
          >
            <BookPlus className="size-4" />
            <span>+ Add Master Book</span>
          </button>
        </div>
      </div>

      {/* Books, Chapters & Topics Accordion */}
      <div className="space-y-4">
        {currentBooks.length === 0 ? (
          <div className="card p-12 text-center text-xs text-ink-faint border-dashed">
            No default books mapped to this class yet. Click{" "}
            <strong className="text-leaf">+ Add Master Book</strong> above to create your first book.
          </div>
        ) : (
          currentBooks.map((book) => {
            const isBookExpanded = Boolean(expandedBooks[book.id]);

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
                      </div>
                      <p className="text-[11px] text-ink-faint">
                        {book.lessons.length} chapter{book.lessons.length === 1 ? "" : "s"} •{" "}
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
                    {/* Inline Add Chapter Form */}
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
                        placeholder={`Add new chapter to ${book.name}…`}
                        className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-ink-faint/60"
                      />
                      <button
                        onClick={() => handleAddChapter(book.id)}
                        disabled={pending || !chapterInputs[book.id]?.trim()}
                        className="shrink-0 rounded-lg bg-leaf px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                      >
                        Add Chapter
                      </button>
                    </div>

                    {/* Chapters List */}
                    {book.lessons.length === 0 ? (
                      <p className="text-center text-xs text-ink-faint py-3">
                        No chapters added yet. Add your first chapter above.
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
                                        <span className="text-[10px] font-bold text-leaf uppercase">
                                          CH{chIdx + 1}
                                        </span>
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
                                      title="Rename chapter"
                                      onClick={() => {
                                        setEditingChapterId(chapter.id);
                                        setEditChapterName(chapter.name);
                                      }}
                                      className="grid size-6 place-items-center rounded text-ink-faint hover:text-leaf transition"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                    <button
                                      title="Delete chapter"
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
                                      placeholder={`Add topic to ${chapter.name}…`}
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
                                      No topics under this chapter yet.
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
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Book Name (English / Primary)
                </label>
                <input
                  autoFocus
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="e.g. Arabic 1st Paper, General Math"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Bangla / Arabic Name (Optional)
                </label>
                <input
                  value={bookNameBn}
                  onChange={(e) => setBookNameBn(e.target.value)}
                  placeholder="e.g. আরবি ১ম পত্র, সাধারণ গণিত"
                  className="w-full font-bengali rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
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
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
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

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Book Name
                </label>
                <input
                  autoFocus
                  value={editBookName}
                  onChange={(e) => setEditBookName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  Bangla / Arabic Name
                </label>
                <input
                  value={editBookNameBn}
                  onChange={(e) => setEditBookNameBn(e.target.value)}
                  className="w-full font-bengali rounded-xl border border-line bg-white px-3 py-2 text-xs outline-none focus:border-leaf"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
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
                <Pencil className="size-4 text-leaf" />
                <span>Edit Class / Grade</span>
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
                  Class / Grade Name (e.g. Alim 2027, Dakhil 2027)
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
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
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
                {pending ? "Saving…" : "Update Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
