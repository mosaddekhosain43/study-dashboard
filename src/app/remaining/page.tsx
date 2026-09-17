import Link from "next/link";
import { ArrowRight, CheckCircle2, Hourglass } from "lucide-react";
import { EmptyState, StatusChip } from "@/components/ui";
import { getRemaining, getSubjectStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Still Remaining — Study Dashboard" };

export default async function RemainingPage() {
  const [groups, stats] = await Promise.all([getRemaining(), getSubjectStats()]);
  const totalRemaining = stats.reduce((a, s) => a + s.remaining, 0);
  const totalTopics = stats.reduce((a, s) => a + s.total, 0);

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Still Remaining</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          Everything that is <span className="font-semibold text-ink">not yet completed</span>, grouped by paper.{" "}
          {totalTopics > 0 && (
            <>
              <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-bold text-amber-700 ring-1 ring-amber-200">
                {totalRemaining} topics left
              </span>
            </>
          )}
        </p>
      </header>

      {totalTopics === 0 ? (
        <EmptyState
          icon={<Hourglass className="size-5" />}
          title="No syllabus yet"
          body="Once you enter your syllabus, every unfinished topic appears here automatically."
          action={
            <Link href="/syllabus" className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-[12.5px] font-semibold text-white">
              Add syllabus <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-5" />}
          title="Great job! Everything is completed"
          body="All syllabus topics are marked complete. Time for revision."
        />
      ) : (
        <div className="rise rise-1 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.subject.id} className="card overflow-hidden">
              <Link
                href={`/subjects/${g.subject.id}`}
                className="flex items-center justify-between border-b border-line bg-paper/50 px-4 py-3 transition hover:bg-paper"
              >
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">{g.subject.name}</p>
                  <p className="font-bengali text-[11px] text-ink-faint">{g.subject.nameBn}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-amber-700 ring-1 ring-amber-200">
                  {g.items.length} left
                </span>
              </Link>
              <ul className="max-h-[340px] divide-y divide-line overflow-y-auto">
                {g.items.map((t) => (
                  <li key={t.id} className="flex items-start gap-2.5 px-4 py-2.5">
                    <div className="pt-0.5">
                      <StatusChip status={t.status} small />
                    </div>
                    <span className="flex-1 text-[13px] font-medium text-ink break-words leading-snug">{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
