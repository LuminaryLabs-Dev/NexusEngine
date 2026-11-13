import {createDomainKit} from '../../../../domain-kit.js';
import {sameSource} from '../../../contracts/creative-harness.js';
import {createAuthoringAgentGuidance,reviewAuthoringAgentEvidence} from '../../services.js';
export function createAuthoringAgentKit(){
 return createDomainKit({id:'authoring-agent-kit',manifestId:'authoring-agent-kit',
  domain:'authoring-agent',domainPath:'n:authoring:agent',parentDomainPath:'n:authoring',
  apiName:'authoringAgent',requires:['n:authoring:project'],provides:['n:authoring:agent'],
  purpose:'Provide source-bound creative guidance and review to generic Agent Workers.',
  createApi:({engine})=>({
   guide(input){
    const project=engine.n.authoringProject;
    if(!project||!sameSource(input?.request?.sourceRevision,project.context())||
       input.request.projectRef!==project.context().projectId)throw new Error('Stale or unrelated Authoring source');
    return createAuthoringAgentGuidance({...input,tools:project.tools()});
   },
   review:reviewAuthoringAgentEvidence
  })
 });
}
