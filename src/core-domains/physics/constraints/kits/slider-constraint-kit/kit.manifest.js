import { atomicKit } from "../../../../manifest-input.js";

export default atomicKit({
  id: "slider-constraint-kit",
  responsibility: "Normalize portable local-axis slider constraint descriptors.",
  domainPath: "n:physics:constraints",
  apiName: "physicsSliderConstraint",
  requires: ["n:physics"],
  provides: ["n:physics:constraints", "physics:slider-constraint"],
  module: "./src/core-domains/physics/constraints/kits/slider-constraint-kit/index.js",
  exportName: "createSliderConstraintKit",
  publicSubpath: "./domains/physics/constraints/slider",
  proofReferences: [],
  proofStatus: "pending"
});
