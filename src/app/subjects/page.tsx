import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, CircleDashed, ListChecks, Timer, XCircle } from "lucide-react";
import { EmptyState, ProgressBar } from "@/components/ui";
import { formatMinutes, relativeDay } from "@/lib/dates";
import { getSubjectStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Subjects — Study Dashboard" };

export default async function SubjectsPage() {
  const stats = await getSubjectStats();
  const anyTopics = stats.some((s) => s.total > 0);

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[30px] font-bold leading-none tracking-tight text-ink sm:text-[34px]">
            Subjects & Papers
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-faint">All 13 papers. Click any subject for chapter-level detail.</p>
        </div>
        <Link href="/syllabus" className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf">
          Manage syllabus <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {!anyTopics && (
        <EmptyState
          icon={<ListChecks className="size-5" />}
          title="Syllabus is empty"
          body="Add your real chapters/topics first — progress tracking uses exactly what you enter."
          action={
            <Link href="/syllabus" className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-[12.5px] font-semibold text-white">
              Syllabus Setup <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      )}

      <div className="rise rise-1 overflow-hidden rounded-[18px] border border-line bg-white shadow-card">
        {stats.map((s, i) => (
          <Link
            key={s.subject.id}
            href={`/subjects/${s.subject.id}`}
            className={`group flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition hover:bg-paper/70 sm:px-5 ${
              i !== 0 ? "border-t border-line" : ""
            }`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-leaf-soft font-display text-[13px] font-bold text-leaf">
              {s.subject.sortOrder}
            </span>
            <div className="w-44 shrink-0">
              <p className="text-[13.5px] font-semibold text-ink group-hover:text-leaf">{s.subject.name}</p>
              <p className="font-bengali text-[11px] text-ink-faint">{s.subject.nameBn}</p>
            </div>
            <div className="min-w-[160px] flex-1">
              <div className="mb-1 flex justify-between text-[10.5px] font-semibold tabular-nums text-ink-faint">
                <span>{s.total === 0 ? "no topics yet" : `${s.completed}/${s.total} topics`}</span>
                <span>{Math.round(s.progress * 100)}%</span>
              </div>
              <ProgressBar value={s.progress} height={7} />
            </div>
            <div className="hidden items-center gap-3 text-[11px] font-medium text-ink-faint md:flex">
              <span className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-emerald-500" />{s.completed}</span>
              <span className="flex items-center gap-1"><CircleDashed className="size-3.5 text-amber-500" />{s.inProgress}</span>
              <span className="flex items-center gap-1"><XCircle className="size-3.5 text-rose-400" />{s.notCompleted}</span>
            </div>
            <div className="hidden w-32 shrink-0 text-right text-[11px] text-ink-faint lg:block">
              <p className="flex items-center justify-end gap-1">
                <Timer className="size-3" /> {s.minutes > 0 ? formatMinutes(s.minutes) : "—"}
              </p>
              <p>{s.lastStudied ? relativeDay(s.lastStudied) : "never studied"}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-leaf" />
          </Link>
        ))}
      </div>
    </div>
  );
}
