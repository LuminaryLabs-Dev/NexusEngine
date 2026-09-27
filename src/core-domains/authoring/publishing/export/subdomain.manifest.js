import { domainNode } from "../../../manifest-input.js";
export default domainNode({id:'authoring-publishing-export-domain',domainPath:'n:authoring:publishing:export',parentDomainPath:'n:authoring:publishing',label:'Authoring Publishing Export',
responsibility:'Own canonical publishing export operations, default providers, diagnostics and source-safe lifecycle.',
owns:['publishing export contracts and canonical implementations'],forbiddenResponsibilities:['duplicate editable source authority','Editor-specific presentation','runtime simulation'],
requires:['n:authoring:project'],provides:['n:authoring:publishing:export'],proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']});
