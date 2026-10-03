import Link from "next/link";
import {
  AlarmClockCheck,
  AlertTriangle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Flame,
  Hourglass,
  Info,
  LibraryBig,
  ListChecks,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  XCircle,
  Compass,
} from "lucide-react";
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
import { getStudentDailyTargetPlanAction } from "@/actions/planner";
import DailyTargetAndStudyPlanClient from "@/components/DailyTargetAndStudyPlanClient";
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

  const [data, subjects, classroom, dailyPlanRes] = await Promise.all([
    getDashboardData(),
    getSubjects(),
    getStudentClassroomData(),
    getStudentDailyTargetPlanAction(),
  ]);
  const dailyTargetPlan = dailyPlanRes?.ok ? dailyPlanRes.data : null;
  const subjectOpts = subjects.map((s) => ({ id: s.id, name: s.name }));
  const today = formatLong(todayKey());

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="rise flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight text-ink">
            {today}
          </h1>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:gap-2.5">
          <div className="card flex items-center gap-2.5 p-3 sm:px-4 sm:py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-brand sm:size-9">
              <AlarmClockCheck className="size-4 sm:size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none tabular-nums text-ink sm:text-[19px]">
                {data.exam.daysToExam}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint truncate sm:text-[10.5px]">
                {data.exam.daysToExam === 1 ? "DAY TO EXAM" : "DAYS TO EXAM"}
              </p>
            </div>
          </div>

          <div className="card flex items-center gap-2.5 p-3 sm:px-4 sm:py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-brand sm:size-9">
              <Target className="size-4 sm:size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none tabular-nums text-ink sm:text-[19px]">
                {data.exam.daysToTarget}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint truncate sm:text-[10.5px]">
                {data.exam.daysToTarget === 1 ? "DAY TO TARGET" : "DAYS TO TARGET"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats (mobile) ─────────────────────────────────── */}
      <section className="rise space-y-3 sm:hidden">
        <Link
          href="/subjects"
          className="relative flex items-center gap-4 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1f5a45] to-[#2d6b55] p-4 text-white shadow-card"
        >
          <div className="pointer-events-none absolute -right-10 -bottom-16 size-48 rounded-full bg-white/5" />
          <div className="relative grid size-[92px] shrink-0 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="9" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="#7ee8b5" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={`${Math.max(0.03, data.progress) * 263.9} 263.9`}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-[22px] font-bold leading-none">{Math.round(data.progress * 100)}%</p>
              <p className="mt-1 text-[8.5px] font-semibold tracking-[0.14em] text-white/75">OVERALL</p>
            </div>
          </div>
          <div className="h-16 w-px shrink-0 bg-white/25" />
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/80">Overall Syllabus</p>
            <p className="mt-1 text-[15px] leading-snug">
              <span className="font-bold">{data.completed}</span> of <span className="font-bold">{data.total}</span> topics completed
            </p>
            <p className="mt-0.5 text-[12.5px] text-white/70">{data.remaining} remaining</p>
          </div>
          <div className="flex flex-col items-end gap-3 self-stretch justify-center">
            <BookMarked className="size-5 text-white/80" />
            <ChevronRight className="size-4 text-white/80" />
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/subjects", label: "Completed", value: String(data.completed), sub: "topics done", icon: <CheckCircle2 className="size-5 text-white" />, iconBg: "bg-emerald-700/90 ring-8 ring-emerald-100", card: "bg-emerald-50/60 border-emerald-100", labelCls: "text-emerald-900" },
            { href: "/subjects", label: "In Progress", value: String(data.inProgress), sub: "being studied", icon: <CircleDashed className="size-5 text-amber-600" />, iconBg: "bg-amber-100", card: "bg-amber-50/60 border-amber-100", labelCls: "text-amber-900" },
            { href: "/remaining", label: "Remaining", value: String(data.remaining), sub: `${data.notStarted} never started`, icon: <Hourglass className="size-5 text-blue-800" />, iconBg: "bg-blue-100", card: "bg-blue-50/60 border-blue-100", labelCls: "text-blue-900" },
            { href: "/timer", label: "Today's Time", value: formatMinutes(data.todayMinutes), sub: "study time logged", icon: <Timer className="size-5 text-violet-700" />, iconBg: "bg-violet-100", card: "bg-violet-50/60 border-violet-100", labelCls: "text-violet-900" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className={`relative flex flex-col gap-2 rounded-[18px] border p-3.5 ${s.card}`}>
              <div className="flex items-center gap-2.5">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.iconBg}`}>{s.icon}</span>
                <p className={`text-[10.5px] font-bold uppercase tracking-[0.12em] ${s.labelCls}`}>{s.label}</p>
              </div>
              <div className="flex items-end justify-between">
                <div className="min-w-0">
                  <p className="font-display text-[26px] font-bold leading-none tabular-nums text-ink">{s.value}</p>
                  <p className="mt-1 truncate text-[11.5px] text-ink-soft">{s.sub}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink-faint" />
              </div>
            </Link>
          ))}
        </div>

        <Link href="/log" className="flex items-center gap-3.5 rounded-[18px] border border-rose-100 bg-rose-50/70 p-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rose-100">
            <Flame className="size-5 text-rose-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">Streak</p>
            <p className="font-display text-[26px] font-bold leading-none tabular-nums text-ink">{data.streak}d</p>
            <p className="mt-1 text-[11.5px] text-ink-soft">{data.streak > 0 ? "keep it burning" : "study today to start"}</p>
          </div>
          <div className="flex items-end gap-1">
            <span className="h-2.5 w-1.5 rounded-full bg-rose-200" />
            <span className="h-4 w-1.5 rounded-full bg-rose-300" />
            <span className="h-5 w-1.5 rounded-full bg-rose-300" />
          </div>
          <ChevronRight className="size-4 shrink-0 text-ink-faint" />
        </Link>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="rise hidden sm:grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
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
          icon={<Hourglass className="size-4 text-ink-faint" />}
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

      {/* ── Daily Target Pace, Suggested Books & Friday Revision ─ */}
      {dailyTargetPlan && dailyTargetPlan.totalTopics > 0 && (
        <section className="rise rise-1">
          <DailyTargetAndStudyPlanClient initialData={dailyTargetPlan} />
        </section>
      )}

      {/* ── Classroom Tasks & Materials (if enrolled in a batch) ─ */}
      {classroom && (
        <div className="rise rise-2">
          <ClassroomCard
            batchName={classroom.batch.name}
            batchId={classroom.batch.id}
            materials={classroom.materials}
            initialMessages={classroom.messages}
            userName={classroom.user.name}
          />
        </div>
      )}

      {data.total === 0 && (
        <div className="card rise p-5 border-leaf/40 bg-leaf-soft/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-leaf text-white shadow-sm shrink-0">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-ink">
                Set Up Your Exam Syllabus & Books
              </h2>
              <p className="text-xs text-ink-faint">
                Select your class books and exam chapters to get started with personalized tracking.
              </p>
            </div>
          </div>
          <Link
            href="/syllabus"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-leaf px-4 py-2.5 text-xs font-bold text-white transition hover:bg-leaf-deep shrink-0 shadow-sm"
          >
            <span>Set Up Syllabus</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}



      {/* ── Subjects ───────────────────────────────────────── */}
      <section className="rise rise-4">
        <SectionHeader
          title="Subject Overview"
          sub={`${data.stats.length > 0 ? `All ${data.stats.length} subjects` : "Subjects"} — progress at a glance`}
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
