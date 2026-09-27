import { domainNode } from "../../manifest-input.js";
export default domainNode({id:'authoring-persistence-domain',domainPath:'n:authoring:persistence',parentDomainPath:'n:authoring',label:'Authoring Persistence',
responsibility:'Own canonical persistence operations, default providers, diagnostics and source-safe lifecycle.',
owns:['persistence contracts and canonical implementations'],forbiddenResponsibilities:['duplicate editable source authority','Editor-specific presentation','runtime simulation'],
requires:['n:authoring:project'],provides:['n:authoring:persistence'],proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']});
