self.addEventListener('install', (event) => {
  console.log('Service Worker instalado!');
});

self.addEventListener('fetch', (event) => {
  // Isso permite que o app funcione offline no futuro se você configurar o cache
  event.respondWith(fetch(event.request));
});