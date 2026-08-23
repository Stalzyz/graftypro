const CACHE_NAME = 'grafty-pwa-v1';
const OFFLINE_URL = '/dashboard/chat';

const ASSETS_TO_CACHE = [
  '/',
  '/dashboard/chat',
  '/grafty_brand.svg',
  '/grafty_icon.svg',
  '/grafty_fav.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Silent catch for missing asset caching in dev
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first with Cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation/assets
  if (event.request.method !== 'GET') return;

  // Ignore non-http/https requests (e.g. chrome-extension://, moz-extension://)
  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    return;
  }
  if (!url.protocol.startsWith('http')) return;

  // Ignore API requests and WebSockets
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response && response.status === 200 && event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          }).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Network Error', { status: 408, statusText: 'Offline' });
        });
      })
  );
});

// Push Notification Event
self.addEventListener('push', (event) => {
  let data = { title: 'New WhatsApp Message', body: 'You received a message in Grafty Live Chat', url: '/dashboard/chat', count: 1 };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Update PWA Home Screen App Badge
  if ('setAppBadge' in self.navigator) {
    self.navigator.setAppBadge(data.count || 1).catch(() => {});
  }

  const options = {
    body: data.body,
    icon: '/grafty_fav.png',
    badge: '/grafty_icon.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard/chat' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event - Opens Grafty Live Chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/dashboard/chat') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
