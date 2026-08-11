import {
  TIME_SCALE_SCHEMA,
  normalizeDefinitionCommand,
  normalizeRemovalCommand,
  normalizeTimeScale
} from "../../world-contracts.js";

export { normalizeTimeScale };

export function normalizeTimeScaleDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "scale", normalizeTimeScale, "Physics time-scale definition");
}

export function normalizeTimeScaleRemovalCommand(input) {
  return normalizeRemovalCommand(input, "scaleId", "Physics time scale");
}

export function timeScaleContract() {
  return Object.freeze({
    schema: TIME_SCALE_SCHEMA,
    combination: "deterministic-product",
    minimumFactor: 0,
    maximumFactor: 1000,
    runtimeClockOwnedExternally: true,
    lifecycleStepOwnedExternally: true
  });
}
