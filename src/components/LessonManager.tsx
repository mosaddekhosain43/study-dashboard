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

  // Lesson accordion state (default open all)
  const [openLessons, setOpenLessons] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (const l of lessons) init[l.id] = true;
    return init;
  });

  // Rename lesson
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonName, setEditLessonName] = useState("");

  // Delete lesson confirmation
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<number | null>(null);

  // Topic Quick add per lesson: { [lessonId]: string }
  const [quickTopicInputs, setQuickTopicInputs] = useState<Record<number, string>>({});

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
        setNewLessonName("");
        setShowAddLesson(false);
      } else {
        setMsg(res.error || "Failed to add lesson");
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
        setMsg(`Added ${created} topic(s)${skipped ? `, skipped ${skipped} duplicate(s)` : ""}.`);
        setBulkText("");
        setBulkLessonId(null);
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
          <span>+ Add Lesson / অধ্যায়</span>
        </button>
      </div>

      {/* Inline Add Lesson Form */}
      {showAddLesson && (
        <div className="card rise border-leaf/40 bg-leaf-soft/20 p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-bold text-ink">Add New Lesson (অধ্যায়)</span>
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
              placeholder="e.g. Lesson 1: Grammar Basics / অধ্যায় ১: নাহু পরিচিতি"
              className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
            />
            <button
              onClick={handleAddLesson}
              disabled={pending || !newLessonName.trim()}
              className="shrink-0 rounded-xl bg-leaf px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
            >
              Create Lesson
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
            Paste topics below, one topic per line:
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={"Topic 1: Overview\nTopic 2: Deep Dive\nTopic 3: Exam questions…"}
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
              className="rounded-lg bg-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lesson List */}
      <div className="space-y-4">
        {filteredLessons.map((lesson, lessonIndex) => {
          const isOpen = openLessons[lesson.id] ?? true;
          const isEditing = editingLessonId === lesson.id;
          const isOrphan = lesson.id === 0;

          return (
            <div
              key={lesson.id}
              className="card overflow-hidden border border-line shadow-xs transition duration-150"
            >
              {/* Lesson Header */}
              <div className="flex items-center justify-between gap-2.5 bg-paper/80 p-3 sm:px-4 border-b border-line/60">
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
                          className="grid size-7 place-items-center rounded-lg bg-slate-200 text-slate-600 shrink-0"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-leaf shrink-0">
                            L{lessonIndex + 1}
                          </span>
                          <h3
                            onClick={() => toggleLesson(lesson.id)}
                            className="font-display text-[14.5px] font-bold text-ink cursor-pointer hover:text-leaf truncate"
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
                  <div className="flex items-center gap-1 shrink-0">
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
                          className="rounded-md bg-slate-200 px-2 py-0.5 text-slate-600 text-[11px]"
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

              {/* Lesson Body: Topics List + Quick Add Topic */}
              {isOpen && (
                <div className="p-3 sm:p-4 space-y-3">
                  {/* Inline quick add topic for this lesson */}
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-paper/50 p-1.5 sm:p-2">
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
                      placeholder={`Add topic to ${lesson.name}…`}
                      className="min-w-0 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-ink-faint/60"
                    />
                    <button
                      onClick={() => handleAddTopic(lesson.id)}
                      disabled={pending || !quickTopicInputs[lesson.id]?.trim()}
                      className="shrink-0 rounded-lg bg-leaf px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                    >
                      Add Topic
                    </button>
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
                                        className="grid size-7 place-items-center rounded-lg bg-slate-200 text-slate-600 shrink-0"
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
                                          <span className="italic text-ink-soft">
                                            note: {t.notes}
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
                                      className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-600 text-[10.5px]"
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
                              <div className="mt-2 flex items-center gap-2 rounded-xl bg-paper p-2">
                                <input
                                  autoFocus
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add notes for this topic…"
                                  className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] outline-none focus:border-leaf"
                                />
                                <button
                                  onClick={() =>
                                    startTransition(async () => {
                                      await updateTopicNotesAction(t.id, noteText);
                                      setNoteTopicId(null);
                                      refresh();
                                    })
                                  }
                                  className="rounded-lg bg-leaf px-3 py-1 text-xs font-semibold text-white"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setNoteTopicId(null)}
                                  className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-line/80 py-4 text-center text-[12.5px] text-ink-faint">
                      {lesson.topics.length === 0
                        ? "No topics in this lesson yet. Type above to add one!"
                        : "No topics match the selected filter."}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="card border-dashed p-10 text-center text-[13.5px] text-ink-faint">
            No lessons created yet for this subject. Click{" "}
            <span className="font-semibold text-leaf">&quot;+ Add Lesson&quot;</span> above to create your first lesson!
          </div>
        )}
      </div>
    </div>
  );
}
