import { gjkDetect } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { gjkDetectionContract } from "./contracts.js";

export function createGjkDetectionKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "gjk-detection-kit",
    id: config.id ?? "gjk-detection-kit",
    domain: "physics-gjk-detection",
    apiName: config.apiName ?? "physicsGjkDetection",
    requires: ["n:physics", "n:physics:shape"],
    provides: ["physics:gjk"],
    purpose: "Run deterministic support-mapping GJK for the explicitly supported convex shape set.",
    owns: ["Minkowski support search", "simplex evolution", "convex separation classification"],
    doesNotOwn: ["penetration depth", "nonconvex mesh traversal", "contacts", "solver execution"],
    contract: gjkDetectionContract,
    methods: { intersect: (_context, input) => gjkDetect(input) }
  });
}

export default createGjkDetectionKit;
