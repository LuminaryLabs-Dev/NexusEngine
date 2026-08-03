import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createCargoManifestServices } from "./services.js";
import { createCargoManifestState, normalizeCargoManifestConfig } from "./contracts.js";

export { createCargoManifestState, normalizeCargoManifestConfig, queryNearestCargo } from "./contracts.js";

export function createCargoManifestKit(config = {}) {
  const normalized = normalizeCargoManifestConfig(config);
  return createDomainKit({ ...config, manifestId: "cargo-manifest-kit", id: config.id ?? "cargo-manifest-kit", domain: "cargo-manifest", domainPath: "n:simulation:economy:cargo", parentDomainPath: "n:simulation:economy", apiName: "cargoManifest", requires: ["n:simulation"], provides: ["n:simulation:economy:cargo", "economy:cargo-manifest"], config: normalized, initialState: createCargoManifestState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "pickedup", "deposited", "quotacompleted"], createApi({ baseApi }) { return createCargoManifestServices(baseApi); }, metadata: { rendererAgnostic: true, historicalSource: "src/cargo-manifest-kit.js@a9adca5" } });
}

export default createCargoManifestKit;
