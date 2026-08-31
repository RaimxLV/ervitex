/**
 * Persistent catalog cache (IndexedDB).
 *
 * The catalog is a few thousand rows that change at most once per nightly
 * supplier sync. Storing the raw rows in the browser lets repeat visits render
 * instantly from disk (stale-while-revalidate) instead of waiting for ~6
 * paginated database requests. localStorage is too small for this payload, so
 * IndexedDB is used directly (no dependency).
 */

const DB_NAME = "ervitex-catalog";
const STORE = "scopes";
const DB_VERSION = 1;

/** Bump when the cached row shape changes so old entries are ignored. */
const SCHEMA_VERSION = 2;

/** Cached data older than this is refreshed before being trusted for display. */
export const CATALOG_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export interface CatalogCacheEntry {
  schema: number;
  savedAt: number;
  items: unknown[];
  prices: unknown[];
}

const openDb = (): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });

export const readCatalogCache = async (
  key: string,
): Promise<{ entry: CatalogCacheEntry; stale: boolean } | null> => {
  const db = await openDb();
  if (!db) return null;
  try {
    const entry = await new Promise<CatalogCacheEntry | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as CatalogCacheEntry) || null);
      req.onerror = () => resolve(null);
    });
    if (!entry || entry.schema !== SCHEMA_VERSION) return null;
    if (!Array.isArray(entry.items) || !entry.items.length) return null;
    return { entry, stale: Date.now() - entry.savedAt > CATALOG_CACHE_TTL_MS };
  } catch {
    return null;
  } finally {
    db.close();
  }
};

export const writeCatalogCache = async (
  key: string,
  items: unknown[],
  prices: unknown[],
): Promise<void> => {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(
        { schema: SCHEMA_VERSION, savedAt: Date.now(), items, prices } satisfies CatalogCacheEntry,
        key,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch {
    /* quota or private-mode failures are non-fatal */
  } finally {
    db.close();
  }
};

export const clearCatalogCache = async (): Promise<void> => {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
};
