"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { parseUpdateAction, saveUpdateAction } from "@/actions";
import type { ParseResult, ParsedItem } from "@/lib/parser";
import { EXAMPLE_INPUTS } from "@/lib/parser";
import { STATUS_META, STATUSES, type StudyStatus } from "@/lib/constants";
import { StatusIcon } from "@/components/ui";
import { todayKey } from "@/lib/dates";

interface SubjectOpt {
  id: number;
  name: string;
}
interface TopicOpt {
  id: number;
  subjectId: number;
  name: string;
}

interface DraftItem {
  key: number;
  subjectId: number | null;
  topicId: number | null;
  topicText: string;
  status: StudyStatus;
  minutes: string;
  confidence: number;
  needsConfirmation: boolean;
  clause: string;
}

let keyCounter = 1;
const nextKey = () => keyCounter++;

function draftFromParsed(p: ParsedItem): DraftItem {
  return {
    key: nextKey(),
    subjectId: p.subjectId,
    topicId: p.topicId,
    topicText: p.topicText,
    status: p.status,
    minutes: p.minutes ? String(p.minutes) : "",
    confidence: p.confidence,
    needsConfirmation: p.needsConfirmation || p.subjectId === null,
    clause: p.clause,
  };
}

export default function StudyComposer({
  subjects,
  syllabus,
  autoFocus = false,
}: {
  subjects: SubjectOpt[];
  syllabus: TopicOpt[];
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [date, setDate] = useState(todayKey());
  const [addToSyllabus, setAddToSyllabus] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const subjectName = (id: number | null) =>
    subjects.find((s) => s.id === id)?.name ?? "—";

  const analyze = () => {
    if (!text.trim()) {
      setMessage("Please write an update first, e.g. 'Arabic 2nd Paper finished chapter 1'");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await parseUpdateAction(text);
      setParseResult(result);
      setDate(result.date);
      setDrafts(result.items.map(draftFromParsed));
      if (result.items.length === 0) {
        setMessage(
          "Could not detect a subject. Try naming the paper, e.g. Bangla 1st, English 2nd, Arabic 2nd.",
        );
      }
    });
  };

  const update = (key: number, patch: Partial<DraftItem>) =>
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const remove = (key: number) => setDrafts((ds) => ds.filter((d) => d.key !== key));

  const addManual = () =>
    setDrafts((ds) => [
      ...ds,
      {
        key: nextKey(),
        subjectId: null,
        topicId: null,
        topicText: "",
        status: "completed",
        minutes: "",
        confidence: 0,
        needsConfirmation: true,
        clause: "",
      },
    ]);

  const unconfirmed = drafts.filter((d) => d.subjectId === null).length;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await saveUpdateAction({
        rawText: text,
        date,
        addToSyllabus,
        items: drafts.map((d) => ({
          subjectId: d.subjectId,
          topicId: d.topicId,
          topicText: d.topicId
            ? (syllabus.find((t) => t.id === d.topicId)?.name ?? d.topicText)
            : d.topicText,
          status: d.status,
          minutes: d.minutes ? Math.max(0, Math.round(Number(d.minutes))) : null,
        })),
      });
      if (!res.ok) {
        setMessage(res.error);
      } else {
        setText("");
        setParseResult(null);
        setDrafts([]);
        setMessage("saved");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const topicsFor = useMemo(
    () => (subjectId: number | null) =>
      subjectId ? syllabus.filter((t) => t.subjectId === subjectId) : [],
    [syllabus],
  );

  return (
    <section className="card overflow-hidden">
      {/* composer header */}
      <div className="border-b border-line bg-gradient-to-br from-leaf-soft/70 via-white to-white px-5 pb-4 pt-5 sm:px-6">
        <div className="flex items-center gap-2 text-leaf">
          <Sparkles className="size-4" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Smart Study Update</p>
        </div>
        <h2 className="mt-1 font-display text-[19px] font-semibold tracking-tight text-ink">
          What did you study today?
        </h2>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <textarea
          ref={areaRef}
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyze();
          }}
          rows={3}
          placeholder="Write what you studied today, e.g. Finished Arabic 2nd Paper and still reading English Grammar..."
          className="w-full resize-y rounded-xl border border-line bg-paper/60 px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint/70 focus:border-leaf focus:bg-white focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Try:</span>
          {EXAMPLE_INPUTS.slice(0, 3).map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setText(ex);
                areaRef.current?.focus();
              }}
              className="font-bengali rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] text-ink-soft transition hover:border-leaf hover:text-leaf"
            >
              {ex.length > 34 ? ex.slice(0, 34) + "…" : ex}
            </button>
          ))}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <button
            onClick={analyze}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-leaf to-leaf-deep px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-md shadow-leaf/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Wand2 className="size-4" />
            {pending ? "Analyzing…" : "Understand my update"}
          </button>
          <p className="text-[11.5px] text-ink-faint">
            Local parser — works offline. Ctrl/Cmd + Enter to analyze.
          </p>
          {message && message !== "saved" && (
            <p className="font-bengali flex items-center gap-1.5 text-[12.5px] font-medium text-amber-brand">
              <AlertTriangle className="size-3.5" /> {message}
            </p>
          )}
          {message === "saved" && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[12.5px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" /> Saved — dashboard updated.
            </p>
          )}
        </div>
      </div>

      {/* detected preview */}
      {parseResult && drafts.length > 0 && (
        <div className="border-t border-line bg-paper/50 px-5 py-5 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Detected updates · {drafts.length}
            </p>
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink-soft">
              Date
              <input
                type="date"
                value={date}
                max={todayKey()}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-line bg-white px-2 py-1 text-[12.5px]"
              />
            </label>
          </div>

          <ul className="space-y-3">
            {drafts.map((d) => {
              const tops = topicsFor(d.subjectId);
              return (
                <li
                  key={d.key}
                  className={`rounded-xl border bg-white p-3.5 shadow-sm transition ${
                    d.subjectId === null ? "border-amber-300 ring-1 ring-amber-200" : "border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusIcon status={d.status} className="size-5 shrink-0" />

                    {/* subject */}
                    <select
                      value={d.subjectId ?? ""}
                      onChange={(e) =>
                        update(d.key, {
                          subjectId: e.target.value ? Number(e.target.value) : null,
                          topicId: null,
                        })
                      }
                      className={`rounded-lg border px-2 py-1.5 text-[13px] font-semibold ${
                        d.subjectId === null
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-line bg-paper/60 text-ink"
                      }`}
                    >
                      <option value="">Pick subject…</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    {/* topic: syllabus select or free text */}
                    <div className="flex min-w-[180px] flex-1 items-center gap-1.5">
                      {tops.length > 0 && (
                        <select
                          value={d.topicId ?? ""}
                          onChange={(e) =>
                            update(d.key, {
                              topicId: e.target.value ? Number(e.target.value) : null,
                              topicText: e.target.value
                                ? (tops.find((t) => t.id === Number(e.target.value))?.name ?? d.topicText)
                                : d.topicText,
                            })
                          }
                          className="max-w-[190px] rounded-lg border border-line bg-paper/60 px-2 py-1.5 text-[13px] text-ink"
                        >
                          <option value="">Free text topic…</option>
                          {tops.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        value={d.topicText}
                        onChange={(e) =>
                          update(d.key, {
                            topicText: e.target.value,
                            topicId: d.topicId && e.target.value !== (tops.find((t) => t.id === d.topicId)?.name ?? "") ? null : d.topicId,
                          })
                        }
                        placeholder="Topic (e.g. Chapter 1, Poetry 2, Tense)"
                        className="min-w-[140px] flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px]"
                      />
                    </div>

                    {/* minutes */}
                    <input
                      value={d.minutes}
                      onChange={(e) => update(d.key, { minutes: e.target.value.replace(/[^\d]/g, "") })}
                      placeholder="min"
                      inputMode="numeric"
                      className="w-[64px] rounded-lg border border-line bg-white px-2 py-1.5 text-[13px] tabular-nums"
                      title="Minutes studied (optional)"
                    />

                    <button
                      onClick={() => remove(d.key)}
                      className="grid size-8 place-items-center rounded-lg text-ink-faint transition hover:bg-rose-50 hover:text-rose-600"
                      title="Remove this item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* status segmented */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-7">
                    {STATUSES.map((st) => {
                      const meta = STATUS_META[st];
                      const active = d.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => update(d.key, { status: st })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                            active
                              ? `${meta.bg} ${meta.text} border-transparent ring-1 ${meta.ring}`
                              : "border-line bg-white text-ink-faint hover:text-ink"
                          }`}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                    {d.clause && (
                      <span className="font-bengali ml-1 truncate text-[11px] italic text-ink-faint/80">
                        «{d.clause.length > 52 ? d.clause.slice(0, 52) + "…" : d.clause}»
                      </span>
                    )}
                    {d.needsConfirmation && (
                      <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                        check
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={addManual}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-white px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf"
            >
              <Plus className="size-4" /> Add item
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={addToSyllabus}
                onChange={(e) => setAddToSyllabus(e.target.checked)}
                className="size-4 accent-leaf"
              />
              Add new topics to my syllabus
            </label>
            <div className="flex-1" />
            {unconfirmed > 0 && (
              <p className="text-[12px] font-medium text-amber-brand">
                {unconfirmed} item{unconfirmed > 1 ? "s" : ""} need{unconfirmed > 1 ? "" : "s"} a subject
              </p>
            )}
            <button
              onClick={save}
              disabled={saving || drafts.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13.5px] font-semibold text-paper shadow transition hover:bg-pine active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? "Saving…" : `Save ${drafts.length} update${drafts.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
