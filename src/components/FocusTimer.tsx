"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Flame,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
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
  timerResumeAction,
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
    // Ignore audio autoplay restrictions
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
  initialStreak?: number;
}

export default function FocusTimer({
  subjects,
  initialTodayMinutes = 0,
  initialStreak = 1,
}: Props) {
  // Mode: 'set' (Set Timer) vs 'free' (Timer)
  const [timerType, setTimerType] = useState<"set" | "free">("set");
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputMins, setCustomInputMins] = useState("35");

  // Flow States: 'ready' (Image 1) | 'running' (Image 2) | 'completed' (Image 3)
  const [flowState, setFlowState] = useState<"ready" | "running" | "completed">("ready");

  // Timer internals
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [freeSeconds, setFreeSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | "">("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [todayMinutes, setTodayMinutes] = useState(initialTodayMinutes);
  const [streak, setStreak] = useState(initialStreak);
  const [lastLoggedMinutes, setLastLoggedMinutes] = useState(25);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen detection
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

  // Main countdown/stopwatch tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (timerType === "set") {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              setFlowState("completed");
              setLastLoggedMinutes(targetMinutes);
              if (soundEnabled) {
                playCelebrationChime();
              }
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              // Automatically save session to database when countdown finishes!
              saveStudySessionAction({
                subjectId: selectedSubject === "" ? null : selectedSubject,
                minutes: targetMinutes,
              }).catch(() => {});
              setTodayMinutes((m) => m + targetMinutes);
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
  }, [isRunning, timerType, soundEnabled, targetMinutes, selectedSubject]);

  // Mode change
  const handleSwitchType = (type: "set" | "free") => {
    if (isRunning) return;
    setTimerType(type);
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
  };

  const handleAddMinutes = (added: number) => {
    if (timerType === "set") {
      const next = targetMinutes + added;
      setTargetMinutes(next);
      setRemainingSeconds((prev) => prev + added * 60);
    }
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInputMins, 10);
    if (!isNaN(val) && val > 0) {
      handleSetTarget(Math.min(720, val));
      setShowCustomModal(false);
    }
  };

  // Start / Resume session
  const handleStart = () => {
    if (timerType === "set" && remainingSeconds <= 0) {
      setRemainingSeconds(targetMinutes * 60);
    }
    setIsRunning(true);
    setFlowState("running");
    timerStartAction(selectedSubject === "" ? null : selectedSubject).catch(() => {});
  };

  const handlePause = () => {
    setIsRunning(false);
    timerPauseAction().catch(() => {});
  };

  const handleResume = () => {
    setIsRunning(true);
    timerResumeAction().catch(() => {});
  };

  const handleReset = () => {
    setIsRunning(false);
    setFlowState("ready");
    if (timerType === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
    timerStopAction().catch(() => {});
  };

  // Stop & finish session early
  const handleStopAndSave = async () => {
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

      setTodayMinutes((m) => m + studiedMinutes);
      setLastLoggedMinutes(studiedMinutes);
      setIsRunning(false);
      setFlowState("completed");
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Break timer (5 min break from Image 3)
  const handleStartBreak = () => {
    setTimerType("set");
    setTargetMinutes(5);
    setRemainingSeconds(5 * 60);
    setFlowState("running");
    setIsRunning(true);
  };

  // Back to timer
  const handleReturnToTimer = () => {
    setFlowState("ready");
    setIsRunning(false);
    if (timerType === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);
  const subjectDisplayName = currentSubjectObj ? currentSubjectObj.name : "General / Mixed study";

  // Progress calculations for Circular Ring (Image 2)
  const totalTargetSec = targetMinutes * 60;
  const progressRatio =
    timerType === "set" && totalTargetSec > 0
      ? Math.min(1, Math.max(0, (totalTargetSec - remainingSeconds) / totalTargetSec))
      : 0;

  // SVG circle calculations (radius 100, circumference 628.3)
  const strokeRadius = 100;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference * (1 - progressRatio);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center transition-colors duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen w-screen bg-[#0d1b14] p-4 sm:p-6"
          : "w-full"
      }`}
    >
      {/* ── Custom Minutes Modal ───────────────────────────────── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-base font-bold text-slate-800">
              Set Custom Duration
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              How many minutes do you want to study?
            </p>

            <form onSubmit={handleApplyCustomMinutes} className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="720"
                  autoFocus
                  value={customInputMins}
                  onChange={(e) => setCustomInputMins(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-bold text-slate-900 focus:border-[#0c4a34] focus:outline-none"
                />
                <span className="text-sm font-semibold text-slate-600">min</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#0c4a34] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#093a29] transition"
                >
                  Set Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STATE 1: READY / IDLE (Image 1)
         ════════════════════════════════════════════════════════════ */}
      {flowState === "ready" && (
        <div className="w-full max-w-[400px] rounded-[32px] border border-line/80 bg-white p-5 sm:p-6 shadow-xl">
          {/* Top Header Row */}
          <div className="flex items-center justify-between gap-2 pb-2">
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

            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <TimerIcon className="size-3 text-emerald-600" />
              <span>TIMER</span>
            </div>

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

          {/* Clock Display */}
          <div className="my-2 sm:my-3 text-center select-none">
            <div className="font-display text-[68px] sm:text-[76px] font-black leading-none tabular-nums tracking-tight text-[#0f172a]">
              {timerType === "set" ? formatSeconds(remainingSeconds) : formatSeconds(freeSeconds)}
            </div>
          </div>

          {/* Selected Subject Pill */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/70 shadow-2xs">
              <BookOpen className="size-3 text-emerald-600" />
              <span className="truncate max-w-[220px]">{subjectDisplayName}</span>
            </div>
          </div>

          {/* Mode Switcher: Set Timer vs Timer */}
          <div className="mb-3.5 rounded-2xl bg-[#eef3f0] p-1 grid grid-cols-2 gap-1 border border-slate-200/50">
            <button
              type="button"
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

          {/* Quick Presets + Custom Option (when Set Timer is active) */}
          {timerType === "set" && (
            <div className="mb-3.5 grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => handleAddMinutes(5)}
                className="rounded-xl border border-slate-200/90 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs text-center"
              >
                +5m
              </button>

              <button
                type="button"
                onClick={() => handleAddMinutes(15)}
                className="rounded-xl border border-slate-200/90 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs text-center"
              >
                +15m
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

              {/* Custom Duration Button */}
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className={`rounded-xl py-1.5 text-xs font-bold transition shadow-2xs text-center ${
                  targetMinutes !== 25 && targetMinutes !== 50
                    ? "border border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                title="Set custom minutes"
              >
                {targetMinutes !== 25 && targetMinutes !== 50 ? `${targetMinutes}m` : "Custom"}
              </button>
            </div>
          )}

          {/* Subject Dropdown */}
          <div className="relative mb-3.5">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
              <BookOpen className="size-4" />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : "")}
              className="w-full appearance-none rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-10 text-xs sm:text-[13px] font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 focus:border-[#0c4a34] focus:outline-none cursor-pointer"
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

          {/* Big Start Button */}
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0c4a34] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#093a29] transition active:scale-98"
            >
              <Play className="size-4 fill-white" />
              <span>Start</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="size-12 rounded-2xl border border-slate-200/90 bg-white grid place-items-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
              title="Reset"
            >
              <RotateCcw className="size-4.5" />
            </button>
          </div>

          {/* Note */}
          <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-emerald-800/80 mb-3.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>Stop saves the session to today&apos;s log.</span>
          </p>

          {/* Stats Card: Today's Focus & Streak */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-emerald-100/70 text-emerald-800">
                <BarChart2 className="size-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  TODAY&apos;S FOCUS
                </p>
                <p className="font-bold text-slate-900 text-[13px] flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {formatTotalFocus(todayMinutes)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                SESSION STREAK
              </p>
              <p className="font-bold text-amber-900 text-[13px] flex items-center justify-end gap-1">
                <Flame className="size-3.5 text-amber-500 fill-amber-500" />
                {streak} Days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STATE 2: ACTIVE RUNNING FOCUS SESSION (Image 2)
         ════════════════════════════════════════════════════════════ */}
      {flowState === "running" && (
        <div className="w-full max-w-[400px] rounded-[32px] border border-line/80 bg-white p-5 sm:p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <button
              type="button"
              onClick={handlePause}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Focus Session</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {soundEnabled ? <Volume2 className="size-3 text-emerald-600" /> : <VolumeX className="size-3 text-slate-400" />}
              </button>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active
              </span>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 p-1 text-slate-600 hover:text-slate-900"
              >
                {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
              </button>
            </div>
          </div>

          {/* Circular Progress Ring with Digital Time Inside */}
          <div className="relative my-4 flex items-center justify-center select-none">
            <svg className="size-[220px] -rotate-90 transform" viewBox="0 0 240 240">
              {/* Background Track Circle */}
              <circle
                cx="120"
                cy="120"
                r={strokeRadius}
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="120"
                cy="120"
                r={strokeRadius}
                stroke="#0c4a34"
                strokeWidth="12"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={timerType === "set" ? strokeDashoffset : 0}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Content Inside Circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                DEEP WORK
              </span>
              <span className="font-display text-5xl sm:text-6xl font-black tabular-nums tracking-tight text-[#0f172a] my-1">
                {timerType === "set"
                  ? formatSeconds(remainingSeconds)
                  : formatSeconds(freeSeconds)}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {timerType === "set" ? `remaining of ${targetMinutes}m` : "session in progress"}
              </span>
            </div>
          </div>

          {/* Active Subject Pill */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-800 border border-slate-200/60 shadow-2xs">
              <BookOpen className="size-3 text-emerald-700" />
              <span className="truncate max-w-[240px]">{subjectDisplayName}</span>
            </div>
          </div>

          {/* Control Buttons Row (Like Image 2: +5m, Central Big Pause, Stop & Finish) */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Quick +5m Button */}
            <button
              type="button"
              onClick={() => handleAddMinutes(5)}
              className="rounded-2xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              ⏱️ +5m
            </button>

            {/* Central Giant Play/Pause Circle Button */}
            {isRunning ? (
              <button
                type="button"
                onClick={handlePause}
                className="grid size-16 place-items-center rounded-full bg-[#0c4a34] text-white shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition"
                title="Pause"
              >
                <Pause className="size-6 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="grid size-16 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition"
                title="Resume"
              >
                <Play className="size-6 fill-white ml-0.5" />
              </button>
            )}

            {/* Finish & Save Session Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleStopAndSave}
              className="rounded-2xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-xs font-bold text-rose-700 hover:bg-rose-50 transition shadow-2xs flex items-center gap-1.5"
              title="Finish and save to log"
            >
              <Square className="size-3.5 fill-rose-600 text-rose-600" />
              <span>{isSaving ? "Saving..." : "Finish"}</span>
            </button>
          </div>

          {/* Subtle info notice */}
          <p className="text-center text-[11px] text-slate-400 mb-4">
            Stopping or finishing saves this session to your study log.
          </p>

          {/* Today's Target / Progress Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Today&apos;s Focus
              </span>
              <span className="font-bold text-slate-900">{formatTotalFocus(todayMinutes)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#0c4a34] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((todayMinutes / 180) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STATE 3: SESSION ACCOMPLISHED (Image 3)
         ════════════════════════════════════════════════════════════ */}
      {flowState === "completed" && (
        <div className="w-full max-w-[400px] rounded-[32px] border border-line/80 bg-white p-6 shadow-xl text-center">
          {/* Top Big Emerald Celebration Badge */}
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100/90 text-emerald-700 mb-3 shadow-inner">
            <Check className="size-8" strokeWidth={3} />
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/70 mb-2">
            <Sparkles className="size-3 text-emerald-600" />
            <span>SESSION ACCOMPLISHED</span>
          </div>

          {/* Big Heading */}
          <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Session Complete!
          </h2>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            <strong className="font-semibold text-slate-800">{lastLoggedMinutes} minutes</strong> of deep focus logged for{" "}
            <strong className="font-semibold text-slate-800">{subjectDisplayName}</strong>.
          </p>

          {/* 4-Grid Stats Summary (Image 3) */}
          <div className="my-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Clock className="size-3.5 text-emerald-600" /> Focus Time
              </span>
              <p className="mt-1 font-display text-lg font-black text-slate-900">
                {lastLoggedMinutes}m
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <BookOpen className="size-3.5 text-emerald-600" /> Subject
              </span>
              <p className="mt-1 font-display text-sm font-bold text-slate-900 truncate">
                {subjectDisplayName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Calendar className="size-3.5 text-emerald-600" /> Today&apos;s Total
              </span>
              <p className="mt-1 font-display text-lg font-black text-slate-900">
                {formatTotalFocus(todayMinutes)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Flame className="size-3.5 text-amber-500 fill-amber-500" /> Daily Streak
              </span>
              <p className="mt-1 font-display text-lg font-black text-slate-900">
                {streak} Days
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={handleStartBreak}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0c4a34] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#093a29] transition active:scale-98"
            >
              <Coffee className="size-4" />
              <span>Start 5m Short Break</span>
            </button>

            <button
              type="button"
              onClick={handleReturnToTimer}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition active:scale-98"
            >
              <RotateCcw className="size-3.5" />
              <span>Return to Timer</span>
            </button>
          </div>

          {/* Motivational Quote Box */}
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3 text-center">
            <p className="text-[11.5px] italic text-emerald-900 font-medium">
              &ldquo;Rest is the foundation of mindful mastery.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
