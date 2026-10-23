/** Optional bounded hot window; archives retain older evidence without putting it in ECS. */
export function createAgentExecutionLedger(initialRecords = [], options = {}) {
  const records = [];
  let sequence = 0, bytes = 0;
  const maxRecords = options.maxRecords ?? Infinity, maxBytes = options.maxBytes ?? Infinity;
  if (!(maxRecords >= 1) || !(maxBytes >= 1)) throw new TypeError("Invalid execution ledger budget.");
  const size = value => JSON.stringify(value).length * 2;
  function retain(next) {
    records.push(next); bytes += size(next);
    while (records.length > maxRecords || (bytes > maxBytes && records.length > 0)) bytes -= size(records.shift());
  }
  for (const record of initialRecords) { retain(structuredClone(record)); sequence++; }
  return {
    record(entry = {}) {
      sequence++;
      const next = { id: entry.id ?? `execution-${sequence}`, agentId: entry.agentId ?? null,
        action: entry.action ?? "noop", accepted: entry.accepted !== false,
        result: structuredClone(entry.result ?? {}), evidence: structuredClone(entry.evidence ?? {}) };
      options.archive?.(structuredClone(next));
      retain(next);
      return structuredClone(next);
    },
    get: id => structuredClone(records.find(r => r.id === id) ?? options.retrieve?.(id) ?? null),
    list: () => structuredClone(records),
    snapshot: () => ({ records: structuredClone(records) }),
    diagnostics: () => ({ records: records.length, bytes, maxRecords, maxBytes }),
    reset(nextRecords = []) {
      records.length = 0; bytes = 0; sequence = 0;
      for (const record of nextRecords) { retain(structuredClone(record)); sequence++; }
      return this.snapshot();
    }
  };
}
