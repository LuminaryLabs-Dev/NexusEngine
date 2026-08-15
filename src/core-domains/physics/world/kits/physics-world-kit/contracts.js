import {
  PHYSICS_WORLD_SCHEMA,
  normalizeDefinitionCommand,
  normalizePhysicsWorld,
  normalizeRemovalCommand
} from "../../world-contracts.js";

export { normalizePhysicsWorld };

export function normalizePhysicsWorldDefinitionCommand(input) {
  return normalizeDefinitionCommand(input, "world", normalizePhysicsWorld, "Physics world definition");
}

export function normalizePhysicsWorldRemovalCommand(input) {
  return normalizeRemovalCommand(input, "worldId", "Physics world");
}

export function physicsWorldContract() {
  return Object.freeze({
    schema: PHYSICS_WORLD_SCHEMA,
    references: Object.freeze([
      "gravityFieldIds",
      "forceFieldIds",
      "windFieldIds",
      "timeScaleIds",
      "simulationRegionIds"
    ]),
    samplingMutatesState: false,
    providerExecutionOwnedExternally: true,
    bodyAndSolverStateOwnedExternally: true
  });
}
