import { domainNode } from "../../manifest-input.js";
export default domainNode({id:'authoring-importing-domain',domainPath:'n:authoring:importing',parentDomainPath:'n:authoring',label:'Authoring Importing',
responsibility:'Own canonical importing operations, default providers, diagnostics and source-safe lifecycle.',
owns:['importing contracts and canonical implementations'],forbiddenResponsibilities:['duplicate editable source authority','Editor-specific presentation','runtime simulation'],
requires:['n:authoring:project'],provides:['n:authoring:importing'],proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']});
