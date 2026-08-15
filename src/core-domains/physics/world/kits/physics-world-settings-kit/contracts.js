import {
  PHYSICS_WORLD_SETTINGS_SCHEMA,
  normalizePhysicsWorldSettings
} from "../../world-contracts.js";

export { normalizePhysicsWorldSettings };

export function physicsWorldSettingsContract() {
  return Object.freeze({
    schema: PHYSICS_WORLD_SETTINGS_SCHEMA,
    coordinateSystems: Object.freeze(["right-handed", "left-handed"]),
    lengthUnit: "meters-per-engine-unit",
    boundsShape: "axis-aligned-box",
    providerExecutionOwnedExternally: true,
    runtimeClockOwnedExternally: true
  });
}
