import {mkdir,readFile,writeFile,rename} from "node:fs/promises";
import {dirname,resolve} from "node:path";
export function createLoopCheckpointStore({root}={}){
 if(!root)throw new TypeError("Checkpoint root required");
 const pathFor=id=>{if(!/^[a-zA-Z0-9_.-]+$/.test(id))throw new TypeError("Invalid checkpoint id");return resolve(root,id+".json");};
 return Object.freeze({
  async load(id){try{return JSON.parse(await readFile(pathFor(id),"utf8"));}catch(error){if(error.code==="ENOENT")return null;throw error;}},
  async save(id,value,{expectedRevision}={}){
   const target=pathFor(id);await mkdir(dirname(target),{recursive:true});
   let prior=null;try{prior=JSON.parse(await readFile(target,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
   if(expectedRevision!==undefined&&prior?.revision!==expectedRevision)throw new Error("Checkpoint revision conflict");
   const tmp=target+"."+process.pid+"."+Date.now()+".tmp";
   await writeFile(tmp,JSON.stringify(value,null,2));await rename(tmp,target);
   return target;
  }
 });
}
