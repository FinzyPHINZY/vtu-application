// const cacheData = "appV1";

// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(cacheData).then((cache) => {
//             cache.addAll([
//                 "/static/js/main.chunk.js",
//                 "/static/js/0.chunk.js",
//                 "static/js/bundle.js",
//                 "/index.html",
//                 "/",
//                 "/fonts/DM-Sans-regular.woff2",
//                 "/fonts/DM-Sans-regular.woff",
//                 "/vite.svg", // Add the SVG here
//             ]);
//         })
//     );
// });

// self.addEventListener("fetch", (event) => {
//     event.respondWith(
//         caches.match(event.request).then((resp) => {
//             if (resp) {
//                 return resp;
//             }

//         })
//     );
// });
// self.addEventListener('install', (event) => {
//     event.waitUntil(
//       caches.open('my-pwa-cache').then((cache) => {
//         return cache.addAll([
//           '/',
//           '/index.html',
//           '/manifest.json',
//           '/static/js/bundle.js',
//           // Add other assets and routes to cache
//         ]);
//       })
//     );
//   });

//   self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });


console.log("I de here")

// import { precacheAndRoute } from 'workbox-precaching'

// precacheAndRoute(self.__WB_MANIFEST)

// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING')
//     self.skipWaiting()
// })

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.open('offline-cache').then((cache) => {
//       return cache.keys().then((request) => {
//         return Promise.all(
//           request.map((request) => {
//             return caches.match(request).then((response) => {
//               if (!response || (request.mode === 'navigate' && response.status !== 200)) {
//                 return false;
//               }
//               return caches.delete(request);
//             });
//           })
//         );
//       }).then(() => self.clients.claim());
//     })
//   )
// })
