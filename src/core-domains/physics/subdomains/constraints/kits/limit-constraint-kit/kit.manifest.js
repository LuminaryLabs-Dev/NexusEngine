import { atomicKit } from "../../../../../manifest-input.js";

export default atomicKit({
  id: "limit-constraint-kit",
  responsibility: "Normalize portable linear and angular limit constraint descriptors.",
  domainPath: "n:physics:constraints",
  apiName: "physicsLimitConstraint",
  requires: ["n:physics"],
  provides: ["n:physics:constraints", "physics:limit-constraint"],
  module: "./src/core-domains/physics/subdomains/constraints/kits/limit-constraint-kit/index.js",
  exportName: "createLimitConstraintKit",
  publicSubpath: "./domains/physics/constraints/limit",
  proofReferences: [],
  proofStatus: "pending"
});
