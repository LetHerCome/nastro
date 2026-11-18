// Nastro funziona anche offline: pagine dalla rete se c'è, altrimenti dalla cache; il resto dalla cache.
const CACHE = 'nastro-v5';
self.addEventListener('install', e => {
  // file per file: se uno manca, gli altri restano in cache lo stesso
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(['./', './index.html', './manifest.webmanifest', './sounds/key.mp3', './sounds/ding.mp3', './sounds/ret.mp3', './sounds/space1.mp3', './sounds/space2.mp3', './sounds/space3.mp3', ...Array.from({ length: 13 }, (_, i) => `./sounds/k${i + 1}.mp3`)].map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
