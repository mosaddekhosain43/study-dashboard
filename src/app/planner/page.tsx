import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStudentStudyPlanAction } from "@/actions/planner";
import StudyGuidePlannerClient from "@/components/StudyGuidePlannerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study Guide & Exam Routine — Study Dashboard",
  description: "Personalized daily target, routine, and spaced repetition revision guide.",
};

export default async function PlannerPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const res = await getStudentStudyPlanAction();
  if (!res.ok || !res.plan) {
    return (
      <div className="card p-8 text-center text-rose-600">
        {res.error || "Failed to load study plan."}
      </div>
    );
  }

  return <StudyGuidePlannerClient initialPlan={res.plan} />;
}
