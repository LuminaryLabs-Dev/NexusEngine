import {
  createBroadPhasePair,
  detectionProxyPairAllowed,
  normalizeBroadPhasePair
} from "../../detection-contracts.js";
import { sortBroadPhasePairs } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { broadPhasePairContract } from "./contracts.js";

export function createBroadPhasePairKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "broad-phase-pair-kit",
    id: config.id ?? "broad-phase-pair-kit",
    domain: "physics-broad-phase-pair",
    apiName: config.apiName ?? "physicsBroadPhasePair",
    requires: ["n:physics", "n:physics:collider"],
    provides: ["physics:broad-phase-pair"],
    purpose: "Create stable broad-phase pairs after symmetric collision-filter evaluation.",
    owns: ["pair identity", "pair filtering", "pair deduplication", "pair ordering"],
    doesNotOwn: ["proxy state", "collision detection", "contacts", "solver execution"],
    contract: broadPhasePairContract,
    methods: {
      create: (_context, left, right) => createBroadPhasePair(left, right),
      normalize: (_context, pair) => normalizeBroadPhasePair(pair),
      allowed: (_context, left, right) => detectionProxyPairAllowed(left, right),
      sort: (_context, pairs) => sortBroadPhasePairs(pairs)
    }
  });
}

export default createBroadPhasePairKit;
