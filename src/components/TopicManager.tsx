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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${
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
        <div className="flex-1" />
        <button
          onClick={() => setBulkOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf"
        >
          <ListPlus className="size-4" /> Bulk add
        </button>
      </div>

      {/* add form */}
      <div className="card mb-4 flex items-center gap-2 p-2.5">
        <Plus className="ml-1 size-4 text-leaf" />
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
          className="rounded-lg bg-leaf px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
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
      <ul className="space-y-2">
        {filtered.map((t, idx) => {
          const editing = editingId === t.id;
          return (
            <li key={t.id} className="card group flex items-center gap-3 px-3.5 py-3">
              <span className="hidden w-6 text-right text-[11px] font-semibold tabular-nums text-ink-faint sm:block">
                {idx + 1}
              </span>
              <StatusIcon status={t.status} className="size-5 shrink-0" />

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
                      className="font-bengali min-w-0 flex-1 rounded-lg border border-leaf bg-white px-2 py-1 text-[13.5px]"
                    />
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await renameTopicAction(t.id, editName);
                          setEditingId(null);
                          refresh();
                        })
                      }
                      className="grid size-7 place-items-center rounded-lg bg-leaf text-white"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="grid size-7 place-items-center rounded-lg bg-slate-200 text-slate-600">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`font-bengali truncate text-[14px] font-semibold ${t.status === "completed" ? "text-ink-soft" : "text-ink"}`}>
                      {t.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-[10.5px] text-ink-faint">
                      {t.completedAt && <span>completed {t.completedAt}</span>}
                      {!t.completedAt && <span>updated {t.updatedAt.slice(0, 10)}</span>}
                      {t.notes && <span className="font-bengali italic">note: {t.notes}</span>}
                    </div>
                  </>
                )}
              </div>

              {noteId === t.id && (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write notes…"
                    className="w-40 rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px]"
                  />
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await updateTopicNotesAction(t.id, noteText);
                        setNoteId(null);
                        refresh();
                      })
                    }
                    className="grid size-7 place-items-center rounded-lg bg-leaf text-white"
                  >
                    <Check className="size-3.5" />
                  </button>
                </div>
              )}

              <select
                value={t.status}
                onChange={(e) =>
                  startTransition(async () => {
                    await setTopicStatusAction(t.id, e.target.value);
                    refresh();
                  })
                }
                className={`rounded-lg border-0 px-2 py-1.5 text-[11.5px] font-bold ring-1 ${STATUS_META[t.status].bg} ${STATUS_META[t.status].text} ${STATUS_META[t.status].ring}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>

              <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
                <button
                  title="Note"
                  onClick={() => { setNoteId(noteId === t.id ? null : t.id); setNoteText(t.notes ?? ""); }}
                  className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-paper hover:text-amber-600"
                >
                  <StickyNote className="size-3.5" />
                </button>
                <button
                  title="Rename"
                  onClick={() => { setEditingId(t.id); setEditName(t.name); }}
                  className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-paper hover:text-leaf"
                >
                  <Pencil className="size-3.5" />
                </button>
                {confirmDeleteId === t.id ? (
                  <span className="flex items-center gap-1 pl-1 text-[10.5px] font-bold text-rose-600">
                    Sure?
                    <button
                      onClick={() => startTransition(async () => { await deleteTopicAction(t.id); refresh(); })}
                      className="rounded-md bg-rose-600 px-1.5 py-0.5 text-white"
                    >
                      Yes
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded-md bg-slate-200 px-1.5 py-0.5 text-slate-600">
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    title="Delete topic"
                    onClick={() => setConfirmDeleteId(t.id)}
                    className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </span>
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
