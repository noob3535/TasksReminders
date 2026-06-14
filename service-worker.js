const CACHE_NAME = "taskpulse-cache-v7";
const BASE_PATH = "/TasksReminders/";
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}styles.css`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon.svg`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isAppShell =
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname === BASE_PATH ||
      requestUrl.pathname === `${BASE_PATH}index.html` ||
      requestUrl.pathname === `${BASE_PATH}styles.css` ||
      requestUrl.pathname === `${BASE_PATH}app.js` ||
      requestUrl.pathname === `${BASE_PATH}manifest.webmanifest`);

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(`${BASE_PATH}index.html`)))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}index.html`));
    })
  );
});
