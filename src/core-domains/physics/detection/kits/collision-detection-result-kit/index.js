import { normalizeCollisionDetectionResult } from "../../detection-contracts.js";
import { sortCollisionResults } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { collisionDetectionResultContract } from "./contracts.js";

export function createCollisionDetectionResultKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "collision-detection-result-kit",
    id: config.id ?? "collision-detection-result-kit",
    domain: "physics-collision-detection-result",
    apiName: config.apiName ?? "physicsCollisionDetectionResult",
    requires: ["n:physics"],
    provides: ["physics:collision-detection-result"],
    purpose: "Normalize finite portable collision outcomes and stable result ordering.",
    owns: ["detection result schema", "result consistency", "result ordering"],
    doesNotOwn: ["contacts", "trigger events", "solver impulses", "gameplay reactions"],
    contract: collisionDetectionResultContract,
    methods: {
      normalize: (_context, value) => normalizeCollisionDetectionResult(value),
      sort: (_context, values) => sortCollisionResults(values)
    }
  });
}

export default createCollisionDetectionResultKit;
