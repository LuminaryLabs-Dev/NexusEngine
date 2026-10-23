const clone = (value) => structuredClone(value);
const checkId = (id) => {
  if (typeof id !== "string" || !id.trim()) throw new TypeError("Context key must be a nonempty string.");
  return id;
};

export function createAgentContextStore({ maxEntries = 256, maxTextLength = 16000 } = {}) {
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || !Number.isSafeInteger(maxTextLength) || maxTextLength < 1) {
    throw new RangeError("Context budgets must be positive integers.");
  }
  const records = new Map();
  return Object.freeze({
    put(agentId, key, value, { source = null } = {}) {
      checkId(agentId); checkId(key);
      const json = JSON.stringify(value);
      if (json === undefined || json.length > maxTextLength) throw new RangeError("Context exceeds configured budget.");
      const id = JSON.stringify([agentId, key]);
      if (!records.has(id) && records.size >= maxEntries) throw new RangeError("Context entry limit reached.");
      const entry = { agentId, key, value: clone(value), source, revision: (records.get(id)?.revision ?? 0) + 1 };
      records.set(id, entry);
      return clone(entry);
    },
    get(agentId, key) {
      checkId(agentId); checkId(key);
      const entry = records.get(JSON.stringify([agentId, key]));
      return entry ? clone(entry) : null;
    },
    list(agentId) {
      checkId(agentId);
      return [...records.values()].filter(x => x.agentId === agentId).map(clone);
    },
    remove(agentId, key) {
      checkId(agentId); checkId(key);
      return records.delete(JSON.stringify([agentId, key]));
    },
    snapshot() { return { schema: "nexusengine.agent-context/1", entries: [...records.values()].map(clone) }; },
    restore(snapshot) {
      if (snapshot?.schema !== "nexusengine.agent-context/1" || !Array.isArray(snapshot.entries) || snapshot.entries.length > maxEntries) {
        throw new TypeError("Invalid agent context snapshot.");
      }
      const staged = new Map();
      for (const item of snapshot.entries) {
        checkId(item.agentId); checkId(item.key);
        const serialized = JSON.stringify(item.value);
        if (serialized === undefined || serialized.length > maxTextLength) throw new RangeError("Restored context exceeds configured budget.");
        const id = JSON.stringify([item.agentId, item.key]);
        if (staged.has(id) || !Number.isSafeInteger(item.revision) || item.revision < 1) throw new TypeError("Invalid or duplicate context entry.");
        staged.set(id, clone(item));
      }
      records.clear();
      for (const [key, value] of staged) records.set(key, value);
      return this.snapshot();
    }
  });
}
