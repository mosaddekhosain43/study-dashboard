"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ListPlus,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import {
  addTopicAction,
  bulkAddTopicsAction,
  deleteTopicAction,
  moveTopicAction,
  renameTopicAction,
  setTopicStatusAction,
  updateTopicNotesAction,
} from "@/actions";
import type { TopicDto } from "@/lib/queries";
import { STATUS_META, STATUSES, type StudyStatus } from "@/lib/constants";
import { StatusIcon } from "@/components/ui";

type Filter = "all" | StudyStatus;

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  completed: "Completed",
  in_progress: "In Progress",
  not_started: "Not Started",
  not_completed: "Not Completed",
};

export default function TopicManager({
  subjectId,
  topics,
}: {
  subjectId: number;
  topics: TopicDto[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [noteId, setNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [quickName, setQuickName] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => topics.filter((t) => filter === "all" || t.status === filter),
    [topics, filter],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: topics.length, completed: 0, in_progress: 0, not_started: 0, not_completed: 0 };
    for (const t of topics) c[t.status]++;
    return c;
  }, [topics]);

  const refresh = () => router.refresh();

  const addQuick = () => {
    if (!quickName.trim()) return;
    startTransition(async () => {
      const res = await addTopicAction(subjectId, quickName);
      if (res.ok) setQuickName("");
      refresh();
    });
  };

  const addBulk = () => {
    startTransition(async () => {
      const res = await bulkAddTopicsAction(subjectId, bulkText);
      if (res.ok) {
        setMsg(`Added ${res.created} topic${res.created === 1 ? "" : "s"}${res.skipped ? `, skipped ${res.skipped} duplicate(s)` : ""}.`);
        setBulkText("");
        setBulkOpen(false);
      } else setMsg(res.error);
      refresh();
    });
  };

  return (
    <div>
      {/* filters + add */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
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
            <span className={`ml-1.5 tabular-nums ${filter === f ? "text-white/80" : "text-ink-faint"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
        <div className="hidden sm:block flex-1" />
        <button
          onClick={() => setBulkOpen((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf"
        >
          <ListPlus className="size-3.5" /> Bulk add
        </button>
      </div>

      {/* add form */}
      <div className="card mb-4 flex items-center gap-2 p-2 sm:p-2.5">
        <Plus className="ml-1 size-4 text-leaf shrink-0" />
        <input
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addQuick()}
          placeholder="Add topic — e.g. Chapter 7, Hadith 13, Tense"
          className="min-w-0 flex-1 bg-transparent px-1 text-[13.5px] outline-none placeholder:text-ink-faint/60"
        />
        <button
          onClick={addQuick}
          disabled={pending || !quickName.trim()}
          className="shrink-0 rounded-lg bg-leaf px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
        >
          Add topic
        </button>
      </div>

      {bulkOpen && (
        <div className="card mb-4 border-leaf/30 bg-leaf-soft/30 p-4">
          <p className="mb-2 text-[12.5px] font-semibold text-ink">
            Paste many topics — one per line:
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={"Chapter 1\nChapter 2\nSurah Baqarah\nHadith 5…"}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
          />
          <div className="mt-2 flex gap-2">
            <button onClick={addBulk} disabled={pending} className="rounded-lg bg-leaf px-3.5 py-2 text-[12px] font-semibold text-white disabled:opacity-50">
              Import lines
            </button>
            <button onClick={() => setBulkOpen(false)} className="rounded-lg bg-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}
      {msg && <p className="mb-3 text-[12.5px] font-medium text-leaf">{msg}</p>}

      {/* topic list */}
      <ul className="space-y-2.5">
        {filtered.map((t, idx) => {
          const editing = editingId === t.id;
          return (
            <li key={t.id} className="card group p-3.5 sm:py-3 sm:px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="hidden w-5 text-right text-[11px] font-semibold tabular-nums text-ink-faint sm:block pt-0.5">
                    {idx + 1}
                  </span>
                  <div className="pt-0.5">
                    <StatusIcon status={t.status} className="size-4.5 shrink-0" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              startTransition(async () => {
                                await renameTopicAction(t.id, editName);
                                setEditingId(null);
                                refresh();
                              });
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-leaf bg-white px-2 py-1 text-[13.5px]"
                        />
                        <button
                          onClick={() =>
                            startTransition(async () => {
                              await renameTopicAction(t.id, editName);
                              setEditingId(null);
                              refresh();
                            })
                          }
                          className="grid size-7 place-items-center rounded-lg bg-leaf text-white shrink-0"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="grid size-7 place-items-center rounded-lg bg-slate-200 text-slate-600 shrink-0">
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className={`text-[14px] font-semibold leading-snug break-words ${t.status === "completed" ? "text-ink-soft opacity-75" : "text-ink"}`}>
                          {t.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-faint">
                          {t.completedAt ? (
                            <span>completed {t.completedAt}</span>
                          ) : (
                            <span>updated {t.updatedAt.slice(0, 10)}</span>
                          )}
                          {t.notes && <span className="italic text-ink-soft">note: {t.notes}</span>}
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
                    className={`rounded-lg border-0 px-2.5 py-1.5 text-[11px] font-bold ring-1 transition ${STATUS_META[t.status].bg} ${STATUS_META[t.status].text} ${STATUS_META[t.status].ring}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons: accessible on touch/mobile, neat on desktop */}
              <div className="mt-2 pt-2 border-t border-line/50 flex items-center justify-between sm:border-0 sm:pt-0 sm:mt-1 sm:justify-end sm:gap-1">
                <div className="flex items-center gap-1">
                  <button
                    title="Rename"
                    onClick={() => { setEditingId(t.id); setEditName(t.name); }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-faint hover:bg-paper hover:text-leaf transition"
                  >
                    <Pencil className="size-3" /> Edit
                  </button>
                  <button
                    title="Add note"
                    onClick={() => { setNoteId(noteId === t.id ? null : t.id); setNoteText(t.notes ?? ""); }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-faint hover:bg-paper hover:text-amber-600 transition"
                  >
                    <StickyNote className="size-3" /> Note
                  </button>
                  <button
                    title="Move up"
                    onClick={() => startTransition(async () => { await moveTopicAction(t.id, "up"); refresh(); })}
                    className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-paper"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    title="Move down"
                    onClick={() => startTransition(async () => { await moveTopicAction(t.id, "down"); refresh(); })}
                    className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-paper"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>

                <div>
                  {confirmDeleteId === t.id ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      Sure?
                      <button
                        onClick={() => startTransition(async () => { await deleteTopicAction(t.id); refresh(); })}
                        className="rounded-md bg-rose-600 px-2 py-0.5 text-white text-[11px]"
                      >
                        Yes
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="rounded-md bg-slate-200 px-2 py-0.5 text-slate-600 text-[11px]">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      title="Delete topic"
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-faint hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  )}
                </div>
              </div>

              {noteId === t.id && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-paper p-2">
                  <input
                    autoFocus
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write note for this topic…"
                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-leaf"
                  />
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await updateTopicNotesAction(t.id, noteText);
                        setNoteId(null);
                        refresh();
                      })
                    }
                    className="rounded-lg bg-leaf px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setNoteId(null)}
                    className="rounded-lg bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="card border-dashed p-10 text-center text-[13px] text-ink-faint">
          {topics.length === 0
            ? "No topics in this paper yet — add your first chapter above."
            : "No topics match this filter."}
        </div>
      )}
    </div>
  );
}
