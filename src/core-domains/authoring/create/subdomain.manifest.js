import { domainNode } from "../../manifest-input.js";
export default domainNode({id:'authoring-create-domain',domainPath:'n:authoring:create',parentDomainPath:'n:authoring',label:'Authoring Create',
responsibility:'Own canonical create operations, default providers, diagnostics and source-safe lifecycle.',
owns:['create contracts and canonical implementations'],forbiddenResponsibilities:['duplicate editable source authority','Editor-specific presentation','runtime simulation'],
requires:['n:authoring:project'],provides:['n:authoring:create'],proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']});
