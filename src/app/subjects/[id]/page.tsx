import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDashed, Timer, XCircle } from "lucide-react";
import TopicManager from "@/components/TopicManager";
import { Donut, ProgressBar } from "@/components/ui";
import { formatMinutes } from "@/lib/dates";
import { getSubjectDetail } from "@/lib/queries";
import { STATUS_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subjectId = Number(id);
  if (!Number.isInteger(subjectId)) notFound();

  const detail = await getSubjectDetail(subjectId);
  if (!detail) notFound();

  const { subject, topics, recentItems, totalMinutes } = detail;
  const total = topics.length;
  const byStatus = {
    completed: topics.filter((t) => t.status === "completed").length,
    in_progress: topics.filter((t) => t.status === "in_progress").length,
    not_completed: topics.filter((t) => t.status === "not_completed").length,
    not_started: topics.filter((t) => t.status === "not_started").length,
  };
  const progress = total > 0 ? byStatus.completed / total : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link href="/subjects" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-faint transition hover:text-leaf py-1">
        <ArrowLeft className="size-4" /> All subjects
      </Link>

      <header className="card rise relative overflow-hidden p-4 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-leaf to-glow" />
        {/* Top: Donut and Subject Details */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Donut
            size={118}
            stroke={13}
            segments={[
              { value: byStatus.completed, color: STATUS_META.completed.color },
              { value: byStatus.in_progress, color: STATUS_META.in_progress.color },
              { value: byStatus.not_completed, color: STATUS_META.not_completed.color },
              { value: byStatus.not_started, color: STATUS_META.not_started.color },
            ]}
            centerLabel={`${Math.round(progress * 100)}%`}
            centerSub="done"
          />
          <div className="w-full flex-1 text-center sm:text-left">
            <p className="font-bengali text-[13px] text-ink-faint">{subject.nameBn}</p>
            <h1 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight text-ink">{subject.name}</h1>
            <div className="mt-3 w-full max-w-lg mx-auto sm:mx-0">
              <div className="mb-1 flex justify-between text-[11px] font-semibold tabular-nums text-ink-faint">
                <span>{byStatus.completed}/{total} topics completed</span>
                <span>{total - byStatus.completed} remaining</span>
              </div>
              <ProgressBar value={progress} shine={progress > 0 && progress < 1} />
            </div>
          </div>
        </div>

        {/* Bottom: 4 Full-Width Stat Cards */}
        <div className="mt-5 pt-4 border-t border-line/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 text-center w-full">
          {[
            { icon: CheckCircle2, label: "Done", value: byStatus.completed, cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200/60" },
            { icon: CircleDashed, label: "Doing", value: byStatus.in_progress, cls: "text-amber-600", bg: "bg-amber-50 border-amber-200/60" },
            { icon: XCircle, label: "Missed", value: byStatus.not_completed, cls: "text-rose-500", bg: "bg-rose-50 border-rose-200/60" },
            { icon: Timer, label: "Time", value: formatMinutes(totalMinutes), cls: "text-leaf", bg: "bg-leaf-soft border-leaf/20" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-paper/60 p-3 sm:p-4 transition hover:bg-paper hover:shadow-2xs">
              <span className={`mx-auto mb-1.5 grid size-8 place-items-center rounded-xl border ${s.bg} ${s.cls}`}>
                <s.icon className="size-4" />
              </span>
              <p className="font-display text-base sm:text-lg font-bold tabular-nums text-ink">{s.value}</p>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-faint mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="rise rise-1">
        <TopicManager subjectId={subject.id} topics={topics} />
      </section>

      {recentItems.length > 0 && (
        <section className="rise rise-2">
          <h2 className="mb-3 font-display text-[17px] font-semibold tracking-tight text-ink">
            Recent records in this paper
          </h2>
          <div className="card p-4">
            <ul className="divide-y divide-line">
              {recentItems.slice(0, 12).map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2 text-[13px]">
                  <span className={`size-2 rounded-full ${STATUS_META[r.status].dot}`} />
                  <span className="font-bengali flex-1 font-medium text-ink">{r.label}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_META[r.status].bg} ${STATUS_META[r.status].text}`}>
                    {STATUS_META[r.status].short}
                  </span>
                  <span className="w-20 text-right text-[11px] tabular-nums text-ink-faint">{r.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
