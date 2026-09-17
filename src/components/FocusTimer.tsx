"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer as TimerIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  saveStudySessionAction,
  timerPauseAction,
  timerStartAction,
  timerStopAction,
} from "@/actions";

// Soothing chime sound using Web Audio API
function playCelebrationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.2);
    gain2.gain.setValueAtTime(0.3, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 1.4);

    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1174.66, now + 0.45);
    gain3.gain.setValueAtTime(0.35, now + 0.45);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.45);
    osc3.stop(now + 1.8);
  } catch {
    // Ignore audio errors if blocked
  }
}

function formatSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remS = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(remS)}`;
  }
  return `${pad(m)}:${pad(remS)}`;
}

function formatTotalFocus(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface Props {
  subjects: { id: number; name: string }[];
  initialTodayMinutes?: number;
}

export default function FocusTimer({
  subjects,
  initialTodayMinutes = 0,
}: Props) {
  // Mode: 'set' (Set Timer) vs 'free' (Timer)
  const [timerType, setTimerType] = useState<"set" | "free">("set");
  const [targetMinutes, setTargetMinutes] = useState(25);

  // Runtime State
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [freeSeconds, setFreeSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | "">("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(initialTodayMinutes);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      console.error("Fullscreen toggle error:", err);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (timerType === "set") {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              setIsCompleted(true);
              if (soundEnabled) {
                playCelebrationChime();
              }
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              return 0;
            }
            return prev - 1;
          });
        } else {
          setFreeSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerType, soundEnabled]);

  const handleSwitchType = (type: "set" | "free") => {
    if (isRunning) return;
    setTimerType(type);
    setIsCompleted(false);
    setHasStarted(false);
    setSavedMessage(null);
    if (type === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
  };

  const handleSetTarget = (mins: number) => {
    if (isRunning) return;
    setTimerType("set");
    setTargetMinutes(mins);
    setRemainingSeconds(mins * 60);
    setIsCompleted(false);
    setHasStarted(false);
    setSavedMessage(null);
  };

  const handleAddMinutes = (added: number) => {
    if (isRunning) return;
    setTimerType("set");
    const next = targetMinutes + added;
    setTargetMinutes(next);
    setRemainingSeconds(next * 60);
  };

  const handleStartOrResume = () => {
    if (timerType === "set" && remainingSeconds <= 0) {
      setRemainingSeconds(targetMinutes * 60);
    }
    setSavedMessage(null);
    setIsCompleted(false);
    setIsRunning(true);
    setHasStarted(true);
    timerStartAction(selectedSubject === "" ? null : selectedSubject).catch(() => {});
  };

  const handlePause = () => {
    setIsRunning(false);
    timerPauseAction().catch(() => {});
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setIsCompleted(false);
    setSavedMessage(null);
    if (timerType === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
    timerStopAction().catch(() => {});
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    let studiedMinutes = 0;

    if (timerType === "set") {
      const elapsedSec = targetMinutes * 60 - remainingSeconds;
      studiedMinutes = Math.max(1, Math.round(elapsedSec / 60));
    } else {
      studiedMinutes = Math.max(1, Math.round(freeSeconds / 60));
    }

    try {
      await saveStudySessionAction({
        subjectId: selectedSubject === "" ? null : selectedSubject,
        minutes: studiedMinutes,
      });

      setTodayMinutes((prev) => prev + studiedMinutes);
      setSavedMessage(
        `Saved ${studiedMinutes}m to today's log!`
      );
      setIsRunning(false);
      setHasStarted(false);
      setIsCompleted(false);
      if (timerType === "set") {
        setRemainingSeconds(targetMinutes * 60);
      } else {
        setFreeSeconds(0);
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center transition-colors duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen w-screen bg-[#0d1b14] p-4 sm:p-6"
          : "w-full"
      }`}
    >
      {/* ── Main Timer Card matching the provided reference ──────── */}
      <div
        className={`w-full max-w-[400px] rounded-[32px] border border-line/80 bg-white p-5 sm:p-6 shadow-xl transition-all ${
          isFullscreen ? "shadow-2xl ring-1 ring-white/10" : ""
        }`}
      >
        {/* ── Top Header Row (Chime, TIMER Pill, Fullscreen) ────── */}
        <div className="flex items-center justify-between gap-2 pb-2">
          {/* Chime On / Muted */}
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-3.5 text-emerald-600" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="size-3.5 text-slate-400" />
                <span>Muted</span>
              </>
            )}
          </button>

          {/* TIMER Status Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <TimerIcon className="size-3 text-emerald-600" />
            <span>TIMER</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5 text-slate-600" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>

        {/* ── Giant Digital Clock Digits ────────────────────────── */}
        <div className="my-2 sm:my-3 text-center select-none">
          <div className="font-display text-[68px] sm:text-[76px] font-black leading-none tabular-nums tracking-tight text-[#0f172a]">
            {timerType === "set"
              ? formatSeconds(remainingSeconds)
              : formatSeconds(freeSeconds)}
          </div>
        </div>

        {/* ── Active Subject Pill (Below Digits) ─────────────────── */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/70 shadow-2xs">
            <BookOpen className="size-3 text-emerald-600" />
            <span className="truncate max-w-[220px]">
              {currentSubjectObj ? currentSubjectObj.name : "General / Mixed study"}
            </span>
          </div>
        </div>

        {/* ── Mode Switcher: Set Timer vs Timer ──────────────────── */}
        <div className="mb-3.5 rounded-2xl bg-[#eef3f0] p-1 grid grid-cols-2 gap-1 border border-slate-200/50">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSwitchType("set")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              timerType === "set"
                ? "bg-[#0c4a34] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TimerIcon className="size-3.5" />
            <span>Set Timer</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSwitchType("free")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              timerType === "free"
                ? "bg-[#0c4a34] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Play className="size-3.5 fill-current" />
            <span>Timer</span>
          </button>
        </div>

        {/* ── Preset Buttons Row (for Set Timer mode) ───────────── */}
        {timerType === "set" && !isRunning && (
          <div className="mb-3.5 grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleAddMinutes(5)}
              className="rounded-xl border border-slate-200/90 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs text-center"
            >
              + 5m
            </button>

            <button
              type="button"
              onClick={() => handleAddMinutes(15)}
              className="rounded-xl border border-slate-200/90 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs text-center"
            >
              + 15m
            </button>

            <button
              type="button"
              onClick={() => handleSetTarget(25)}
              className={`rounded-xl py-1.5 text-xs font-bold transition shadow-2xs text-center ${
                targetMinutes === 25
                  ? "border border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              25m Focus
            </button>

            <button
              type="button"
              onClick={() => handleSetTarget(50)}
              className={`rounded-xl py-1.5 text-xs font-bold transition shadow-2xs text-center ${
                targetMinutes === 50
                  ? "border border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              50m Deep
            </button>
          </div>
        )}

        {/* ── Subject Selection Dropdown ────────────────────────── */}
        <div className="relative mb-3.5">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
            <BookOpen className="size-4" />
          </div>
          <select
            value={selectedSubject}
            disabled={isRunning}
            onChange={(e) =>
              setSelectedSubject(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full appearance-none rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-10 text-xs sm:text-[13px] font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 focus:border-[#0c4a34] focus:outline-none disabled:opacity-60 cursor-pointer"
          >
            <option value="">General / Mixed study</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="size-4" />
          </div>
        </div>

        {/* ── Main Action Controls ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStartOrResume}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0c4a34] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#093a29] transition active:scale-98"
            >
              <Play className="size-4 fill-white" />
              <span>
                {isCompleted
                  ? "Start Again"
                  : hasStarted
                  ? "Resume"
                  : "Start"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0c4a34] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#093a29] transition active:scale-98"
            >
              <Pause className="size-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          {/* Reset button (as shown in reference screenshot) */}
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasStarted && !isRunning}
            className="size-12 rounded-2xl border border-slate-200/90 bg-white grid place-items-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs disabled:opacity-40"
            title="Reset timer"
          >
            <RotateCcw className="size-4.5" />
          </button>
        </div>

        {/* Save Session button (if timer has been run) */}
        {(hasStarted || isCompleted) && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveSession}
            className="w-full mb-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/80 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>{isSaving ? "Saving..." : "Stop & Save to Daily Log"}</span>
          </button>
        )}

        {/* Saved feedback toast */}
        {savedMessage && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs font-semibold text-emerald-800">
            {savedMessage}
          </div>
        )}

        {/* ── Helper Notice with Checkmark ──────────────────────── */}
        <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-emerald-800/80 mb-3.5">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          <span>Stopping saves automatically to today&apos;s log.</span>
        </p>

        {/* ── Today's Total Focus Summary Row ───────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            Today&apos;s Total Focus
          </span>
          <span className="font-bold text-slate-900">
            {formatTotalFocus(todayMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
