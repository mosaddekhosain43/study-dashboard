import { getMinutesForDate, getSubjects } from "@/lib/queries";
import { todayKey } from "@/lib/dates";
import FocusTimer from "@/components/FocusTimer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Timer — Study Dashboard",
  description: "Distraction-free full screen study timer for deep focused learning sessions.",
};

export default async function TimerPage() {
  const [subjects, todayMinutes] = await Promise.all([
    getSubjects(),
    getMinutesForDate(todayKey()).catch(() => 0),
  ]);

  return (
    <div className="relative py-2 sm:py-4">
      <FocusTimer
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        initialTodayMinutes={todayMinutes}
      />
    </div>
  );
}
