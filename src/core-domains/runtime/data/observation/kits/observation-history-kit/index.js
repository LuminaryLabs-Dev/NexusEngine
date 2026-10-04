import { createDomainKit } from "../../../../../domain-kit.js";
import { validateRetention } from "../../contracts.js";
import { createHistoryState, append, retain, loadHistory } from "./state.js";
export * from "../../contracts.js";

export function createObservationHistoryKit(config = {}) {
  const initial = createHistoryState(config.retention);
  return createDomainKit({
    manifestId: "observation-history-kit", id: "observation-history-kit", domain: "observation-history",
    domainPath: "n:runtime:data:observation", parentDomainPath: "n:runtime:data", apiName: "observationHistory",
    stability: "stable-candidate", version: "0.0.4", requires: ["n:runtime:data"], provides: ["n:runtime:data:observation", "data:observation-history"],
    initialState: { history: initial },
    createApi({ world, State, baseApi }) {
      const read = () => world.getResource(State).history;
      const write = history => baseApi.update({ history });
      return {
        appendCommitted(record) { const next = append(read(), record); if (next !== read()) write(next); return structuredClone(record); },
        getFrame(identity) { return structuredClone(read().records.find(record => ["sessionId", "epoch", "sourceFrame"].every(key => record[key] === identity[key])) ?? null); },
        list({ after = null, limit = 100 } = {}) {
          if (!Number.isSafeInteger(limit) || limit < 1) throw new TypeError("Invalid history limit.");
          const records = read().records;
          const index = after ? records.findIndex(record => ["sessionId", "epoch", "sourceFrame"].every(key => record[key] === after[key])) : -1;
          if (after && index < 0) throw new Error("History cursor was evicted or is unknown.");
          return structuredClone(records.slice(index + 1, index + 1 + limit));
        },
        setRetention(retention) { const next = retain({ ...read(), ...validateRetention(retention) }); write(next); return structuredClone(next); },
        getSnapshot() { return structuredClone(read()); },
        loadSnapshot(snapshot) { const next = loadHistory(snapshot); write(next); return structuredClone(next); },
        reset() { write(structuredClone(initial)); return structuredClone(initial); }
      };
    }
  });
}
