import { redirect } from "next/navigation";
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

  return (
    <StudentOnboardingWizard
      initialData={res.data}
      isReconfiguring={isEditing}
      skipRedirectUrl="/"
    />
  );
}
