"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  Download,
  FileText,
  FolderDown,
  MessageSquare,
  Pin,
  Send,
  Users,
} from "lucide-react";
import {
  sendBatchMessageAction,
  togglePinBatchMessageAction,
} from "@/actions/teacher";

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
  isPinned: boolean;
  createdAt: Date;
  senderName: string;
  senderRole: string;
  isSelf: boolean;
}

interface Props {
  batchId: number;
  batchName: string;
  currentUser: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "teacher" | "student";
  };
  initialMessages: Message[];
  materials?: Material[];
}

export default function ClassroomChatClient({
  batchId,
  batchName,
  currentUser,
  initialMessages,
  materials = [],
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"notices" | "chat">(
    urlTab === "chat" ? "chat" : "notices"
  );

  useEffect(() => {
    if (urlTab === "chat" || urlTab === "notices") {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: "notices" | "chat") => {
    setActiveTab(tab);
    router.replace(`/classroom?tab=${tab}`, { scroll: false });
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isPinnedChecked, setIsPinnedChecked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isStaff = currentUser.role === "teacher" || currentUser.role === "admin";

  const teacherNotices = messages.filter(
    (m) => m.senderRole === "teacher" || m.senderRole === "admin"
  );
  const pinnedMessages = messages.filter((m) => m.isPinned);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setIsSending(true);

    const tempMsg: Message = {
      id: Date.now(),
      content,
      isPinned: isStaff && isPinnedChecked,
      createdAt: new Date(),
      senderName: currentUser.name,
      senderRole: currentUser.role,
      isSelf: true,
    };

    setMessages((prev) => [tempMsg, ...prev]);
    setInputText("");
    setIsPinnedChecked(false);

    const fd = new FormData();
    fd.append("batchId", batchId.toString());
    fd.append("content", content);
    if (isStaff && isPinnedChecked) {
      fd.append("isPinned", "true");
    }

    try {
      await sendBatchMessageAction(fd);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleTogglePin = async (messageId: number, currentPinState: boolean) => {
    const nextState = !currentPinState;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isPinned: nextState } : m))
    );

    try {
      await togglePinBatchMessageAction(messageId, nextState);
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  return (
    <div className="card overflow-hidden border border-line bg-card shadow-card">
      {/* ── Tab Switcher Header ─────────────────────────────────── */}
      <div className="flex border-b border-line bg-paper/40 p-2 gap-2">
        <button
          type="button"
          onClick={() => handleTabChange("notices")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
            activeTab === "notices"
              ? "bg-white text-pine shadow-xs border border-line font-bold"
              : "text-ink-faint hover:text-ink hover:bg-white/50"
          }`}
        >
          <Bell className="size-4 text-leaf" />
          <span>Notices & Study Materials</span>
          <span className="ml-1 rounded-full bg-leaf-soft px-2 py-0.5 text-[10.5px] font-bold text-leaf">
            {teacherNotices.length + materials.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("chat")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
            activeTab === "chat"
              ? "bg-white text-pine shadow-xs border border-line font-bold"
              : "text-ink-faint hover:text-ink hover:bg-white/50"
          }`}
        >
          <MessageSquare className="size-4 text-leaf" />
          <span>Batch Discussion</span>
          <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-[10.5px] font-bold text-ink-faint">
            {messages.length}
          </span>
        </button>
      </div>

      {/* ── Tab 1: Notices & Study Materials ──────────────────── */}
      {activeTab === "notices" && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Section: Teacher Notices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-line/60 pb-2">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <Bell className="size-4 text-amber-700" />
                Teacher Announcements & Notices ({teacherNotices.length})
              </h3>
              <span className="text-[11px] text-ink-faint">
                Official notices for {batchName}
              </span>
            </div>

            {teacherNotices.length === 0 ? (
              <div className="rounded-xl border border-line/60 bg-paper/30 py-8 text-center text-xs text-ink-faint">
                <Bell className="mx-auto size-8 text-ink-faint/30 mb-2" />
                No teacher notices have been posted for this batch yet.
              </div>
            ) : (
              <div className="space-y-3">
                {teacherNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`rounded-xl border p-4 shadow-2xs transition ${
                      notice.isPinned
                        ? "border-amber-300/80 bg-amber-50/70"
                        : "border-line bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-line/50 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          {notice.senderName}
                        </span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900 border border-amber-200">
                          Teacher
                        </span>
                        {notice.isPinned && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                            <Pin className="size-2.5 rotate-45" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-ink-faint">
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isStaff && (
                          <button
                            type="button"
                            onClick={() => handleTogglePin(notice.id, notice.isPinned)}
                            className="text-[11px] font-medium text-amber-800 hover:underline ml-2"
                          >
                            {notice.isPinned ? "Unpin" : "Pin"}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] text-ink leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Shared Files & Study Materials */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-line/60 pb-2">
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <FileText className="size-4 text-leaf" />
                Lesson Files & Study Notes ({materials.length})
              </h3>
              <span className="text-[11px] text-ink-faint">
                Course attachments & assignments
              </span>
            </div>

            {materials.length === 0 ? (
              <div className="rounded-xl border border-line/60 bg-paper/30 py-8 text-center text-xs text-ink-faint">
                <FolderDown className="mx-auto size-8 text-ink-faint/30 mb-2" />
                No shared files or lesson attachments uploaded yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex flex-col justify-between rounded-xl border border-line/80 bg-white p-4 shadow-2xs transition hover:border-leaf/50"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-leaf-soft text-leaf">
                            <FileText className="size-4.5" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-ink truncate leading-tight">
                              {mat.title}
                            </h4>
                            <p className="text-[10.5px] text-ink-faint truncate mt-0.5">
                              {mat.fileName || "Study Document"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {mat.description && (
                        <p className="mt-2.5 text-[11.5px] text-ink-soft line-clamp-2 leading-relaxed">
                          {mat.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-line/60 flex items-center justify-between gap-2">
                      {mat.dueDate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                          <Calendar className="size-3" /> Due {mat.dueDate}
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-ink-faint">
                          {new Date(mat.createdAt).toLocaleDateString()}
                        </span>
                      )}

                      {mat.fileUrl ? (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-pine/90"
                        >
                          <Download className="size-3" />
                          <span>Download File</span>
                        </a>
                      ) : (
                        <span className="text-[10.5px] text-ink-faint italic">
                          No file attached
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Batch Discussion Chat ──────────────────────── */}
      {activeTab === "chat" && (
        <>
          {/* Pinned Announcements Banner (if any) */}
          {pinnedMessages.length > 0 && (
            <div className="border-b border-amber-200/80 bg-amber-50/70 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Pin className="size-3.5 rotate-45 text-amber-700" />
                <span>Pinned Teacher Notice</span>
              </div>
              {pinnedMessages.map((pm) => (
                <div
                  key={pm.id}
                  className="rounded-xl border border-amber-200/60 bg-white/90 p-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-ink-faint pb-1 border-b border-amber-100 mb-1.5">
                    <span className="font-semibold text-amber-950">{pm.senderName}</span>
                    <span>{new Date(pm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                    {pm.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Message Stream */}
          <div className="flex flex-col-reverse h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4 space-y-reverse bg-paper/20">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-xs text-ink-faint">
                <MessageSquare className="mx-auto size-10 text-ink-faint/40 mb-3" />
                No messages in this batch yet. Feel free to ask a question or start the discussion!
              </div>
            ) : (
              messages.map((m) => {
                const isTeacher = m.senderRole === "teacher" || m.senderRole === "admin";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.isSelf ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-ink-soft">
                        {m.senderName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${
                          isTeacher
                            ? "bg-amber-100 text-amber-900 border border-amber-300/60 font-semibold"
                            : "bg-paper text-ink-faint border border-line/60"
                        }`}
                      >
                        {isTeacher ? "Teacher" : "Student"}
                      </span>
                      {m.isPinned && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700">
                          <Pin className="size-2.5 rotate-45" /> Pinned
                        </span>
                      )}
                      {isStaff && (
                        <button
                          type="button"
                          onClick={() => handleTogglePin(m.id, m.isPinned)}
                          className="text-[10px] text-ink-faint hover:text-amber-700 transition underline ml-1"
                          title={m.isPinned ? "Unpin notice" : "Pin notice"}
                        >
                          {m.isPinned ? "Unpin" : "Pin"}
                        </button>
                      )}
                    </div>

                    <div
                      className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words shadow-2xs ${
                        m.isSelf
                          ? "bg-leaf text-white rounded-br-none"
                          : isTeacher
                          ? "bg-amber-50/90 border border-amber-200 text-ink rounded-bl-none"
                          : "bg-white border border-line text-ink rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-line p-3 sm:p-4 bg-white space-y-2"
          >
            {isStaff && (
              <label className="flex items-center gap-2 text-xs text-amber-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinnedChecked}
                  onChange={(e) => setIsPinnedChecked(e.target.checked)}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Pin className="size-3 rotate-45" /> Pin as official announcement on dashboard
                </span>
              </label>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question or discuss (Bangla / English)..."
                className="flex-1 rounded-xl border border-line bg-paper/30 px-4 py-2.5 text-xs text-ink placeholder:text-ink-faint/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf/20"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-leaf px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50 shadow-sm"
              >
                <Send className="size-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
