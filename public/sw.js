// Service Worker for Alim Study Dashboard PWA (Offline Support)
const CACHE_NAME = "study-dashboard-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/avatars/male.png",
  "/avatars/female.png",
  "/timer",
  "/subjects",
  "/settings",
];

// 1. Install: Pre-cache essential shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache error (non-fatal):", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: Cache-First for static assets, Network-First for navigation with cache fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST server actions)
  if (request.method !== "GET") {
    return;
  }

  // Static Assets (_next/static, avatars, icons, fonts): Cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/avatars/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML Page Navigation: Network-First, with cache fallback when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: Return cached page or root dashboard
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          const cachedHome = await caches.match("/");
          if (cachedHome) return cachedHome;
          return new Response(
            `<!DOCTYPE html>
            <html lang="bn">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Study Dashboard - Offline Mode</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #0c1813; color: #e2e8f0; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
                .card { background: #13241c; border: 1px solid #1f3a2c; padding: 32px 24px; border-radius: 24px; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #34d399; font-size: 20px; margin-bottom: 8px; }
                p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
                button { background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Offline Mode (ইন্টারনেট সংযোগ নেই)</h1>
                <p>আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট কানেকশন পাওয়া মাত্রই অ্যাপটি পুনরায় আপডেট হবে। ইতিমধ্যে সেভ হওয়া পড়া দেখতে পারেন।</p>
                <button onclick="window.location.reload()">পুনরায় চেষ্টা করুন (Retry)</button>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
