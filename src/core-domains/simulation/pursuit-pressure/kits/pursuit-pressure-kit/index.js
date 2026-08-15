import { createDomainKit } from "../../../../domain-kit.js";
import { createPursuitPressureServices } from "./services.js";
import { createPursuitPressureState, normalizePursuitPressureConfig } from "./contracts.js";

export { calculatePursuitTransition, createPursuitPressureState, normalizePursuitPressureConfig, pursuitBandFor } from "./contracts.js";

export function createPursuitPressureKit(config = {}) {
  const normalized = normalizePursuitPressureConfig(config);
  return createDomainKit({ ...config, manifestId: "pursuit-pressure-kit", id: config.id ?? "pursuit-pressure-kit", domain: "pursuit-pressure", domainPath: "n:simulation:pursuit-pressure", parentDomainPath: "n:simulation", apiName: "pursuitPressure", requires: ["n:simulation"], provides: ["n:simulation:pursuit-pressure", "simulation:pursuit-pressure"], config: normalized, initialState: createPursuitPressureState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "changed", "caught", "recovered"], createApi({ baseApi }) { return createPursuitPressureServices(baseApi); }, metadata: { rendererAgnostic: true, historicalSource: "src/pursuit-pressure-kit.js@a9adca5" } });
}

export default createPursuitPressureKit;
