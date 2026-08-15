import { atomicKit } from "../../../../manifest-input.js";

export default atomicKit({
  id: "drive-constraint-kit",
  responsibility: "Normalize portable positional and velocity drive constraint descriptors.",
  domainPath: "n:physics:constraints",
  apiName: "physicsDriveConstraint",
  requires: ["n:physics"],
  provides: ["n:physics:constraints", "physics:drive-constraint"],
  module: "./src/core-domains/physics/constraints/kits/drive-constraint-kit/index.js",
  exportName: "createDriveConstraintKit",
  publicSubpath: "./domains/physics/constraints/drive",
  proofReferences: [],
  proofStatus: "pending"
});
