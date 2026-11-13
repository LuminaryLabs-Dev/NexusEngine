// Portable evidence-driven guidance, not an agent executor or a source writer.
import {createCreativeHarnessContract,sameSource} from '../contracts/creative-harness.js';
const copy=x=>structuredClone(x);
const text=x=>typeof x==='string'&&x.length>0;
const kinds=new Set(['design','art','interaction','craft']);
export function createAuthoringAgentGuidance({discipline,request,tools,evidence=[]}={}){
 if(!kinds.has(discipline)||!Array.isArray(tools)||!Array.isArray(evidence)||evidence.length>128)
  throw new TypeError('Discipline, discovered tools and bounded evidence required');
 const harness=createCreativeHarnessContract(discipline),brief=harness.request(request);
 const seen=new Set();
 for(const item of evidence){
  if(!text(item?.ref)||seen.has(item.ref)||!['source','render','validation','reference','review'].includes(item.kind)||
     !sameSource(item.sourceRevision,brief.sourceRevision)||
     (item.description!==undefined&&!text(item.description)))throw new TypeError('Stale or invalid Authoring evidence');
  seen.add(item.ref);
 }
 return copy({schema:'nexusengine.authoring.agent.guidance/1',discipline,goalRef:brief.goalRef,
  projectRef:brief.projectRef,sourceRevision:brief.sourceRevision,
  allowedCapabilities:harness.discover(brief,tools),
  acceptedCriteria:brief.acceptanceCriteria,reviewPolicy:brief.reviewPolicy,
  methodStages:harness.stages,evidence});
}
export function reviewAuthoringAgentEvidence({discipline,request,details}={}){
 if(!kinds.has(discipline))throw new TypeError('Unknown Authoring discipline');
 // The existing independent discipline contract is the acceptance authority.
 return createCreativeHarnessContract(discipline).review(request,details);
}
