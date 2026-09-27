import { record, fail, digest, jsonBytes } from './io.js';
import { requireText } from './value.js';
export function createAuthoringLedger(kitId, capacity=10000, state=null) {
  let local=[]; const pending=new Map();
  const getReceipts=()=>new Map((state?(state.read().receipts??[]):local).map(r=>[r.requestId,r]));
  const setReceipts=m=>{const data=[...m.values()];if(state)state.write({receipts:data});else local=data;};
  const getSnapshot=()=>record({schema:'nexusengine.authoring-io-ledger/1',kitId,receipts:[...getReceipts().values()]});
  function idle(){if(pending.size) throw fail('AUTHORING_BUSY','Cannot restore/reset an active operation ledger.');}
  return {
    get(id){return getReceipts().get(id)?.receipt??null;},
    async run(id,request,action){
      requireText(id,'requestId');const receipts=getReceipts();const requestHash=digest(jsonBytes(request)),old=receipts.get(id)??pending.get(id);
      if(old&&old.requestHash!==requestHash) throw fail('AUTHORING_REQUEST_CONFLICT',`Request ${id} was reused with different content.`);
      if(receipts.has(id)) return receipts.get(id).receipt;
      if(pending.has(id)) return pending.get(id).promise;
      if(receipts.size+pending.size>=capacity) throw fail('AUTHORING_RECEIPT_CAPACITY','Receipt capacity exhausted.');
      const promise=Promise.resolve().then(action).then(receipt=>{
        const frozen=record(receipt);const completed=getReceipts();completed.set(id,{requestId:id,requestHash,receipt:frozen});setReceipts(completed);return frozen;
      }).finally(()=>pending.delete(id));
      pending.set(id,{requestHash,promise});return promise;
    },
    getSnapshot,
    reset(){idle();setReceipts(new Map());return getSnapshot();},
    loadSnapshot(s){idle();
      if(s?.schema!=='nexusengine.authoring-io-ledger/1'||s.kitId!==kitId||!Array.isArray(s.receipts)||s.receipts.length>capacity) throw fail('AUTHORING_SNAPSHOT','Invalid operation ledger snapshot.');
      const next=new Map();
      for(const r of s.receipts){requireText(r.requestId,'requestId');if(next.has(r.requestId)||!/^sha256:[0-9a-f]{64}$/.test(r.requestHash)) throw fail('AUTHORING_SNAPSHOT','Invalid receipt identity.');next.set(r.requestId,record(r));}
      setReceipts(next);return getSnapshot();
    }
  };
}
