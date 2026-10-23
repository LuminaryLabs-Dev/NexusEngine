// Small DAG contract: execution is deliberately owned by existing domain hosts.
export function createAgentTaskGraph(nodes, {maxBytes=Infinity}={}) {
  const checkBytes=value=>{if(JSON.stringify(value).length*2>maxBytes)throw new RangeError("Task graph byte budget exceeded; use compact receipt references.");};
  checkBytes(nodes);
  if(!Array.isArray(nodes)||!nodes.length||nodes.length>256) throw new TypeError("Task graph must contain 1-256 nodes.");
  const map=new Map();
  for(const n of nodes){if(!n||typeof n.id!=="string"||!n.id||map.has(n.id)||!Array.isArray(n.dependencies??[]))throw new TypeError("Invalid or duplicate task node.");map.set(n.id,{id:n.id,dependencies:[...(n.dependencies??[])],status:"pending",receipt:null});}
  for(const n of map.values())for(const dep of n.dependencies)if(!map.has(dep)||dep===n.id)throw new TypeError("Unknown or self dependency.");
  const visited=new Set(),stack=new Set();
  function visit(id){if(stack.has(id))throw new TypeError("Cyclic task graph.");if(visited.has(id))return;stack.add(id);for(const d of map.get(id).dependencies)visit(d);stack.delete(id);visited.add(id);}
  for(const id of map.keys())visit(id);
  const snapshot=()=>({schema:"nexusengine.agent-task-graph/1",nodes:[...map.values()].map(x=>structuredClone(x))});
  return Object.freeze({
    ready(){return [...map.values()].filter(n=>n.status==="pending"&&n.dependencies.every(d=>map.get(d).status==="complete")).map(x=>x.id);},
    complete(id,receipt){const node=map.get(id);if(!node||!this.ready().includes(id))throw new Error("Task is not ready.");if(!receipt||receipt.ok!==true)throw new TypeError("Successful receipt required.");checkBytes({...snapshot(),nodes:snapshot().nodes.map(n=>n.id===id?{...n,status:"complete",receipt}:n)});node.status="complete";node.receipt=structuredClone(receipt);return snapshot();},
    fail(id,receipt){const node=map.get(id);if(!node||node.status!=="pending")throw new Error("Task is not pending.");checkBytes({...snapshot(),nodes:snapshot().nodes.map(n=>n.id===id?{...n,status:"failed",receipt}:n)});node.status="failed";node.receipt=structuredClone(receipt??null);return snapshot();},
    revise(id){if(!map.has(id))throw new Error("Unknown task.");const affected=new Set([id]);let changed=true;while(changed){changed=false;for(const n of map.values())if(!affected.has(n.id)&&n.dependencies.some(d=>affected.has(d))){affected.add(n.id);changed=true;}}
      for(const a of affected){const n=map.get(a);n.status="pending";n.receipt=null;}return [...affected];},
    snapshot,
    restore(value){checkBytes(value);if(value?.schema!=="nexusengine.agent-task-graph/1"||!Array.isArray(value.nodes)||value.nodes.length!==map.size)throw new TypeError("Invalid task graph snapshot.");
      const staged=new Map(value.nodes.map(n=>[n.id,n]));if(staged.size!==map.size)throw new TypeError("Duplicate graph entries.");
      for(const [id,n] of map){const next=staged.get(id);if(!next||JSON.stringify(next.dependencies)!==JSON.stringify(n.dependencies)||!["pending","complete","failed"].includes(next.status)||next.status==="complete"&&next.receipt?.ok!==true)throw new TypeError("Invalid task state.");}
      for(const [id,n] of map){const next=staged.get(id);n.status=next.status;n.receipt=structuredClone(next.receipt);}return snapshot();}
  });
}
