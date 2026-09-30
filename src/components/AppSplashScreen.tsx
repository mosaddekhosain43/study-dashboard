"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck } from "lucide-react";

export default function AppSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if user already saw splash in current tab session
    const seenInSession = sessionStorage.getItem("alim_study_splash_seen");
    if (seenInSession) {
      setVisible(false);
      return;
    }

    // Smooth timing: allow logo animation to complete quickly, then fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
      sessionStorage.setItem("alim_study_splash_seen", "true");
    }, 700);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 1150);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#04130d] via-[#082218] to-[#061c14] text-white transition-opacity duration-500 ease-out select-none ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />

      {/* Animated Brand Container */}
      <div className="relative flex flex-col items-center text-center px-6 animate-rise">
        {/* Logo Icon with subtle breathing scale */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/25 blur-xl animate-pulse" />
          <div className="relative grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white shadow-2xl shadow-emerald-950/60 ring-1 ring-emerald-300/30 transition-transform duration-700 hover:scale-105">
            <BookOpenCheck className="size-8 sm:size-10 stroke-[2.2] animate-bounce-subtle" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            Study Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-emerald-300/70">
            Progress Tracker
          </p>
        </div>

        {/* Minimal loading bar */}
        <div className="mt-8 w-36 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-full animate-shimmer-fast" />
        </div>
      </div>
    </div>
  );
}
