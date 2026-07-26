// Service worker — Road Trip USA
// Rôle unique : permettre à l'appli de s'OUVRIR sans réseau (app shell).
// Les données (fiches Supabase) NE sont PAS gérées ici — voir loadAllFiches()
// et loadFiche()/saveFiche() dans index.html qui ont leur propre cache localStorage.
// Séparer les deux évite les conflits entre deux mécanismes de cache différents.

const CACHE_NAME = 'roadtrip-usa-shell-v2.32.0';
const APP_SHELL = [
  './',
  './index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne JAMAIS intercepter les appels Supabase (API de données) :
  // l'appli gère déjà son propre fallback offline pour ces données via localStorage.
  // Les mélanger avec le cache du service worker créerait deux sources de vérité.
  if (url.hostname.endsWith('supabase.co')) {
    return;
  }

  // Chargement de la page elle-même : réseau d'abord (pour avoir la dernière version
  // à jour dès qu'il y a du réseau), cache en secours si hors ligne.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then((r) => r || new Response('Hors ligne — page non disponible en cache', { status: 503 })))
    );
    return;
  }

  // Ressources statiques externes (polices, Leaflet, jsPDF, client Supabase JS) :
  // cache d'abord (elles changent rarement, versions figées dans les URLs), réseau en secours.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached || new Response('', { status: 503, statusText: 'Hors ligne — ressource non mise en cache' }));
    })
  );
});
