import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-import-service-kit",domainPath:"n:authoring:importing",apiName:"authoringImport",
  responsibility:"Decode external bytes into editable documents and orchestrate staged import.",requires:["authoring:import-registry", "authoring:import-validation", "authoring:import-commit"],provides:["authoring:import-service", "n:authoring:importing"],
  module:"./src/core-domains/authoring/importing/kits/authoring-import-service-kit/index.js",exportName:"createAuthoringImportServiceKit",publicSubpath:"./domains/authoring/importing/import-service",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
