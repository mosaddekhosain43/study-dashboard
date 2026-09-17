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
      <div className="card flex items-center gap-3 p-3">
        <Search className="ml-2 size-5 shrink-0 text-leaf" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search subject, chapter, topic, note or date… e.g. Hadith, Chapter 2, 2025-09-17"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-faint/60"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px] font-semibold text-ink-soft"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px] font-semibold text-ink-soft"
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
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
              <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <StatusIcon status={t.status} />
                <span className="font-bengali flex-1 truncate text-[13.5px] font-medium text-ink">{t.name}</span>
                <span className="text-[11.5px] text-ink-faint">{t.subjectName}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[t.status].bg} ${STATUS_META[t.status].text}`}>
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
              <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                <StatusIcon status={it.status} />
                <span className="w-[140px] truncate text-[12px] font-semibold text-ink-soft">{it.subjectName}</span>
                <span className="font-bengali min-w-[120px] flex-1 truncate text-[13.5px] font-medium text-ink">
                  {it.label}
                  {it.notes && <span className="ml-1.5 text-[11px] italic text-ink-faint">· {it.notes}</span>}
                </span>
                {it.minutes ? <span className="text-[11px] font-semibold tabular-nums text-ink-faint">{it.minutes}m</span> : null}
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[it.status].bg} ${STATUS_META[it.status].text}`}>
                  {STATUS_META[it.status].short}
                </span>
                <span className="w-24 text-right text-[11px] tabular-nums text-ink-faint" title={it.date}>
                  {formatDayLabel(it.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
