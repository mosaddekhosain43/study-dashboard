"use client";

import { useState } from "react";
import {
  FolderPlus,
  GraduationCap,
  Layers,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createBatchAction,
  createTeacherAction,
  deleteBatchAction,
  deleteUserAction,
} from "@/actions/admin";

interface Batch {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  studentCount: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  assignedBatches: string[];
  assignedBatchIds: number[];
  createdAt: Date;
}

interface Student {
  id: number;
  name: string;
  email: string;
  batchName: string;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  createdAt: Date;
}

interface Props {
  initialData: {
    batches: Batch[];
    teachers: Teacher[];
    students: Student[];
  };
}

export default function AdminClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"batches" | "teachers" | "students">("batches");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createBatchAction(fd);
      if (res.ok) {
        setShowBatchModal(false);
        window.location.reload();
      } else {
        setError(res.error || "Failed to create batch.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!confirm("Are you sure you want to delete this batch? All associated data will be removed.")) return;
    try {
      const res = await deleteBatchAction(id);
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          batches: prev.batches.filter((b) => b.id !== id),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createTeacherAction(fd);
      if (res.ok) {
        setShowTeacherModal(false);
        window.location.reload();
      } else {
        setError(res.error || "Failed to create teacher.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, role: "teacher" | "student") => {
    if (!confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      const res = await deleteUserAction(id);
      if (res.ok) {
        if (role === "teacher") {
          setData((prev) => ({
            ...prev,
            teachers: prev.teachers.filter((t) => t.id !== id),
          }));
        } else {
          setData((prev) => ({
            ...prev,
            students: prev.students.filter((s) => s.id !== id),
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 border border-line bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-faint">Registered Students</span>
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-leaf">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            {data.students.length}
          </p>
        </div>

        <div className="card p-5 border border-line bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-faint">Active Teachers</span>
            <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            {data.teachers.length}
          </p>
        </div>

        <div className="card p-5 border border-line bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-faint">Class Batches</span>
            <span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Layers className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            {data.batches.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-line pb-3">
        <button
          onClick={() => setActiveTab("batches")}
          className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "batches"
              ? "bg-pine text-white shadow-md shadow-pine/20"
              : "border border-line bg-card text-ink-soft hover:bg-paper hover:text-ink"
          }`}
        >
          Class Batches ({data.batches.length})
        </button>
        <button
          onClick={() => setActiveTab("teachers")}
          className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "teachers"
              ? "bg-pine text-white shadow-md shadow-pine/20"
              : "border border-line bg-card text-ink-soft hover:bg-paper hover:text-ink"
          }`}
        >
          Teachers ({data.teachers.length})
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "students"
              ? "bg-pine text-white shadow-md shadow-pine/20"
              : "border border-line bg-card text-ink-soft hover:bg-paper hover:text-ink"
          }`}
        >
          All Students ({data.students.length})
        </button>
      </div>

      {/* TAB 1: Batches */}
      {activeTab === "batches" && (
        <section className="card overflow-hidden border border-line bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 sm:px-6 py-4 bg-paper/30">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Class Batches
              </h2>
              <p className="text-xs text-ink-faint">
                Manage your academic batches
              </p>
            </div>
            <button
              onClick={() => setShowBatchModal(true)}
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-leaf-deep"
            >
              <Plus className="size-3.5" />
              Create Batch
            </button>
          </div>

          {/* Mobile Card List (sm:hidden) */}
          <div className="divide-y divide-line/60 sm:hidden">
            {data.batches.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-ink-faint">
                No batches created yet. Click "Create Batch" above.
              </div>
            ) : (
              data.batches.map((b) => (
                <div key={b.id} className="p-4 space-y-2.5 hover:bg-paper/30 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-ink">{b.name}</span>
                    <button
                      onClick={() => handleDeleteBatch(b.id)}
                      className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 shadow-xs transition hover:bg-rose-50 shrink-0"
                      title="Delete batch"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-faint border border-line/60">
                      {b.slug}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200/60 whitespace-nowrap">
                      <Users className="size-3" />
                      {b.studentCount} students
                    </span>
                  </div>
                  {b.description && (
                    <p className="text-xs text-ink-soft leading-relaxed">{b.description}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-line bg-paper/40 font-semibold text-ink-soft whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3">Batch Name</th>
                  <th className="px-6 py-3">Identifier (Slug)</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Enrolled Students</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {data.batches.map((b) => (
                  <tr key={b.id} className="hover:bg-paper/30 transition">
                    <td className="px-6 py-4 font-semibold text-ink whitespace-nowrap">{b.name}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-ink-faint whitespace-nowrap">{b.slug}</td>
                    <td className="px-6 py-4 text-ink-soft">{b.description || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60 whitespace-nowrap">
                        <Users className="size-3" />
                        {b.studentCount} students
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteBatch(b.id)}
                        className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 transition hover:bg-rose-50 ml-auto"
                        title="Delete batch"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: Teachers */}
      {activeTab === "teachers" && (
        <section className="card overflow-hidden border border-line bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 sm:px-6 py-4 bg-paper/30">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Teacher Accounts
              </h2>
              <p className="text-xs text-ink-faint">
                Add teacher credentials and assign them to specific class batches
              </p>
            </div>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl bg-leaf px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-leaf-deep"
            >
              <Plus className="size-3.5" />
              Add Teacher
            </button>
          </div>

          {/* Mobile Card View (sm:hidden) */}
          <div className="divide-y divide-line/60 sm:hidden">
            {data.teachers.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-ink-faint">
                No teacher accounts created yet. Click "Add Teacher" above.
              </div>
            ) : (
              data.teachers.map((t) => (
                <div key={t.id} className="p-4 space-y-2.5 hover:bg-paper/30 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-ink">{t.name}</span>
                    <button
                      onClick={() => handleDeleteUser(t.id, "teacher")}
                      className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 shadow-xs transition hover:bg-rose-50 shrink-0"
                      title="Delete teacher"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-ink-faint font-mono">{t.email}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {t.assignedBatches.length === 0 ? (
                      <span className="text-xs text-ink-faint italic">No batches assigned</span>
                    ) : (
                      t.assignedBatches.map((name) => (
                        <span
                          key={name}
                          className="rounded-md bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft border border-line"
                        >
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-line bg-paper/40 font-semibold text-ink-soft whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3">Teacher Name</th>
                  <th className="px-6 py-3">Login Email</th>
                  <th className="px-6 py-3">Assigned Batches</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {data.teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-ink-faint">
                      No teacher accounts created yet. Click "Add Teacher" above.
                    </td>
                  </tr>
                ) : (
                  data.teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-paper/30 transition">
                      <td className="px-6 py-4 font-semibold text-ink whitespace-nowrap">{t.name}</td>
                      <td className="px-6 py-4 text-ink-soft whitespace-nowrap">{t.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {t.assignedBatches.length === 0 ? (
                            <span className="text-ink-faint italic">No batches</span>
                          ) : (
                            t.assignedBatches.map((name) => (
                              <span
                                key={name}
                                className="rounded bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft border border-line"
                              >
                                {name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(t.id, "teacher")}
                          className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 transition hover:bg-rose-50 ml-auto"
                          title="Delete teacher"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: Students */}
      {activeTab === "students" && (
        <section className="card overflow-hidden border border-line bg-card shadow-card">
          <div className="border-b border-line px-4 sm:px-6 py-4 bg-paper/30">
            <h2 className="font-display text-base font-semibold text-ink">
              All Registered Students ({data.students.length})
            </h2>
            <p className="text-xs text-ink-faint">
              Master student directory with syllabus progress status
            </p>
          </div>

          {/* Mobile Card View (sm:hidden) */}
          <div className="divide-y divide-line/60 sm:hidden">
            {data.students.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-ink-faint">
                No students registered yet.
              </div>
            ) : (
              data.students.map((s) => (
                <div key={s.id} className="p-4 space-y-2.5 hover:bg-paper/30 transition">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-ink truncate">{s.name}</h3>
                      <p className="text-xs text-ink-faint font-mono truncate">{s.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(s.id, "student")}
                      className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 shadow-xs transition hover:bg-rose-50 shrink-0"
                      title="Delete student"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <span className="rounded-md bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft border border-line">
                      {s.batchName}
                    </span>
                    <span className="text-ink-soft">
                      <span className="font-semibold text-leaf">{s.completedTopics}</span> / {s.totalTopics} topics
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-ink-faint">
                      <span>Syllabus Progress</span>
                      <span className="font-semibold text-leaf">{s.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full bg-leaf rounded-full transition-all duration-300"
                        style={{ width: `${s.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-line bg-paper/40 font-semibold text-ink-soft whitespace-nowrap">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Batch</th>
                  <th className="px-6 py-3">Syllabus Progress</th>
                  <th className="px-6 py-3">Topics Completed</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {data.students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-ink-faint">
                      No students registered yet.
                    </td>
                  </tr>
                ) : (
                  data.students.map((s) => (
                    <tr key={s.id} className="hover:bg-paper/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-ink">{s.name}</div>
                        <div className="text-[11px] text-ink-faint font-mono">{s.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="rounded-md bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft border border-line">
                          {s.batchName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full bg-leaf rounded-full"
                              style={{ width: `${s.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-semibold text-ink-soft">
                            {s.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-ink-soft whitespace-nowrap">
                        <span className="font-semibold text-leaf">
                          {s.completedTopics}
                        </span>{" "}
                        / {s.totalTopics}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(s.id, "student")}
                          className="grid size-8 place-items-center rounded-lg border border-line bg-white text-rose-600 transition hover:bg-rose-50 ml-auto"
                          title="Delete student"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-display text-base font-semibold text-ink">
                Create Academic Batch
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="grid size-8 place-items-center rounded-lg border border-line bg-white text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Batch Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alim 2027"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="e.g. Alim Second Year Examination Candidate Batch 2027"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-60"
                >
                  <FolderPlus className="size-3.5" />
                  {loading ? "Creating..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-display text-base font-semibold text-ink">
                Add New Teacher Account
              </h3>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="grid size-8 place-items-center rounded-lg border border-line bg-white text-ink-faint hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Mawlana Ahmadullah"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Teacher Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="teacher@alim.edu"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Initial Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-line bg-paper/30 px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-faint/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Assign Batches
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-line bg-paper/20">
                  {data.batches.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-xs text-ink hover:bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="batchIds"
                        value={b.id}
                        className="rounded border-line text-leaf focus:ring-leaf"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-60"
                >
                  <UserPlus className="size-3.5" />
                  {loading ? "Creating..." : "Save Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
