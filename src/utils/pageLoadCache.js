// Memory-only: browser refresh or a new login resets these background loads.
export function createPageLoadCache(identity) {
  let scope;
  const entries = new Map();
  const synchronize = () => {
    const next = identity();
    if (next !== scope) {
      entries.clear();
      scope = next;
    }
  };
  return {
    load(key, loader) {
      synchronize();
      if (!entries.has(key)) {
        const promise = Promise.resolve().then(loader);
        entries.set(key, promise);
        promise.catch(() => {
          if (entries.get(key) === promise) entries.delete(key);
        });
      }
      return entries.get(key);
    },
    async update(key, updater) {
      synchronize();
      const promise = entries.get(key);
      if (!promise) return;
      const value = await promise;
      synchronize();
      if (entries.get(key) === promise) updater(value);
    },
    clear() {
      entries.clear();
      scope = undefined;
    },
  };
}

const cache = createPageLoadCache(() => JSON.stringify([
  localStorage.getItem("token"),
  localStorage.getItem("userId"),
  localStorage.getItem("role"),
]));

export const loadOncePerLogin = (key, loader) => cache.load(key, loader);
export const updatePageLoadCache = (key, updater) => cache.update(key, updater);
export const clearPageLoadCache = () => cache.clear();
