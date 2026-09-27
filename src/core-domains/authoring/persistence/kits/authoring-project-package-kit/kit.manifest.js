import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-project-package-kit",domainPath:"n:authoring:persistence",apiName:"authoringProjectPackage",
  responsibility:"Encode and verify content-addressed Project snapshots, historical documents and image tiles.",requires:["n:authoring:project"],provides:["authoring:project-package"],
  module:"./src/core-domains/authoring/persistence/kits/authoring-project-package-kit/index.js",exportName:"createAuthoringProjectPackageKit",publicSubpath:"./domains/authoring/persistence/project-package",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
