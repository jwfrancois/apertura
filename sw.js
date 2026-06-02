// Apertura Service Worker — minimal offline-first cache
const CACHE = 'apertura-v2';
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
