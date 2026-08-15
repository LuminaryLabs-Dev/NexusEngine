import { createDomainKit } from "../../../../domain-kit.js";
import {
  PHYSICS_WORLD_SETTINGS_SCHEMA,
  inspectWorldValue,
  normalizeAtomicWorldSnapshot
} from "../../world-contracts.js";
import { normalizePhysicsWorldSettings, physicsWorldSettingsContract } from "./contracts.js";

export function createPhysicsWorldSettingsKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-world-settings-kit",
    id: config.id ?? "physics-world-settings-kit",
    domain: "physics-world-settings",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsWorldSettings",
    requires: ["n:physics"],
    provides: ["n:physics:world", "physics:world-settings"],
    purpose: "Normalize portable Physics coordinate, unit, bounds, and out-of-bounds settings.",
    owns: ["Physics coordinate convention", "Physics length unit", "Physics world bounds policy"],
    doesNotOwn: ["Runtime clocks", "solver settings", "semantic World regions", "provider handles"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: physicsWorldSettingsContract,
        normalize: normalizePhysicsWorldSettings,
        inspect(input) {
          return inspectWorldValue(normalizePhysicsWorldSettings, input, PHYSICS_WORLD_SETTINGS_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicWorldSnapshot(snapshot, "physics-world-settings"));
        }
      };
    }
  });
}

export default createPhysicsWorldSettingsKit;
