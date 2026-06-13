// After 2AM — minimal PWA service worker.
// Installable + offline fallback: navigations are network-first and fall back
// to the cached /offline page when there's no connection. No story caching.
const CACHE = "a2s-shell-v1";
const PRECACHE = ["/offline", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Page loads: try network, fall back to the offline page when unreachable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match("/offline") || Response.error()
      )
    );
  }
});
