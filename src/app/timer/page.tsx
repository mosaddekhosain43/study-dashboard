import { getSubjects } from "@/lib/queries";
import FocusTimer from "@/components/FocusTimer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Timer — Study Dashboard",
  description: "Distraction-free full screen study timer for deep focused learning sessions.",
};

export default async function TimerPage() {
  const subjects = await getSubjects();

  return (
    <div className="relative">
      <FocusTimer subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}
