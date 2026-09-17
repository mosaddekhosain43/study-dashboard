"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import type { SessionUser } from "@/lib/auth";

interface AppShellProps {
  subjects: { id: number; name: string }[];
  user: SessionUser | null;
  children: React.ReactNode;
}

export default function AppShell({ subjects, user, children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-paper">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar subjects={subjects} user={user} />
      <div className="lg:pl-[272px]">
        <main className="mx-auto w-full max-w-[1380px] px-4 pb-16 pt-20 sm:px-7 lg:pt-8">
          {children}
        </main>
      </div>
    </>
  );
}
