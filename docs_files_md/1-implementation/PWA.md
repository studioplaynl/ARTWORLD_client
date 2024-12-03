##### 1. First, create the manifest.json file in your public folder:

`manifest.json`

```json
{
  "name": "Artworld",
  "short_name": "Artworld",
  "start_url": "/",
  "display": "fullscreen",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "landscape",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 2. Next, create the service-worker.js file in your public folder:

`index.html`

```html
<head>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#000000">
  <!-- Add these for iOS support -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
</head>
```

#### 3. Create service-worker.js in your public folder:

`service-worker.js`

```javascript
const CACHE_NAME = 'artworld-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/assets/world_artworld/',
  // Add paths to your critical assets here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch new
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

##### 4. Update your App.svelte to register the service worker:

`App.svelte`

```javascript
onMount(async () => {
  document.getElementById('loader').classList.add('hide');

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful');
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err);
    }
  }

  // Your existing onMount code...
  await restoreSession();
  // ...
});
```
#### 5. Create icons for your app (if you don't have them already):


- Create a 192x192 and 512x512 version of your app icon
- Place them in public/icons/ directory
- Make sure the paths in manifest.json match your icon locations

To test:
- Build and deploy your app
- Open Chrome DevTools
- Go to Application tab
