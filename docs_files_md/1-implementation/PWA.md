##### 1. First, create the manifest.json file in your public folder:

`manifest.json`

```json
{
  "name": "Artworld",
  "short_name": "Artworld",
  "start_url": "/?source=pwa",
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
 '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // SVG icons
  '/assets/SHB/svg/AW-icon-square-drawing.svg',
  '/assets/SHB/svg/AW-icon-square-animation.svg',
  '/assets/SHB/svg/AW-icon-minus.svg',
  '/assets/SHB/svg/AW-icon-plus.svg',
  '/assets/SHB/svg/AW-icon-reset.svg',
  '/assets/SHB/svg/AW-icon-previous.svg',
  '/assets/SHB/svg/AW-icon-enter.svg',
  '/assets/SHB/svg/AW-icon-home.svg',
  '/assets/SHB/svg/AW-icon-heart-full-red.svg',
  '/assets/SHB/svg/AW-icon-heart.svg',
  '/assets/SHB/svg/AW-icon-enter-space.svg',
  '/assets/SHB/svg/AW-icon-save.svg',
  '/assets/SHB/svg/AW-icon-addressbook.svg',
  '/assets/SHB/svg/AW-icon-cross.svg',
  '/assets/SHB/svg/AW-icon-trash.svg',
  '/assets/SHB/svg/AW-icon-fullscreen.svg',
  '/assets/svg/icon-move.svg',
  '/assets/SHB/svg/AW-icon-more.svg',
  '/assets/svg/pencil.svg',
  '/assets/SHB/svg/AW-icon-play.svg',
  // Images
  '/assets/museum.png',
  '/assets/ball_grey.png',
  '/assets/brush3.png',
  '/assets/brickwall_white.jpg',
  '/assets/DinoA_01.png',
  '/assets/flower.png',
  '/assets/spritesheets/cloud_breathing.png',
  '/assets/svg/exhibit_outdoor_big.svg',
  '/assets/svg/exhibit_outdoor_small1.svg',
  '/assets/svg/exhibit_outdoor_small2.svg',
  '/assets/likes_balloon.png'
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
