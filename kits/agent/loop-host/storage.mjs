import {mkdir,readFile,writeFile,rename,open,unlink} from "node:fs/promises";
import {dirname,resolve} from "node:path";
export function createLoopCheckpointStore({root}={}){
 if(!root)throw new TypeError("Checkpoint root required");
 const pathFor=id=>{if(!/^[a-zA-Z0-9_.-]+$/.test(id))throw new TypeError("Invalid checkpoint id");return resolve(root,id+".json");};
 return Object.freeze({
  async load(id){
   try{const value=JSON.parse(await readFile(pathFor(id),"utf8"));if(value?.schema!=="nexusengine.agent.loop.run/1"||!Number.isSafeInteger(value?.state?.revision))throw new Error("Corrupt loop checkpoint");return value;}
   catch(error){if(error.code==="ENOENT")return null;throw error;}
  },
  async save(id,value,{expectedRevision=null}={}){
   if(value?.schema!=="nexusengine.agent.loop.run/1"||!Number.isSafeInteger(value?.state?.revision))throw new TypeError("Invalid checkpoint state");
   const target=pathFor(id);await mkdir(dirname(target),{recursive:true});
   const lock=target+".lock",handle=await open(lock,"wx");let temp=null;
   try{
    let prior=null;try{prior=JSON.parse(await readFile(target,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
    if((prior?.state?.revision??null)!==expectedRevision)throw new Error("Checkpoint revision conflict");
    temp=target+"."+process.pid+"."+Date.now()+".tmp";
    await writeFile(temp,JSON.stringify(value,null,2)+"\n");
    await rename(temp,target);temp=null;return target;
   }finally{
    await handle.close();await unlink(lock);
   }
  }
 });
}
