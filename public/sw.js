const CACHE_NAME = 'class-portal-v1'
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Network-first for page navigations (so students always see fresh
// announcements/assignments when online), falling back to a friendly
// offline page only when there's truly no connection.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Cache-first for static assets (icons, manifest) — these rarely change.
  if (request.url.includes('/icon-') || request.url.includes('/manifest.json')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
  }
})
