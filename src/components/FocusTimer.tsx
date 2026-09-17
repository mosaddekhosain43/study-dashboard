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
    // Ignore audio restrictions if blocked by browser
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
  // Default mode: 'set' (Set Timer is default as requested)
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
      className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 min-h-screen w-screen bg-[#0d1b14] p-4 sm:p-8 text-white"
          : "mx-auto w-full max-w-xl card border border-line bg-card p-6 sm:p-9 shadow-card text-ink"
      }`}
    >
      {/* ── Top Bar: Chime & Fullscreen ───────────────────────── */}
      <div className="mb-5 sm:mb-7 flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setSoundEnabled((v) => !v)}
          title={soundEnabled ? "Sound Chime Enabled" : "Sound Muted"}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            isFullscreen
              ? "border border-white/10 bg-[#1a3325] text-emerald-100/70 hover:text-white"
              : "border border-line bg-paper/60 text-ink-faint hover:text-ink hover:bg-paper"
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className={`size-3.5 ${isFullscreen ? "text-glow" : "text-leaf"}`} />
              <span>Chime On</span>
            </>
          ) : (
            <>
              <VolumeX className="size-3.5 opacity-50" />
              <span>Muted</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            isFullscreen
              ? "border border-white/10 bg-[#1a3325] text-emerald-100/70 hover:text-white"
              : "border border-line bg-paper/60 text-ink-faint hover:text-leaf hover:bg-paper"
          }`}
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

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex w-full flex-col items-center text-center">
        {/* Status Pill */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${
            isFullscreen
              ? "border border-white/10 bg-[#1a3325] text-emerald-100/70"
              : "border border-line bg-paper/70 text-ink-soft"
          }`}
        >
          {isCompleted ? (
            <>
              <Sparkles className={`size-3.5 ${isFullscreen ? "text-glow" : "text-amber-600"} animate-bounce`} />
              <span className={isFullscreen ? "text-glow font-bold" : "text-amber-700 font-bold"}>
                Target Reached! Great Job
              </span>
            </>
          ) : isRunning ? (
            <>
              <span className="relative flex size-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isFullscreen ? "bg-glow" : "bg-leaf"} opacity-75`} />
                <span className={`relative inline-flex size-2 rounded-full ${isFullscreen ? "bg-glow" : "bg-leaf"}`} />
              </span>
              <span className={isFullscreen ? "text-glow font-bold" : "text-leaf font-bold"}>
                {timerType === "set" ? `Focusing (${targetMinutes} min session)` : "Stopwatch Running"}
              </span>
            </>
          ) : (
            <>
              <TimerIcon className="size-3 opacity-60" />
              <span>
                {timerType === "set" ? `Study Target: ${targetMinutes} Min` : "Open Timer"}
              </span>
            </>
          )}
        </div>

        {/* ── Big Digital Timer Display ─────────────────────────── */}
        <div className="my-5 sm:my-7 select-none">
          <div
            className={`font-display text-7xl sm:text-8xl md:text-9xl font-extrabold tabular-nums tracking-tight transition-colors duration-200 ${
              isFullscreen
                ? isCompleted
                  ? "text-glow drop-shadow-[0_0_30px_rgba(24,185,129,0.5)] animate-pulse"
                  : isRunning
                  ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "text-emerald-50/80"
                : isCompleted
                ? "text-leaf animate-pulse"
                : isRunning
                ? "text-leaf drop-shadow-sm"
                : "text-ink"
            }`}
          >
            {timerType === "set" ? formatSeconds(remainingSeconds) : formatSeconds(freeSeconds)}
          </div>

          {currentSubjectObj && (
            <p className={`mt-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isFullscreen ? "text-glow" : "text-leaf"
            }`}>
              <BookOpen className="size-3.5" />
              <span>{currentSubjectObj.name}</span>
            </p>
          )}
        </div>

        {/* ── Progress Bar (Only for Set Timer mode) ────────────── */}
        {timerType === "set" && (
          <div className="mb-5 w-full max-w-xs">
            <div className={`h-1.5 w-full overflow-hidden rounded-full ${
              isFullscreen ? "bg-white/10" : "bg-paper-deep border border-line/60"
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isFullscreen ? "bg-glow shadow-xs shadow-glow/40" : "bg-leaf"
                }`}
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
            <div className={`mt-1 flex justify-between text-[10.5px] font-mono ${
              isFullscreen ? "text-emerald-100/40" : "text-ink-faint"
            }`}>
              <span>0%</span>
              <span>{Math.round(progressRatio * 100)}%</span>
              <span>{targetMinutes}m</span>
            </div>
          </div>
        )}

        {/* ── 2 OPTIONS: Set Timer vs Open Timer (No crowded presets) ── */}
        {!isRunning && (
          <div className="mb-5 w-full space-y-3">
            {/* 2-Option Segment Toggle */}
            <div className={`inline-flex items-center rounded-2xl p-1 shadow-2xs ${
              isFullscreen
                ? "border border-white/10 bg-[#1a3325]"
                : "border border-line bg-paper/60"
            }`}>
              <button
                type="button"
                onClick={() => handleSwitchType("set")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  timerType === "set"
                    ? isFullscreen
                      ? "bg-glow text-pine shadow-sm"
                      : "bg-leaf text-white shadow-sm"
                    : isFullscreen
                    ? "text-emerald-100/60 hover:text-white"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                <TimerIcon className="size-3.5" />
                <span>Set Timer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchType("free")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  timerType === "free"
                    ? isFullscreen
                      ? "bg-glow text-pine shadow-sm"
                      : "bg-leaf text-white shadow-sm"
                    : isFullscreen
                    ? "text-emerald-100/60 hover:text-white"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                <Play className="size-3.5 fill-current" />
                <span>Open Timer</span>
              </button>
            </div>

            {/* Set Timer input: Stepper + Direct Minute Input */}
            {timerType === "set" && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleMinutesChange(targetMinutes - 5)}
                  className={`size-8 rounded-xl transition grid place-items-center ${
                    isFullscreen
                      ? "border border-white/10 bg-[#1a3325] text-emerald-50 hover:bg-[#203f2e]"
                      : "border border-line bg-paper hover:bg-paper-deep text-ink"
                  }`}
                  title="Decrease 5 minutes"
                >
                  <Minus className="size-3.5" />
                </button>

                <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 shadow-2xs ${
                  isFullscreen
                    ? "border border-white/10 bg-[#1a3325]"
                    : "border border-line bg-paper/60"
                }`}>
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
                    className={`w-14 bg-transparent text-center font-display text-base font-bold focus:outline-none ${
                      isFullscreen ? "text-white" : "text-ink"
                    }`}
                  />
                  <span className={`text-xs font-semibold ${
                    isFullscreen ? "text-emerald-100/70" : "text-ink-faint"
                  }`}>
                    min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleMinutesChange(targetMinutes + 5)}
                  className={`size-8 rounded-xl transition grid place-items-center ${
                    isFullscreen
                      ? "border border-white/10 bg-[#1a3325] text-emerald-50 hover:bg-[#203f2e]"
                      : "border border-line bg-paper hover:bg-paper-deep text-ink"
                  }`}
                  title="Increase 5 minutes"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Subject Selection Dropdown ────────────────────────── */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <div className="relative inline-flex items-center">
            <span className={`pointer-events-none absolute left-3 ${
              isFullscreen ? "text-emerald-100/40" : "text-ink-faint"
            }`}>
              <BookOpen className="size-3.5" />
            </span>
            <select
              value={selectedSubject}
              disabled={isRunning}
              onChange={(e) =>
                setSelectedSubject(e.target.value ? Number(e.target.value) : "")
              }
              className={`rounded-xl py-2 pl-8 pr-8 text-xs sm:text-[13px] font-semibold shadow-2xs transition focus:outline-none disabled:opacity-60 ${
                isFullscreen
                  ? "border border-white/10 bg-[#1a3325] text-emerald-50/90 hover:border-white/20 focus:border-glow"
                  : "border border-line bg-paper/50 text-ink hover:border-leaf/40 focus:border-leaf focus:bg-white"
              }`}
            >
              <option value="" className={isFullscreen ? "bg-[#12251b] text-emerald-50" : ""}>
                General / Mixed study
              </option>
              {subjects.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  className={isFullscreen ? "bg-[#12251b] text-emerald-50" : ""}
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-98 ${
                isFullscreen
                  ? "bg-glow text-pine hover:brightness-105"
                  : "bg-leaf text-white hover:bg-leaf-deep"
              }`}
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-8 py-3 text-xs sm:text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-200 active:scale-98"
            >
              <Pause className="size-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {/* Stop & Save */}
          {(isRunning ||
            (timerType === "set" && remainingSeconds < totalTargetSec) ||
            (timerType === "free" && freeSeconds > 0) ||
            isCompleted) && (
            <button
              disabled={isSaving}
              onClick={handleSaveSession}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs sm:text-sm font-semibold shadow-2xs transition active:scale-98 disabled:opacity-50 ${
                isFullscreen
                  ? "border border-white/10 bg-white/5 text-emerald-50/90 hover:bg-white/10"
                  : "border border-line bg-paper hover:bg-emerald-50 hover:text-leaf hover:border-emerald-200 text-ink"
              }`}
              title="Stop and save session to today's log"
            >
              <CheckCircle2 className={`size-4 ${isFullscreen ? "text-glow" : "text-leaf"}`} />
              <span>{isSaving ? "Saving..." : "Stop & Save"}</span>
            </button>
          )}

          {/* Reset */}
          {!isRunning &&
            ((timerType === "set" && remainingSeconds < totalTargetSec) ||
              (timerType === "free" && freeSeconds > 0)) && (
              <button
                onClick={handleReset}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-semibold transition active:scale-98 ${
                  isFullscreen
                    ? "border border-white/10 bg-white/5 text-emerald-100/50 hover:bg-white/10 hover:text-white"
                    : "border border-line bg-paper text-ink-faint hover:text-ink"
                }`}
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
              className={`w-full rounded-xl px-3.5 py-2 text-xs shadow-2xs focus:outline-none ${
                isFullscreen
                  ? "border border-white/10 bg-[#1a3325] text-emerald-50 placeholder:text-emerald-100/30 focus:border-glow"
                  : "border border-line bg-paper/50 text-ink placeholder:text-ink-faint/70 focus:border-leaf focus:bg-white"
              }`}
            />
          </div>
        )}

        {/* Saved Toast */}
        {savedMessage && (
          <div className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs ${
            isFullscreen
              ? "border border-glow/30 bg-glow/10 text-glow"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}>
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Footer text */}
        <p className={`mt-5 text-[11px] ${
          isFullscreen ? "text-emerald-100/40" : "text-ink-faint"
        }`}>
          Stop saves the session to today&apos;s log.
        </p>
      </div>
    </div>
  );
}
