import { createDomainKit } from "../../../../../domain-kit.js";
import { createScheduleServices } from "./services.js";
import { createScheduleState, normalizeScheduleConfig } from "./contracts.js";

export { advanceSchedule, createScheduleState, normalizeScheduleConfig } from "./contracts.js";

export function createScheduleKit(config = {}) {
  const normalized = normalizeScheduleConfig(config);
  return createDomainKit({ ...config, manifestId: "schedule-kit", id: config.id ?? "schedule-kit", domain: "schedule", domainPath: "n:runtime:sequence:schedule", parentDomainPath: "n:runtime:sequence", apiName: "schedule", requires: ["n:runtime:sequence"], provides: ["n:runtime:sequence:schedule", "sequence:schedule"], config: normalized, initialState: createScheduleState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "cycle"], createApi({ baseApi }) { return createScheduleServices(baseApi); }, metadata: { rendererAgnostic: true, historicalSource: "src/schedule-kit.js@a9adca5" } });
}

export default createScheduleKit;
