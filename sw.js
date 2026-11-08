// Service worker: el app completo funciona sin internet.
// Estrategia: responde desde la caché al instante y actualiza en segundo plano cuando hay conexión.
const CACHE = "interpjud-v6";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "js/app.js", "js/audio.js", "js/ai.js", "js/content.js", "js/drills.js", "js/criterios.js", "js/modulos.js", "js/banco2.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return;
  const key = req.mode === "navigate" ? "index.html" : req;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(req).then((r) => {
      if (r && r.ok) cache.put(key, r.clone());
      return r;
    }).catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }
    return (await network) || (await cache.match("index.html")) || new Response("Sin conexión", { status: 503 });
  })());
});
