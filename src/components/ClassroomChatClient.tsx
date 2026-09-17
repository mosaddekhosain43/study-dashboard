"use client";

import { useState } from "react";
import {
  MessageSquare,
  Pin,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  sendBatchMessageAction,
  togglePinBatchMessageAction,
} from "@/actions/teacher";

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
}

export default function ClassroomChatClient({
  batchId,
  batchName,
  currentUser,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isPinnedChecked, setIsPinnedChecked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isStaff = currentUser.role === "teacher" || currentUser.role === "admin";

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const regularMessages = messages;

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
          regularMessages.map((m) => {
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
                      onClick={() => handleTogglePin(m.id, m.isPinned)}
                      className="text-[10px] text-ink-faint hover:text-amber-700 transition underline ml-1"
                      title={m.isPinned ? "Unpin message" : "Pin notice"}
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
    </div>
  );
}
