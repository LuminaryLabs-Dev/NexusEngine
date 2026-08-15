import { sameWorldValue } from "./world-contracts.js";

export function createWorldRecordRegistry({
  baseApi,
  collectionName,
  revisionName,
  recordName,
  idName,
  normalizeDefinition,
  normalizeRemoval
}) {
  const readRecord = (id) => baseApi.getState()[collectionName][id] ?? null;

  return {
    defineRecord(command = {}) {
      const request = normalizeDefinition(command);
      const record = request[recordName];
      return baseApi.applyCommand(request, (state) => {
        const existing = state[collectionName][record.id];
        if (existing && !sameWorldValue(existing, record)) {
          throw new TypeError(`${recordName} ${record.id} already exists with different content.`);
        }
        const created = !existing;
        const records = created
          ? { ...state[collectionName], [record.id]: record }
          : state[collectionName];
        const revision = created ? state[revisionName] + 1 : state[revisionName];
        return {
          patch: {
            [collectionName]: records,
            order: Object.keys(records).sort(),
            [revisionName]: revision
          },
          result: {
            [recordName]: record,
            created,
            [revisionName]: revision
          }
        };
      });
    },
    removeRecord(command = {}) {
      const request = normalizeRemoval(command);
      const id = request[idName];
      return baseApi.applyCommand(request, (state) => {
        const existing = state[collectionName][id];
        if (!existing) throw new TypeError(`Unknown ${recordName} ${id}.`);
        const records = { ...state[collectionName] };
        delete records[id];
        const revision = state[revisionName] + 1;
        return {
          patch: {
            [collectionName]: records,
            order: Object.keys(records).sort(),
            [revisionName]: revision
          },
          result: {
            [recordName]: existing,
            removed: true,
            [revisionName]: revision
          }
        };
      });
    },
    hasRecord(id) {
      return readRecord(String(id)) !== null;
    },
    getRecord(id) {
      return readRecord(String(id));
    },
    listRecords() {
      const state = baseApi.getState();
      return state.order.map((id) => state[collectionName][id]);
    }
  };
}
