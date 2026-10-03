import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDataAction, getMasterCurriculumAction } from "@/actions/admin";
import { getAllFeedbacksAction } from "@/actions/feedback";
import { initializeDb } from "@/db";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await initializeDb();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?relogin=1");
  }

  const [data, currData, feedbackRes] = await Promise.all([
    getAdminDataAction(),
    getMasterCurriculumAction(),
    getAllFeedbacksAction().catch(() => ({ ok: true, feedbacks: [] })),
  ]);

  return (
    <div className="space-y-8">
      <header className="rise flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-leaf">
            Super Administrator Control
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Institution Management
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Create batches, assign teachers, monitor student rosters, and manage platform access
          </p>
        </div>
      </header>

      <AdminClient
        initialData={{
          ...data,
          curriculum: currData.curriculum,
          feedbacks: feedbackRes.feedbacks || [],
        }}
      />
    </div>
  );
}
