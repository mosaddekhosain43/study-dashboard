"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer as TimerIcon,
} from "lucide-react";
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
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function elapsedOf(t: TimerState | null, now: number): number {
  if (!t) return 0;
  return t.accumulatedMs + (t.running ? now - t.startedAt : 0);
}

interface Props {
  subjects: { id: number; name: string }[];
}

export default function FocusTimer({ subjects }: Props) {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [selected, setSelected] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setTick] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync timer state on mount
  useEffect(() => {
    getTimerAction().then((t) => {
      setTimer(t);
      if (t?.subjectId) setSelected(t.subjectId);
    });
  }, []);

  // 1-second interval update for smooth live display
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

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

  const handleStartOrResume = () => {
    setSavedMessage(null);
    if (hasTime && !running) {
      run(
        () => timerResumeAction(),
        timer ? { ...timer, running: true, startedAt: Date.now() } : null
      );
    } else {
      run(
        () => timerStartAction(selected === "" ? null : selected),
        {
          subjectId: selected === "" ? null : selected,
          startedAt: Date.now(),
          accumulatedMs: 0,
          running: true,
        }
      );
    }
  };

  const handlePause = () => {
    run(
      () => timerPauseAction(),
      timer
        ? {
            ...timer,
            running: false,
            accumulatedMs: elapsedOf(timer, Date.now()),
          }
        : null
    );
  };

  const handleStop = async () => {
    const totalMs = elapsed;
    const mins = Math.max(1, Math.round(totalMs / 60_000));
    await run(() => timerStopAction(sessionNote || undefined), null);
    setSessionNote("");
    if (totalMs >= 30_000) {
      setSavedMessage(`Session saved! ${mins} minute${mins === 1 ? "" : "s"} added to today's study log.`);
    } else {
      setSavedMessage("Session ended (less than 30s not saved).");
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selected);

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[78vh] flex-col items-center justify-center transition-all ${
        isFullscreen ? "bg-[#0c1813] text-white p-6" : ""
      }`}
    >
      {/* Background ambient decorative glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={`size-[380px] sm:size-[500px] rounded-full blur-3xl transition-opacity duration-1000 ${
            running
              ? "bg-emerald-500/10 opacity-100"
              : "bg-leaf/5 opacity-50"
          }`}
        />
      </div>

      {/* Main Focus Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-4 py-1.5 shadow-2xs backdrop-blur-md">
          {running ? (
            <>
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Focus Session in Progress
              </span>
            </>
          ) : hasTime ? (
            <>
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Session Paused
              </span>
            </>
          ) : (
            <>
              <TimerIcon className="size-3.5 text-ink-faint" />
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Ready to Study
              </span>
            </>
          )}
        </div>

        {/* Big Giant Digital Timer Display */}
        <div className="my-6 sm:my-10 select-none">
          <span
            className={`font-display text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums tracking-tighter transition-colors duration-300 ${
              running
                ? "text-pine drop-shadow-sm"
                : hasTime
                ? "text-amber-800"
                : "text-ink/85"
            }`}
          >
            {fmt(elapsed)}
          </span>

          {/* Active subject indication */}
          {selectedSubject && (
            <p className="mt-2 text-xs sm:text-sm font-semibold text-leaf flex items-center justify-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>{selectedSubject.name}</span>
            </p>
          )}
        </div>

        {/* Subject Picker (when not running, or can switch anytime) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
          <div className="relative inline-flex items-center">
            <span className="pointer-events-none absolute left-3 text-ink-faint">
              <BookOpen className="size-3.5" />
            </span>
            <select
              value={selected}
              disabled={running}
              onChange={(e) => setSelected(e.target.value ? Number(e.target.value) : "")}
              className="rounded-xl border border-line bg-card/90 py-2.5 pl-8 pr-8 text-xs sm:text-[13px] font-semibold text-ink shadow-xs transition hover:border-leaf/50 focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20 disabled:opacity-60"
            >
              <option value="">General / Mixed Study</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          {!running ? (
            <button
              disabled={busy}
              onClick={handleStartOrResume}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-leaf to-leaf-deep px-8 sm:px-10 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-leaf/25 transition-all hover:shadow-xl hover:shadow-leaf/30 hover:brightness-105 active:scale-98 disabled:opacity-50"
            >
              <Play className="size-5 fill-white" />
              <span>{hasTime ? "Resume Session" : "Start Focus Timer"}</span>
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={handlePause}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-amber-400 px-8 sm:px-10 py-3.5 text-sm sm:text-base font-bold text-amber-950 shadow-lg shadow-amber-400/25 transition-all hover:bg-amber-300 active:scale-98 disabled:opacity-50"
            >
              <Pause className="size-5 fill-amber-950" />
              <span>Pause Timer</span>
            </button>
          )}

          {hasTime && (
            <button
              disabled={busy}
              onClick={handleStop}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-3.5 text-sm sm:text-base font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-300 active:scale-98 disabled:opacity-50"
              title="Stop and save session to today's study log"
            >
              <Square className="size-4 fill-rose-700" />
              <span>Stop & Save</span>
            </button>
          )}
        </div>

        {/* Optional Study Note (visible when timer has time or is running) */}
        {hasTime && (
          <div className="mt-5 w-full max-w-xs transition-all">
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Topic or note for today's log (optional)..."
              className="w-full rounded-xl border border-line bg-card/80 px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint/70 shadow-2xs focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20"
            />
          </div>
        )}

        {/* Saved Success Notification */}
        {savedMessage && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Fullscreen & Ambient Controls */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card/60 px-3.5 py-1.5 text-xs font-medium text-ink-faint hover:text-ink hover:bg-card transition shadow-2xs"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span>Fullscreen Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Motivational Distraction-Free Subtitle */}
        <p className="mt-8 text-xs text-ink-faint/70 max-w-sm leading-relaxed">
          Keep this screen open in front of you while studying. Phone away, full concentration.
        </p>
      </div>
    </div>
  );
}
