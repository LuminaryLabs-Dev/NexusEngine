const clone = (value) => value === undefined ? undefined : structuredClone(value);

function requestPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

export function createBrowserIndexedDbAssetCacheAdapter(options = {}) {
  const indexedDB = options.indexedDB ?? globalThis.indexedDB;
  if (!indexedDB) throw new Error("IndexedDB is unavailable in this host.");
  const databaseName = String(options.databaseName ?? "nexusengine-assets");
  const storeName = String(options.storeName ?? "portable-assets");
  const version = Math.max(1, Math.floor(Number(options.version) || 1));
  let databasePromise = null;

  function open() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, version);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Could not open the NexusEngine asset cache."));
      request.onblocked = () => reject(new Error("The NexusEngine asset cache upgrade is blocked."));
    });
    return databasePromise;
  }

  async function store(mode = "readonly") {
    const database = await open();
    return database.transaction(storeName, mode).objectStore(storeName);
  }

  const api = {
    id: options.id ?? "browser-indexeddb-asset-cache",
    async get(key) {
      return clone(await requestPromise((await store()).get(String(key))) ?? null);
    },
    async put(key, value) {
      const record = { ...clone(value), key: String(key) };
      await requestPromise((await store("readwrite")).put(record));
      return clone(record);
    },
    async has(key) {
      return (await requestPromise((await store()).count(String(key)))) > 0;
    },
    async delete(key) {
      await requestPromise((await store("readwrite")).delete(String(key)));
      return true;
    },
    async list(prefix = "") {
      const values = await requestPromise((await store()).getAll());
      return values.filter((entry) => String(entry.key).startsWith(String(prefix))).map(clone);
    },
    async invalidate(prefix = "") {
      const entries = await api.list(prefix);
      for (const entry of entries) await api.delete(entry.key);
      return entries.length;
    },
    async clear() {
      await requestPromise((await store("readwrite")).clear());
      return true;
    },
    dispose() {
      databasePromise?.then((database) => database.close()).catch(() => {});
      databasePromise = null;
    }
  };
  return Object.freeze(api);
}

export default createBrowserIndexedDbAssetCacheAdapter;
