"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FolderPlus,
  ListPlus,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import {
  addLessonAction,
  addTopicAction,
  bulkAddTopicsAction,
  deleteLessonAction,
  deleteTopicAction,
  moveTopicAction,
  renameLessonAction,
  renameTopicAction,
  setTopicStatusAction,
  updateTopicNotesAction,
} from "@/actions";
import type { LessonDto, TopicDto } from "@/lib/queries";
import { STATUS_META, STATUSES, type StudyStatus } from "@/lib/constants";
import { ProgressBar, StatusIcon } from "@/components/ui";

type Filter = "all" | StudyStatus;

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  completed: "Completed",
  in_progress: "In Progress",
  not_started: "Not Started",
  not_completed: "Not Completed",
};

export default function LessonManager({
  subjectId,
  subjectName,
  lessons,
}: {
  subjectId: number;
  subjectName: string;
  lessons: LessonDto[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, startTransition] = useTransition();

  // New Lesson state
  const [newLessonName, setNewLessonName] = useState("");
  const [showAddLesson, setShowAddLesson] = useState(false);

  // Lesson accordion state (default collapsed: all closed initially)
  const [openLessons, setOpenLessons] = useState<Record<number, boolean>>({});

  // Rename lesson
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonName, setEditLessonName] = useState("");

  // Delete lesson confirmation
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<number | null>(null);

  // Topic Quick add per lesson: { [lessonId]: string }
  const [quickTopicInputs, setQuickTopicInputs] = useState<Record<number, string>>({});

  // Dedicated Add Topic modal state
  const [addTopicModalLessonId, setAddTopicModalLessonId] = useState<number | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicNotes, setNewTopicNotes] = useState("");

  // Topic bulk add modal
  const [bulkLessonId, setBulkLessonId] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState("");

  // Topic editing
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editTopicName, setEditTopicName] = useState("");

  // Topic note
  const [noteTopicId, setNoteTopicId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // Topic delete confirmation
  const [confirmDeleteTopicId, setConfirmDeleteTopicId] = useState<number | null>(null);

  // Status message
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => router.refresh();

  // Toggle lesson accordion
  const toggleLesson = (id: number) => {
    setOpenLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter topics inside each lesson
  const filteredLessons = useMemo(() => {
    return lessons.map((l) => {
      const filteredTopics = l.topics.filter(
        (t) => filter === "all" || t.status === filter
      );
      return {
        ...l,
        filteredTopics,
      };
    });
  }, [lessons, filter]);

  // Overall counts across all lessons
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0,
      completed: 0,
      in_progress: 0,
      not_started: 0,
      not_completed: 0,
    };
    for (const l of lessons) {
      for (const t of l.topics) {
        c.all++;
        c[t.status]++;
      }
    }
    return c;
  }, [lessons]);

  // Handlers for Lessons
  const handleAddLesson = () => {
    if (!newLessonName.trim()) return;
    startTransition(async () => {
      const res = await addLessonAction(subjectId, newLessonName.trim());
      if (res.ok) {
        const newId = (res as any).id || (res as any).lesson?.id;
        if (newId) {
          setOpenLessons((prev) => ({ ...prev, [newId]: true }));
        }
        setNewLessonName("");
        setShowAddLesson(false);
        setMsg("নতুন অধ্যায় সফলভাবে তৈরি হয়েছে! এবার এতে টপিক যুক্ত করুন। ✓");
        setTimeout(() => setMsg(null), 5000);
      } else {
        setMsg(res.error || "অধ্যায় তৈরি করতে সমস্যা হয়েছে");
      }
      refresh();
    });
  };

  const handleRenameLesson = (lessonId: number) => {
    if (!editLessonName.trim()) return;
    startTransition(async () => {
      await renameLessonAction(lessonId, editLessonName.trim());
      setEditingLessonId(null);
      refresh();
    });
  };

  const handleDeleteLesson = (lessonId: number) => {
    startTransition(async () => {
      await deleteLessonAction(lessonId);
      setConfirmDeleteLessonId(null);
      refresh();
    });
  };

  // Handlers for Topics
  const handleAddTopic = (lessonId: number) => {
    const val = quickTopicInputs[lessonId]?.trim();
    if (!val) return;
    startTransition(async () => {
      const res = await addTopicAction(subjectId, val, lessonId > 0 ? lessonId : null);
      if (res.ok) {
        setQuickTopicInputs((prev) => ({ ...prev, [lessonId]: "" }));
        setOpenLessons((prev) => ({ ...prev, [lessonId]: true }));
        setMsg("টপিক সফলভাবে যুক্ত হয়েছে! ✓");
        setTimeout(() => setMsg(null), 4000);
      } else {
        setMsg(res.error || "টপিক যুক্ত করতে সমস্যা হয়েছে");
      }
      refresh();
    });
  };

  const handleModalAddTopic = () => {
    if (!newTopicTitle.trim() || addTopicModalLessonId === null) return;
    const lessonId = addTopicModalLessonId;
    startTransition(async () => {
      const res = await addTopicAction(
        subjectId,
        newTopicTitle.trim(),
        lessonId > 0 ? lessonId : null,
        undefined,
        newTopicNotes.trim() || null
      );
      if (res.ok) {
        setOpenLessons((prev) => ({ ...prev, [lessonId]: true }));
        setAddTopicModalLessonId(null);
        setNewTopicTitle("");
        setNewTopicNotes("");
        setMsg("টপিক সফলভাবে যুক্ত হয়েছে! ✓");
        setTimeout(() => setMsg(null), 4000);
      } else {
        setMsg(res.error || "টপিক যুক্ত করতে সমস্যা হয়েছে");
      }
      refresh();
    });
  };

  const handleBulkAddTopics = (lessonId: number) => {
    if (!bulkText.trim()) return;
    startTransition(async () => {
      const res = await bulkAddTopicsAction(subjectId, bulkText, lessonId > 0 ? lessonId : null);
      if (res.ok) {
        const created = "created" in res ? res.created : 0;
        const skipped = "skipped" in res ? res.skipped : 0;
        setMsg(`Added ${created} topic(s)${skipped ? `, skipped ${skipped} duplicate(s)` : ""}. ✓`);
        setBulkText("");
        setBulkLessonId(null);
        if (lessonId > 0) {
          setOpenLessons((prev) => ({ ...prev, [lessonId]: true }));
        }
        setTimeout(() => setMsg(null), 5000);
      } else {
        setMsg(res.error || "Failed to import topics");
      }
      refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar + Add Lesson CTA */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${
                filter === f
                  ? "border-leaf bg-leaf text-white"
                  : "border-line bg-white text-ink-soft hover:border-leaf hover:text-leaf"
              }`}
            >
              {FILTER_LABELS[f]}
              <span
                className={`ml-1.5 tabular-nums ${
                  filter === f ? "text-white/80" : "text-ink-faint"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddLesson((v) => !v)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-leaf-deep shrink-0"
        >
          <FolderPlus className="size-4" />
          <span>+ Add Chapter / অধ্যায়</span>
        </button>
      </div>

      {/* Inline Add Chapter Form */}
      {showAddLesson && (
        <div className="card rise border-leaf/40 bg-leaf-soft/20 p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-bold text-ink">Add New Chapter (অধ্যায়)</span>
            <button onClick={() => setShowAddLesson(false)} className="text-ink-faint hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-leaf shrink-0 ml-1" />
            <input
              autoFocus
              value={newLessonName}
              onChange={(e) => setNewLessonName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLesson()}
              placeholder="e.g. Chapter 1: Grammar Basics / অধ্যায় ১: নাহু পরিচিতি"
              className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
            />
            <button
              onClick={handleAddLesson}
              disabled={pending || !newLessonName.trim()}
              className="shrink-0 rounded-xl bg-leaf px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
            >
              Create Chapter
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-[12.5px] font-medium text-leaf">{msg}</p>}

      {/* Bulk Add Topics Modal */}
      {bulkLessonId !== null && (
        <div className="card rise border-leaf/30 bg-leaf-soft/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold text-ink">
              Bulk Add Topics to:{" "}
              <span className="text-leaf">
                {lessons.find((l) => l.id === bulkLessonId)?.name || "Lesson"}
              </span>
            </p>
            <button onClick={() => setBulkLessonId(null)} className="text-ink-faint hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
          <p className="text-[12px] text-ink-soft mb-2">
            নিচে প্রতি লাইনে একটি করে টপিক লিখুন। চাইলে পাইপ <code className="font-mono bg-paper px-1 rounded">|</code> দিয়ে টপিকের নোট বা প্রশ্নও যুক্ত করতে পারেন (যেমন: <code className="font-mono bg-paper px-1 rounded">আয়াত ০১-০৩ | ১. শানে নুযুল ২. ব্যাখ্যা</code>):
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={`আয়াত: ০১-০৩ | ১. بين سبب نزول هذه الآيات\nআয়াত: ০৪-০৫ | ১. ব্যাখ্যা ও শিক্ষণীয় বিষয়\nTopic 3: Exam questions`}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
          />
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => handleBulkAddTopics(bulkLessonId)}
              disabled={pending || !bulkText.trim()}
              className="rounded-lg bg-leaf px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50 hover:bg-leaf-deep"
            >
              Import Topics
            </button>
            <button
              onClick={() => setBulkLessonId(null)}
              className="rounded-lg bg-paper-deep border border-line px-3.5 py-2 text-[12px] font-semibold text-ink-soft hover:bg-line"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lesson List */}
      <div className="space-y-4">
        {filteredLessons.map((lesson, lessonIndex) => {
          const isOpen = Boolean(openLessons[lesson.id]);
          const isEditing = editingLessonId === lesson.id;
          const isOrphan = lesson.id === 0;

          return (
            <div
              key={lesson.id}
              className="card overflow-hidden border border-line shadow-xs transition duration-150"
            >
              {/* Lesson Header */}
              <div
                className={`flex items-center justify-between gap-2.5 bg-paper/80 p-3 sm:px-4 transition ${
                  isOpen ? "border-b border-line/60" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleLesson(lesson.id)}
                    className="grid size-7 place-items-center rounded-lg border border-line bg-white text-ink-soft hover:text-leaf transition shrink-0"
                    title={isOpen ? "Collapse lesson" : "Expand lesson"}
                  >
                    {isOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editLessonName}
                          onChange={(e) => setEditLessonName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameLesson(lesson.id);
                            if (e.key === "Escape") setEditingLessonId(null);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-leaf bg-white px-2.5 py-1 text-[13.5px]"
                        />
                        <button
                          onClick={() => handleRenameLesson(lesson.id)}
                          className="grid size-7 place-items-center rounded-lg bg-leaf text-white shrink-0"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingLessonId(null)}
                          className="grid size-7 place-items-center rounded-lg bg-paper-deep border border-line text-ink-soft shrink-0"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => toggleLesson(lesson.id)}
                        className="flex flex-col sm:flex-row sm:items-center sm:gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-leaf shrink-0">
                            CH{lessonIndex + 1}
                          </span>
                          <h3
                            className="font-display text-[14.5px] font-bold text-ink hover:text-leaf truncate"
                          >
                            {lesson.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-faint">
                          <span>
                            {lesson.completedTopics}/{lesson.totalTopics} completed
                          </span>
                          <div className="w-16 sm:w-20">
                            <ProgressBar value={lesson.progress} />
                          </div>
                          <span className="tabular-nums font-semibold">
                            {Math.round(lesson.progress * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lesson Actions */}
                {!isOrphan && !isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      title="Add topic with questions & notes"
                      onClick={() => {
                        setAddTopicModalLessonId(lesson.id);
                        setNewTopicTitle("");
                        setNewTopicNotes("");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-leaf/30 bg-leaf-soft/70 px-2 py-1 text-[11.5px] font-semibold text-leaf hover:bg-leaf hover:text-white transition"
                    >
                      <Plus className="size-3.5" /> Topic
                    </button>
                    <button
                      title="Bulk add topics to this lesson"
                      onClick={() => {
                        setBulkLessonId(lesson.id);
                        setBulkText("");
                      }}
                      className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-[11.5px] font-semibold text-ink-soft hover:border-leaf hover:text-leaf transition"
                    >
                      <ListPlus className="size-3.5" /> Bulk
                    </button>
                    <button
                      title="Rename lesson"
                      onClick={() => {
                        setEditingLessonId(lesson.id);
                        setEditLessonName(lesson.name);
                      }}
                      className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-white hover:text-leaf transition"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    {confirmDeleteLessonId === lesson.id ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                        <span>Delete?</span>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="rounded-md bg-rose-600 px-2 py-0.5 text-white text-[11px]"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteLessonId(null)}
                          className="rounded-md bg-paper-deep border border-line px-2 py-0.5 text-ink-soft text-[11px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        title="Delete lesson"
                        onClick={() => setConfirmDeleteLessonId(lesson.id)}
                        className="grid size-7 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Lesson Body: Topics List + Add Topic */}
              {isOpen && (
                <div className="p-3 sm:p-4 space-y-3">
                  {/* Action bar inside lesson: Quick Add + Full Topic with Notes button */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-line bg-paper/60 p-2 sm:p-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Plus className="ml-1 size-4 text-leaf shrink-0" />
                      <input
                        value={quickTopicInputs[lesson.id] ?? ""}
                        onChange={(e) =>
                          setQuickTopicInputs((prev) => ({
                            ...prev,
                            [lesson.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleAddTopic(lesson.id)}
                        placeholder={`Add quick topic title to ${lesson.name}…`}
                        className="min-w-0 flex-1 bg-white rounded-lg border border-line/80 px-2.5 py-1.5 text-[12.5px] outline-none focus:border-leaf placeholder:text-ink-faint/60"
                      />
                      <button
                        onClick={() => handleAddTopic(lesson.id)}
                        disabled={pending || !quickTopicInputs[lesson.id]?.trim()}
                        className="shrink-0 rounded-lg bg-leaf px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                      >
                        Add Topic
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 justify-end pt-1 sm:pt-0 border-t border-line/50 sm:border-0">
                      <button
                        onClick={() => {
                          setAddTopicModalLessonId(lesson.id);
                          setNewTopicTitle("");
                          setNewTopicNotes("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-leaf px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs transition hover:bg-leaf-deep"
                      >
                        <BookOpen className="size-3.5" /> + Topic with Notes (নোটসহ)
                      </button>
                    </div>
                  </div>

                  {/* Topics in this lesson */}
                  {lesson.filteredTopics.length > 0 ? (
                    <ul className="space-y-2">
                      {lesson.filteredTopics.map((t, idx) => {
                        const isEditingTopic = editingTopicId === t.id;

                        return (
                          <li
                            key={t.id}
                            className="rounded-xl border border-line/70 bg-white p-2.5 sm:py-2.5 sm:px-3.5 transition hover:border-line"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="hidden w-5 text-right text-[11px] font-semibold tabular-nums text-ink-faint sm:block pt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="pt-0.5">
                                  <StatusIcon status={t.status} className="size-4 shrink-0" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  {isEditingTopic ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        autoFocus
                                        value={editTopicName}
                                        onChange={(e) => setEditTopicName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            startTransition(async () => {
                                              await renameTopicAction(t.id, editTopicName);
                                              setEditingTopicId(null);
                                              refresh();
                                            });
                                          }
                                          if (e.key === "Escape") setEditingTopicId(null);
                                        }}
                                        className="min-w-0 flex-1 rounded-lg border border-leaf bg-white px-2 py-1 text-[13px]"
                                      />
                                      <button
                                        onClick={() =>
                                          startTransition(async () => {
                                            await renameTopicAction(t.id, editTopicName);
                                            setEditingTopicId(null);
                                            refresh();
                                          })
                                        }
                                        className="grid size-7 place-items-center rounded-lg bg-leaf text-white shrink-0"
                                      >
                                        <Check className="size-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingTopicId(null)}
                                        className="grid size-7 place-items-center rounded-lg bg-paper-deep border border-line text-ink-soft shrink-0"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <p
                                        className={`text-[13.5px] font-semibold leading-snug break-words ${
                                          t.status === "completed"
                                            ? "text-ink-soft opacity-75 line-through decoration-line"
                                            : "text-ink"
                                        }`}
                                      >
                                        {t.name}
                                      </p>
                                      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-faint">
                                        {t.completedAt ? (
                                          <span>completed {t.completedAt}</span>
                                        ) : (
                                          <span>updated {t.updatedAt.slice(0, 10)}</span>
                                        )}
                                        {t.notes && (
                                          <span className="block w-full mt-1.5 whitespace-pre-line text-[12px] text-ink-soft not-italic border-t border-line/60 pt-1" dir="auto">
                                            {t.notes}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                <select
                                  value={t.status}
                                  onChange={(e) =>
                                    startTransition(async () => {
                                      await setTopicStatusAction(t.id, e.target.value);
                                      refresh();
                                    })
                                  }
                                  className={`rounded-lg border-0 px-2 py-1 text-[11px] font-bold ring-1 transition ${
                                    STATUS_META[t.status].bg
                                  } ${STATUS_META[t.status].text} ${
                                    STATUS_META[t.status].ring
                                  }`}
                                >
                                  {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {STATUS_META[s].label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Topic Actions */}
                            <div className="mt-2 pt-1.5 border-t border-line/40 flex items-center justify-between sm:border-0 sm:pt-0 sm:mt-1 sm:justify-end sm:gap-1">
                              <div className="flex items-center gap-1">
                                <button
                                  title="Rename topic"
                                  onClick={() => {
                                    setEditingTopicId(t.id);
                                    setEditTopicName(t.name);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-faint hover:bg-paper hover:text-leaf transition"
                                >
                                  <Pencil className="size-3" /> Edit
                                </button>
                                <button
                                  title="Add/Edit note"
                                  onClick={() => {
                                    setNoteTopicId(noteTopicId === t.id ? null : t.id);
                                    setNoteText(t.notes ?? "");
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-faint hover:bg-paper hover:text-amber-600 transition"
                                >
                                  <StickyNote className="size-3" /> Note
                                </button>
                                <button
                                  title="Move up"
                                  onClick={() =>
                                    startTransition(async () => {
                                      await moveTopicAction(t.id, "up");
                                      refresh();
                                    })
                                  }
                                  className="grid size-5 place-items-center rounded text-ink-faint hover:bg-paper"
                                >
                                  <ChevronUp className="size-3" />
                                </button>
                                <button
                                  title="Move down"
                                  onClick={() =>
                                    startTransition(async () => {
                                      await moveTopicAction(t.id, "down");
                                      refresh();
                                    })
                                  }
                                  className="grid size-5 place-items-center rounded text-ink-faint hover:bg-paper"
                                >
                                  <ChevronDown className="size-3" />
                                </button>
                              </div>

                              <div>
                                {confirmDeleteTopicId === t.id ? (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                    Sure?
                                    <button
                                      onClick={() =>
                                        startTransition(async () => {
                                          await deleteTopicAction(t.id);
                                          refresh();
                                        })
                                      }
                                      className="rounded bg-rose-600 px-1.5 py-0.5 text-white text-[10.5px]"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteTopicId(null)}
                                      className="rounded bg-paper-deep border border-line px-1.5 py-0.5 text-ink-soft text-[10.5px]"
                                    >
                                      No
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    title="Delete topic"
                                    onClick={() => setConfirmDeleteTopicId(t.id)}
                                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-faint hover:bg-rose-50 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="size-3" /> Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Topic Note Editor */}
                            {noteTopicId === t.id && (
                              <div className="mt-2.5 rounded-xl border border-line bg-paper/90 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11.5px] font-bold text-ink">প্রশ্নসমূহ ও বিবরণ সম্পাদনা করুন (Edit Notes):</span>
                                  <button onClick={() => setNoteTopicId(null)} className="text-ink-faint hover:text-ink">
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  autoFocus
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  rows={4}
                                  placeholder="টপিকের বিস্তারিত নোট ও সম্ভাব্য প্রশ্নসমূহ লিখুন..."
                                  className="w-full rounded-lg border border-line bg-white p-2.5 text-[12.5px] leading-relaxed outline-none focus:border-leaf"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() =>
                                      startTransition(async () => {
                                        await updateTopicNotesAction(t.id, noteText);
                                        setNoteTopicId(null);
                                        setMsg("নোট আপডেট করা হয়েছে! ✓");
                                        setTimeout(() => setMsg(null), 3000);
                                        refresh();
                                      })
                                    }
                                    className="rounded-lg bg-leaf px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-leaf-deep transition"
                                  >
                                    Save Notes
                                  </button>
                                  <button
                                    onClick={() => setNoteTopicId(null)}
                                    className="rounded-lg bg-paper-deep border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-line transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-line/80 p-5 text-center space-y-2">
                      <p className="text-[12.5px] text-ink-faint">
                        {lesson.topics.length === 0
                          ? "এই অধ্যায়ে এখনও কোনো টপিক যুক্ত করা হয়নি।"
                          : "No topics match the selected filter."}
                      </p>
                      {lesson.topics.length === 0 && (
                        <button
                          onClick={() => {
                            setAddTopicModalLessonId(lesson.id);
                            setNewTopicTitle("");
                            setNewTopicNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs transition hover:bg-leaf-deep"
                        >
                          <Plus className="size-3.5" /> প্রথম টপিক যুক্ত করুন
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="card border-dashed p-10 text-center text-[13.5px] text-ink-faint">
            No chapters created yet for this subject. Click{" "}
            <span className="font-semibold text-leaf">&quot;+ Add Chapter&quot;</span> above to create your first chapter!
          </div>
        )}
      </div>

      {/* Add Topic with Notes Modal */}
      {addTopicModalLessonId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card w-full max-w-lg p-5 sm:p-6 shadow-xl rise border-leaf/30 bg-white space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-[16.5px] font-bold text-ink">
                  নতুন টপিক যুক্ত করুন (Add Topic)
                </h3>
                <p className="text-[12px] text-ink-faint mt-0.5">
                  অধ্যায়: <span className="font-semibold text-leaf">{lessons.find((l) => l.id === addTopicModalLessonId)?.name || "অধ্যায়"}</span>
                </p>
              </div>
              <button
                onClick={() => setAddTopicModalLessonId(null)}
                className="text-ink-faint hover:text-ink transition p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1">
                  টপিক বা আয়াত শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleModalAddTopic()}
                  placeholder="e.g. আয়াত: ০১-০৩ অথবা পাঠ ১: নাহু পরিচিতি"
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-leaf focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink mb-1">
                  সম্ভাব্য প্রশ্নসমূহ ও বিস্তারিত নোট (Questions & Study Notes) <span className="text-ink-faint font-normal">(ঐচ্ছিক)</span>
                </label>
                <textarea
                  value={newTopicNotes}
                  onChange={(e) => setNewTopicNotes(e.target.value)}
                  rows={5}
                  placeholder={`যেভাবে সিলেবাসে প্রশ্ন ও নোট সাজানো রয়েছে, সেভাবে লিখুন... যেমন:\n১. بين سبب نزول هذه الآيات الكريمة-\n২. ما المراد بقوله تعالى "اتقوا ربكم"؟\n৩. এই পাঠের মূল শিক্ষণীয় বিষয়সমূহ...`}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[12.5px] leading-relaxed outline-none focus:border-leaf focus:bg-white transition"
                />
                <p className="text-[11px] text-ink-faint mt-1">
                  টিপস: প্রতিটি প্রশ্ন বা পয়েন্ট নতুন লাইনে লিখুন। এটি টপিকের নিচে সুন্দরভাবে প্রদর্শিত হবে।
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-line/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAddTopicModalLessonId(null)}
                className="rounded-xl border border-line bg-paper-deep px-4 py-2 text-[12px] font-semibold text-ink-soft hover:bg-line transition"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                disabled={pending || !newTopicTitle.trim()}
                onClick={handleModalAddTopic}
                className="rounded-xl bg-leaf px-5 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-leaf-deep disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {pending ? "সংরক্ষণ হচ্ছে..." : "টপিক সংরক্ষণ করুন (Save Topic)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
