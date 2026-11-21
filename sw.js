/* Offline shell. Bump V when you change files so tablets pick up the update. */
const V = 'im-vote-v2', FILES = ['./', 'index.html', 'styles.css', 'app.js', 'config.js', 'logo.jpg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });