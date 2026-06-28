export function createCompletionLedger(initialCompleted = []) {
  const completed = new Set(initialCompleted);
  const records = [];
  return {
    complete(id, payload = {}) {
      const key = String(id);
      if (completed.has(key)) {
        return { id: key, accepted: false, duplicate: true, completed: true };
      }
      completed.add(key);
      const record = { id: key, accepted: true, duplicate: false, completed: true, payload: structuredClone(payload) };
      records.push(record);
      return structuredClone(record);
    },
    has(id) {
      return completed.has(String(id));
    },
    list() {
      return Array.from(completed);
    },
    getRecords() {
      return structuredClone(records);
    },
    reset(ids = []) {
      completed.clear();
      records.length = 0;
      for (const id of ids) completed.add(String(id));
      return this.snapshot();
    },
    snapshot() {
      return { completed: Array.from(completed), records: structuredClone(records) };
    },
    loadSnapshot(snapshot = {}) {
      return this.reset(snapshot.completed ?? []);
    }
  };
}
