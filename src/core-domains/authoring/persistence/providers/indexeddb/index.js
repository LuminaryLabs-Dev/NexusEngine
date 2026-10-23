/** Lazy compatibility adapter; concrete browser execution belongs to the host kit. */
export function createIndexedDBAuthoringStorageProvider() {
  let implementation;
  const get = async () => implementation ??= (await import('../../../../../../kits/authoring/storage/indexeddb/index.js')).createIndexedDBAuthoringStorageProvider();
  return {id:'authoring-indexeddb-storage/1',version:'1',format:'indexeddb',profile:'indexeddb-cas/1',capabilities:{persistent:true,atomic:true},
    async read(...args) { return (await get()).read(...args); },
    async write(...args) { return (await get()).write(...args); }
  };
}
