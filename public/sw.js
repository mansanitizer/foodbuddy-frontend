// Service Worker for FoodBuddy PWA
// This provides offline functionality and better mobile performance

const CACHE_NAME = 'foodbuddy-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/firebase-messaging-sw.js',
  '/vite.svg'
];

// Network-first strategy URLs (API calls, dynamic content)
const NETWORK_FIRST_URLS = [
  '/api/',
  '/src/',
  'https://www.gstatic.com/firebasejs/',
  'https://foodbuddy-e48dd.firebaseapp.com',
  'https://foodbuddy-e48dd.firebasestorage.app'
];

// Cache-first strategy URLs (static assets)
const CACHE_FIRST_URLS = [
  '.css',
  '.js',
  '.webp',
  '.png',
  '.jpg',
  '.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and moz-extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (shouldUseCacheFirst(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for API calls and dynamic content)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline page or error response
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    return new Response('Content not available', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Stale-while-revalidate strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  // Start network request (don't await it)
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Network request failed:', request.url);
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network response if no cache
  return networkPromise;
}

// Helper functions to determine caching strategy
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST_URLS.some(ext => url.includes(ext));
}

// Handle background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('[SW] Performing background sync');
  // Implementation would go here for syncing offline actions
}

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.webp',
      badge: '/icons/icon-72.webp',
      data: data.data || {},
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');

  event.notification.close();

  if (event.action) {
    // Handle action buttons
    console.log('[SW] Action clicked:', event.action);
  } else {
    // Handle main notification click
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        // Focus existing client or open new one
        for (const client of clientList) {
          if (client.url && client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
