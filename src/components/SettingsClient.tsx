"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Database,
  Download,
  Eraser,
  FileJson,
  FlaskConical,
  Save,
  Target,
  Upload,
} from "lucide-react";
import {
  clearAllDataAction,
  getBackupJsonAction,
  importBackupAction,
  loadDemoDataAction,
  saveExamSettingsAction,
} from "@/actions";

export default function SettingsClient({
  examDate,
  targetDate,
  counts,
}: {
  examDate: string;
  targetDate: string;
  counts: { topics: number; updates: number; sessions: number };
}) {
  const router = useRouter();
  const [exam, setExam] = useState(examDate);
  const [target, setTarget] = useState(targetDate);
  const [msg, setMsg] = useState<string | null>(null);
  const [dangerMsg, setDangerMsg] = useState<string | null>(null);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 4000);
  };

  const saveDates = () =>
    startTransition(async () => {
      const res = await saveExamSettingsAction(exam, target);
      flash(res.ok ? "Dates saved." : res.error);
      router.refresh();
    });

  const exportJson = async () => {
    const json = await getBackupJsonAction();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alim-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Backup downloaded — keep it somewhere safe.");
  };

  const importJson = (text: string) =>
    startTransition(async () => {
      const res = await importBackupAction(text);
      if (res.ok) {
        flash(`Restored: ${res.counts.subjects} subjects, ${res.counts.topics} topics, ${res.counts.updates} updates, ${res.counts.sessions} sessions.`);
      } else flash(res.error);
      router.refresh();
    });

  return (
    <div className="space-y-5">
      {msg && (
        <p className="rise flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="size-4" /> {msg}
        </p>
      )}

      {/* Exam configuration */}
      <section className="card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
          <CalendarClock className="size-4.5 text-leaf" /> Examination & Target
        </h2>
        <p className="mb-4 text-[12.5px] text-ink-faint">
          The countdown, daily target and catch-up recommendations are calculated from these two dates.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
              <CalendarClock className="size-3.5" /> Test Exam date (January)
            </span>
            <input
              type="date"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-semibold"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
              <Target className="size-3.5" /> Syllabus completion target
            </span>
            <input
              type="date"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-semibold"
            />
          </label>
          <button
            onClick={saveDates}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
          >
            <Save className="size-4" /> Save
          </button>
        </div>
      </section>

      {/* Backup */}
      <section className="card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
          <Database className="size-4.5 text-leaf" /> Backup & Restore
        </h2>
        <p className="mb-4 text-[12.5px] leading-relaxed text-ink-faint">
          Your data lives in a local database on this PC — {counts.topics} topics · {counts.updates} updates ·{" "}
          {counts.sessions} sessions right now. Export a JSON backup regularly; restore it any time (it replaces
          current data).
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper transition hover:bg-pine"
          >
            <Download className="size-4" /> Export JSON backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-soft transition hover:border-leaf hover:text-leaf"
          >
            <Upload className="size-4" /> Restore from backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              f.text().then(importJson);
              e.target.value = "";
            }}
          />
          <span className="flex items-center gap-1.5 text-[11.5px] text-ink-faint">
            <FileJson className="size-3.5" /> Dashboard backup files only
          </span>
        </div>
      </section>

      {/* Demo + danger */}
      <section className="card border-amber-200 bg-amber-50/30 p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display text-[16px] font-semibold text-ink">
          <FlaskConical className="size-4.5 text-amber-brand" /> Sample Data & Reset
        </h2>
        <p className="mb-4 text-[12.5px] text-ink-faint">
          Testing the app? Load a realistic demo syllabus with a month of study history. It <span className="font-semibold">replaces</span> your current data — export a backup first.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          {confirmDemo ? (
            <span className="flex items-center gap-2 text-[13px] font-semibold text-amber-800">
              Replace current data with demo data?
              <button
                onClick={() =>
                  startTransition(async () => {
                    await loadDemoDataAction();
                    setConfirmDemo(false);
                    flash("Demo data loaded.");
                    router.refresh();
                  })
                }
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-white"
              >
                Yes, load it
              </button>
              <button onClick={() => setConfirmDemo(false)} className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmDemo(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              <FlaskConical className="size-4" /> Load demo data…
            </button>
          )}

          {confirmClear ? (
            <span className="flex items-center gap-2 text-[13px] font-semibold text-rose-700">
              Permanently delete ALL topics, updates & sessions?
              <button
                onClick={() =>
                  startTransition(async () => {
                    await clearAllDataAction();
                    setConfirmClear(false);
                    setDangerMsg("All data cleared. Subjects remain.");
                    router.refresh();
                  })
                }
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-white"
              >
                Delete everything
              </button>
              <button onClick={() => setConfirmClear(false)} className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-line">
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Eraser className="size-4" /> Clear all study data…
            </button>
          )}
        </div>
        {dangerMsg && <p className="mt-3 text-[12.5px] font-medium text-rose-600">{dangerMsg}</p>}
      </section>

      {/* About the parser */}
      <section className="card p-5">
        <h2 className="mb-1 font-display text-[16px] font-semibold text-ink">About the Language Engine</h2>
        <p className="text-[12.5px] leading-relaxed text-ink-faint">
          The natural-language parser runs fully locally without internet. It understands informal study updates
          (subjects, paper numbers, statuses, study durations, and dates). If it is unsure, it asks you to confirm
          before saving.
        </p>
      </section>
    </div>
  );
}
