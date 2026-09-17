import { CheckCircle2, CircleDashed, Languages, Lightbulb, XCircle, Circle } from "lucide-react";
import StudyComposer from "@/components/StudyComposer";
import UpdateFeed from "@/components/UpdateFeed";
import { SectionHeader } from "@/components/ui";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRecentUpdates, getSubjects } from "@/lib/queries";
import { getTopicsForComposer } from "@/actions";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = { title: "Study Update — Alim Study Dashboard" };

const PHRASEBOOK: { icon: typeof CheckCircle2; title: string; phrases: string[] }[] = [
  {
    icon: CheckCircle2,
    title: "Completed",
    phrases: ["Done", "Completed", "Finished", "শেষ হইছে", "পড়া শেষ"],
  },
  {
    icon: CircleDashed,
    title: "In Progress",
    phrases: ["Reading", "Studying", "Ongoing", "পড়ছি", "চলতেছে"],
  },
  {
    icon: XCircle,
    title: "Not Completed",
    phrases: ["Remaining", "Incomplete", "বাকি আছে", "শেষ হয়নি"],
  },
  {
    icon: Circle,
    title: "Not Started",
    phrases: ["To do", "Pending", "পড়ি নাই", "কাল পড়ব"],
  },
];

export default async function UpdatePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [subjects, syllabus, recent] = await Promise.all([
    getSubjects(),
    getTopicsForComposer(),
    getRecentUpdates(30),
  ]);
  const today = todayKey();
  const todays = recent.filter((u) => u.date === today);
  const subjectOpts = subjects.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-8">
      <header className="rise">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Study Update</h1>
        <p className="mt-1 text-[13.5px] text-ink-faint">
          Write naturally in plain language — the local parser automatically detects subjects, statuses, and durations.
        </p>
      </header>

      <div className="rise rise-1 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StudyComposer subjects={subjectOpts} syllabus={syllabus} autoFocus />
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Languages className="size-4 text-leaf" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                Phrasebook
              </p>
            </div>
            <div className="space-y-3.5">
              {PHRASEBOOK.map((g) => (
                <div key={g.title}>
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                    <g.icon className="size-3.5" /> {g.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {g.phrases.map((p) => (
                      <span key={p} className="rounded-full bg-paper px-2 py-0.5 text-[11.5px] text-ink-soft">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-leaf-soft/60 to-white p-5">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="size-4 text-amber-500" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Tips</p>
            </div>
            <ul className="list-disc space-y-1.5 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
              <li>Mention the subject clearly, e.g. "Bangla 1st", "Arabic 2nd", "ICT".</li>
              <li>Separate multiple topics with "and" or commas.</li>
              <li>Include durations like "2 hours" or "45 mins" to log study time.</li>
              <li>Write "yesterday" or specific dates to log retroactive study.</li>
              <li>Review and adjust the detected cards before saving.</li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="rise rise-2">
        <SectionHeader title="Today's Records" sub={`${todays.length} update${todays.length === 1 ? "" : "s"} saved today`} />
        {todays.length === 0 ? (
          <div className="card border-dashed p-8 text-center text-[13px] text-ink-faint">
            Nothing saved today yet — your updates will appear here.
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            <UpdateFeed updates={todays} subjects={subjectOpts} groupByDate={false} compact />
          </div>
        )}
      </section>
    </div>
  );
}
