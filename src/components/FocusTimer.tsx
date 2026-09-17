"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart2,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
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
  // Mode: Default is 'free' (Timer) as requested by user
  const [timerType, setTimerType] = useState<"free" | "set">("free");
  const [targetMinutes, setTargetMinutes] = useState(25);

  // Flow States: 'ready' | 'running' | 'completed'
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
              // Automatically save session to database when countdown finishes
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
  const handleSwitchType = (type: "free" | "set") => {
    if (isRunning) return;
    if (!document.fullscreenElement) {
      toggleFullscreen().catch(() => {});
    }
    setTimerType(type);
    if (type === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
  };

  const handleTargetChange = (mins: number) => {
    const clamped = Math.max(1, Math.min(720, mins));
    setTargetMinutes(clamped);
    if (timerType === "set") {
      setRemainingSeconds(clamped * 60);
    }
  };

  // Start / Resume session
  const handleStart = () => {
    if (!document.fullscreenElement) {
      toggleFullscreen().catch(() => {});
    }
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

  // Progress calculations for Circular Ring
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
      className={`transition-colors duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-[100dvh] w-screen bg-[#0e261d] overflow-hidden flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 select-none"
          : "w-full flex items-center justify-center py-2"
      }`}
    >
      {/* ════════════════════════════════════════════════════════════
          STATE 1: READY / IDLE
         ════════════════════════════════════════════════════════════ */}
      {flowState === "ready" && (
        <div
          className={`w-full transition-all duration-300 ${
            isFullscreen
              ? "h-full max-w-md flex flex-col justify-between items-stretch text-white"
              : "max-w-[400px] rounded-[32px] border border-line/80 bg-white p-5 sm:p-6 shadow-xl"
          }`}
        >
          {/* Top Header Row: Pushed to TOP in Fullscreen */}
          <div className="flex items-center justify-between gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                isFullscreen
                  ? "border border-[#265342] bg-[#18382c] text-emerald-100 hover:bg-[#1f4738]"
                  : "border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className={`size-3.5 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="size-3.5 text-slate-400" />
                  <span>Muted</span>
                </>
              )}
            </button>

            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                isFullscreen
                  ? "border border-[#265342] bg-[#18382c] text-emerald-200"
                  : "border border-slate-200/90 bg-slate-50/80 text-slate-700"
              }`}
            >
              <TimerIcon className={`size-3 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
              <span>TIMER</span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                isFullscreen
                  ? "border border-[#265342] bg-[#18382c] text-emerald-100 hover:bg-[#1f4738]"
                  : "border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-slate-100"
              }`}
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

          {/* Middle Body: Centered between top and bottom in Fullscreen */}
          <div className={isFullscreen ? "my-auto flex flex-col items-center justify-center w-full py-4 space-y-3" : ""}>
            {/* Clock Display */}
            <div
              onClick={() => {
                if (!document.fullscreenElement) toggleFullscreen().catch(() => {});
              }}
              title="Click to toggle Fullscreen"
              className="my-2 sm:my-3 text-center select-none cursor-pointer"
            >
              <div
                className={`font-display text-[68px] sm:text-[80px] font-black leading-none tabular-nums tracking-tight transition hover:scale-102 ${
                  isFullscreen ? "text-white drop-shadow-md" : "text-[#0f172a]"
                }`}
              >
                {timerType === "set" ? formatSeconds(remainingSeconds) : formatSeconds(freeSeconds)}
              </div>
            </div>

            {/* Selected Subject Pill */}
            <div className="flex justify-center mb-4">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs ${
                  isFullscreen
                    ? "bg-[#18382c] border border-[#265342] text-emerald-200"
                    : "bg-emerald-50/90 border border-emerald-200/70 text-emerald-800"
                }`}
              >
                <BookOpen className={`size-3 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
                <span className="truncate max-w-[220px]">{subjectDisplayName}</span>
              </div>
            </div>

            {/* Mode Switcher: Timer (Default) vs Set Timer */}
            <div
              className={`mb-3.5 w-full rounded-2xl p-1 grid grid-cols-2 gap-1 border ${
                isFullscreen
                  ? "bg-[#143226] border-[#224b3b]"
                  : "bg-[#eef3f0] border-slate-200/50"
              }`}
            >
              <button
                type="button"
                onClick={() => handleSwitchType("free")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                  timerType === "free"
                    ? isFullscreen
                      ? "bg-[#10b981] text-[#062419] font-black shadow-md"
                      : "bg-[#0c4a34] text-white shadow-xs"
                    : isFullscreen
                    ? "text-emerald-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Play className="size-3.5 fill-current" />
                <span>Timer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchType("set")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                  timerType === "set"
                    ? isFullscreen
                      ? "bg-[#10b981] text-[#062419] font-black shadow-md"
                      : "bg-[#0c4a34] text-white shadow-xs"
                    : isFullscreen
                    ? "text-emerald-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TimerIcon className="size-3.5" />
                <span>Set Timer</span>
              </button>
            </div>

            {/* Custom Duration Input when "Set Timer" is selected */}
            {timerType === "set" && (
              <div
                className={`mb-3.5 w-full flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200 ${
                  isFullscreen
                    ? "border border-[#265342] bg-[#143226] text-emerald-100"
                    : "border border-emerald-200/80 bg-emerald-50/50 text-slate-800"
                }`}
              >
                <span className={`text-xs font-bold ${isFullscreen ? "text-emerald-200" : "text-emerald-950"}`}>
                  Set Duration:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={targetMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        handleTargetChange(val);
                      }
                    }}
                    className={`w-16 rounded-xl py-1.5 px-2 text-center text-sm font-bold shadow-2xs focus:outline-none ${
                      isFullscreen
                        ? "bg-[#0e261d] border border-[#2d5f4c] text-white focus:border-[#10b981]"
                        : "border border-emerald-300 bg-white text-slate-900 focus:border-[#0c4a34] focus:ring-1 focus:ring-[#0c4a34]"
                    }`}
                  />
                  <span className={`text-xs font-semibold ${isFullscreen ? "text-emerald-300" : "text-emerald-900"}`}>
                    min
                  </span>
                </div>
              </div>
            )}

            {/* Subject Dropdown */}
            <div className="relative mb-3.5 w-full">
              <div className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${isFullscreen ? "text-emerald-300" : "text-slate-600"}`}>
                <BookOpen className="size-4" />
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : "")}
                className={`w-full appearance-none rounded-2xl py-3 pl-10 pr-10 text-xs sm:text-[13px] font-semibold shadow-2xs transition focus:outline-none cursor-pointer ${
                  isFullscreen
                    ? "bg-[#143226] border border-[#265342] text-white hover:border-[#38745c] focus:border-[#10b981]"
                    : "bg-white border border-slate-200/90 text-slate-800 hover:border-slate-300 focus:border-[#0c4a34]"
                }`}
              >
                <option value="" className={isFullscreen ? "bg-[#0e261d] text-white" : ""}>
                  General / Mixed study
                </option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className={isFullscreen ? "bg-[#0e261d] text-white" : ""}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${isFullscreen ? "text-emerald-300" : "text-slate-500"}`}>
                <ChevronDown className="size-4" />
              </div>
            </div>

            {/* Big Start Button */}
            <div className="flex items-center gap-2 mb-3 w-full">
              <button
                type="button"
                onClick={handleStart}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-sm transition active:scale-98 ${
                  isFullscreen
                    ? "bg-[#10b981] hover:bg-[#059669] text-[#062419] font-black shadow-lg shadow-emerald-950/40"
                    : "bg-[#0c4a34] hover:bg-[#093a29] text-white"
                }`}
              >
                <Play className={`size-4 ${isFullscreen ? "fill-[#062419]" : "fill-white"}`} />
                <span>Start</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className={`size-12 rounded-2xl grid place-items-center transition shadow-2xs ${
                  isFullscreen
                    ? "border border-[#265342] bg-[#143226] text-emerald-200 hover:bg-[#1c4233] hover:text-white"
                    : "border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="Reset"
              >
                <RotateCcw className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Bottom Section: Pushed to BOTTOM in Fullscreen */}
          <div className="w-full pt-2 pb-1">
            {/* Note */}
            <p className={`flex items-center justify-center gap-1.5 text-[11.5px] font-medium mb-3 ${
              isFullscreen ? "text-emerald-400/90" : "text-emerald-800/80"
            }`}>
              <CheckCircle2 className={`size-3.5 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
              <span>Stop saves the session to today&apos;s log.</span>
            </p>

            {/* Stats Card: Today's Focus & Streak */}
            <div
              className={`rounded-2xl p-3.5 flex items-center justify-between text-xs border ${
                isFullscreen
                  ? "border-[#265342] bg-[#143226]"
                  : "border-slate-100 bg-slate-50/90"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`grid size-8 place-items-center rounded-xl ${
                  isFullscreen ? "bg-[#1c4233] text-emerald-300" : "bg-emerald-100/70 text-emerald-800"
                }`}>
                  <BarChart2 className="size-4" />
                </span>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${
                    isFullscreen ? "text-emerald-300/70" : "text-slate-400"
                  }`}>
                    TODAY&apos;S FOCUS
                  </p>
                  <p className={`font-bold text-[13px] flex items-center gap-1 ${
                    isFullscreen ? "text-white" : "text-slate-900"
                  }`}>
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    {formatTotalFocus(todayMinutes)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-[10px] uppercase font-bold tracking-wider ${
                  isFullscreen ? "text-emerald-300/70" : "text-slate-400"
                }`}>
                  SESSION STREAK
                </p>
                <p className={`font-bold text-[13px] flex items-center justify-end gap-1 ${
                  isFullscreen ? "text-amber-300" : "text-amber-900"
                }`}>
                  <Flame className="size-3.5 text-amber-500 fill-amber-500" />
                  {streak} Days
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STATE 2: ACTIVE RUNNING FOCUS SESSION
         ════════════════════════════════════════════════════════════ */}
      {flowState === "running" && (
        <div
          className={`w-full transition-all duration-300 ${
            isFullscreen
              ? "h-full max-w-md flex flex-col justify-between items-stretch text-white"
              : "max-w-[400px] rounded-[32px] border border-line/80 bg-white p-5 sm:p-6 shadow-xl"
          }`}
        >
          {/* Top Header Row: PUSHED TO TOP IN FULLSCREEN */}
          <div className="flex items-center justify-between gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={handlePause}
              className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                isFullscreen ? "text-emerald-200 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowLeft className="size-3.5" />
              <span>Focus Session</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  isFullscreen
                    ? "border border-[#265342] bg-[#18382c] text-emerald-200"
                    : "border border-slate-200/80 bg-slate-50 text-slate-700"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className={`size-3 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
                ) : (
                  <VolumeX className="size-3 text-slate-400" />
                )}
              </button>

              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isFullscreen
                  ? "border border-[#265342] bg-[#18382c] text-emerald-300"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}>
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>

              <button
                type="button"
                onClick={toggleFullscreen}
                className={`inline-flex items-center rounded-full p-1 ${
                  isFullscreen
                    ? "border border-[#265342] bg-[#18382c] text-emerald-200 hover:text-white"
                    : "border border-slate-200/80 bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
              </button>
            </div>
          </div>

          {/* Middle Body: Circular Progress Ring + Controls: PUSHED TO CENTER IN FULLSCREEN */}
          <div className={isFullscreen ? "my-auto flex flex-col items-center justify-center w-full py-2" : ""}>
            {/* Circular Progress Ring with Digital Time Inside */}
            <div className="relative my-4 flex items-center justify-center select-none">
              <svg className="size-[220px] sm:size-[240px] -rotate-90 transform" viewBox="0 0 240 240">
                {/* Background Track Circle */}
                <circle
                  cx="120"
                  cy="120"
                  r={strokeRadius}
                  stroke={isFullscreen ? "#1c4233" : "#e2e8f0"}
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Animated Progress Circle */}
                <circle
                  cx="120"
                  cy="120"
                  r={strokeRadius}
                  stroke={isFullscreen ? "#10b981" : "#0c4a34"}
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
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isFullscreen ? "text-emerald-300/70" : "text-slate-400"
                }`}>
                  DEEP WORK
                </span>
                <span className={`font-display text-5xl sm:text-6xl font-black tabular-nums tracking-tight my-1 ${
                  isFullscreen ? "text-white" : "text-[#0f172a]"
                }`}>
                  {timerType === "set"
                    ? formatSeconds(remainingSeconds)
                    : formatSeconds(freeSeconds)}
                </span>
                <span className={`text-xs font-semibold ${
                  isFullscreen ? "text-emerald-300/80" : "text-slate-400"
                }`}>
                  {timerType === "set" ? `target ${targetMinutes}m` : "session in progress"}
                </span>
              </div>
            </div>

            {/* Active Subject Pill */}
            <div className="flex justify-center mb-5">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold shadow-2xs ${
                isFullscreen
                  ? "bg-[#18382c] border border-[#265342] text-emerald-200"
                  : "bg-slate-100 border border-slate-200/60 text-slate-800"
              }`}>
                <BookOpen className={`size-3 ${isFullscreen ? "text-emerald-400" : "text-emerald-700"}`} />
                <span className="truncate max-w-[240px]">{subjectDisplayName}</span>
              </div>
            </div>

            {/* Clean Controls: Central Big Pause/Play & Finish */}
            <div className="flex items-center justify-center gap-5 mt-1 mb-2">
              {/* Central Giant Play/Pause Circle Button */}
              {isRunning ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className={`grid size-16 place-items-center rounded-full transition active:scale-95 hover:scale-105 ${
                    isFullscreen
                      ? "bg-[#10b981] text-[#062419] shadow-lg shadow-emerald-950/50"
                      : "bg-[#0c4a34] text-white shadow-lg shadow-emerald-900/20"
                  }`}
                  title="Pause"
                >
                  <Pause className="size-6 fill-current" />
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
                className={`rounded-2xl px-5 py-3.5 text-xs font-bold transition shadow-2xs flex items-center gap-1.5 ${
                  isFullscreen
                    ? "border border-rose-900/60 bg-[#2b171c] text-rose-300 hover:bg-[#3b1f26]"
                    : "border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100"
                }`}
                title="Finish and save to log"
              >
                <Square className="size-3.5 fill-rose-500 text-rose-500" />
                <span>{isSaving ? "Saving..." : "Finish"}</span>
              </button>
            </div>
          </div>

          {/* Bottom Section: PUSHED TO BOTTOM IN FULLSCREEN */}
          <div className="w-full pt-2 pb-1">
            {/* Subtle info notice */}
            <p className={`text-center text-[11px] mb-2.5 ${isFullscreen ? "text-emerald-400/70" : "text-slate-400"}`}>
              Finishing saves this session directly to your study log.
            </p>

            {/* Today's Target / Progress Card */}
            <div className={`rounded-2xl p-3 sm:p-3.5 border ${
              isFullscreen ? "border-[#265342] bg-[#143226]" : "border-slate-100 bg-slate-50"
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`flex items-center gap-1.5 font-bold ${
                  isFullscreen ? "text-emerald-200" : "text-slate-700"
                }`}>
                  <CheckCircle2 className={`size-3.5 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
                  Today&apos;s Focus
                </span>
                <span className={`font-bold ${isFullscreen ? "text-white" : "text-slate-900"}`}>
                  {formatTotalFocus(todayMinutes)}
                </span>
              </div>
              <div className={`h-2 w-full overflow-hidden rounded-full ${isFullscreen ? "bg-[#1c4233]" : "bg-slate-200"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFullscreen ? "bg-[#10b981]" : "bg-[#0c4a34]"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((todayMinutes / 180) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STATE 3: SESSION ACCOMPLISHED (Real Data Only)
         ════════════════════════════════════════════════════════════ */}
      {flowState === "completed" && (
        <div
          className={`w-full text-center transition-all duration-300 ${
            isFullscreen
              ? "h-full max-w-md flex flex-col justify-between items-stretch text-white"
              : "max-w-[400px] rounded-[32px] border border-line/80 bg-white p-6 shadow-xl"
          }`}
        >
          {/* Top Section in Fullscreen */}
          <div className="pt-2">
            {/* Top Big Emerald Celebration Badge */}
            <div className={`mx-auto grid size-16 place-items-center rounded-full mb-3 shadow-inner ${
              isFullscreen
                ? "bg-[#18382c] border border-[#265342] text-emerald-400"
                : "bg-emerald-100/90 text-emerald-700"
            }`}>
              <Check className="size-8" strokeWidth={3} />
            </div>

            {/* Pill Badge */}
            <div className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-bold mb-2 ${
              isFullscreen
                ? "bg-[#18382c] border border-[#265342] text-emerald-300"
                : "bg-emerald-50 border border-emerald-200/70 text-emerald-800"
            }`}>
              <Sparkles className={`size-3 ${isFullscreen ? "text-emerald-400" : "text-emerald-600"}`} />
              <span>SESSION ACCOMPLISHED</span>
            </div>
          </div>

          {/* Middle Section in Fullscreen */}
          <div className={isFullscreen ? "my-auto flex flex-col items-center justify-center w-full py-4" : ""}>
            {/* Big Heading */}
            <h2 className={`font-display text-2xl font-black tracking-tight ${
              isFullscreen ? "text-white" : "text-slate-900"
            }`}>
              Session Complete!
            </h2>
            <p className={`mt-1 text-xs leading-relaxed max-w-xs mx-auto ${
              isFullscreen ? "text-emerald-200/80" : "text-slate-500"
            }`}>
              <strong className={`font-semibold ${isFullscreen ? "text-white" : "text-slate-800"}`}>
                {lastLoggedMinutes} minutes
              </strong> of deep focus logged for{" "}
              <strong className={`font-semibold ${isFullscreen ? "text-white" : "text-slate-800"}`}>
                {subjectDisplayName}
              </strong>.
            </p>

            {/* 4-Grid Stats Summary (User's Real Database Data) */}
            <div className="my-5 w-full grid grid-cols-2 gap-2.5">
              <div className={`rounded-2xl p-3 text-left border ${
                isFullscreen ? "border-[#265342] bg-[#143226]" : "border-slate-100 bg-slate-50/80"
              }`}>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                  isFullscreen ? "text-emerald-300/80" : "text-slate-500"
                }`}>
                  <Clock className="size-3.5 text-emerald-400" /> Focus Time
                </span>
                <p className={`mt-1 font-display text-lg font-black ${isFullscreen ? "text-white" : "text-slate-900"}`}>
                  {lastLoggedMinutes}m
                </p>
              </div>

              <div className={`rounded-2xl p-3 text-left border ${
                isFullscreen ? "border-[#265342] bg-[#143226]" : "border-slate-100 bg-slate-50/80"
              }`}>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                  isFullscreen ? "text-emerald-300/80" : "text-slate-500"
                }`}>
                  <BookOpen className="size-3.5 text-emerald-400" /> Subject
                </span>
                <p className={`mt-1 font-display text-sm font-bold truncate ${isFullscreen ? "text-white" : "text-slate-900"}`}>
                  {subjectDisplayName}
                </p>
              </div>

              <div className={`rounded-2xl p-3 text-left border ${
                isFullscreen ? "border-[#265342] bg-[#143226]" : "border-slate-100 bg-slate-50/80"
              }`}>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                  isFullscreen ? "text-emerald-300/80" : "text-slate-500"
                }`}>
                  <Calendar className="size-3.5 text-emerald-400" /> Today&apos;s Total
                </span>
                <p className={`mt-1 font-display text-lg font-black ${isFullscreen ? "text-white" : "text-slate-900"}`}>
                  {formatTotalFocus(todayMinutes)}
                </p>
              </div>

              <div className={`rounded-2xl p-3 text-left border ${
                isFullscreen ? "border-[#265342] bg-[#143226]" : "border-slate-100 bg-slate-50/80"
              }`}>
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                  isFullscreen ? "text-emerald-300/80" : "text-slate-500"
                }`}>
                  <Flame className="size-3.5 text-amber-500 fill-amber-500" /> Daily Streak
                </span>
                <p className={`mt-1 font-display text-lg font-black ${isFullscreen ? "text-white" : "text-slate-900"}`}>
                  {streak} Days
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Button: PUSHED TO BOTTOM IN FULLSCREEN */}
          <div className="w-full pb-2">
            <button
              type="button"
              onClick={handleReturnToTimer}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-sm transition active:scale-98 ${
                isFullscreen
                  ? "bg-[#10b981] hover:bg-[#059669] text-[#062419] font-black"
                  : "bg-[#0c4a34] hover:bg-[#093a29] text-white"
              }`}
            >
              <RotateCcw className="size-4" />
              <span>Return to Timer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

