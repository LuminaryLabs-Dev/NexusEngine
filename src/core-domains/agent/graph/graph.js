import {cloneSerializableState as copy} from '../../../foundation/serializable-state.js';
import {operationRequestHash} from '../../../foundation/idempotency-ledger.js';

export const AGENT_GRAPH_SCHEMA = 'nexusengine.agent.graph/1';
const defaults = {maxNodes:256,maxEdges:1024,maxOperations:1024,maxChanges:256,maxBytes:1048576,maxDepth:32};
export const graphText = x => typeof x === 'string' && x.trim().length > 0 && x.length <= 4096;
const integer = x => Number.isSafeInteger(x) && x >= 0;
export function agentGraphLimits(input={}) {
  const result={...defaults,...input};
  if(Object.keys(result).some(key=>!Object.hasOwn(defaults,key)) || Object.values(result).some(x=>!integer(x)||x<1)) throw new TypeError('Invalid graph limits');
  return result;
}
function checkSnapshot(value,limits) {
  const state=copy(value);
  if(state?.schema!==AGENT_GRAPH_SCHEMA||!graphText(state.id)||!integer(state.revision)||!Array.isArray(state.nodes)||!Array.isArray(state.edges)||!Array.isArray(state.operations)) throw new TypeError('Invalid graph snapshot');
  if(state.nodes.length>limits.maxNodes||state.edges.length>limits.maxEdges||state.operations.length>limits.maxOperations||new TextEncoder().encode(JSON.stringify(state)).length>limits.maxBytes) throw new RangeError('Graph capacity exceeded');
  const nodes=new Map();
  for(const node of state.nodes) {
    if(!graphText(node?.id)||!graphText(node.type)||typeof node.retired!=='boolean'||!node.data||Array.isArray(node.data)||typeof node.data!=='object'||nodes.has(node.id)) throw new TypeError('Invalid or duplicate graph node');
    nodes.set(node.id,node);
  }
  const edges=new Set(),dependencies=new Map(state.nodes.map(n=>[n.id,[]]));
  for(const edge of state.edges) {
    if(!graphText(edge?.id)||!graphText(edge.type)||edges.has(edge.id)||!nodes.has(edge.from)||!nodes.has(edge.to)) throw new TypeError('Invalid graph edge');
    edges.add(edge.id);
    if(edge.type==='requires') dependencies.get(edge.from).push(edge.to);
  }
  // Only dependency edges are a DAG. Descriptive references may cycle.
  const depths=new Map(),active=new Set();
  function visit(id,level=1) {
    if(level>limits.maxDepth||active.has(id)) throw new RangeError('Graph dependency cycle or depth exceeded');
    if(depths.has(id)) return depths.get(id);
    active.add(id);
    let depth=1;for(const dependency of dependencies.get(id)) depth=Math.max(depth,1+visit(dependency,level+1));
    active.delete(id);depths.set(id,depth);
    if(depth>limits.maxDepth) throw new RangeError('Graph dependency depth exceeded');
    return depth;
  }
  for(const id of nodes.keys()) visit(id);
  const operations=new Set();
  for(const operation of state.operations) {
    if(!graphText(operation?.operationId)||operations.has(operation.operationId)||!graphText(operation.requestHash)||!integer(operation.revision)||operation.revision<1||operation.revision>state.revision) throw new TypeError('Invalid graph operation history');
    operations.add(operation.operationId);
  }
  if(state.operations.length!==state.revision||state.operations.some((op,i)=>op.revision!==i+1)) throw new TypeError('Incomplete graph operation history');
  return state;
}

/** Portable topology and bounded journal; no execution, goals, providers or I/O. */
export function createAgentGraph({id,nodes=[],edges=[],limits={},snapshot=null}={}) {
  const policy=agentGraphLimits(limits);
  const normalizeNode=n=>({id:n.id,type:n.type,data:copy(n.data??{}),retired:n.retired??false});
  const normalizeEdge=e=>({id:e.id,type:e.type,from:e.from,to:e.to});
  let state=checkSnapshot(snapshot??{schema:AGENT_GRAPH_SCHEMA,id,revision:0,nodes:nodes.map(normalizeNode),edges:edges.map(normalizeEdge),operations:[]},policy);
  const identity=state.id,baseline=copy(state);
  function apply(input) {
    const request=copy(input),{operationId,expectedRevision,changes}=request;
    if(!graphText(operationId)||!integer(expectedRevision)||!Array.isArray(changes)||!changes.length||changes.length>policy.maxChanges) throw new TypeError('Invalid graph patch');
    const requestHash=operationRequestHash(request),previous=state.operations.find(op=>op.operationId===operationId);
    if(previous) {if(previous.requestHash!==requestHash) throw new Error('Graph operation identity conflict');return copy(previous);}
    if(expectedRevision!==state.revision) throw new Error('Graph revision conflict');
    const next=copy(state);
    for(const change of changes) {
      if(change.kind==='add_node') {
        if(next.nodes.some(n=>n.id===change.node?.id)) throw new Error('Graph node already exists');
        next.nodes.push(normalizeNode(change.node));
      } else if(change.kind==='update_node'||change.kind==='retire_node') {
        const node=next.nodes.find(n=>n.id===change.id);if(!node) throw new Error('Unknown graph node');
        if(change.kind==='retire_node') node.retired=true;
        else {if(node.retired) throw new Error('Retired graph node');node.data=copy(change.data);}
      } else if(change.kind==='add_edge') {
        if(next.edges.some(e=>e.id===change.edge?.id)) throw new Error('Graph edge already exists');
        next.edges.push(normalizeEdge(change.edge));
      } else if(change.kind==='remove_edge') {
        if(!next.edges.some(e=>e.id===change.id)) throw new Error('Unknown graph edge');
        next.edges=next.edges.filter(e=>e.id!==change.id);
      } else throw new TypeError('Unsupported graph patch operation');
    }
    next.revision++;
    const receipt={operationId,requestHash,revision:next.revision,...(request.commandHash?{commandHash:request.commandHash}:{})};next.operations.push(receipt);
    state=checkSnapshot(next,policy);return copy(receipt);
  }
  function traverse(start,{type=null,direction='outgoing',maxDepth=policy.maxDepth}={}) {
    if(!state.nodes.some(n=>n.id===start)||!['outgoing','incoming'].includes(direction)||!integer(maxDepth)||maxDepth>policy.maxDepth) throw new TypeError('Invalid graph traversal');
    const seen=new Set([start]),queue=[[start,0]],result=[];
    for(let at=0;at<queue.length;at++) {
      const [id,depth]=queue[at];if(depth>=maxDepth) continue;
      for(const edge of state.edges) {
        if(type!==null&&edge.type!==type) continue;
        const next=direction==='outgoing'?(edge.from===id?edge.to:null):(edge.to===id?edge.from:null);
        if(next===null||seen.has(next)) continue;
        seen.add(next);result.push(next);queue.push([next,depth+1]);
      }
    }
    return result;
  }
  return Object.freeze({
    limits:Object.freeze({...policy}),
    snapshot:()=>copy(state),read:nodeId=>copy(state.nodes.find(n=>n.id===nodeId)??null),apply,traverse,
    restore(value) {const next=checkSnapshot(value,policy);if(next.id!==identity) throw new Error('Graph identity mismatch');state=next;return copy(state);},
    reset() {state=copy(baseline);return copy(state);}
  });
}
