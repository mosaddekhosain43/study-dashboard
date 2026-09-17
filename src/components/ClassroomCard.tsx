"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Calendar,
  Download,
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
  batchId,
  materials,
  initialMessages,
}: Props) {
  // Only teacher or admin announcements are shown here on the dashboard card
  const teacherAnnouncements = initialMessages.filter(
    (m) => m.senderRole === "teacher" || m.senderRole === "admin"
  );
  const pinnedNotice = teacherAnnouncements.find((m) => m.isPinned) || teacherAnnouncements[0];

  return (
    <section className="card overflow-hidden border border-line bg-card p-4 sm:p-5 shadow-card transition-all hover:shadow-card-hover">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-line/70">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-sm shadow-leaf/25">
            <GraduationCap className="size-4.5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[15px] sm:text-base font-bold text-ink tracking-tight">
                Classroom & Notes
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60">
                <Users className="size-2.5" />
                {batchName}
              </span>
            </div>
            <p className="text-[11.5px] text-ink-faint">
              Teacher updates, classroom files & batch discussion
            </p>
          </div>
        </div>

        <Link
          href="/classroom"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-pine px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-pine/20 transition hover:bg-pine/90 active:scale-98"
        >
          <MessageSquare className="size-3.5" />
          <span>Batch Chat & Q&A</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* ── Teacher Notice / Announcement ───────────────────────── */}
      <div className="pt-3.5 space-y-3">
        {pinnedNotice ? (
          <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Pin className="size-3.5 rotate-45 text-amber-700" />
                <span>{pinnedNotice.isPinned ? "Pinned Teacher Notice" : "Teacher Announcement"}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-800/80">
                <span className="font-semibold">{pinnedNotice.senderName}</span>
                <span>•</span>
                <span>{new Date(pinnedNotice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink font-medium whitespace-pre-wrap">
              {pinnedNotice.content}
            </p>

            <div className="mt-2.5 pt-2 flex items-center justify-end border-t border-amber-100">
              <Link
                href="/classroom"
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-leaf transition hover:underline"
              >
                Reply or discuss in Classroom <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-paper/50 px-3.5 py-2.5 text-xs border border-line/60">
            <div className="flex items-center gap-2 text-ink-faint">
              <BellRing className="size-3.5 text-leaf" />
              <span>No teacher announcements today. You are all caught up!</span>
            </div>
            <Link
              href="/classroom"
              className="text-[11.5px] font-semibold text-leaf transition hover:underline inline-flex items-center gap-1"
            >
              Open Chat <ArrowRight className="size-3" />
            </Link>
          </div>
        )}

        {/* ── Shared Files / Materials ──────────────────────────── */}
        {materials.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                Shared Files & Tasks ({materials.length})
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-white p-3 shadow-2xs transition hover:border-leaf/50"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-leaf-soft text-leaf">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-ink truncate leading-tight">
                        {mat.title}
                      </p>
                      {mat.dueDate ? (
                        <p className="text-[10.5px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="size-2.5" /> Due {mat.dueDate}
                        </p>
                      ) : (
                        <p className="text-[10.5px] text-ink-faint truncate mt-0.5">
                          {mat.fileName || "Lesson Attachment"}
                        </p>
                      )}
                    </div>
                  </div>

                  {mat.fileUrl && (
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:bg-leaf hover:text-white border border-line"
                    >
                      <Download className="size-3" />
                      Get
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
