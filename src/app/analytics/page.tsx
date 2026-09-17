import Link from "next/link";
import { AlarmClockCheck, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock, Target, TrendingDown } from "lucide-react";
import { Donut, ProgressBar, SectionHeader, VBars } from "@/components/ui";
import { STATUS_META } from "@/lib/constants";
import { formatMinutes, todayKey } from "@/lib/dates";
import { getAnalytics, getExamConfig } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics — Study Dashboard" };

export default async function AnalyticsPage() {
  const [a, exam] = await Promise.all([getAnalytics(), getExamConfig()]);

  return (
    <div className="space-y-8">
      <header className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Progress Analytics</h1>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            Where your effort is going — and which papers need rescue.
          </p>
        </div>
        <div className="card flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold text-ink-soft">
          <Clock className="size-4 text-leaf" />
          Lifetime study time: <span className="font-display font-bold text-ink">{formatMinutes(a.totalMinutes)}</span>
        </div>
      </header>

      {/* top charts */}
      <section className="rise rise-1 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card flex flex-col items-center justify-center gap-3 p-5">
          <Donut
            segments={a.statusDist.map((d) => ({ value: d.count, color: STATUS_META[d.status].color }))}
            centerLabel={`${Math.round(a.overall * 100)}%`}
            centerSub="syllabus"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {a.statusDist.map((d) => (
              <span key={d.status} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                <span className="size-2 rounded-full" style={{ background: STATUS_META[d.status].color }} />
                {STATUS_META[d.status].label} · {d.count}
              </span>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Last 7 Days</p>
          <VBars
            data={a.last7.map((d) => ({
              label: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][new Date(d.date + "T00:00").getDay()],
              value: d.minutes,
              title: formatMinutes(d.minutes),
            }))}
            highlightLast
          />
        </div>

        <div className="card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Weekly Study Time</p>
          <VBars
            data={a.weeklyHours.map((w) => ({
              label: w.weekStart.slice(5).replace("-", "/"),
              value: Math.round(w.minutes / 60),
              title: formatMinutes(w.minutes),
            }))}
            color="#c77f00"
            highlightLast
          />
        </div>

        <div className="card flex flex-col gap-3 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Extremes & Countdown</p>
          {a.mostStudied && (
            <div className="flex items-center gap-2.5 rounded-xl bg-leaf-soft/70 px-3 py-2.5">
              <ArrowUpNarrowWide className="size-4 text-leaf" />
              <div>
                <p className="text-[12px] font-bold text-ink">{a.mostStudied.name}</p>
                <p className="text-[10.5px] text-ink-faint">most studied · {formatMinutes(a.mostStudied.minutes)}</p>
              </div>
            </div>
          )}
          {a.leastStudied && (
            <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5">
              <ArrowDownWideNarrow className="size-4 text-amber-brand" />
              <div>
                <p className="text-[12px] font-bold text-ink">{a.leastStudied.name}</p>
                <p className="text-[10.5px] text-ink-faint">least studied · {formatMinutes(a.leastStudied.minutes)}</p>
              </div>
            </div>
          )}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line px-3 py-2 text-center">
              <AlarmClockCheck className="mx-auto mb-0.5 size-3.5 text-rose-brand" />
              <p className="font-display text-[16px] font-bold tabular-nums">{exam.daysToExam}</p>
              <p className="text-[9px] font-bold uppercase text-ink-faint">days to exam</p>
            </div>
            <div className="rounded-xl border border-line px-3 py-2 text-center">
              <Target className="mx-auto mb-0.5 size-3.5 text-amber-brand" />
              <p className="font-display text-[16px] font-bold tabular-nums">{exam.daysToTarget}</p>
              <p className="text-[9px] font-bold uppercase text-ink-faint">to target</p>
            </div>
          </div>
        </div>
      </section>

      {/* subject-wise progress */}
      <section className="rise rise-2">
        <SectionHeader title="Subject-wise Progress" sub="Sorted by completion" />
        <div className="card divide-y divide-line">
          {[...a.stats]
            .sort((x, y) => y.progress - x.progress)
            .map((s) => (
              <Link key={s.subject.id} href={`/subjects/${s.subject.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 transition hover:bg-paper/60 sm:px-5">
                <span className="w-44 truncate text-[13px] font-semibold text-ink">{s.subject.name}</span>
                <div className="min-w-[140px] flex-1">
                  <ProgressBar value={s.progress} height={7} tone={s.progress < 0.3 ? "rose" : s.progress < 0.65 ? "amber" : "leaf"} />
                </div>
                <span className="w-12 text-right text-[12.5px] font-bold tabular-nums text-ink">{Math.round(s.progress * 100)}%</span>
                <span className="hidden w-28 text-right text-[11px] tabular-nums text-ink-faint md:block">
                  {s.completed}/{s.total} · {formatMinutes(s.minutes)}
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* falling behind */}
      <section className="rise rise-3">
        <SectionHeader title="Needs Attention" sub="Papers significantly below your average progress" />
        {a.fallingBehind.length === 0 ? (
          <div className="card border-dashed p-8 text-[13px] text-ink-faint">
            Nothing is severely behind. Keep the balance.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {a.fallingBehind.map((s) => (
              <Link key={s.subject.id} href={`/subjects/${s.subject.id}`} className="card flex items-center gap-3 border-amber-200 bg-amber-50/40 p-4 transition hover:shadow-pop">
                <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <TrendingDown className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-[13.5px] font-bold text-ink">{s.subject.name}</p>
                  <p className="text-[11.5px] text-ink-faint">
                    {Math.round(s.progress * 100)}% done vs {Math.round(a.overall * 100)}% overall · {s.remaining} left
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <p className="pb-2 text-center text-[11px] text-ink-faint">Generated locally · {todayKey()}</p>
    </div>
  );
}
