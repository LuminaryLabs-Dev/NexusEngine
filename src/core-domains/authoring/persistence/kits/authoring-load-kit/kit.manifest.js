import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-load-kit",domainPath:"n:authoring:persistence",apiName:"authoringLoad",
  responsibility:"Verify a stored package before atomically restoring the sole Project source authority.",requires:["authoring:project-package", "authoring:storage-provider-registry"],provides:["authoring:load"],
  module:"./src/core-domains/authoring/persistence/kits/authoring-load-kit/index.js",exportName:"createAuthoringLoadKit",publicSubpath:"./domains/authoring/persistence/load",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
