// Service Worker for Alim Study Dashboard PWA (Robust Offline Support)
const CACHE_NAME = "study-dashboard-v2";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/avatars/male.png",
  "/avatars/female.png",
  "/icon.png",
  "/apple-icon.png",
];

// 1. Install: Pre-cache essential static assets individually
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache skipped for ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate: Clean up older cache versions and claim clients immediately
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

// 3. Fetch Event Handler
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST server actions)
  if (request.method !== "GET") {
    return;
  }

  // A. Static Assets: JS chunks, CSS, fonts, avatars, icons (Cache-First)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/avatars/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Return safe fallback for images if missing
            return new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // B. Full HTML Page Navigation: Network-First with Cache Fallback
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
          // 1. Try exact requested page from cache
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // 2. Try URL without query strings
          const cleanUrl = url.origin + url.pathname;
          const cachedClean = await caches.match(cleanUrl);
          if (cachedClean) return cachedClean;

          // 3. Fallback to cached Root Dashboard
          const cachedHome = await caches.match("/");
          if (cachedHome) return cachedHome;

          // 4. Safe offline fallback HTML
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Study Dashboard — Offline Mode</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0c1813; color: #e2e8f0; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center; }
                .card { background: #13241c; border: 1px solid #1f3a2c; padding: 32px 24px; border-radius: 24px; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #34d399; font-size: 20px; margin-bottom: 8px; font-weight: 700; }
                p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
                .btn { display: inline-block; background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Offline Mode</h1>
                <p>You are currently offline. Any changes made offline will automatically sync when connection is restored.</p>
                <a href="/" class="btn">Go to Dashboard</a>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // C. Next.js RSC fetches and dynamic API requests
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
        .catch(() => {
          // If offline and cached, return cached
          if (cachedResponse) return cachedResponse;
          // IMPORTANT: Never return undefined to respondWith!
          // Return a 503 Response so Next.js or the browser handles offline gracefully without throwing an uncaught FetchEvent TypeError
          return new Response(
            JSON.stringify({ error: "Offline mode active" }),
            {
              status: 503,
              statusText: "Service Unavailable (Offline)",
              headers: { "Content-Type": "application/json" },
            }
          );
        });

      return cachedResponse || fetchPromise;
    })
  );
});
