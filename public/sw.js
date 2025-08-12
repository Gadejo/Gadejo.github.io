// ADHD Learning RPG - Service Worker (Fixed)
// Provides offline capability and caching for better performance

const CACHE_NAME = 'adhd-learning-rpg-v4.1.0';
const RUNTIME_CACHE = 'adhd-runtime-cache-v4.1.0';
const API_CACHE = 'adhd-api-cache-v4.1.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add built assets that will be available after build
  // These will be populated dynamically during install
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Helper function to check if URL is cacheable
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache these schemes/origins
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:' ||
      url.hostname === 'cloudflareinsights.com') {
    return false;
  }
  
  return true;
}

// Get cache strategy for request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // API calls - Network first with fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Static assets - Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // HTML pages - Stale while revalidate
  if (url.pathname === '/' || request.mode === 'navigate') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Cache response with appropriate cache
function cacheResponse(request, response, strategy) {
  const url = new URL(request.url);
  let cacheName = RUNTIME_CACHE;
  
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) {
    cacheName = API_CACHE;
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
    cacheName = CACHE_NAME;
  }
  
  return caches.open(cacheName).then(cache => {
    return cache.put(request, response.clone());
  });
}

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when possible with advanced strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip uncacheable requests
  if (!isCacheableRequest(event.request)) {
    return;
  }

  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(
    handleRequestWithStrategy(event.request, strategy)
  );
});

// Handle request with specific caching strategy
async function handleRequestWithStrategy(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

// Cache First Strategy - for static assets
async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cacheResponse(request, response, CACHE_STRATEGIES.CACHE_FIRST);
    }
    return response;
  } catch (error) {
    console.warn('Cache first failed for:', request.url, error);
    throw error;
  }
}

// Network First Strategy - for API calls
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cacheResponse(request, response, CACHE_STRATEGIES.NETWORK_FIRST);
    }
    return response;
  } catch (error) {
    console.warn('Network first failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request, serve app shell
    if (request.mode === 'navigate') {
      const appShell = await caches.match('/index.html');
      if (appShell) {
        return appShell;
      }
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy - for HTML pages
async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cacheResponse(request, response, CACHE_STRATEGIES.STALE_WHILE_REVALIDATE);
    }
    return response;
  }).catch(error => {
    console.warn('Stale while revalidate background fetch failed:', error);
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network response
  return fetchPromise;
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-data') {
    event.waitUntil(syncOfflineData());
  } else if (event.tag === 'sync-study-sessions') {
    event.waitUntil(syncStudySessions());
  } else if (event.tag === 'sync-achievements') {
    event.waitUntil(syncAchievements());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: 'Time for your study session! 🎮📚',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-study',
        title: 'Start Studying',
        icon: '/vite.svg'
      },
      {
        action: 'remind-later',
        title: 'Remind Later',
        icon: '/vite.svg'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('ADHD Learning RPG', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
  if (event.action === 'start-study') {
    event.waitUntil(
      clients.openWindow('/?action=quick-study')
    );
  } else if (event.action === 'remind-later') {
    // Schedule another notification
    console.log('Service Worker: Reminder scheduled');
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-study-reminders') {
    event.waitUntil(checkStudyReminders());
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  } else if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }
});

// Sync functions
async function syncOfflineData() {
  try {
    console.log('Service Worker: Syncing offline data');
    // Sync any offline data here
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    throw error;
  }
}

async function syncStudySessions() {
  try {
    console.log('Service Worker: Syncing study sessions');
    // Sync study sessions created offline
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Study session sync failed', error);
    throw error;
  }
}

async function syncAchievements() {
  try {
    console.log('Service Worker: Syncing achievements');
    // Sync achievement progress
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Achievement sync failed', error);
    throw error;
  }
}

async function checkStudyReminders() {
  try {
    console.log('Service Worker: Checking study reminders');
    // Check if user should be reminded to study
    const clients = await self.clients.matchAll();
    if (clients.length === 0) {
      // App not open, check if reminder is needed
      const lastStudyTime = await getLastStudyTime();
      const now = Date.now();
      const hoursSinceLastStudy = (now - lastStudyTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastStudy >= 24) {
        await self.registration.showNotification('Study Reminder', {
          body: 'Haven\'t studied in a while? Keep your streak alive! 🔥',
          icon: '/vite.svg',
          badge: '/vite.svg',
          data: { type: 'reminder' }
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Reminder check failed', error);
  }
}

async function getLastStudyTime() {
  // Get last study time from IndexedDB or localStorage
  try {
    const cache = await caches.open(API_CACHE);
    const response = await cache.match('/api/last-study');
    if (response) {
      const data = await response.json();
      return data.lastStudyTime;
    }
  } catch (error) {
    console.warn('Could not get last study time:', error);
  }
  return Date.now(); // Default to now if not found
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}
