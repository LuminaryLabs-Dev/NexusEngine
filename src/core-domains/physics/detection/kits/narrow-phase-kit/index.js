import { detectNarrowPhase } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { narrowPhaseContract } from "./contracts.js";

export function createNarrowPhaseKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "narrow-phase-kit",
    id: config.id ?? "narrow-phase-kit",
    domain: "physics-narrow-phase",
    apiName: config.apiName ?? "physicsNarrowPhase",
    requires: [
      "n:physics",
      "n:physics:shape",
      "n:physics:collider",
      "physics:shape-intersection",
      "physics:gjk",
      "physics:epa",
      "physics:collision-detection-result"
    ],
    provides: ["physics:narrow-phase"],
    purpose: "Dispatch supported shape pairs through deterministic exact algorithms and explicit unsupported results.",
    owns: ["narrow-phase dispatch", "algorithm selection", "portable intersection classification"],
    doesNotOwn: ["broad-phase proxies", "contacts", "manifolds", "solver impulses", "gameplay events"],
    contract: narrowPhaseContract,
    methods: { detect: (_context, input) => detectNarrowPhase(input) }
  });
}

export default createNarrowPhaseKit;
