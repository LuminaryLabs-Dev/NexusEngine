import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-import-registry-kit",domainPath:"n:authoring:importing",apiName:"authoringImportRegistry",
  responsibility:"Own trusted canonical importer discovery and provider selection.",requires:["n:authoring:project"],provides:["authoring:import-registry"],
  module:"./src/core-domains/authoring/importing/kits/authoring-import-registry-kit/index.js",exportName:"createAuthoringImportRegistryKit",publicSubpath:"./domains/authoring/importing/import-registry",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
