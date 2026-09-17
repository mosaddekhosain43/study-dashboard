import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherDashboardData } from "@/actions/teacher";
import TeacherDashboardClient from "./TeacherDashboardClient";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login?relogin=1");
  }

  const data = await getTeacherDashboardData();

  return (
    <div className="space-y-8">
      <header className="rise flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-leaf">
            Teacher Classroom Panel
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome, {user.name}
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Manage your batches, monitor student syllabus progress, assign tasks & share study notes
          </p>
        </div>
      </header>

      <TeacherDashboardClient initialData={data} user={user} />
    </div>
  );
}
