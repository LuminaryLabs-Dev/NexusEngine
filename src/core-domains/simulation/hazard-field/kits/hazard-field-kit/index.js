import { createDomainKit } from "../../../../domain-kit.js";
import { createHazardFieldServices } from "./services.js";
import { createHazardFieldState, normalizeHazardFieldConfig } from "./contracts.js";

export { advanceHazardField, createHazardFieldState, normalizeHazard, normalizeHazardFieldConfig, queryHazardCircle } from "./contracts.js";

export function createHazardFieldKit(config = {}) {
  const normalized = normalizeHazardFieldConfig(config);
  return createDomainKit({ ...config, manifestId: "hazard-field-kit", id: config.id ?? "hazard-field-kit", domain: "hazard-field", domainPath: "n:simulation:hazard-field", parentDomainPath: "n:simulation", apiName: "hazardField", requires: ["n:simulation"], provides: ["n:simulation:hazard-field", "simulation:hazard-field"], config: normalized, initialState: createHazardFieldState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "spawned"], createApi({ baseApi }) { return createHazardFieldServices(baseApi); }, metadata: { rendererAgnostic: true, historicalSource: "src/hazard-field-kit.js@a9adca5" } });
}

export default createHazardFieldKit;
