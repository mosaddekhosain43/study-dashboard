"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Timer } from "lucide-react";
import {
  getTimerAction,
  timerPauseAction,
  timerResumeAction,
  timerStartAction,
  timerStopAction,
} from "@/actions";
import type { TimerState } from "@/lib/constants";

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function elapsedOf(t: TimerState | null, now: number): number {
  if (!t) return 0;
  return t.accumulatedMs + (t.running ? now - t.startedAt : 0);
}

export default function TimerWidget({
  subjects,
}: {
  subjects: { id: number; name: string }[];
}) {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [selected, setSelected] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const timerRef = useRef<TimerState | null>(null);
  timerRef.current = timer;

  useEffect(() => {
    getTimerAction().then((t) => {
      setTimer(t);
      if (t?.subjectId) setSelected(t.subjectId);
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const run = async (fn: () => Promise<unknown>, next?: TimerState | null) => {
    if (busy) return;
    setBusy(true);
    if (next !== undefined) setTimer(next);
    try {
      await fn();
      const fresh = await getTimerAction();
      setTimer(fresh);
    } finally {
      setBusy(false);
    }
  };

  const elapsed = elapsedOf(timer, Date.now());
  const running = Boolean(timer?.running);
  const hasTime = elapsed > 0;

  return (
    <div className="rounded-2xl border border-white/8 bg-pine-2 p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
          <Timer className="size-3.5" /> Study Timer
        </span>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-glow">
            <span className="ticking inline-block size-1.5 rounded-full bg-glow" /> LIVE
          </span>
        )}
      </div>

      <p
        className={`font-display text-[26px] font-semibold tabular-nums tracking-tight ${
          running ? "text-white" : "text-emerald-50/70"
        }`}
      >
        {fmt(elapsed)}
      </p>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : "")}
        className="mt-2 w-full rounded-lg border border-white/10 bg-pine-3 px-2.5 py-1.5 text-xs text-emerald-50/90"
      >
        <option value="">General / Mixed study</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <div className="mt-2.5 flex gap-2">
        {!running ? (
          <button
            disabled={busy}
            onClick={() =>
              hasTime
                ? run(
                    () => timerResumeAction(),
                    timer ? { ...timer, running: true, startedAt: Date.now() } : null,
                  )
                : run(
                    () => timerStartAction(selected === "" ? null : selected),
                    { subjectId: selected === "" ? null : selected, startedAt: Date.now(), accumulatedMs: 0, running: true },
                  )
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-glow/90 py-1.5 text-xs font-semibold text-pine transition hover:bg-glow disabled:opacity-50"
          >
            <Play className="size-3.5" /> {hasTime && !running ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => run(() => timerPauseAction(), timer ? { ...timer, running: false, accumulatedMs: elapsedOf(timer, Date.now()) } : null)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-300 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-200 disabled:opacity-50"
          >
            <Pause className="size-3.5" /> Pause
          </button>
        )}
        {hasTime && (
          <button
            disabled={busy}
            onClick={() => run(() => timerStopAction(), null)}
            title="Stop & save session"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-emerald-50/80 transition hover:bg-white/10 disabled:opacity-50"
          >
            <Square className="size-3.5" /> Stop
          </button>
        )}
      </div>
      <p className="mt-2 text-[10.5px] leading-snug text-emerald-100/30">
        Stop saves the session to today&apos;s log.
      </p>
    </div>
  );
}
