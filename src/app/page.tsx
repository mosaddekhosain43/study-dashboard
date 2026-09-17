import Link from "next/link";
import {
  AlarmClockCheck,
  AlertTriangle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  CircleDashed,
  Flame,
  Hourglass,
  Info,
  LibraryBig,
  ListChecks,
  Target,
  Timer,
  TrendingUp,
  XCircle,
} from "lucide-react";
import StudyComposer from "@/components/StudyComposer";
import UpdateFeed from "@/components/UpdateFeed";
import ClassroomCard from "@/components/ClassroomCard";
import {
  Donut,
  EmptyState,
  ProgressBar,
  SectionHeader,
  StatTile,
  StatusDot,
} from "@/components/ui";
import { redirect } from "next/navigation";
import { formatLong, formatMinutes, relativeDay, todayKey } from "@/lib/dates";
import { getDashboardData, getStudentClassroomData, getSubjects } from "@/lib/queries";
import { getTopicsForComposer } from "@/actions";
import { STATUS_META } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role === "admin") {
    redirect("/admin");
  }
  if (user.role === "teacher") {
    redirect("/teacher");
  }

  const [data, subjects, syllabus, classroom] = await Promise.all([
    getDashboardData(),
    getSubjects(),
    getTopicsForComposer(),
    getStudentClassroomData(),
  ]);
  const subjectOpts = subjects.map((s) => ({ id: s.id, name: s.name }));
  const today = formatLong(todayKey());

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-leaf">
            {today}
          </p>
          <h1 className="mt-1 font-display text-[30px] font-bold leading-none tracking-tight text-ink sm:text-[34px]">
            Alim Study Dashboard
          </h1>
          <p className="mt-1.5 text-[13.5px] text-ink-faint">
            Alim 2nd Year · 13 papers · Test Examination countdown active
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="card flex items-center gap-3 px-4 py-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-brand">
              <AlarmClockCheck className="size-4.5" />
            </span>
            <div>
              <p className="font-display text-[19px] font-bold leading-none tabular-nums text-ink">
                {data.exam.daysToExam}
              </p>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">
                days to Test Exam
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3 px-4 py-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-brand">
              <Target className="size-4.5" />
            </span>
            <div>
              <p className="font-display text-[19px] font-bold leading-none tabular-nums text-ink">
                {data.exam.daysToTarget}
              </p>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-faint">
                days to syllabus target · {data.exam.targetDate}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Composer ───────────────────────────────────────── */}
      <div className="rise rise-1">
        <StudyComposer subjects={subjectOpts} syllabus={syllabus} />
      </div>

      {/* ── Classroom Tasks & Materials (if enrolled in a batch) ─ */}
      {classroom && (
        <div className="rise rise-1">
          <ClassroomCard
            batchName={classroom.batch.name}
            batchId={classroom.batch.id}
            materials={classroom.materials}
            initialMessages={classroom.messages}
            userName={classroom.user.name}
          />
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="rise rise-2 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        <div className="card col-span-2 flex items-center gap-4 p-4 max-xl:row-span-1 sm:max-xl:col-span-3">
          <Donut
            size={120}
            stroke={14}
            segments={[
              { value: data.completed, color: STATUS_META.completed.color },
              { value: data.inProgress, color: STATUS_META.in_progress.color },
              { value: data.notCompleted, color: STATUS_META.not_completed.color },
              { value: data.notStarted, color: STATUS_META.not_started.color },
            ]}
            centerLabel={`${Math.round(data.progress * 100)}%`}
            centerSub="Overall"
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              Overall Syllabus
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              <span className="font-bold text-ink">{data.completed}</span> of{" "}
              <span className="font-bold text-ink">{data.total}</span> topics completed
            </p>
            <p className="mt-0.5 text-[12px] text-ink-faint">
              {data.remaining} remaining
            </p>
            {data.total === 0 && (
              <Link
                href="/syllabus"
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-leaf px-2.5 py-1 text-[11.5px] font-semibold text-white"
              >
                Set up syllabus <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
        <StatTile
          icon={<CheckCircle2 className="size-4 text-emerald-600" />}
          label="Completed"
          value={String(data.completed)}
          sub="topics done"
          accent="#0f9d6e"
        />
        <StatTile
          icon={<CircleDashed className="size-4 text-amber-600" />}
          label="In Progress"
          value={String(data.inProgress)}
          sub="being studied"
          accent="#e5a100"
        />
        <StatTile
          icon={<Hourglass className="size-4 text-slate-500" />}
          label="Remaining"
          value={String(data.remaining)}
          sub={`${data.notStarted} never started`}
          accent="#94a3b8"
        />
        <StatTile
          icon={<Timer className="size-4 text-leaf" />}
          label="Today's Time"
          value={formatMinutes(data.todayMinutes)}
          sub="study time logged"
          accent="#0c7a5b"
        />
        <StatTile
          icon={<Flame className="size-4 text-orange-500" />}
          label="Streak"
          value={`${data.streak}d`}
          sub={data.streak > 0 ? "keep it burning" : "study today to start"}
          accent="#f97316"
        />
      </section>

      {/* ── Target + alerts ────────────────────────────────── */}
      <section className="rise rise-3 grid gap-4 lg:grid-cols-5">
        <div className="card relative overflow-hidden p-5 lg:col-span-2">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-leaf to-glow" />
          <div className="flex items-center gap-2 text-leaf">
            <Target className="size-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Daily Target</p>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <p className="font-display text-[40px] font-bold leading-none tracking-tight text-ink">
              {data.target.doneToday}
              <span className="text-[22px] text-ink-faint"> / {data.target.todayTarget}</span>
            </p>
            <p className="pb-1 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
              topics today
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={data.target.todayTarget ? data.target.doneToday / data.target.todayTarget : 0}
              shine={data.target.doneToday < data.target.todayTarget}
            />
          </div>
          {data.target.remainingTopics > 0 ? (
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
              You need ≈{" "}
              <span className="font-bold text-ink">{data.target.perDay} topics/day</span> to finish{" "}
              {data.target.remainingTopics} topics by {data.exam.targetDate}.
              {data.target.behindThisWeek > 0 ? (
                <span className="font-bengali block mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[12px] font-medium text-amber-800">
                  {data.target.behindThisWeek} topic(s) behind this week — add ~{data.target.catchUpPerDay}{" "}
                  extra per remaining day.
                </span>
              ) : (
                <span className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                  <TrendingUp className="size-3.5" /> On pace — excellent.
                </span>
              )}
            </p>
          ) : (
            <p className="mt-3 text-[12.5px] text-ink-faint">
              Add your syllabus topics to unlock daily targets.
            </p>
          )}
        </div>

        <div className="card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <Info className="size-4 text-leaf" />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Smart Alerts
            </p>
          </div>
          {data.alerts.length === 0 ? (
            <p className="flex items-center gap-2 text-[13px] text-ink-faint">
              <CheckCircle2 className="size-4 text-emerald-600" />
              All clear — no warnings right now.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {data.alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5">
                  {a.kind === "warn" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  ) : a.kind === "success" ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Info className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{a.title}</p>
                    <p className="text-[12px] text-ink-faint">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Subjects ───────────────────────────────────────── */}
      <section className="rise rise-4">
        <SectionHeader
          title="Subject Overview"
          sub="All 13 papers — progress at a glance"
          action={
            <Link href="/subjects" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-leaf hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        {data.stats.every((s) => s.total === 0) ? (
          <EmptyState
            icon={<LibraryBig className="size-5" />}
            title="No syllabus topics yet"
            body="Enter your real syllabus chapter by chapter — the tracker only measures what you actually study."
            action={
              <Link href="/syllabus" className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-[12.5px] font-semibold text-white">
                Open Syllabus Setup <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.stats.map((s) => (
              <Link
                key={s.subject.id}
                href={`/subjects/${s.subject.id}`}
                className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-pop"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-leaf-soft font-display text-[13px] font-bold text-leaf">
                      {s.subject.sortOrder}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold leading-tight text-ink group-hover:text-leaf">
                        {s.subject.name}
                      </p>
                      <p className="font-bengali text-[11px] text-ink-faint">{s.subject.nameBn}</p>
                    </div>
                  </div>
                  <span className="font-display text-[15px] font-bold tabular-nums text-ink">
                    {Math.round(s.progress * 100)}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={s.progress} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-ink-faint">
                  <span className="flex items-center gap-1"><StatusDot status="completed" />{s.completed} done</span>
                  <span className="flex items-center gap-1"><StatusDot status="in_progress" />{s.inProgress} doing</span>
                  <span className="flex items-center gap-1"><XCircle className="size-3 text-rose-400" />{s.remaining} left</span>
                  <span className="ml-auto">
                    {s.lastStudied ? `studied ${relativeDay(s.lastStudied)}` : "never studied"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent + remaining peek ────────────────────────── */}
      <section className="rise rise-5 grid gap-4 lg:grid-cols-2">
        <div>
          <SectionHeader
            title="Recent Updates"
            sub="Your latest study records"
            action={
              <Link href="/log" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-leaf hover:underline">
                Daily log <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {data.recent.length === 0 ? (
            <EmptyState
              icon={<BookMarked className="size-5" />}
              title="No updates yet"
              body="Write your first study update above — plain Bangla works perfectly."
            />
          ) : (
            <UpdateFeed updates={data.recent} subjects={subjectOpts} compact />
          )}
        </div>
        <div>
          <SectionHeader
            title="Still Remaining"
            sub="Top backlog by subject"
            action={
              <Link href="/remaining" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-leaf hover:underline">
                Full list <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="card p-4">
            {data.stats.filter((s) => s.remaining > 0).length === 0 ? (
              <div className="flex items-center gap-2 py-6 text-[13px] text-ink-faint">
                <ListChecks className="size-4 text-emerald-600" />
                {data.total === 0
                  ? "Your remaining-list unlocks after you add syllabus topics."
                  : "Everything is completed. Incredible."}
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {data.stats
                  .filter((s) => s.remaining > 0)
                  .sort((a, b) => b.remaining - a.remaining)
                  .slice(0, 7)
                  .map((s) => (
                    <li key={s.subject.id}>
                      <Link
                        href={`/subjects/${s.subject.id}`}
                        className="flex items-center gap-3 py-2.5 hover:text-leaf"
                      >
                        <span className="w-40 truncate text-[13px] font-semibold text-ink">
                          {s.subject.name}
                        </span>
                        <div className="flex-1">
                          <ProgressBar value={s.progress} tone={s.progress < 0.3 ? "rose" : s.progress < 0.6 ? "amber" : "leaf"} height={6} />
                        </div>
                        <span className="w-16 text-right text-[11.5px] font-semibold tabular-nums text-ink-faint">
                          {s.remaining} left
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
