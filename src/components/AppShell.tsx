"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import type { SessionUser } from "@/lib/auth";

import AppSplashScreen from "./AppSplashScreen";

interface AppShellProps {
  subjects: { id: number; name: string }[];
  user: SessionUser | null;
  children: React.ReactNode;
}

export default function AppShell({ subjects, user, children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";
  const isOnboardingPage = pathname === "/onboarding";

  if (isAuthPage) {
    return (
      <>
        <AppSplashScreen />
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-paper">
          {children}
        </main>
      </>
    );
  }

  if (isOnboardingPage) {
    return (
      <>
        <AppSplashScreen />
        <main className="min-h-screen w-full bg-paper">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <AppSplashScreen />
      <Sidebar subjects={subjects} user={user} />
      <div className="lg:pl-[272px]">
        <main className="mx-auto w-full max-w-[1380px] px-3.5 pb-20 pt-4 sm:px-7 sm:pt-8 sm:pb-16">
          {children}
        </main>
      </div>
    </>
  );
}
