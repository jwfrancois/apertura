// Apertura Service Worker — offline-first cache
// v3: include auth.js with cache-busting query + delete all old caches aggressively
const CACHE = 'apertura-v4';
const PRECACHE = [
  '/',
  '/index.html',
  '/curriculum.html',
  '/history.html',
  '/resources.html',
  '/about.html',
  '/assessment.html',
  '/glossary.html',
  '/careers.html',
  '/login.html',
  '/register.html',
  '/profile.html',
  '/admin.html',
  '/manifest.json',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/lessons.js',
  '/assets/auth.js',
  '/assets/resources.js',
  '/assets/resources-app.js',
  '/assets/assessment.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .catch((err) => console.warn('[sw] precache failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        // Delete ALL old caches, not just non-matching ones — v1 had wrong auth.js
        keys.filter((k) => k !== CACHE).map((k) => {
          console.log('[sw] deleting old cache', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Network-first for HTML to avoid stale shells; cache-first for everything else
  const url = new URL(e.request.url);
  const isHTML = e.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/';
  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match('/index.html')))
    );
    return;
  }
  // Cache-first for assets, with network fallback
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
