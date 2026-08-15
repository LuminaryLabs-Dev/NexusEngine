import { atomicKit } from "../../../../manifest-input.js";

export default atomicKit({
  id: "hinge-constraint-kit",
  responsibility: "Normalize portable local-axis hinge constraint descriptors.",
  domainPath: "n:physics:constraints",
  apiName: "physicsHingeConstraint",
  requires: ["n:physics"],
  provides: ["n:physics:constraints", "physics:hinge-constraint"],
  module: "./src/core-domains/physics/constraints/kits/hinge-constraint-kit/index.js",
  exportName: "createHingeConstraintKit",
  publicSubpath: "./domains/physics/constraints/hinge",
  proofReferences: [],
  proofStatus: "pending"
});
