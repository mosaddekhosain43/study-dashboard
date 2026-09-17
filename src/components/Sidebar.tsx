"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CalendarRange,
  GraduationCap,
  Hourglass,
  LayoutDashboard,
  LibraryBig,
  LogIn,
  LogOut,
  Menu,
  NotebookPen,
  Search,
  Settings,
  ShieldCheck,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import TimerWidget from "@/components/TimerWidget";
import { logoutAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/auth";

interface SidebarProps {
  subjects: { id: number; name: string }[];
  user?: SessionUser | null;
}

export default function Sidebar({ subjects, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const groups = [
    {
      label: "Track",
      items: [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/update", label: "Study Update", icon: SquarePen },
        { href: "/subjects", label: "Subjects", icon: LibraryBig },
        { href: "/remaining", label: "Still Remaining", icon: Hourglass },
      ],
    },
    {
      label: "Review",
      items: [
        { href: "/log", label: "Daily Log", icon: CalendarDays },
        { href: "/weekly", label: "Weekly Review", icon: CalendarRange },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    ...(user?.role === "teacher" || user?.role === "admin"
      ? [
          {
            label: "Classroom",
            items: [
              { href: "/teacher", label: "Teacher Panel", icon: GraduationCap },
              ...(user.role === "admin"
                ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
                : []),
            ],
          },
        ]
      : []),
    {
      label: "Manage",
      items: [
        { href: "/syllabus", label: "Syllabus Setup", icon: NotebookPen },
        { href: "/search", label: "Search", icon: Search },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-lg shadow-leaf/30">
          <BookOpenCheck className="size-5" strokeWidth={2.2} />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[15px] font-semibold tracking-tight text-white">
            Alim Study
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200/50">
            2nd Year Dashboard
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/35">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                        active
                          ? "bg-emerald-400/10 text-emerald-50"
                          : "text-emerald-100/55 hover:bg-white/5 hover:text-emerald-50"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-glow to-leaf" />
                      )}
                      <Icon
                        className={`size-[17px] shrink-0 transition-colors ${
                          active ? "text-glow" : "text-emerald-100/40 group-hover:text-emerald-100/80"
                        }`}
                        strokeWidth={2}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 px-4 py-4 space-y-3">
        <TimerWidget subjects={subjects} />

        {user ? (
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-xs font-semibold text-white">
                {user.name}
              </p>
              <span className="inline-block rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="grid size-7 place-items-center rounded-lg text-emerald-100/50 transition hover:bg-white/10 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-xs font-semibold text-emerald-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogIn className="size-3.5" />
            Sign In / Register
          </Link>
        )}

        <div className="pt-2 text-center">
          <p className="text-[11px] text-emerald-100/40">
            Developed by{" "}
            <a
              href="https://www.facebook.com/mosaddek.hosain.rahi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-200/70 transition hover:text-white hover:underline"
            >
              Mosaddek Hosain
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper px-4 py-3 shadow-xs lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-sm shadow-leaf/20">
            <BookOpenCheck className="size-4" strokeWidth={2.2} />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-ink">Alim Study</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-lg border border-line bg-white text-ink active:scale-95 transition"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-white/5 bg-pine lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-pine/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-pine shadow-2xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
