"use client";

import Link from "next/link";
import {
  Bell,
  BellRing,
  FileText,
  GraduationCap,
  MessageSquare,
  Pin,
  Users,
} from "lucide-react";

interface Material {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  dueDate: string | null;
  createdAt: Date;
}

interface Message {
  id: number;
  content: string;
  isPinned?: boolean;
  createdAt: Date;
  senderName: string;
  senderRole: string;
  isSelf: boolean;
}

interface Props {
  batchName: string;
  batchId: number;
  materials: Material[];
  initialMessages: Message[];
  userName: string;
}

export default function ClassroomCard({
  batchName,
  materials,
  initialMessages,
}: Props) {
  // Only teacher or admin announcements are shown on the dashboard summary
  const teacherAnnouncements = initialMessages.filter(
    (m) => m.senderRole === "teacher" || m.senderRole === "admin"
  );
  const latestNotice =
    teacherAnnouncements.find((m) => m.isPinned) || teacherAnnouncements[0];

  const fileCount = materials.length;

  return (
    <section className="card overflow-hidden border border-line bg-card p-4 sm:p-5 shadow-card transition-all hover:shadow-card-hover">
      {/* ── Header: Title, Batch Badge & File Count Badge ────── */}
      <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-line/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-sm shadow-leaf/25">
            <GraduationCap className="size-4 sm:size-4.5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[15px] sm:text-base font-bold text-ink tracking-tight">
              Classroom
            </h2>
            <p className="text-[11px] text-ink-faint truncate">
              Teacher updates & study materials
            </p>
          </div>
        </div>

        {/* Batch name and file count badges aligned side by side */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60 whitespace-nowrap">
            <Users className="size-3 text-emerald-600" />
            {batchName}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60 whitespace-nowrap">
            <FileText className="size-3 text-blue-600" />
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
        </div>
      </div>

      {/* ── Content: Latest Teacher Notice / Announcement ──────── */}
      <div className="py-3">
        {latestNotice ? (
          <div className="relative rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                {latestNotice.isPinned ? (
                  <>
                    <Pin className="size-3.5 rotate-45 text-amber-700" />
                    <span>Pinned Teacher Notice</span>
                  </>
                ) : (
                  <>
                    <Bell className="size-3.5 text-amber-700" />
                    <span>Teacher Announcement</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80">
                <span className="font-semibold">{latestNotice.senderName}</span>
                <span>•</span>
                <span>
                  {new Date(latestNotice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-[12.5px] leading-relaxed text-ink line-clamp-3 whitespace-pre-wrap font-normal">
              {latestNotice.content}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-paper/50 px-3.5 py-3 text-xs border border-line/60 text-ink-faint">
            <BellRing className="size-4 text-leaf shrink-0" />
            <span>No teacher announcements today. You are all caught up!</span>
          </div>
        )}
      </div>

      {/* ── Bottom Action Buttons: Open Chat & Open Notices ─────── */}
      <div className="pt-3 border-t border-line/70 grid grid-cols-2 gap-2.5 sm:gap-3">
        <Link
          href="/classroom?tab=chat"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper/80 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:bg-emerald-50 hover:text-leaf hover:border-emerald-200 active:scale-[0.99] whitespace-nowrap"
        >
          <MessageSquare className="size-3.5 text-leaf shrink-0" />
          <span>Open Chat</span>
        </Link>

        <Link
          href="/classroom?tab=notices"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-pine px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-pine/20 transition hover:bg-pine/90 active:scale-[0.99] whitespace-nowrap"
        >
          <Bell className="size-3.5 text-glow shrink-0" />
          <span>Open Notices</span>
        </Link>
      </div>
    </section>
  );
}
