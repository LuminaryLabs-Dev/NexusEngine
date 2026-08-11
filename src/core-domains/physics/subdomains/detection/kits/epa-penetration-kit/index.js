import { epaPenetration } from "../../detection-algorithms.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { epaPenetrationContract } from "./contracts.js";

export function createEpaPenetrationKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "epa-penetration-kit",
    id: config.id ?? "epa-penetration-kit",
    domain: "physics-epa-penetration",
    apiName: config.apiName ?? "physicsEpaPenetration",
    requires: ["n:physics", "n:physics:shape", "physics:gjk"],
    provides: ["physics:epa"],
    purpose: "Resolve convex penetration depth, normal, and witnesses from a valid GJK tetrahedron.",
    owns: ["polytope expansion", "penetration depth", "penetration witnesses"],
    doesNotOwn: ["GJK simplex search", "contacts", "manifolds", "solver execution"],
    contract: epaPenetrationContract,
    methods: { solve: (_context, input) => epaPenetration(input) }
  });
}

export default createEpaPenetrationKit;
