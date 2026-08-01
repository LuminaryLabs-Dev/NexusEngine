export function createAgentExecutionLedger(initialRecords = []) {
  const records = [...initialRecords.map((record) => structuredClone(record))];
  return {
    record(entry = {}) {
      const next = {
        id: entry.id ?? `execution-${records.length + 1}`,
        agentId: entry.agentId ?? null,
        action: entry.action ?? "noop",
        accepted: entry.accepted !== false,
        result: structuredClone(entry.result ?? {}),
        evidence: structuredClone(entry.evidence ?? {})
      };
      records.push(next);
      return structuredClone(next);
    },
    list() {
      return structuredClone(records);
    },
    snapshot() {
      return { records: structuredClone(records) };
    },
    reset(nextRecords = []) {
      records.length = 0;
      records.push(...nextRecords.map((record) => structuredClone(record)));
      return this.snapshot();
    }
  };
}
