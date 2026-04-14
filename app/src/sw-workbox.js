// Workbox service worker loader via CDN. This file expects to be served at /src/sw-workbox.js
// It uses importScripts to pull workbox and then configures precaching and runtime caching.
try{
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
  if(workbox){
    // Precache the app shell. In a production build you'd replace this with a generated manifest.
    workbox.precaching.precacheAndRoute([
      {url: '/', revision: 'v1'},
      {url: '/index.html', revision: 'v1'},
    ]);

    // Cache JS/CSS with StaleWhileRevalidate
    workbox.routing.registerRoute(
      ({request}) => request.destination === 'script' || request.destination === 'style',
      new workbox.strategies.StaleWhileRevalidate({cacheName: 'static-resources'})
    );

    // Cache images with a CacheFirst strategy
    workbox.routing.registerRoute(
      ({request}) => request.destination === 'image',
      new workbox.strategies.CacheFirst({cacheName: 'images', plugins: [new workbox.expiration.ExpirationPlugin({maxEntries:50})]})
    );

    // Default handler: NetworkFirst for navigation requests
    workbox.routing.registerRoute(
      ({request}) => request.mode === 'navigate',
      new workbox.strategies.NetworkFirst({cacheName: 'pages'})
    );
  }
}catch(e){
  // if importScripts or workbox fails, no SW features — graceful degrade
  console.warn('Workbox failed to load', e);
}
