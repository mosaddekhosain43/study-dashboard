"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { sendBatchMessageAction } from "@/actions/teacher";

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
  userName,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chatOpen, setChatOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setIsSending(true);

    const tempMsg: Message = {
      id: Date.now(),
      content,
      createdAt: new Date(),
      senderName: userName,
      senderRole: "student",
      isSelf: true,
    };
    setMessages((prev) => [tempMsg, ...prev]);
    setInputText("");

    const fd = new FormData();
    fd.append("batchId", batchId.toString());
    fd.append("content", content);

    try {
      await sendBatchMessageAction(fd);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <section className="card overflow-hidden border border-line bg-card p-4 sm:p-6 shadow-card">
        <div className="border-b border-line pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-leaf-soft text-leaf sm:size-10">
                <BookOpen className="size-4.5 sm:size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base sm:text-lg font-semibold text-ink leading-tight truncate">
                  Class Tasks & Notes
                </h2>
                <p className="text-[11px] sm:text-xs text-ink-faint truncate">
                  Teacher shared assignments and lesson notes
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
              <Users className="size-3" />
              {batchName}
            </span>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2">
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-leaf hover:bg-white active:scale-98"
            >
              <MessageSquare className="size-3.5 text-leaf" />
              Class Q&A Discussion ({messages.length})
            </button>
          </div>
        </div>

        <div className="mt-4">
          {materials.length === 0 ? (
            <div className="py-5 text-center text-xs text-ink-faint">
              No tasks or study notes posted for your batch yet. Check back soon!
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-line/80 bg-paper/50 p-4 transition-all hover:border-line-strong hover:bg-white"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold text-ink">
                        {mat.title}
                      </h3>
                      {mat.dueDate && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                          <Calendar className="size-3" />
                          Due {mat.dueDate}
                        </span>
                      )}
                    </div>
                    {mat.description && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-soft line-clamp-3">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  {mat.fileUrl && (
                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint truncate max-w-[180px]">
                        <FileText className="size-3.5 shrink-0 text-leaf" />
                        {mat.fileName || "Lesson File"}
                      </span>
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-leaf-deep"
                      >
                        <Download className="size-3.5" />
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

      {/* Classroom Q&A Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl border border-line bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-paper/60">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Class Discussion & Q&A
                </h3>
                <p className="text-xs text-ink-faint">
                  {batchName} · Ask questions in Bangla or English
                </p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line bg-white text-ink-faint transition hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-paper/20">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-ink-faint">
                  No questions asked yet. Be the first to start the discussion!
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.isSelf ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-ink-soft">
                        {m.senderName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${
                          m.senderRole === "teacher"
                            ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.senderRole}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed break-words ${
                        m.isSelf
                          ? "bg-leaf text-white rounded-br-none shadow-sm"
                          : "bg-white border border-line text-ink rounded-bl-none shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-line p-3 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question or reply (Bangla / English)..."
                className="flex-1 rounded-xl border border-line bg-paper/40 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                <Send className="size-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
