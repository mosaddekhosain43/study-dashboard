"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
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

// Gentle audio chime using Web Audio API
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
    // Ignore audio restrictions if blocked
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

export default function FocusTimer({ subjects }: Props) {
  // 2 Options: 'set' (Set Target Time) OR 'free' (Open Timer / No Limit)
  const [timerType, setTimerType] = useState<"set" | "free">("set");
  const [targetMinutes, setTargetMinutes] = useState(25);

  // Runtime State
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [freeSeconds, setFreeSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | "">("");
  const [sessionNote, setSessionNote] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
    setSavedMessage(null);
    if (type === "set") {
      setRemainingSeconds(targetMinutes * 60);
    } else {
      setFreeSeconds(0);
    }
  };

  const handleMinutesChange = (newMins: number) => {
    const valid = Math.max(1, Math.min(720, newMins));
    setTargetMinutes(valid);
    if (!isRunning) {
      setRemainingSeconds(valid * 60);
      setIsCompleted(false);
      setSavedMessage(null);
    }
  };

  const handleStart = () => {
    if (timerType === "set" && targetMinutes <= 0) return;
    setSavedMessage(null);
    setIsCompleted(false);
    setIsRunning(true);
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

  const totalTargetSec = targetMinutes * 60;
  const progressRatio =
    timerType === "set" && totalTargetSec > 0
      ? Math.min(1, Math.max(0, (totalTargetSec - remainingSeconds) / totalTargetSec))
      : 1;

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject);

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[82vh] flex-col items-center justify-center transition-colors duration-500 ${
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen w-screen bg-[#0d1b14] p-4 sm:p-8"
          : "w-full rounded-3xl bg-[#12251b] p-6 sm:p-10 shadow-2xl border border-white/8"
      }`}
    >
      {/* Top Bar: Sound toggle & Fullscreen button */}
      <div className="relative z-20 mb-4 sm:mb-6 flex w-full max-w-xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? "Sound Alert Enabled" : "Sound Alert Muted"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#1a3325] px-3 py-1.5 text-xs text-emerald-100/70 transition hover:text-white"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="size-3.5 text-glow" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="size-3.5 text-emerald-100/40" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#1a3325] px-3 py-1.5 text-xs font-medium text-emerald-100/70 transition hover:text-white"
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

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Status Pill matching sidebar Study Timer header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1a3325] px-4 py-1.5 shadow-2xs">
          {isCompleted ? (
            <>
              <Sparkles className="size-3.5 text-glow animate-bounce" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-glow">
                Target Reached! Great Job
              </span>
            </>
          ) : isRunning ? (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-glow" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-glow">
                {timerType === "set"
                  ? `Focusing (${targetMinutes} min session)`
                  : "Free Study Running"}
              </span>
            </>
          ) : (
            <>
              <TimerIcon className="size-3.5 text-emerald-100/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/50">
                {timerType === "set"
                  ? `Study Target: ${targetMinutes} Min`
                  : "Study Timer (No Limit)"}
              </span>
            </>
          )}
        </div>

        {/* ── Giant Digital Clock Display ──────────────────────── */}
        <div className="my-6 sm:my-8 select-none">
          <div
            className={`font-display text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums tracking-tight transition-colors duration-200 ${
              isCompleted
                ? "text-glow drop-shadow-[0_0_25px_rgba(24,185,129,0.5)] animate-pulse"
                : isRunning
                ? "text-white"
                : "text-emerald-50/80"
            }`}
          >
            {timerType === "set"
              ? formatSeconds(remainingSeconds)
              : formatSeconds(freeSeconds)}
          </div>

          {/* Active subject indication */}
          {currentSubjectObj && (
            <p className="mt-2 text-xs sm:text-sm font-semibold text-glow flex items-center justify-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>{currentSubjectObj.name}</span>
            </p>
          )}
        </div>

        {/* ── Progress Bar (Only when Target is Set) ────────────── */}
        {timerType === "set" && (
          <div className="mb-6 w-full max-w-xs sm:max-w-sm">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-glow transition-all duration-1000 shadow-xs shadow-glow/40"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-emerald-100/40 font-mono">
              <span>0%</span>
              <span>{Math.round(progressRatio * 100)}% completed</span>
              <span>{targetMinutes}m</span>
            </div>
          </div>
        )}

        {/* ── EXACTLY 2 OPTIONS: Set Time vs Open Timer ─────────── */}
        {!isRunning && (
          <div className="mb-6 w-full space-y-3.5">
            {/* 2-Option Segment Toggle in Pine-3 */}
            <div className="inline-flex items-center rounded-2xl border border-white/10 bg-[#1a3325] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSwitchType("set")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  timerType === "set"
                    ? "bg-glow text-pine shadow-sm"
                    : "text-emerald-100/60 hover:text-white"
                }`}
              >
                <TimerIcon className="size-3.5" />
                <span>Set Time</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchType("free")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  timerType === "free"
                    ? "bg-glow text-pine shadow-sm"
                    : "text-emerald-100/60 hover:text-white"
                }`}
              >
                <Play className="size-3.5 fill-current" />
                <span>Open Timer (No Limit)</span>
              </button>
            </div>

            {/* If "Set Time" is chosen: Simple input to choose minutes */}
            {timerType === "set" && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMinutesChange(targetMinutes - 5)}
                  className="size-8 rounded-xl border border-white/10 bg-[#1a3325] text-emerald-50 hover:bg-[#203f2e] transition grid place-items-center"
                  title="Decrease 5 minutes"
                >
                  <Minus className="size-3.5" />
                </button>

                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#1a3325] px-3.5 py-1.5 shadow-2xs">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={targetMinutes || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        handleMinutesChange(val);
                      } else {
                        setTargetMinutes(0);
                      }
                    }}
                    className="w-14 bg-transparent text-center font-display text-base font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-emerald-100/70">minutes</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleMinutesChange(targetMinutes + 5)}
                  className="size-8 rounded-xl border border-white/10 bg-[#1a3325] text-emerald-50 hover:bg-[#203f2e] transition grid place-items-center"
                  title="Increase 5 minutes"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Subject Selection (Styled exactly like original sidebar dropdown) ── */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="relative inline-flex items-center">
            <span className="pointer-events-none absolute left-3 text-emerald-100/40">
              <BookOpen className="size-3.5" />
            </span>
            <select
              value={selectedSubject}
              disabled={isRunning}
              onChange={(e) =>
                setSelectedSubject(e.target.value ? Number(e.target.value) : "")
              }
              className="rounded-xl border border-white/10 bg-[#1a3325] py-2 pl-8 pr-8 text-xs sm:text-[13px] font-semibold text-emerald-50/90 shadow-2xs transition hover:border-white/20 focus:border-glow focus:outline-none disabled:opacity-60"
            >
              <option value="" className="bg-[#12251b] text-emerald-50">
                General / Mixed study
              </option>
              {subjects.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  className="bg-[#12251b] text-emerald-50"
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Action Buttons (Matching original vibrant glow button) ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-glow px-8 sm:px-10 py-3 text-xs sm:text-sm font-bold text-pine shadow-sm transition hover:brightness-105 active:scale-98"
            >
              <Play className="size-4 fill-current" />
              <span>
                {isCompleted
                  ? "Start Again"
                  : timerType === "set" && remainingSeconds < totalTargetSec
                  ? "Resume Session"
                  : "Start"}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-8 sm:px-10 py-3 text-xs sm:text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-200 active:scale-98"
            >
              <Pause className="size-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {/* Reset or Stop & Save Button */}
          {(isRunning ||
            (timerType === "set" && remainingSeconds < totalTargetSec) ||
            (timerType === "free" && freeSeconds > 0) ||
            isCompleted) && (
            <button
              disabled={isSaving}
              onClick={handleSaveSession}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-emerald-50/90 shadow-2xs transition hover:bg-white/10 active:scale-98 disabled:opacity-50"
              title="Stop and save session to today's log"
            >
              <CheckCircle2 className="size-4 text-glow" />
              <span>{isSaving ? "Saving..." : "Stop & Save"}</span>
            </button>
          )}

          {!isRunning &&
            ((timerType === "set" && remainingSeconds < totalTargetSec) ||
              (timerType === "free" && freeSeconds > 0)) && (
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-emerald-100/50 hover:bg-white/10 hover:text-white transition active:scale-98"
                title="Reset timer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            )}
        </div>

        {/* Optional Study Note */}
        {(isRunning ||
          (timerType === "set" && remainingSeconds < totalTargetSec) ||
          (timerType === "free" && freeSeconds > 0) ||
          isCompleted) && (
          <div className="mt-4 w-full max-w-xs transition-all">
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Topic or note for today's log (optional)..."
              className="w-full rounded-xl border border-white/10 bg-[#1a3325] px-3.5 py-2 text-xs text-emerald-50 placeholder:text-emerald-100/30 shadow-2xs focus:border-glow focus:outline-none"
            />
          </div>
        )}

        {/* Saved Success Notification */}
        {savedMessage && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-glow/30 bg-glow/10 px-4 py-2 text-xs font-semibold text-glow shadow-2xs">
            <CheckCircle2 className="size-4 text-glow shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Subtitle matching original screenshot */}
        <p className="mt-5 text-[11px] text-emerald-100/40">
          Stop saves the session to today&apos;s log.
        </p>
      </div>
    </div>
  );
}
