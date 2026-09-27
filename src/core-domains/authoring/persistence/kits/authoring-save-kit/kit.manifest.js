import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-save-kit",domainPath:"n:authoring:persistence",apiName:"authoringSave",
  responsibility:"Persist a captured Project package with generation conflict protection.",requires:["authoring:project-package", "authoring:storage-provider-registry"],provides:["authoring:save"],
  module:"./src/core-domains/authoring/persistence/kits/authoring-save-kit/index.js",exportName:"createAuthoringSaveKit",publicSubpath:"./domains/authoring/persistence/save",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
