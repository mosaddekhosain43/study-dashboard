import Link from "next/link";
import { CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Clock } from "lucide-react";
import { ProgressBar, SectionHeader, VBars } from "@/components/ui";
import { addDays, formatMinutes, startOfWeek, todayKey, weekDates } from "@/lib/dates";
import { getWeekReview } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Weekly Review — Study Dashboard" };

const DAY_NAMES = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const sp = await searchParams;
  const current = startOfWeek(todayKey());
  const weekStart =
    sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week) ? sp.week : current;
  const w = await getWeekReview(weekStart);
  const isCurrent = w.weekStart === current;
  const dates = weekDates(weekStart);
  const delta = w.totalMinutes - w.prevTotalMinutes;

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Weekly Review</h1>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            Saturday → Friday · {dates[0]} to {dates[6]} {isCurrent && <span className="ml-1 rounded-full bg-leaf-soft px-2 py-0.5 text-[11px] font-bold text-leaf-deep">current week</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/weekly?week=${addDays(weekStart, -7)}`} className="grid size-9 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-leaf hover:text-leaf" aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Link>
          {!isCurrent && (
            <Link href="/weekly" className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf">
              This week
            </Link>
          )}
          <Link
            href={isCurrent ? "#" : `/weekly?week=${addDays(weekStart, 7)}`}
            className={`grid size-9 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-leaf hover:text-leaf ${isCurrent ? "pointer-events-none opacity-40" : ""}`}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* summary tiles */}
      <section className="rise rise-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            <Clock className="size-3.5 text-leaf" /> Study Time
          </p>
          <p className="mt-1.5 font-display text-[24px] font-bold tabular-nums text-ink">{formatMinutes(w.totalMinutes)}</p>
          <p className={`text-[11px] font-semibold ${delta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {delta >= 0 ? "▲" : "▼"} {formatMinutes(Math.abs(delta))} vs last week
          </p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Completed
          </p>
          <p className="mt-1.5 font-display text-[24px] font-bold tabular-nums text-ink">{w.topicsCompleted.length}</p>
          <p className="text-[11px] text-ink-faint">topics finished</p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            <CalendarRange className="size-3.5 text-amber-brand" /> Progress Change
          </p>
          <p className="mt-1.5 font-display text-[24px] font-bold tabular-nums text-ink">
            +{Math.round(w.progressDelta * 100)}%
          </p>
          <p className="text-[11px] text-ink-faint">of total syllabus</p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            <CircleSlash className="size-3.5 text-rose-brand" /> Still Left
          </p>
          <p className="mt-1.5 font-display text-[24px] font-bold tabular-nums text-ink">{w.remainingTotal}</p>
          <p className="text-[11px] text-ink-faint">topics syllabus-wide</p>
        </div>
      </section>

      <div className="rise rise-2 grid gap-4 lg:grid-cols-3">
        {/* per-day chart */}
        <div className="card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Hours per Day</p>
          <VBars
            data={w.days.map((d, i) => ({
              label: DAY_NAMES[i],
              value: d.minutes,
              title: formatMinutes(d.minutes),
            }))}
            highlightLast={isCurrent}
          />
        </div>

        {/* completed topics */}
        <div className="card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Completed This Week ({w.topicsCompleted.length})
          </p>
          {w.topicsCompleted.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">No completions recorded this week.</p>
          ) : (
            <ul className="max-h-[190px] space-y-1.5 overflow-y-auto pr-1">
              {w.topicsCompleted.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-[12.5px]">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                  <span className="w-28 shrink-0 truncate text-ink-faint">{t.subjectName}</span>
                  <span className="font-bengali flex-1 truncate font-medium text-ink">{t.label}</span>
                  <span className="text-[10.5px] tabular-nums text-ink-faint">{t.date.slice(5)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* studied vs neglected */}
        <div className="card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Subject Balance</p>
          {w.subjectsStudied.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">Studied</p>
              <ul className="mb-4 space-y-1.5">
                {w.subjectsStudied.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-[12.5px]">
                    <Link href={`/subjects/${s.id}`} className="w-32 shrink-0 truncate font-medium text-ink hover:text-leaf">
                      {s.name}
                    </Link>
                    <div className="flex-1"><ProgressBar value={Math.min(1, s.minutes / 300)} height={5} /></div>
                    <span className="w-12 text-right text-[11px] font-semibold tabular-nums text-ink-faint">{formatMinutes(s.minutes)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {w.subjectsNeglected.length > 0 && (
            <>
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-rose-500">
                <CircleSlash className="size-3" /> Needs attention — not studied
              </p>
              <div className="flex flex-wrap gap-1.5">
                {w.subjectsNeglected.map((s) => (
                  <Link key={s.id} href={`/subjects/${s.id}`} className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100">
                    {s.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
