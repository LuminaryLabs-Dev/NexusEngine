import {
  createEngineRegistrySnapshot,
  planCompositionTree,
} from "nexusengine/domains/composition";
import {
  createSimulationKit,
  createMotionKit,
  createActionLocomotionKit,
  createWorldContactKit,
  createLifecycleProgressionKit,
} from "nexusengine/domains/simulation";
import { createSimulationPhysicsContractKit } from "nexusengine/domains/simulation/physics";
import { createInputKit } from "nexusengine/domains/interaction/input";
import { createInteractionKit } from "nexusengine/domains/interaction/runtime";
import { createCameraKit } from "nexusengine/domains/camera/control";
import {
  createActorRegistryKit,
  createCreatureKit,
  createCharacterKit,
  createPlayerKit,
} from "nexusengine/domains/actor";
import { createWorldDomain, createSceneKit } from "nexusengine/domains/world";
import { createSpatialKit } from "nexusengine/domains/spatial/contracts";
export const registry = createEngineRegistrySnapshot();
// Explicit executable integrations, not a second catalog. Names, ownership and
// dependency edges always come from the pinned Engine registry.
export const factories = {
  "simulation-state-kit": createSimulationKit,
  "motion-contract-kit": createMotionKit,
  "action-locomotion-kit": createActionLocomotionKit,
  "simulation-physics-contract-kit": createSimulationPhysicsContractKit,
  "world-contact-kit": createWorldContactKit,
  "lifecycle-progression-kit": createLifecycleProgressionKit,
  "input-contract-kit": createInputKit,
  "interaction-kit": createInteractionKit,
  "camera-descriptor-kit": createCameraKit,
  "actor-registry-kit": createActorRegistryKit,
  "creature-registry-kit": createCreatureKit,
  "character-registry-kit": createCharacterKit,
  "player-authority-kit": createPlayerKit,
  "world-state-kit": (config) =>
    createWorldDomain({ ...config, childDomains: false }),
  "scene-lifecycle-kit": createSceneKit,
  "spatial-contract-kit": createSpatialKit,
};
export const supported = (id) =>
  Boolean(factories[id]) ||
  ["runtime-lifecycle-kit", "realtime-runtime-kit"].includes(id);
export const kitLabel = (id) =>
  id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const capabilities = [
  {
    id: "player",
    label: "Player movement",
    kits: [
      "player-authority-kit",
      "input-contract-kit",
      "motion-contract-kit",
      "action-locomotion-kit",
    ],
    description: "Input and locomotion, connected to Player authority.",
  },
  {
    id: "identity",
    label: "Player identity",
    kits: ["player-authority-kit"],
    description: "Actor / Player · possession and control authority.",
  },
  {
    id: "character",
    label: "Character",
    kits: ["character-registry-kit"],
    description: "Actor / Character · embodied character reference.",
  },
  {
    id: "camera",
    label: "Game camera",
    kits: ["camera-descriptor-kit"],
    description: "Perspective camera with configurable FOV.",
  },
  {
    id: "collider",
    label: "Solid collider",
    kits: ["simulation-physics-contract-kit", "world-contact-kit"],
    description: "Static box collision envelope.",
  },
  {
    id: "movingPlatform", label: "Moving platform",
    kits: ["motion-contract-kit", "simulation-physics-contract-kit", "world-contact-kit"],
    description: "Configured shuttle or elevator; enable Solid collider before Apply.",
  },
  {
    id: "checkpoint", label: "Checkpoint",
    kits: ["interaction-kit", "world-contact-kit"],
    description: "Touch to set a safe respawn above this marker.",
  },
  {
    id: "finish", label: "Finish marker",
    kits: ["interaction-kit", "lifecycle-progression-kit"],
    description: "Reach this marker with the required score to finish.",
  },
  {
    id: "collectible",
    label: "Collectible",
    kits: ["interaction-kit", "lifecycle-progression-kit"],
    description: "Collection, score and objective progression.",
  },
].map((c) => ({
  ...c,
  available: c.kits.every(
    (id) => registry.kits.some((k) => k.id === id) && supported(id),
  ),
}));
export function resolveKits(requested) {
  const ids = new Set(requested),
    visiting = new Set();
  function add(id) {
    if (visiting.has(id)) return;
    const kit = registry.kits.find((k) => k.id === id);
    if (!kit || !supported(id)) throw Error(`Studio cannot execute ${id}.`);
    visiting.add(id);
    ids.add(id);
    for (const requirement of kit.requires) {
      const provider =
        registry.kits.find(
          (k) =>
            ids.has(k.id) &&
            (k.id === requirement || k.provides.includes(requirement)),
        ) ??
        registry.kits.find(
          (k) =>
            supported(k.id) &&
            (k.id === requirement || k.provides.includes(requirement)),
        );
      if (!provider) throw Error(`No supported provider for ${requirement}.`);
      add(provider.id);
    }
  }
  [...ids].forEach(add);
  return [...ids].sort();
}
const compositions = new Map();
export function compositionFor(bindings = {}, extra = []) {
  const requested = new Set([
    "runtime-lifecycle-kit",
    "realtime-runtime-kit",
    "simulation-state-kit",
    "input-contract-kit",
    "interaction-kit",
    "camera-descriptor-kit",
    "lifecycle-progression-kit",
    "world-state-kit",
    "scene-lifecycle-kit",
    ...extra,
  ]);
  for (const b of Object.values(bindings))
    for (const c of capabilities)
      if (b[c.id]) for (const id of c.kits) requested.add(id);
  if (requested.has("action-locomotion-kit")) {
    requested.add("simulation-physics-contract-kit");
    requested.add("world-contact-kit");
  }
  const ids = resolveKits(requested),
    key = JSON.stringify(ids);
  if (compositions.has(key)) return compositions.get(key);
  const domains = new Map(registry.domains.map((d) => [d.domainPath, d]));
  const nodes = [
      {
        id: "root",
        kind: "domain",
        registryId: "simulation-domain",
        parentNodeId: null,
        order: 0,
        config: {},
      },
    ],
    placed = new Map([["n:simulation", "root"]]);
  function domain(path) {
    if (placed.has(path)) return placed.get(path);
    const d = domains.get(path);
    if (!d) throw Error(`Engine domain unavailable: ${path}`);
    const parent = d.parentDomainPath ? domain(d.parentDomainPath) : "root";
    const id = `d-${d.id}`;
    placed.set(path, id);
    nodes.push({
      id,
      kind: "domain",
      registryId: d.id,
      parentNodeId: parent,
      order: nodes.length,
      config: {},
    });
    return id;
  }
  for (const id of ids) {
    const k = registry.kits.find((k) => k.id === id);
    nodes.push({
      id: `k-${id}`,
      kind: "kit",
      registryId: id,
      parentNodeId: domain(k.domainPath),
      order: nodes.length,
      config: {},
    });
  }
  const tree = {
    schema: "nexusengine.composition-tree/1",
    id: "studio-game",
    revision: 1,
    registryHash: registry.contentHash,
    rootNodeId: "root",
    nodes,
  };
  const plan = planCompositionTree(tree, registry);
  if (!plan.ok) throw Error(plan.errors.map((e) => e.message).join("; "));
  const result = { tree, plan, ids };
  if (compositions.size > 64) compositions.clear();
  compositions.set(key, result);
  return result;
}
