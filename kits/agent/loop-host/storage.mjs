import {mkdir,readFile,rename,open,unlink,lstat} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {randomUUID} from "node:crypto";
import {validateLoopCheckpoint} from "../../../src/core-domains/agent/loop/control/index.js";
export function createLoopCheckpointStore({root}={}){
 if(!root)throw new TypeError("Checkpoint root required");
 const pathFor=id=>{if(!/^[a-zA-Z0-9_.-]+$/.test(id))throw new TypeError("Invalid checkpoint id");return resolve(root,id+".json");};
 return Object.freeze({
  async load(id){
   try{const target=pathFor(id);if((await lstat(target)).isSymbolicLink())throw new Error('Checkpoint symlink rejected');return validateLoopCheckpoint(JSON.parse(await readFile(target,"utf8")));}
   catch(error){if(error.code==="ENOENT")return null;throw error;}
  },
  async save(id,value,{expectedRevision=null}={}){
   value=validateLoopCheckpoint(value);
   const target=pathFor(id);await mkdir(dirname(target),{recursive:true});
   const lock=target+".lock",handle=await open(lock,"wx");let temp=null,primaryError=null;
   try{
    let prior=null;try{if((await lstat(target)).isSymbolicLink())throw new Error('Checkpoint symlink rejected');prior=validateLoopCheckpoint(JSON.parse(await readFile(target,"utf8")));}catch(e){if(e.code!=="ENOENT")throw e;}
    if((prior?.state?.revision??null)!==expectedRevision)throw new Error("Checkpoint revision conflict");
    if(prior&&(value.state.revision<=prior.state.revision||['loopId','agentId','goalRef'].some(k=>value.state[k]!==prior.state[k])))throw new Error('Checkpoint rollback or identity conflict');
    temp=target+"."+randomUUID()+".tmp";
    const output=await open(temp,'wx',0o600);
    try{await output.writeFile(JSON.stringify(value,null,2)+"\n");await output.sync();}finally{await output.close();}
    await rename(temp,target);temp=null;return target;
   }catch(error){primaryError=error;throw error;
   }finally{
    const cleanup=await Promise.allSettled([handle.close(),unlink(lock),...(temp?[unlink(temp)]:[])]);
    if(!primaryError){const failed=cleanup.find(x=>x.status==='rejected');if(failed)throw failed.reason;}
   }
  }
 });
}
