import { createBroadPhaseKit } from "./kits/broad-phase-kit/index.js";
import { createSpatialPartitionKit } from "./kits/spatial-partition-kit/index.js";
import { createDynamicTreeKit } from "./kits/dynamic-tree-kit/index.js";
import { createSweepAndPruneKit } from "./kits/sweep-and-prune-kit/index.js";
import { createBroadPhasePairKit } from "./kits/broad-phase-pair-kit/index.js";
import { createNarrowPhaseKit } from "./kits/narrow-phase-kit/index.js";
import { createShapeIntersectionKit } from "./kits/shape-intersection-kit/index.js";
import { createGjkDetectionKit } from "./kits/gjk-detection-kit/index.js";
import { createEpaPenetrationKit } from "./kits/epa-penetration-kit/index.js";
import { createContinuousCollisionKit } from "./kits/continuous-collision-kit/index.js";
import { createCollisionDetectionResultKit } from "./kits/collision-detection-result-kit/index.js";

export function createPhysicsDetectionDomain(config = {}) {
  return [
    createCollisionDetectionResultKit(config.collisionDetectionResult ?? {}),
    createBroadPhasePairKit(config.broadPhasePair ?? {}),
    createSpatialPartitionKit(config.spatialPartition ?? {}),
    createDynamicTreeKit(config.dynamicTree ?? {}),
    createSweepAndPruneKit(config.sweepAndPrune ?? {}),
    createShapeIntersectionKit(config.shapeIntersection ?? {}),
    createGjkDetectionKit(config.gjkDetection ?? {}),
    createEpaPenetrationKit(config.epaPenetration ?? {}),
    createContinuousCollisionKit(config.continuousCollision ?? {}),
    createNarrowPhaseKit(config.narrowPhase ?? {}),
    createBroadPhaseKit(config.broadPhase ?? {})
  ];
}

export { createBroadPhaseKit } from "./kits/broad-phase-kit/index.js";
export { createSpatialPartitionKit } from "./kits/spatial-partition-kit/index.js";
export { createDynamicTreeKit } from "./kits/dynamic-tree-kit/index.js";
export { createSweepAndPruneKit } from "./kits/sweep-and-prune-kit/index.js";
export { createBroadPhasePairKit } from "./kits/broad-phase-pair-kit/index.js";
export { createNarrowPhaseKit } from "./kits/narrow-phase-kit/index.js";
export { createShapeIntersectionKit } from "./kits/shape-intersection-kit/index.js";
export { createGjkDetectionKit } from "./kits/gjk-detection-kit/index.js";
export { createEpaPenetrationKit } from "./kits/epa-penetration-kit/index.js";
export { createContinuousCollisionKit } from "./kits/continuous-collision-kit/index.js";
export { createCollisionDetectionResultKit } from "./kits/collision-detection-result-kit/index.js";
export * from "./detection-contracts.js";
export * from "./detection-algorithms.js";
export { default as physicsDetectionSubdomainManifest } from "./subdomain.manifest.js";
export default createPhysicsDetectionDomain;
