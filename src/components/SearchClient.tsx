"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BookMarked, Search, ListChecks } from "lucide-react";
import { searchAction } from "@/actions";
import type { SearchResults } from "@/lib/queries";
import { STATUS_META, STATUSES } from "@/lib/constants";
import { StatusIcon } from "@/components/ui";
import { formatDayLabel } from "@/lib/dates";

export default function SearchClient({
  subjects,
}: {
  subjects: { id: number; name: string }[];
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [results, setResults] = useState<SearchResults>({ topics: [], items: [] });
  const [searched, setSearched] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!q.trim() && !status && !subjectId) {
        setResults({ topics: [], items: [] });
        setSearched(false);
        return;
      }
      startTransition(async () => {
        const res = await searchAction(q, status || undefined, subjectId ? Number(subjectId) : undefined);
        setResults(res);
        setSearched(true);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [q, status, subjectId]);

  return (
    <div className="space-y-5">
      {/* search bar */}
      <div className="card p-3 sm:p-3.5 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Search className="ml-1 size-5 shrink-0 text-leaf" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topic, chapter, note or date…"
            className="w-full bg-transparent text-[14px] sm:text-[15px] outline-none placeholder:text-ink-faint/60"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs text-ink-faint hover:text-ink px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 pt-2 border-t border-line/60 sm:border-0 sm:pt-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-line bg-paper px-2.5 py-2 text-[12px] font-semibold text-ink-soft focus:outline-none focus:border-leaf"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-line bg-paper px-2.5 py-2 text-[12px] font-semibold text-ink-soft focus:outline-none focus:border-leaf"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {pending && <p className="text-[12px] font-semibold text-ink-faint">Searching…</p>}

      {searched && !pending && results.topics.length === 0 && results.items.length === 0 && (
        <div className="card border-dashed p-10 text-center text-[13px] text-ink-faint">
          Nothing found. Try another spelling — Bangla or English both work.
        </div>
      )}

      {results.topics.length > 0 && (
        <section>
          <h2 className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            <ListChecks className="size-4 text-leaf" /> Syllabus Topics ({results.topics.length})
          </h2>
          <ul className="card divide-y divide-line">
            {results.topics.map((t) => (
              <li key={t.id} className="flex items-start sm:items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="pt-0.5">
                    <StatusIcon status={t.status} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-ink break-words leading-snug">{t.name}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">{t.subjectName}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[t.status].bg} ${STATUS_META[t.status].text}`}>
                  {STATUS_META[t.status].short}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.items.length > 0 && (
        <section>
          <h2 className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            <BookMarked className="size-4 text-leaf" /> Study Records ({results.items.length})
          </h2>
          <ul className="card divide-y divide-line">
            {results.items.map((it) => (
              <li key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="pt-0.5">
                    <StatusIcon status={it.status} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink-soft">{it.subjectName}</p>
                    <p className="text-[13.5px] font-medium text-ink break-words leading-snug mt-0.5">
                      {it.label}
                      {it.notes && <span className="ml-1.5 text-[11px] italic text-ink-faint">· {it.notes}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-ink-faint">
                  {it.minutes ? <span className="font-semibold tabular-nums">{it.minutes}m</span> : null}
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[it.status].bg} ${STATUS_META[it.status].text}`}>
                    {STATUS_META[it.status].short}
                  </span>
                  <span className="tabular-nums" title={it.date}>
                    {formatDayLabel(it.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
