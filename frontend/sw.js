/**
 * BraineX Service Worker
 * Implements caching strategies for offline capability and performance
 */

const CACHE_VERSION = 'brainex-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Core assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/fields',
  '/universities',
  '/programs',
  '/scholarships',
  '/offline.html',
  '/assets/css/design-system.css',
  '/assets/css/main.css',
  '/assets/css/fields.css',
  '/assets/css/universities.css',
  '/assets/css/programs-page.css',
  '/assets/css/unified-cards.css',
  '/assets/js/theme.js',
  '/assets/js/global.js',
  '/assets/js/main.js',
  '/assets/images/logo.png',
];

// Data files to cache
const DATA_ASSETS = [
  '/data/universities.json',
  '/data/programs.json',
  '/data/fields.json',
  '/data/scholarships.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return caches.open(API_CACHE);
      })
      .then((cache) => {
        console.log('[SW] Caching data assets');
        return cache.addAll(DATA_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith('brainex-') &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== API_CACHE
            )
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Data files - Stale while revalidate
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages - Network first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Caching strategies
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for HTML requests
    return caches.match('/offline.html');
  }
}

// Helper: Check if request is for static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.svg',
    '.woff',
    '.woff2',
    '.ico',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Prefetch resources
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PREFETCH') {
    const urls = event.data.urls || [];
    caches.open(DYNAMIC_CACHE).then((cache) => {
      urls.forEach((url) => {
        fetch(url)
          .then((response) => {
            if (response.ok) {
              cache.put(url, response);
            }
          })
          .catch(() => {});
      });
    });
  }
});
