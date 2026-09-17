"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Pin,
  Sparkles,
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
    <section className="card overflow-hidden border border-line bg-card p-4 sm:p-6 shadow-card space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf sm:size-10">
            <BookOpen className="size-4.5 sm:size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink leading-tight truncate">
              Class Tasks & Notes
            </h2>
            <p className="text-[11px] sm:text-xs text-ink-faint truncate">
              Teacher shared materials and batch updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
            <Users className="size-3" />
            {batchName}
          </span>
          <Link
            href="/classroom"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper/60 px-3.5 py-1.5 text-xs font-semibold text-leaf transition hover:border-leaf hover:bg-white shadow-2xs"
          >
            <MessageSquare className="size-3.5" />
            <span>Batch Chat & Q&A</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* Teacher Announcement / Pinned Notice Section (Student messages NOT shown here) */}
      {pinnedNotice ? (
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-amber-100/40 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Pin className="size-3.5 rotate-45 text-amber-700" />
              {pinnedNotice.isPinned ? "Pinned Teacher Notice" : "Teacher Announcement"}
            </span>
            <span className="text-[11px] font-medium text-amber-800/80">
              {pinnedNotice.senderName}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink font-medium whitespace-pre-wrap">
            {pinnedNotice.content}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-amber-900/70">
            <span>{new Date(pinnedNotice.createdAt).toLocaleDateString()}</span>
            <Link
              href="/classroom"
              className="font-semibold text-leaf hover:underline inline-flex items-center gap-1"
            >
              Discuss in Batch Chat <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-line bg-paper/30 px-4 py-3 text-xs">
          <span className="text-ink-faint flex items-center gap-2">
            <Sparkles className="size-3.5 text-amber-600" />
            No teacher announcements posted yet.
          </span>
          <Link
            href="/classroom"
            className="font-semibold text-leaf hover:underline inline-flex items-center gap-1"
          >
            Open Batch Chat <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      {/* Materials List */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider text-[11px]">
            Lesson Materials & Files ({materials.length})
          </p>
        </div>

        {materials.length === 0 ? (
          <div className="py-4 text-center text-xs text-ink-faint">
            No assignment files posted for your batch yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="group relative flex flex-col justify-between rounded-xl border border-line/80 bg-paper/40 p-3.5 transition-all hover:border-line-strong hover:bg-white shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xs sm:text-sm font-semibold text-ink">
                      {mat.title}
                    </h3>
                    {mat.dueDate && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200/60">
                        <Calendar className="size-3" />
                        Due {mat.dueDate}
                      </span>
                    )}
                  </div>
                  {mat.description && (
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft line-clamp-2">
                      {mat.description}
                    </p>
                  )}
                </div>

                {mat.fileUrl && (
                  <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint truncate max-w-[160px]">
                      <FileText className="size-3.5 shrink-0 text-leaf" />
                      {mat.fileName || "Lesson File"}
                    </span>
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-leaf px-2.5 py-1 text-xs font-medium text-white shadow-2xs transition hover:bg-leaf-deep"
                    >
                      <Download className="size-3" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
