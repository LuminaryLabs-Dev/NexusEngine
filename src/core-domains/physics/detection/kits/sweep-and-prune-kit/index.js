import { sweepAndPrunePairs } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { sweepAndPruneContract } from "./contracts.js";

export function createSweepAndPruneKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "sweep-and-prune-kit",
    id: config.id ?? "sweep-and-prune-kit",
    domain: "physics-sweep-and-prune",
    apiName: config.apiName ?? "physicsSweepAndPrune",
    requires: ["n:physics", "physics:broad-phase-pair"],
    provides: ["physics:sweep-and-prune"],
    purpose: "Generate stable broad-phase pairs by finite interval sweeping with explicit unbounded handling.",
    owns: ["axis ordering", "active interval set", "candidate pair generation"],
    doesNotOwn: ["proxy state", "provider-native acceleration", "narrow-phase detection", "contacts"],
    contract: sweepAndPruneContract,
    methods: {
      findPairs: (_context, proxies, options) => sweepAndPrunePairs(proxies, options)
    }
  });
}

export default createSweepAndPruneKit;
