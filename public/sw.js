function isWorkboxCacheForThisRegistration(name) {
  const hasWorkboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return hasWorkboxBucket && name.endsWith(self.registration.scope);
}

async function isCacheForThisRegistration(name) {
  if (isWorkboxCacheForThisRegistration(name) || /^workbox-/.test(name) || name.includes("ervitex")) return true;
  try {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    return requests.some((request) => request.url.startsWith(self.registration.scope));
  } catch (_error) {
    return false;
  }
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const appCacheChecks = await Promise.all(cacheNames.map(async (name) => [name, await isCacheForThisRegistration(name)]));
        const appCacheNames = appCacheChecks.filter(([, isAppCache]) => isAppCache).map(([name]) => name);
        await Promise.allSettled(appCacheNames.map((name) => caches.delete(name)));
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);