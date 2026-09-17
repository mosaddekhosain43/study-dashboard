import Link from "next/link";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import UpdateFeed from "@/components/UpdateFeed";
import { formatMinutes, formatDayLabel, addDays, todayKey } from "@/lib/dates";
import { getActiveDatesLastNDays, getDayLog, getSubjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Daily Log — Study Dashboard" };

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayKey();
  const [log, subjects, activity] = await Promise.all([
    getDayLog(date),
    getSubjects(),
    getActiveDatesLastNDays(14),
  ]);
  const today = todayKey();
  const subjectOpts = subjects.map((s) => ({ id: s.id, name: s.name }));

  const strip = Array.from({ length: 14 }, (_, i) => addDays(today, -(13 - i)));

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Daily Log</h1>
          <p className="mt-1 text-[13.5px] text-ink-faint">What you studied on any given day.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/log?date=${addDays(date, -1)}`}
            className="grid size-9 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-leaf hover:text-leaf"
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <form action="/log" method="get">
            <input
              type="date"
              name="date"
              defaultValue={date}
              max={today}
              className="rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink"
            />
          </form>
          <Link
            href={addDays(date, 1) > today ? "/log" : `/log?date=${addDays(date, 1)}`}
            className={`grid size-9 place-items-center rounded-xl border border-line bg-white text-ink-soft transition hover:border-leaf hover:text-leaf ${addDays(date, 1) > today ? "pointer-events-none opacity-40" : ""}`}
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* activity strip */}
      <div className="rise rise-1 flex gap-1.5 overflow-x-auto pb-1">
        {strip.map((d) => {
          const has = (activity.get(d) ?? 0) > 0;
          const active = d === date;
          return (
            <Link
              key={d}
              href={`/log?date=${d}`}
              className={`flex min-w-[62px] flex-col items-center rounded-xl border px-2 py-2 transition ${
                active
                  ? "border-leaf bg-leaf text-white"
                  : "border-line bg-white text-ink-soft hover:border-leaf"
              }`}
            >
              <span className={`text-[9.5px] font-bold uppercase tracking-wide ${active ? "text-white/70" : "text-ink-faint"}`}>
                {formatDayLabel(d).slice(0, 3)}
              </span>
              <span className="text-[13px] font-bold tabular-nums">{d.slice(8)}</span>
              <span className={`mt-1 size-1.5 rounded-full ${has ? (active ? "bg-white" : "bg-leaf") : active ? "bg-white/30" : "bg-line-strong"}`} />
            </Link>
          );
        })}
      </div>

      {/* summary of the day */}
      <section className="rise rise-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Study Time", value: formatMinutes(log.minutes), icon: <Timer className="size-4 text-leaf" /> },
          { label: "Completed", value: String(log.completed) },
          { label: "In Progress", value: String(log.inProgress) },
          { label: "Not Completed", value: String(log.notCompleted) },
          { label: "Subjects", value: String(log.subjectsStudied.length) },
        ].map((s) => (
          <div key={s.label} className="card p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              {s.icon}{s.label}
            </p>
            <p className="mt-1 font-display text-[21px] font-bold tabular-nums text-ink">{s.value}</p>
          </div>
        ))}
      </section>

      <div className="rise rise-3 grid gap-4 lg:grid-cols-3">
        {/* Updates */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-[16px] font-semibold tracking-tight text-ink">
            Study Updates — {formatDayLabel(date)}
          </h2>
          {log.updates.length === 0 ? (
            <div className="card border-dashed p-10 text-center text-[13px] text-ink-faint">
              No study updates recorded on {date}.
            </div>
          ) : (
            <UpdateFeed updates={log.updates} subjects={subjectOpts} groupByDate={false} />
          )}
        </div>

        {/* Sessions + subjects */}
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Timed Sessions
            </h3>
            {log.sessions.length === 0 ? (
              <p className="text-[12.5px] text-ink-faint">No timer sessions this day.</p>
            ) : (
              <ul className="space-y-2">
                {log.sessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg bg-paper/60 px-3 py-2">
                    <Timer className="size-3.5 text-leaf" />
                    <span className="flex-1 truncate text-[12.5px] font-semibold text-ink">{s.subjectName}</span>
                    <span className="text-[12px] font-bold tabular-nums text-leaf">{formatMinutes(s.minutes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-4">
            <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Subjects Studied
            </h3>
            {log.subjectsStudied.length === 0 ? (
              <p className="text-[12.5px] text-ink-faint">—</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {log.subjectsStudied.map((n) => (
                  <span key={n} className="rounded-full bg-leaf-soft px-2.5 py-1 text-[11.5px] font-semibold text-leaf-deep">
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>

          {log.notCompleted > 0 && (
            <div className="card border-amber-200 bg-amber-50/50 p-4">
              <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                Skipped / Not completed
              </h3>
              <p className="text-[12.5px] text-amber-800">
                {log.notCompleted} item{log.notCompleted === 1 ? "" : "s"} were planned but not completed this day.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
