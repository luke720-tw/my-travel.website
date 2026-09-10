// Service Worker for Luke旅遊紀錄 PWA
const CACHE_NAME = 'travel-luke-cache-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './notion_data.js',
  './images.png',
  './apple-touch-icon.png',
  './manifest.json'
];

// 安裝事件：預先快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 啟動事件：清理舊快取
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

// 網路請求攔截：Network First 策略（確保能即時獲取最新內容，斷網時從快取載入）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 僅處理同源靜態檔案或 GET 請求，避開 Firebase 即時同步與跨域外部 API
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 若為導航請求（開啟頁面）且快取中沒有特定頁，退回至 index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
