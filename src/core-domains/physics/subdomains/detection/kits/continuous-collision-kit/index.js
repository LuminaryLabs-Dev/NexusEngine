import { continuousSphereCollision } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { continuousCollisionContract } from "./contracts.js";

export function createContinuousCollisionKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "continuous-collision-kit",
    id: config.id ?? "continuous-collision-kit",
    domain: "physics-continuous-collision",
    apiName: config.apiName ?? "physicsContinuousCollision",
    requires: ["n:physics", "n:physics:shape", "physics:collision-detection-result"],
    provides: ["physics:continuous-collision"],
    purpose: "Compute exact linear sphere time of impact without overstating unsupported convex sweep coverage.",
    owns: ["sphere time of impact", "linear sweep classification", "continuous result timing"],
    doesNotOwn: ["body integration", "rotational sweeps", "contacts", "solver execution"],
    contract: continuousCollisionContract,
    methods: { sweep: (_context, input) => continuousSphereCollision(input) }
  });
}

export default createContinuousCollisionKit;
