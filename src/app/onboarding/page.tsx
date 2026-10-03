import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingDataAction } from "@/actions/onboarding";
import StudentOnboardingWizard from "@/components/onboarding/StudentOnboardingWizard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Welcome & Setup — Study Dashboard",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
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

  const resolvedParams = await searchParams;
  const isEditing = resolvedParams?.edit === "true";

  const res = await getOnboardingDataAction();
  if (!res.ok || !res.data) {
    redirect("/");
  }

  // If already completed and not in edit mode, proceed to dashboard
  if (res.data.user.onboardingCompleted && !isEditing) {
    redirect("/");
  }

  // If editing, find currently enrolled book IDs
  let currentBookIds: number[] = [];
  if (isEditing) {
    const userSubs = await db
      .select({ id: subjects.id, name: subjects.name, slug: subjects.slug })
      .from(subjects)
      .where(eq(subjects.userId, user.id));

    const masterBooks = res.data.masterBooks || [];
    currentBookIds = masterBooks
      .filter((mb) =>
        userSubs.some(
          (s) => s.name === mb.name || (Boolean(s.slug) && Boolean(mb.slug) && s.slug.startsWith(mb.slug))
        )
      )
      .map((mb) => mb.id);
  }

  return (
    <StudentOnboardingWizard
      initialData={res.data}
      isReconfiguring={isEditing}
      initialBookIds={currentBookIds.length > 0 ? currentBookIds : undefined}
      skipRedirectUrl={isEditing ? "/syllabus" : "/"}
    />
  );
}
