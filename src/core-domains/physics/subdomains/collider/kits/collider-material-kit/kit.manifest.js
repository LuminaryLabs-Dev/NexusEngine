import { atomicKit } from "../../../../../manifest-input.js";

export default atomicKit({
  id: "collider-material-kit",
  responsibility: "Normalize a collider reference to one public Physics material identity.",
  domainPath: "n:physics:collider",
  apiName: "physicsColliderMaterial",
  requires: ["n:physics", "physics:material-registry"],
  provides: ["n:physics:collider", "physics:collider-material"],
  module: "./src/core-domains/physics/subdomains/collider/kits/collider-material-kit/index.js",
  exportName: "createColliderMaterialKit",
  publicSubpath: "./domains/physics/collider/material",
  proofReferences: [],
  proofStatus: "pending"
});
