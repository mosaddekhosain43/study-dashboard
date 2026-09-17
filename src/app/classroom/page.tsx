import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getStudentClassroomData } from "@/lib/queries";
import ClassroomChatClient from "@/components/ClassroomChatClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Classroom & Notes — Study Dashboard" };

export default async function ClassroomPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getStudentClassroomData();

  if (!data || !data.batch) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <GraduationCap className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">
          No Batch Assigned
        </h2>
        <p className="mt-2 text-xs text-ink-faint leading-relaxed">
          Your account is not assigned to a class batch yet. Please contact your administrator or teacher to assign you to a batch.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-leaf-deep transition"
        >
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rise flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-leaf transition"
            >
              <ArrowLeft className="size-3.5" /> Dashboard
            </Link>
            <span className="text-ink-faint/40">•</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
              <Users className="size-3" />
              {data.batch.name}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Classroom & Notes
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Batch updates, lesson materials, teacher notes & student discussion for {data.batch.name}.
          </p>
        </div>
      </header>

      {/* Interactive Classroom Client with Suspense for SearchParams */}
      <Suspense
        fallback={
          <div className="card p-12 text-center text-xs text-ink-faint">
            Loading Classroom...
          </div>
        }
      >
        <ClassroomChatClient
          batchId={data.batch.id}
          batchName={data.batch.name}
          currentUser={user}
          initialMessages={data.messages}
          materials={data.materials}
        />
      </Suspense>
    </div>
  );
}
