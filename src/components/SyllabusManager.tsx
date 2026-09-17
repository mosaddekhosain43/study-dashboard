"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ChevronDown,
  Download,
  FileUp,
  ListPlus,
  Plus,
  X,
} from "lucide-react";
import {
  bulkAddTopicsAction,
  deleteTopicAction,
  exportSyllabusCsvAction,
  importSyllabusCsvAction,
} from "@/actions";
import type { SubjectDto, TopicDto } from "@/lib/queries";
import { STATUS_META } from "@/lib/constants";

export default function SyllabusManager({
  groups,
}: {
  groups: { subject: SubjectDto; topics: TopicDto[] }[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(groups[0]?.subject.id ?? null);
  const [quick, setQuick] = useState<Record<number, string>>({});
  const [bulkFor, setBulkFor] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvMsg, setCsvMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const addQuick = (subjectId: number) => {
    const text = (quick[subjectId] ?? "").trim();
    if (!text) return;
    startTransition(async () => {
      await bulkAddTopicsAction(subjectId, text);
      setQuick((q) => ({ ...q, [subjectId]: "" }));
      router.refresh();
    });
  };

  const importBulk = (subjectId: number) => {
    startTransition(async () => {
      await bulkAddTopicsAction(subjectId, bulkText);
      setBulkText("");
      setBulkFor(null);
      router.refresh();
    });
  };

  const importCsv = (text: string) => {
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await importSyllabusCsvAction(text);
      if (res.ok) {
        setCsvMsg(`Imported ${res.created} topic(s) · skipped ${res.skipped} duplicate(s) · ${res.unmatched} row(s) with unknown subject.`);
        setCsvText("");
      } else setCsvMsg(res.error);
      router.refresh();
    });
  };

  const exportCsv = async () => {
    const csv = await exportSyllabusCsvAction();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alim-syllabus-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* import / export bar */}
      <div className="card flex flex-wrap items-center gap-2.5 p-4">
        <FileUp className="size-4 text-leaf" />
        <p className="text-[12.5px] font-semibold text-ink">CSV import:</p>
        <label className="cursor-pointer rounded-lg border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf">
          Choose .csv file
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              f.text().then(importCsv);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-[11px] text-ink-faint">format: Subject, Topic, Chapter(optional) — one per line</span>
        <div className="flex-1" />
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf"
        >
          <Download className="size-3.5" /> Export syllabus CSV
        </button>
      </div>
      {csvMsg && <p className="rounded-xl bg-leaf-soft px-4 py-2 text-[12.5px] font-medium text-leaf-deep">{csvMsg}</p>}

      {/* subject accordions */}
      {groups.map((g) => {
        const open = openId === g.subject.id;
        const done = g.topics.filter((t) => t.status === "completed").length;
        return (
          <div key={g.subject.id} className="card overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : g.subject.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-paper/50"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-leaf-soft font-display text-[13px] font-bold text-leaf">
                {g.subject.sortOrder}
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink">{g.subject.name}</p>
                <p className="font-bengali text-[11px] text-ink-faint">{g.subject.nameBn}</p>
              </div>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold tabular-nums text-ink-soft ring-1 ring-line">
                {g.topics.length} topics · {done} done
              </span>
              <ChevronDown className={`size-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="border-t border-line bg-paper/40 px-4 py-4">
                {g.topics.length === 0 ? (
                  <p className="mb-3 text-[12.5px] italic text-ink-faint">
                    No topics yet — type your real chapters below.
                  </p>
                ) : (
                  <div className="mb-3.5 flex flex-wrap gap-1.5">
                    {g.topics.map((t) => (
                      <span
                        key={t.id}
                        className={`font-bengali group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ${STATUS_META[t.status].bg} ${STATUS_META[t.status].text} ${STATUS_META[t.status].ring}`}
                      >
                        {t.name}
                        <button
                          onClick={() =>
                            startTransition(async () => {
                              await deleteTopicAction(t.id);
                              router.refresh();
                            })
                          }
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          title="Delete"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={quick[g.subject.id] ?? ""}
                    onChange={(e) => setQuick((q) => ({ ...q, [g.subject.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addQuick(g.subject.id)}
                    placeholder="Topic name + Enter — e.g. Chapter 1"
                    className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
                  />
                  <button
                    onClick={() => addQuick(g.subject.id)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                  <button
                    onClick={() => setBulkFor(bulkFor === g.subject.id ? null : g.subject.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink-soft"
                  >
                    <ListPlus className="size-3.5" /> Bulk
                  </button>
                  <Link href={`/subjects/${g.subject.id}`} className="ml-auto text-[12px] font-semibold text-leaf hover:underline">
                    Open full editor →
                  </Link>
                </div>

                {bulkFor === g.subject.id && (
                  <div className="mt-3">
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      rows={5}
                      placeholder={"One topic per line…\nChapter 1\nChapter 2\nGrammar Rules"}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-leaf"
                    />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => importBulk(g.subject.id)} className="rounded-lg bg-leaf px-3.5 py-2 text-[12px] font-semibold text-white">
                        Import lines
                      </button>
                      <button onClick={() => setBulkFor(null)} className="rounded-lg bg-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
