import { CORE_SCENE_DOMAIN_VERSION } from "./constants.js";
import { createSceneRegistry } from "./descriptors.js";
import { clone, optionalSceneId, unique } from "./utils.js";

export function createInitialSceneState(config = {}) {
  const registry = createSceneRegistry(config.registry ?? config.manifest ?? config.scenes ?? {});
  const first = Object.keys(registry)[0] ?? null;
  const currentSceneId = optionalSceneId(config.initialSceneId ?? config.currentSceneId ?? first, "initial scene id");
  if (currentSceneId && !registry[currentSceneId]) throw new Error(`Initial scene does not exist in registry: ${currentSceneId}`);
  const entryId = currentSceneId ? `initial:${currentSceneId}` : null;
  return {
    sceneDomainVersion: CORE_SCENE_DOMAIN_VERSION,
    registry,
    currentSceneId,
    previousSceneId: null,
    visitedSceneIds: currentSceneId ? [currentSceneId] : [],
    sceneEntryLedger: currentSceneId ? { [entryId]: { entryId, sceneId: currentSceneId, source: "initial", payload: clone(config.initialPayload ?? {}) } } : {},
    sceneExitLedger: {},
    transitionLedger: {},
    rejectedTransitionLedger: {},
    mountedSceneLedger: {},
    activePayload: clone(config.initialPayload ?? {}),
    unlockedTokens: unique(config.tokens ?? config.unlockedTokens ?? []),
    sceneFlags: clone(config.sceneFlags ?? {}),
    lastAcceptedTransition: null,
    lastRejectedTransition: null,
    lastMountedScene: null,
    transitionSequence: 0
  };
}

export function getSceneById(state, sceneId) {
  return state?.registry?.[sceneId] ?? null;
}

export function getCurrentScene(state) {
  return state?.currentSceneId ? getSceneById(state, state.currentSceneId) : null;
}
