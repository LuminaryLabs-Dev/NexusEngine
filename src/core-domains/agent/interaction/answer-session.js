// Transport-neutral interaction contract. Model reasoning and tool execution remain external.
const copy = (v) => structuredClone(v);
const valid = (s, label) => { if (typeof s !== "string" || !s.trim()) throw new TypeError(label+" must be nonempty."); return s; };
export function createAgentAnswerSession({ id, intent, project = null, maxTurns = 128 } = {}) {
  valid(id,"Session ID"); valid(intent,"Intent");
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1) throw new RangeError("Invalid turn budget.");
  const state={schema:"nexusengine.agent-answer/1",id,intent,project,status:"awaiting-agent",turn:0,history:[],result:null};
  const current=()=>copy(state);
  return Object.freeze({
    ask(){return {session:current(),next:{type:"agent-response",requires:["action","payload"]}};},
    context(){return {id:state.id,intent:state.intent,project:state.project,turn:state.turn,status:state.status};},
    respond(request){
      if(state.status!=="awaiting-agent") throw new Error("Session is not awaiting an agent.");
      if(state.turn>=maxTurns) throw new RangeError("Session turn limit reached.");
      if(!request || !["plan","tool","complete","blocked"].includes(request.action)) throw new TypeError("Unknown agent response action.");
      if(request.action==="tool" && (typeof request.payload?.toolId!=="string" || !request.payload.toolId)) throw new TypeError("Tool request must identify a tool.");
      const entry={id:state.id+":"+(state.turn+1),action:request.action,payload:copy(request.payload??{}),result:null};
      state.history.push(entry);state.turn++;
      if(request.action==="complete"||request.action==="blocked"){state.status=request.action==="complete"?"completed":"blocked";state.result=copy(request.payload??{});}
      else state.status="awaiting-result";
      return {session:current(),next:this.next()};
    },
    result(receipt){
      if(state.status!=="awaiting-result") throw new Error("No outstanding result.");
      const entry=state.history.at(-1);
      if(!receipt || receipt.requestId!==entry.id || typeof receipt.ok!=="boolean") throw new TypeError("Result must match pending request.");
      entry.result=copy(receipt);
      state.status="awaiting-agent";
      return {session:current(),next:this.next()};
    },
    next(){return state.status==="awaiting-agent"?{type:"agent-response"}:state.status==="awaiting-result"?{type:"tool-result",requestId:state.history.at(-1).id}:{type:"done",status:state.status};},
    resume(snapshot){
      if(snapshot?.schema!==state.schema || snapshot.id!==state.id || snapshot.intent!==state.intent || !Array.isArray(snapshot.history) || !Number.isSafeInteger(snapshot.turn) || snapshot.turn!==snapshot.history.length || snapshot.turn>maxTurns || !["awaiting-agent","awaiting-result","completed","blocked"].includes(snapshot.status))throw new TypeError("Invalid session snapshot.");
      if(snapshot.status==="awaiting-result" && (!snapshot.history.length || snapshot.history.at(-1)?.result!==null))throw new TypeError("Unreconciled pending result.");
      Object.assign(state,copy(snapshot));return {session:current(),next:this.next()};
    },
    snapshot:current
  });
}
