// Optional host integration. Core imports neither this module nor credentials.
// Provider retries, validation, reservations and crash reconciliation stay in
// the existing TypeSafe runtime. This adapter never requeues UNKNOWN records.
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {createInferenceResult} from '../../../../src/core-domains/inference/contract/index.js';
const hash=value=>createHash('sha256').update(value).digest('hex');
export function createTypeSafeRuntimeBridge({runtimeScript,scriptSha256,stateDirectory,python='python3',timeoutMs=120000}={}){
 if(!path.isAbsolute(runtimeScript??'')||!path.isAbsolute(stateDirectory??'')||!scriptSha256?.match(/^[a-f0-9]{64}$/)||!Number.isSafeInteger(timeoutMs)||timeoutMs<1)throw new TypeError('Explicit pinned runtime script and private state directory required');
 async function prepare(){
  if(await realpath(runtimeScript)!==runtimeScript||hash(await readFile(runtimeScript))!==scriptSha256)throw new Error('TypeSafe runtime pin mismatch');
  await mkdir(stateDirectory,{recursive:true,mode:0o700});const info=await lstat(stateDirectory);
  if(!info.isDirectory()||info.isSymbolicLink()||(info.mode&0o077)!==0||typeof process.getuid==='function'&&info.uid!==process.getuid()||await realpath(stateDirectory)!==stateDirectory)throw new Error('Unsafe private adapter directory');
 }
 return Object.freeze({
  async writeInput(id,state){await prepare();const body=JSON.stringify({id:'record',state})+'\n',file=path.join(stateDirectory,hash(id+'\n'+body)+'.jsonl');try{await writeFile(file,body,{flag:'wx',mode:0o600});}catch(error){if(error.code!=='EEXIST')throw error;const info=await lstat(file);if(!info.isFile()||info.isSymbolicLink()||(info.mode&0o077)!==0||await readFile(file,'utf8')!==body)throw new Error('Adapter input identity mismatch');}return file;},
  async call(name,args,{signal}={}){
   if(!['create_job','run_job','read_results','job_status'].includes(name))throw new Error('Runtime operation not allowed');await prepare();signal?.throwIfAborted();
   return new Promise((resolve,reject)=>{
    const env=Object.fromEntries(['HOME','PATH','SYSTEMROOT','TMPDIR'].filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]]));
    const child=spawn(python,['-B',runtimeScript,'--call',name,'--arguments','-'],{env,stdio:['pipe','pipe','pipe']});let out='',exceeded=false;
    const abort=()=>child.kill('SIGTERM'),timer=setTimeout(abort,timeoutMs);signal?.addEventListener('abort',abort,{once:true});
    child.stdout.on('data',bytes=>{out+=bytes;if(out.length>1024*1024){exceeded=true;abort();}});child.stderr.resume();
    child.on('error',()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new Error('TypeSafe runtime unavailable'));});
    child.on('exit',code=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);if(code!==0||signal?.aborted||exceeded)return reject(new Error('TypeSafe runtime interrupted or rejected request'));
     try{const value=JSON.parse(out);if(value.isError)throw Error();const payload=JSON.parse(value.content.find(x=>x.type==='text').text);resolve(payload);}catch{reject(new Error('Invalid TypeSafe runtime response'));}
    });child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(args));
   });
  }
 });
}
export function createTypeSafeInference({runtime,project,thresholds,modelId='jev-1.14.0',budgetUsd='0.01',namespace='engine',maxAttempts=1}={}){
 if(typeof runtime?.call!=='function'||typeof runtime?.writeInput!=='function'||!project||!thresholds||!Number.isSafeInteger(maxAttempts)||maxAttempts<1||maxAttempts>3)throw new TypeError('Approved shared runtime budget, thresholds and runtime bridge required');
 const active=new Set();
 return Object.freeze({async infer({request,instance,signal}={}){
  const result=(status,output=null,extra={})=>createInferenceResult({requestId:request.id,modelId:request.modelId,status,output,providerId:instance?.providerId??'typesafe',...extra});
  if(request?.modelId!==modelId||modelId!=='jev-1.14.0'||!request.capabilities?.includes('classification')||instance?.protocol&&instance.protocol!=='typesafe-system-one'||instance?.baseUrl&&instance.baseUrl.replace(/\/$/,'')!=='https://api.typesafe.ai/v1')return result('rejected',null,{error:{reason:'unsupported_configuration'}});
  if(active.has(request.id))return result('rejected',null,{error:{reason:'request_in_flight'}});active.add(request.id);
  let job=null,attempted=false;
  try{
   signal?.throwIfAborted();const input=request.input,questions={},ts={};
   if(!input?.questions||!Number.isSafeInteger(input.profileVersion))throw Error('Invalid typed input');
   for(const [id,q] of Object.entries(input.questions)){
    if(q.type==='choice')questions[id]={type:'choice',instructions:q.instructions,criteria:Object.fromEntries(q.options.map(label=>[label,label]))};
    else if(q.type==='score')questions[id]={type:'score',instructions:q.instructions,criteria:q.levels};
    else if(q.type==='probability')questions[id]={type:'noul',instructions:q.instructions};else throw Error('Unsupported question');
    if(!thresholds[id])throw Error('Explicit question thresholds required');ts[id]=thresholds[id];
   }
   const file=await runtime.writeInput(request.id,input.state);
   const created=await runtime.call('create_job',{input_jsonl:file,profile_name:'custom',profile_json:JSON.stringify({name:'engine-classification',version:input.profileVersion,questions,thresholds:ts}),project,client_ref:'engine:'+hash(namespace+':'+request.id),budget_usd:budgetUsd,max_attempts:maxAttempts,max_input_tokens:65536*maxAttempts,concurrency:1},{signal});job=created.job;
   let attempts=0;let records=await runtime.call('read_results',{job,offset:0,limit:1},{signal});let record=records.records?.[0];
   if(['PENDING','RETRY'].includes(record?.status)){
    // Reuse runtime refusal/retry/UNKNOWN boundaries. No additional HTTP retry.
    attempted=true;const after=await runtime.call('run_job',{job,max_items:1},{signal});attempts=Math.max(0,after.attempts-created.attempts);records=await runtime.call('read_results',{job,offset:0,limit:1},{signal});record=records.records?.[0];
   }
   if(!['DONE','REVIEW','CACHED'].includes(record?.status))return result(record?.status==='UNKNOWN'?'uncertain':'rejected',{status:record?.status??'PENDING'},{receiptRef:'typesafe:'+job,error:{reason:'runtime_'+(record?.status??'pending')}});
   const data=record.result;if(data?.model!==modelId||!data.answers||!data.usage)throw Error('Invalid validated runtime result');
   const answers={};for(const [id,a] of Object.entries(data.answers))answers[id]={type:a.type==='noul'?'probability':a.type,value:a.type==='noul'?a.noul:a.type==='choice'?a.choice:a.score,...(a.confidence!==undefined?{confidence:a.confidence}:{}),...(a.probabilities?{probabilities:a.probabilities}:{})};
   return result('ok',{status:data.review_needed?'uncertain':'answered',answers,validationNotes:data.validation_notes??[]},{usage:attempts?{...data.usage,modelCalls:attempts}:{input_tokens:0,output_tokens:0,modelCalls:0},receiptRef:'typesafe:'+job});
  }catch{return result(signal?.aborted?'cancelled':attempted?'uncertain':'rejected',null,{receiptRef:job?'typesafe:'+job:null,error:{reason:'runtime_unresolved'}});}finally{active.delete(request.id);}
 }});
}
