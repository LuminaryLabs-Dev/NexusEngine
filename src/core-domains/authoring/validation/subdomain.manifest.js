import { domainNode } from "../../manifest-input.js";
export default domainNode({id:'authoring-validation-domain',domainPath:'n:authoring:validation',parentDomainPath:'n:authoring',label:'Authoring Validation',
responsibility:'Own canonical validation operations, default providers, diagnostics and source-safe lifecycle.',
owns:['validation contracts and canonical implementations'],forbiddenResponsibilities:['duplicate editable source authority','Editor-specific presentation','runtime simulation'],
requires:['n:authoring:project'],provides:['n:authoring:validation'],proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']});
