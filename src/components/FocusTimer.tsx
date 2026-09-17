"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
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
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  getTimerAction,
  saveStudySessionAction,
  timerPauseAction,
  timerResumeAction,
  timerStartAction,
  timerStopAction,
} from "@/actions";

// Sound chime using Web Audio API (no external file dependencies)
function playCelebrationChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (587.33 Hz - D5)
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

    // Second tone (880 Hz - A5)
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

    // Third high tone (1174.66 Hz - D6)
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

interface Props {
  subjects: { id: number; name: string }[];
}

const PRESET_MINUTES = [
  { label: "15 min", value: 15 },
  { label: "25 min (Pomodoro)", value: 25 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

export default function FocusTimer({ subjects }: Props) {
  // Timer Mode: 'countdown' or 'stopwatch'
  const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [customInputMinutes, setCustomInputMinutes] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Runtime State
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | "">("");
  const [sessionNote, setSessionNote] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check and listen for fullscreen change
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

  // Main tick loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "countdown") {
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
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  // When changing target minutes while not running
  const handleSelectPreset = (mins: number) => {
    if (isRunning) return;
    setMode("countdown");
    setTargetMinutes(mins);
    setRemainingSeconds(mins * 60);
    setIsCompleted(false);
    setSavedMessage(null);
    setShowCustomInput(false);
  };

  const handleSelectStopwatch = () => {
    if (isRunning) return;
    setMode("stopwatch");
    setStopwatchSeconds(0);
    setIsCompleted(false);
    setSavedMessage(null);
    setShowCustomInput(false);
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customInputMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      handleSelectPreset(mins);
      setShowCustomInput(false);
    }
  };

  const handleStart = () => {
    setSavedMessage(null);
    setIsCompleted(false);
    setIsRunning(true);
    // Tell server timer started for live sync
    timerStartAction(selectedSubject === "" ? null : selectedSubject).catch(() => {});
  };

  const handlePause = () => {
    setIsRunning(false);
    timerPauseAction().catch(() => {});
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSavedMessage(null);
    if (mode === "countdown") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setStopwatchSeconds(0);
    }
    timerStopAction().catch(() => {});
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    let studiedMinutes = 0;

    if (mode === "countdown") {
      const elapsedSec = targetMinutes * 60 - remainingSeconds;
      studiedMinutes = Math.max(1, Math.round(elapsedSec / 60));
    } else {
      studiedMinutes = Math.max(1, Math.round(stopwatchSeconds / 60));
    }

    try {
      await saveStudySessionAction({
        subjectId: selectedSubject === "" ? null : selectedSubject,
        minutes: studiedMinutes,
        note: sessionNote || undefined,
      });

      setSavedMessage(
        `Great job! Saved ${studiedMinutes} minute${
          studiedMinutes === 1 ? "" : "s"
        } to today's study log.`
      );
      setSessionNote("");
      setIsRunning(false);
      setIsCompleted(false);
      if (mode === "countdown") {
        setRemainingSeconds(targetMinutes * 60);
      } else {
        setStopwatchSeconds(0);
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate completion percentage for countdown
  const totalTargetSec = targetMinutes * 60;
  const progressRatio =
    mode === "countdown"
      ? Math.min(1, Math.max(0, (totalTargetSec - remainingSeconds) / totalTargetSec))
      : 1;

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[82vh] flex-col items-center justify-center transition-colors duration-500 ${
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen w-screen bg-[#070f0c] p-4 sm:p-8"
          : "w-full rounded-3xl bg-gradient-to-b from-[#0a1510] via-[#07110d] to-[#050b08] p-6 sm:p-10 shadow-2xl border border-emerald-900/30"
      }`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={`size-[380px] sm:size-[560px] rounded-full blur-[100px] transition-all duration-1000 ${
            isCompleted
              ? "bg-emerald-400/25 scale-110"
              : isRunning
              ? "bg-emerald-500/18 scale-100"
              : "bg-emerald-900/10 scale-90"
          }`}
        />
      </div>

      {/* Top Bar: Sound toggle & Fullscreen toggle */}
      <div className="relative z-20 mb-6 flex w-full max-w-xl items-center justify-between gap-3 text-white/70">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? "Sound Alert Enabled" : "Sound Alert Muted"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-3.5 text-emerald-400" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="size-3.5 text-white/40" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="size-3.5" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="size-3.5" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Main Focus Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 shadow-sm backdrop-blur-md">
          {isCompleted ? (
            <>
              <Sparkles className="size-3.5 text-emerald-400 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Target Reached! Great Job
              </span>
            </>
          ) : isRunning ? (
            <>
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {mode === "countdown"
                  ? `Studying (${targetMinutes} min session)`
                  : "Stopwatch Running"}
              </span>
            </>
          ) : (
            <>
              <TimerIcon className="size-3.5 text-white/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {mode === "countdown"
                  ? `Set Target: ${targetMinutes} Minutes`
                  : "Free Study Mode"}
              </span>
            </>
          )}
        </div>

        {/* ── Giant Digital Clock Display ──────────────────────── */}
        <div className="my-6 sm:my-8 select-none">
          <div
            className={`font-display text-7xl sm:text-8xl md:text-9xl font-extrabold tabular-nums tracking-tighter transition-all duration-300 ${
              isCompleted
                ? "text-emerald-300 drop-shadow-[0_0_40px_rgba(52,211,153,0.6)] animate-pulse"
                : isRunning
                ? "text-white drop-shadow-[0_0_35px_rgba(52,211,153,0.4)]"
                : "text-white/85 drop-shadow-md"
            }`}
          >
            {mode === "countdown"
              ? formatSeconds(remainingSeconds)
              : formatSeconds(stopwatchSeconds)}
          </div>

          {/* Active subject indicator */}
          {currentSubjectObj && (
            <p className="mt-2 text-xs sm:text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>{currentSubjectObj.name}</span>
            </p>
          )}
        </div>

        {/* ── Progress Bar (for Countdown mode) ────────────────── */}
        {mode === "countdown" && (
          <div className="mb-6 w-full max-w-xs sm:max-w-sm">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 shadow-sm shadow-emerald-500/50"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-white/40 font-mono">
              <span>0%</span>
              <span>{Math.round(progressRatio * 100)}% completed</span>
              <span>{targetMinutes}m</span>
            </div>
          </div>
        )}

        {/* ── Target Duration Presets (Select Time to Study) ──── */}
        {!isRunning && (
          <div className="mb-6 w-full space-y-2.5">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {PRESET_MINUTES.map((p) => {
                const active = mode === "countdown" && targetMinutes === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSelectPreset(p.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 border border-emerald-400"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowCustomInput((v) => !v)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  showCustomInput || (mode === "countdown" && !PRESET_MINUTES.some(p => p.value === targetMinutes))
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 border border-emerald-400"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                Custom Time
              </button>

              <button
                type="button"
                onClick={handleSelectStopwatch}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  mode === "stopwatch"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 border border-emerald-400"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                ⏱️ Free Count-Up
              </button>
            </div>

            {/* Custom Minutes Input Popup */}
            {showCustomInput && (
              <form
                onSubmit={handleApplyCustomMinutes}
                className="flex items-center justify-center gap-2 pt-1"
              >
                <input
                  type="number"
                  min="1"
                  max="360"
                  autoFocus
                  placeholder="Minutes (e.g. 40)"
                  value={customInputMinutes}
                  onChange={(e) => setCustomInputMinutes(e.target.value)}
                  className="w-36 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-400 transition"
                >
                  Set
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Subject Selection ───────────────────────────────── */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="relative inline-flex items-center">
            <span className="pointer-events-none absolute left-3 text-white/50">
              <BookOpen className="size-3.5" />
            </span>
            <select
              value={selectedSubject}
              disabled={isRunning}
              onChange={(e) =>
                setSelectedSubject(e.target.value ? Number(e.target.value) : "")
              }
              className="rounded-xl border border-white/15 bg-white/10 py-2 pl-8 pr-8 text-xs sm:text-[13px] font-semibold text-white shadow-xs backdrop-blur-md transition hover:border-white/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60"
            >
              <option value="" className="bg-[#0b1612] text-white">
                General / Mixed Study
              </option>
              {subjects.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  className="bg-[#0b1612] text-white"
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 sm:px-10 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-98"
            >
              <Play className="size-5 fill-white" />
              <span>
                {isCompleted
                  ? "Start Again"
                  : mode === "countdown" && remainingSeconds < totalTargetSec
                  ? "Resume Session"
                  : "Start Studying"}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-amber-400 px-8 sm:px-10 py-3.5 text-sm sm:text-base font-bold text-amber-950 shadow-lg shadow-amber-400/30 transition-all hover:bg-amber-300 active:scale-98"
            >
              <Pause className="size-5 fill-amber-950" />
              <span>Pause</span>
            </button>
          )}

          {/* Reset or Stop & Save Button */}
          {(isRunning ||
            (mode === "countdown" && remainingSeconds < totalTargetSec) ||
            (mode === "stopwatch" && stopwatchSeconds > 0) ||
            isCompleted) && (
            <button
              disabled={isSaving}
              onClick={handleSaveSession}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-6 py-3.5 text-sm sm:text-base font-bold text-emerald-300 shadow-sm transition-all hover:bg-emerald-500/25 hover:border-emerald-400 active:scale-98 disabled:opacity-50"
              title="Save completed study session to today's log"
            >
              <CheckCircle2 className="size-4.5 text-emerald-400" />
              <span>{isSaving ? "Saving..." : "Save Session"}</span>
            </button>
          )}

          {!isRunning &&
            ((mode === "countdown" && remainingSeconds < totalTargetSec) ||
              (mode === "stopwatch" && stopwatchSeconds > 0)) && (
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-xs sm:text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white transition active:scale-98"
                title="Reset timer"
              >
                <RotateCcw className="size-4" />
                <span>Reset</span>
              </button>
            )}
        </div>

        {/* Optional Study Note */}
        {(isRunning ||
          (mode === "countdown" && remainingSeconds < totalTargetSec) ||
          (mode === "stopwatch" && stopwatchSeconds > 0) ||
          isCompleted) && (
          <div className="mt-5 w-full max-w-xs transition-all">
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Topic or note for today's log (optional)..."
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/35 shadow-2xs focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        )}

        {/* Saved Success Notification Toast */}
        {savedMessage && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-sm">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Motivational Distraction-Free Subtitle */}
        <p className="mt-8 text-xs text-white/40 max-w-sm leading-relaxed">
          Keep this screen open in front of you while studying. Phone away, full concentration.
        </p>
      </div>
    </div>
  );
}
