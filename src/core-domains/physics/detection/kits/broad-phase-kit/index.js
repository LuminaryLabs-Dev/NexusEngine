import { computeDetectionBounds, detectBroadPhase } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { broadPhaseContract } from "./contracts.js";

function requirePartition(engine) {
  const partition = engine.n?.physicsSpatialPartition;
  if (!partition || typeof partition.listProxies !== "function") {
    throw new Error("Physics broad phase requires physics:spatial-partition with listProxies().");
  }
  return partition;
}

export function createBroadPhaseKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "broad-phase-kit",
    id: config.id ?? "broad-phase-kit",
    domain: "physics-broad-phase",
    apiName: config.apiName ?? "physicsBroadPhase",
    requires: [
      "n:physics",
      "n:physics:shape",
      "n:physics:collider",
      "physics:spatial-partition",
      "physics:broad-phase-pair",
      "physics:dynamic-tree",
      "physics:sweep-and-prune"
    ],
    provides: ["n:physics:detection", "physics:broad-phase"],
    purpose: "Own canonical Detection discovery and deterministic broad-phase strategy selection.",
    owns: ["Detection domain identity", "shape bounds derivation", "broad-phase strategy selection", "pair candidate receipts"],
    doesNotOwn: ["collider state", "provider acceleration", "narrow-phase intersections", "contacts", "solver execution"],
    contract: broadPhaseContract,
    methods: {
      computeBounds: (_context, shape, pose) => computeDetectionBounds(shape, pose),
      detect: (_context, proxies, options) => detectBroadPhase(proxies, options),
      detectPartition: ({ engine }, options) => detectBroadPhase(requirePartition(engine).listProxies(), options)
    }
  });
}

export default createBroadPhaseKit;
