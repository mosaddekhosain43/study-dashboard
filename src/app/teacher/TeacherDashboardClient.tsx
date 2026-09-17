"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FilePlus2,
  FileText,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  deleteBatchMaterialAction,
  postBatchMaterialAction,
  sendBatchMessageAction,
} from "@/actions/teacher";

interface Student {
  id: number;
  name: string;
  email: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  progressPercent: number;
  latestUpdateText: string | null;
  latestUpdateDate: string | null;
}

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

interface Batch {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  students: Student[];
  materials: Material[];
  messages: Message[];
}

interface Props {
  initialData: {
    teacherName: string;
    batches: Batch[];
  };
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function TeacherDashboardClient({ initialData, user }: Props) {
  const [batches, setBatches] = useState<Batch[]>(initialData.batches);
  const [activeBatchId, setActiveBatchId] = useState<number>(
    initialData.batches[0]?.id || 0
  );
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const activeBatch =
    batches.find((b) => b.id === activeBatchId) || batches[0];

  if (!activeBatch) {
    return (
      <div className="card p-12 text-center border border-line bg-card">
        <Users className="mx-auto size-12 text-ink-faint" />
        <h3 className="mt-4 font-display text-lg font-semibold text-ink">
          No Batches Assigned
        </h3>
        <p className="mt-1 text-xs text-ink-faint">
          You currently have no batches assigned to your teacher account. Please contact the administrator.
        </p>
      </div>
    );
  }

  const handlePostMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPosting(true);
    const fd = new FormData(e.currentTarget);
    fd.append("batchId", activeBatch.id.toString());

    try {
      const res = await postBatchMaterialAction(fd);
      if (res.ok) {
        setShowPostModal(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      await deleteBatchMaterialAction(id);
      setBatches((prev) =>
        prev.map((b) =>
          b.id === activeBatch.id
            ? { ...b, materials: b.materials.filter((m) => m.id !== id) }
            : b
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const content = chatInput.trim();
    setSendingChat(true);

    const tempMsg: Message = {
      id: Date.now(),
      content,
      createdAt: new Date(),
      senderName: user.name,
      senderRole: "teacher",
      isSelf: true,
    };

    setBatches((prev) =>
      prev.map((b) =>
        b.id === activeBatch.id
          ? { ...b, messages: [tempMsg, ...b.messages] }
          : b
      )
    );
    setChatInput("");

    const fd = new FormData();
    fd.append("batchId", activeBatch.id.toString());
    fd.append("content", content);

    try {
      await sendBatchMessageAction(fd);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  const avgProgress =
    activeBatch.students.length > 0
      ? Math.round(
          activeBatch.students.reduce(
            (acc, s) => acc + s.progressPercent,
            0
          ) / activeBatch.students.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Batch selector navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBatchId(b.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                b.id === activeBatch.id
                  ? "bg-pine text-white shadow-md shadow-pine/20"
                  : "border border-line bg-card text-ink-soft hover:bg-paper hover:text-ink"
              }`}
            >
              <Users className="size-3.5" />
              {b.name}
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${
                  b.id === activeBatch.id
                    ? "bg-white/20 text-white"
                    : "bg-paper text-ink-faint"
                }`}
              >
                {b.students.length}
              </span>
            </button>
          ))}
        </div>

        {user.role === "admin" && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-leaf transition hover:border-leaf hover:bg-leaf/5 shadow-xs"
          >
            <Settings className="size-3.5" />
            Manage Batches (Add / Delete)
          </Link>
        )}
      </div>

      {/* Batch summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 border border-line bg-card">
          <p className="text-xs font-semibold text-ink-faint">Enrolled Students</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-ink">
              {activeBatch.students.length}
            </span>
            <span className="text-xs text-ink-faint">in {activeBatch.name}</span>
          </div>
        </div>

        <div className="card p-5 border border-line bg-card">
          <p className="text-xs font-semibold text-ink-faint">Average Syllabus Progress</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-leaf">
              {avgProgress}%
            </span>
            <span className="text-xs text-ink-faint">completed overall</span>
          </div>
        </div>

        <div className="card p-5 border border-line bg-card">
          <p className="text-xs font-semibold text-ink-faint">Study Tasks Shared</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-ink">
              {activeBatch.materials.length}
            </span>
            <span className="text-xs text-ink-faint">notes & assignments</span>
          </div>
        </div>
      </div>

      {/* 2-column layout: Left = Students & Materials, Right = Classroom Chat */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Student Roster & Progress */}
          <section className="card overflow-hidden border border-line bg-card shadow-card">
            <div className="border-b border-line px-6 py-4 bg-paper/30">
              <h2 className="font-display text-base font-semibold text-ink">
                Student Progress Roster ({activeBatch.students.length})
              </h2>
              <p className="text-xs text-ink-faint">
                Real-time syllabus completion status for students in {activeBatch.name}
              </p>
            </div>

            {activeBatch.students.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-faint">
                No students enrolled in this batch yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-paper/40 font-semibold text-ink-soft">
                    <tr>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Syllabus Progress</th>
                      <th className="px-5 py-3">Completed Topics</th>
                      <th className="px-5 py-3">Recent Study Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {activeBatch.students.map((student) => (
                      <tr key={student.id} className="hover:bg-paper/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-ink">{student.name}</div>
                          <div className="text-[11px] text-ink-faint">{student.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-line">
                              <div
                                className="h-full bg-leaf rounded-full transition-all duration-300"
                                style={{ width: `${student.progressPercent}%` }}
                              />
                            </div>
                            <span className="font-semibold text-ink-soft">
                              {student.progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-ink-soft">
                          <span className="font-semibold text-leaf">
                            {student.completedTopics}
                          </span>{" "}
                          / {student.totalTopics}
                        </td>
                        <td className="px-5 py-3.5 max-w-[200px]">
                          {student.latestUpdateText ? (
                            <div>
                              <p className="truncate text-ink-soft font-medium">
                                {student.latestUpdateText}
                              </p>
                              <span className="text-[10px] text-ink-faint">
                                {student.latestUpdateDate}
                              </span>
                            </div>
                          ) : (
                            <span className="text-ink-faint italic">No update yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section: Assigned Homework & Study Notes */}
          <section className="card overflow-hidden border border-line bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper/30">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Assigned Tasks & PDF Notes ({activeBatch.materials.length})
                </h2>
                <p className="text-xs text-ink-faint">
                  Study instructions, homework, and PDF notes shared with this batch
                </p>
              </div>
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep"
              >
                <Plus className="size-3.5" />
                Post New Task
              </button>
            </div>

            <div className="p-6">
              {activeBatch.materials.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-faint">
                  No tasks or notes posted for {activeBatch.name} yet. Click "Post New Task" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBatch.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-paper/30 p-4 transition sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-ink">
                            {mat.title}
                          </h3>
                          {mat.dueDate && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                              <Calendar className="size-3" />
                              Due: {mat.dueDate}
                            </span>
                          )}
                        </div>
                        {mat.description && (
                          <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
                            {mat.description}
                          </p>
                        )}
                        {mat.fileUrl && (
                          <div className="flex items-center gap-2 pt-1 text-xs text-leaf font-medium">
                            <FileText className="size-3.5" />
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {mat.fileName || "Download Attached Material"}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 transition hover:bg-rose-50"
                          title="Delete material"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right col: Batch Discussion & Q&A */}
        <div className="lg:col-span-1">
          <section className="card flex flex-col h-[650px] overflow-hidden border border-line bg-card shadow-card">
            <div className="border-b border-line px-5 py-4 bg-paper/40">
              <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                <MessageSquare className="size-4 text-leaf" />
                Class Q&A Discussion
              </h2>
              <p className="text-xs text-ink-faint">
                {activeBatch.name} · Student questions & teacher answers
              </p>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-paper/20">
              {activeBatch.messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-ink-faint">
                  No questions asked yet in {activeBatch.name}.
                </div>
              ) : (
                activeBatch.messages.map((m) => (
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
                      className={`max-w-[90%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words ${
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

            {/* Send chat */}
            <form
              onSubmit={handleSendChat}
              className="border-t border-line p-3 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Reply to students (Bangla/English)..."
                className="flex-1 rounded-xl border border-line bg-paper/40 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || sendingChat}
                className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Post New Task Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Post Study Task & Materials
                </h3>
                <p className="text-xs text-ink-faint">
                  Assign homework or share PDF notes with {activeBatch.name}
                </p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="grid size-8 place-items-center rounded-lg border border-line bg-white text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handlePostMaterial} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Quran Surah Al-Baqarah Verses 1-20 & Tajweed Notes"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Instructions & Homework Details
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Write instructions, exercises to solve, or reading targets..."
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    File / PDF URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="fileUrl"
                    placeholder="https://drive.google.com/... or link"
                    className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                    File Label / Name
                  </label>
                  <input
                    type="text"
                    name="fileName"
                    placeholder="e.g. Lecture_Note_02.pdf"
                    className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2 text-xs text-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-60"
                >
                  <FilePlus2 className="size-3.5" />
                  {posting ? "Posting..." : "Publish Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
