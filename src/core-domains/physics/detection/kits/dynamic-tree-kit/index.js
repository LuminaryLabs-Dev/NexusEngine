import { buildDynamicTree, dynamicTreePairs, queryDynamicTree } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { dynamicTreeContract } from "./contracts.js";

export function createDynamicTreeKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "dynamic-tree-kit",
    id: config.id ?? "dynamic-tree-kit",
    domain: "physics-dynamic-tree",
    apiName: config.apiName ?? "physicsDynamicTree",
    requires: ["n:physics", "physics:broad-phase-pair"],
    provides: ["physics:dynamic-tree"],
    purpose: "Build deterministic immutable AABB trees without owning provider-native acceleration structures.",
    owns: ["portable tree construction", "tree traversal", "tree pair candidates"],
    doesNotOwn: ["proxy registry", "provider-native trees", "narrow-phase detection", "contacts"],
    contract: dynamicTreeContract,
    methods: {
      build: (_context, proxies) => buildDynamicTree(proxies),
      query: (_context, tree, bounds) => queryDynamicTree(tree, bounds),
      findPairs: (_context, proxies) => dynamicTreePairs(proxies)
    }
  });
}

export default createDynamicTreeKit;
