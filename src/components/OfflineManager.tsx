"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, Download, Check, CheckCircle2, X } from "lucide-react";
import { processOfflineSyncQueue } from "@/lib/offlineSync";

export default function OfflineManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Service Worker registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });

      // Warm offline cache for essential routes in the background
      if (navigator.onLine) {
        setTimeout(() => {
          const routesToWarm = [
            "/",
            "/timer",
            "/subjects",
            "/remaining",
            "/log",
            "/weekly",
            "/analytics",
            "/syllabus",
            "/settings",
            "/search",
            "/feedback",
            "/planner",
          ];
          routesToWarm.forEach((r) => {
            fetch(r, { credentials: "same-origin" }).catch(() => {});
            fetch(r, { headers: { RSC: "1" }, credentials: "same-origin" }).catch(() => {});
          });

          // Also warm individual subject links visible on the page
          setTimeout(() => {
            try {
              const links = Array.from(document.querySelectorAll('a[href^="/subjects/"]'))
                .map((a) => (a as HTMLAnchorElement).pathname)
                .filter((p) => p && p !== "/subjects");
              const uniqueLinks = Array.from(new Set(links));
              uniqueLinks.forEach((link) => {
                fetch(link, { credentials: "same-origin" }).catch(() => {});
                fetch(link, { headers: { RSC: "1" }, credentials: "same-origin" }).catch(() => {});
              });
            } catch {}
          }, 3000);
        }, 1200);
      }
    }

    // 2. Online / Offline status tracking and Auto-Sync
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineToast(false);
      setShowReconnected(true);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => setShowReconnected(false), 3500);
      processOfflineSyncQueue().catch(() => {});
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setShowOfflineToast(true);
      if (offlineTimer) clearTimeout(offlineTimer);
      offlineTimer = setTimeout(() => setShowOfflineToast(false), 3500);
    };

    // Initial check without popping up intrusive banner
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    // Also try syncing on startup if online
    if (typeof navigator !== "undefined" && navigator.onLine) {
      processOfflineSyncQueue().catch(() => {});
    }

    const handleSyncedEvent = (e: any) => {
      const count = e.detail?.count || 0;
      if (count > 0) {
        setSyncedCount(count);
        setTimeout(() => setSyncedCount(null), 4000);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("alim-offline-synced", handleSyncedEvent);

    // 3. PWA Install Prompt Capture
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      if (offlineTimer) clearTimeout(offlineTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("alim-offline-synced", handleSyncedEvent);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {/* Offline Status Brief Toast (Auto-dismisses in 3.5s or tap close) */}
      {showOfflineToast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rise">
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-600/95 px-3.5 py-2.5 text-white shadow-xl backdrop-blur-sm ring-1 ring-white/20">
            <WifiOff className="size-4 shrink-0 text-amber-200" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">Offline Mode</p>
              <p className="text-[11px] text-amber-100 leading-tight mt-0.5">
                No internet connection. Viewing cached data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOfflineToast(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15 transition cursor-pointer"
              title="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {showReconnected && !isOffline && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rise">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600/95 px-4 py-3 text-white shadow-xl backdrop-blur-sm ring-1 ring-white/20">
            <Wifi className="size-5 shrink-0 text-emerald-200" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">
                Back Online
              </p>
              <p className="text-[11px] text-emerald-100 leading-tight mt-0.5">
                Internet connection restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Sync Confirmation Toast */}
      {syncedCount !== null && (
        <div className="fixed bottom-18 left-4 right-4 z-50 mx-auto max-w-md rise">
          <div className="flex items-center gap-3 rounded-2xl bg-teal-700/95 px-4 py-3 text-white shadow-xl backdrop-blur-sm ring-1 ring-white/20">
            <CheckCircle2 className="size-5 shrink-0 text-teal-200" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight">
                Auto-Synced with Cloud
              </p>
              <p className="text-[11px] text-teal-100 leading-tight mt-0.5">
                {syncedCount} offline topic{syncedCount === 1 ? "" : "s"} synced to server.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Button (if available) */}
      {installPrompt && !installed && (
        <div className="fixed bottom-20 right-4 z-40 hidden sm:block rise">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 rounded-2xl bg-pine border border-leaf/30 text-white px-3.5 py-2.5 text-xs font-bold shadow-xl hover:bg-pine/90 transition ring-1 ring-white/10"
            title="Install Dashboard as an app on your device"
          >
            <Download className="size-4 text-glow" />
            <span>Install App</span>
          </button>
        </div>
      )}
    </>
  );
}
