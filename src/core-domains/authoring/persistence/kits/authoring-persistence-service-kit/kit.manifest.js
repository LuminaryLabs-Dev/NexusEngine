import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-persistence-service-kit",domainPath:"n:authoring:persistence",apiName:"authoringPersistence",
  responsibility:"Expose provider-neutral save and load without an Editor dependency.",requires:["authoring:save", "authoring:load"],provides:["authoring:persistence-service", "n:authoring:persistence"],
  module:"./src/core-domains/authoring/persistence/kits/authoring-persistence-service-kit/index.js",exportName:"createAuthoringPersistenceServiceKit",publicSubpath:"./domains/authoring/persistence/persistence-service",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
