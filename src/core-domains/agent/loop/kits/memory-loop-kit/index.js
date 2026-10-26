export async function retrieveLoopMemory({query,context,search,limit=5,maxCharacters=8000}={}){
 if(typeof search!=="function"||!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(maxCharacters)||maxCharacters<1)throw new TypeError("Invalid memory retrieval");
 const candidates=await search({query,context,limit});
 if(!Array.isArray(candidates))throw new TypeError("Memory provider must return records");
 let used=0;const records=[];
 for(const item of candidates.slice(0,limit)){
  if(!item?.source||typeof item.text!=="string")continue;
  const text=item.text.slice(0,Math.max(0,maxCharacters-used));
  if(!text)break;records.push({text,source:item.source,observedAt:item.observedAt??null});
  used+=text.length;
 }
 return {schema:"nexusengine.agent.loop.memory/1",query,records,characters:used};
}
