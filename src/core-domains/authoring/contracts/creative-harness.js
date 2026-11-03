// Discipline-specific, portable contracts over the existing Authoring harness
// envelopes. No source mutations, tool execution, inference or rendering here.
import { AUTHORING_DISCIPLINES, normalizeHarnessRequest, normalizeHarnessResult, harnessData } from './harness.js';

const stages = Object.freeze({
  design:['discover','interpret','plan','author','evaluate','revise'],
  art:['discover','approach','produce','inspect','evaluate','refine'],
  interaction:['discover','define','compose','simulate','evaluate','refine'],
  craft:['discover','select','coordinate','evaluate','direct','maintain']
});
const domains = Object.freeze({
  design:['n:authoring:assembly','n:authoring:mesh','n:authoring:curve'],
  art:['n:authoring:mesh','n:authoring:curve','n:authoring:modifier','n:authoring:uv','n:authoring:material','n:authoring:paint','n:authoring:sculpt','n:authoring:rig','n:authoring:skin','n:authoring:animation','n:authoring:assembly'],
  interaction:['n:authoring:sequence','n:authoring:domain-composition'],
  craft:['n:authoring:assembly','n:authoring:publishing','n:authoring:validation']
});
export const CREATIVE_HARNESS_KINDS = AUTHORING_DISCIPLINES;
export const sameSource = (a,b) => !!a && !!b && a.epoch===b.epoch && a.clock===b.clock;
export const authoringSource = ({epoch,clock}) => ({epoch,clock});

export function createCreativeHarnessContract(kind) {
  if (!AUTHORING_DISCIPLINES.includes(kind)) throw new TypeError('Unknown Authoring harness');
  const schema = 'nexusengine.authoring.'+kind+'/1';
  const request = value => normalizeHarnessRequest(value,kind);
  function discover(input,tools) {
    const r=request(input);
    if(!Array.isArray(tools))throw new TypeError('Current Authoring operation catalogue required');
    return harnessData(tools.filter(t=>typeof t?.id==='string' && domains[kind].some(d=>t.domainPath===d || t.domainPath?.startsWith(d+':')) && r.allowedCapabilities.includes(t.id)).map(t=>({id:t.id,domainPath:t.domainPath,schemaVersion:t.schemaVersion??1,requiredKits:t.requiredKits??[]})));
  }
  function plan(input,operations,tools) {
    const r=request(input);
    if(!Array.isArray(operations) || operations.length>Math.min(r.resourceBudgets.maxSteps,256) || kind==='craft' && operations.length || kind!=='craft' && !operations.length) throw new TypeError('Invalid Authoring operation plan');
    const allowed=new Set(discover(r,tools).map(c=>c.id));
    for(const op of operations)if(!op||typeof op!=='object'||Array.isArray(op)||Object.keys(op).some(k=>!['id','args'].includes(k))||!allowed.has(op.id)||!op.args||typeof op.args!=='object'||Array.isArray(op.args))throw new TypeError('Unknown or unauthorized native Authoring operation');
    return harnessData({schema:schema+'.plan',sourceRevision:r.sourceRevision,targetRef:r.targetRef,operations});
  }
  function review(input,details) {
    const r=request(input);
    if(!details||!sameSource(details.sourceRevision,r.sourceRevision))throw new TypeError('Review is stale or unbound');
    const reviewer=details.reviewer??null;
    if(details.status==='accepted'){
      if(!reviewer||typeof reviewer.id!=='string'||!reviewer.id.trim()||!['human','agent'].includes(reviewer.kind)||r.reviewPolicy.humanRequired && reviewer.kind!=='human'||r.reviewPolicy.reviewerIds.length&&!r.reviewPolicy.reviewerIds.includes(reviewer.id))throw new TypeError('Explicit authorized creative reviewer required');
      if((details.reviewFindings??[]).length || (details.unresolvedRequirements??[]).length)throw new TypeError('Unresolved findings cannot be accepted');
      if(r.acceptanceCriteria.some(c=>c.required&&c.kind==='visual')&&!(details.inspectionEvidenceRefs??[]).length)throw new TypeError('Visual acceptance requires actual inspection evidence');
      if(r.acceptanceCriteria.some(c=>c.required&&c.kind==='scenario')&&!(details.validationEvidenceRefs??[]).length)throw new TypeError('Interaction acceptance requires executable scenario evidence');
    }
    const result=normalizeHarnessResult({requestId:r.requestId,harnessId:kind,status:details.status,sourceRevision:r.sourceRevision,
      outputRefs:details.outputRefs??[],changeReceipts:details.changeReceipts??[],inspectionEvidenceRefs:details.inspectionEvidenceRefs??[],validationEvidenceRefs:details.validationEvidenceRefs??[],reviewFindings:details.reviewFindings??[],unresolvedRequirements:details.unresolvedRequirements??[],nextRecommendedActions:details.nextRecommendedActions??[]});
    return harnessData({schema:schema+'.review',result,reviewer});
  }
  function revision(input,prior,operations,tools,currentSource) {
    const r=request(input);
    if(prior?.result?.status!=='needs_revision'||!prior.result.reviewFindings.length||!sameSource(prior.result.sourceRevision,r.sourceRevision))throw new TypeError('Revision needs current actionable review findings');
    const next=request({...r,sourceRevision:authoringSource(currentSource)});
    return harnessData({schema:schema+'.revision',findingIds:prior.result.reviewFindings.map(f=>f.id),plan:plan(next,operations,tools)});
  }
  return Object.freeze({kind,stages:Object.freeze([...stages[kind]]),request,discover,plan,review,revision});
}
