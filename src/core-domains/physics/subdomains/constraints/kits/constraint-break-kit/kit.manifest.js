import { atomicKit } from "../../../../../manifest-input.js";

export default atomicKit({
  id: "constraint-break-kit",
  responsibility: "Normalize and purely evaluate portable constraint break thresholds.",
  domainPath: "n:physics:constraints",
  apiName: "physicsConstraintBreak",
  requires: ["n:physics"],
  provides: ["n:physics:constraints", "physics:constraint-break"],
  module: "./src/core-domains/physics/subdomains/constraints/kits/constraint-break-kit/index.js",
  exportName: "createConstraintBreakKit",
  publicSubpath: "./domains/physics/constraints/break",
  proofReferences: [],
  proofStatus: "pending"
});
