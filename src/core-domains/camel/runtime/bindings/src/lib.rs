use camel_audio_runtime::language::{CompiledProgram,Engine,Host,Limits,Capability,Value,ModelProvider,ExecutionEvent};
use napi::{bindgen_prelude::*,threadsafe_function::{ThreadsafeFunction,ThreadsafeFunctionCallMode,ErrorStrategy},JsFunction};
use napi_derive::napi;
use serde_json::{Value as J,json};
use std::{collections::HashMap,sync::{Arc,Mutex,OnceLock,mpsc,atomic::{AtomicU64,AtomicBool,Ordering}},time::Duration};
static NEXT:AtomicU64=AtomicU64::new(1);
static PENDING:OnceLock<Mutex<HashMap<String,mpsc::Sender<String>>>>=OnceLock::new();
static CANCEL:OnceLock<Mutex<HashMap<String,Arc<AtomicBool>>>>=OnceLock::new();
type Callback=ThreadsafeFunction<String,ErrorStrategy::CalleeHandled>;
fn err(e:impl std::fmt::Display)->Error {Error::from_reason(e.to_string())}
fn wire(value:J)->J {
 match value {
  J::Number(ref n) if n.as_i64().is_some_and(|x| x > 9007199254740991 || x < -9007199254740991) => json!({"$camel":"bigint","value":n.to_string()}),
  J::Array(v)=>J::Array(v.into_iter().map(wire).collect()),
  J::Object(v)=>J::Object(v.into_iter().map(|(k,v)|(k,wire(v))).collect()),
  v=>v
 }
}
fn value_from_wire(value:J)->std::result::Result<Value,String>{
 if value["$camel"]=="bigint" {return value["value"].as_str().ok_or("Big integer text required")?.parse::<i64>().map(Value::Int).map_err(|_|"Integer exceeds Camel i64 range".into())}
 match value {
  J::Array(v)=>Ok(Value::Array(v.into_iter().map(value_from_wire).collect::<std::result::Result<_,_>>()?)),
  J::Object(v)=>Ok(Value::Object(v.into_iter().map(|(k,v)|Ok((k,value_from_wire(v)?))).collect::<std::result::Result<_,String>>()?)),
  v=>Ok(Value::from_json(v))
 }
}
struct Rpc{cb:Callback,cancelled:Arc<AtomicBool>,job:String}
impl Rpc {
 fn request(&self,kind:&str,payload:J)->std::result::Result<J,String>{
  if self.cancelled.load(Ordering::Relaxed){return Err("Camel execution cancelled".into())}
  let id=format!("{}:{}",self.job,NEXT.fetch_add(1,Ordering::Relaxed));
  let(tx,rx)=mpsc::channel();PENDING.get_or_init(Default::default).lock().unwrap().insert(id.clone(),tx);
  let status=self.cb.call(Ok(json!({"id":id,"kind":kind,"payload":wire(payload)}).to_string()),ThreadsafeFunctionCallMode::NonBlocking);
  if status!=napi::Status::Ok{PENDING.get().unwrap().lock().unwrap().remove(&id);return Err(format!("Callback failed: {status:?}"))}
  loop {match rx.recv_timeout(Duration::from_millis(50)){
   Ok(s)=>{let r:J=serde_json::from_str(&s).map_err(|e|e.to_string())?;return if r["ok"]==true{Ok(r["value"].clone())}else{Err(r["error"].as_str().unwrap_or("Host call failed").into())}},
   Err(mpsc::RecvTimeoutError::Timeout)=>if self.cancelled.load(Ordering::Relaxed){PENDING.get().unwrap().lock().unwrap().remove(&id);return Err("Camel execution cancelled".into())},
   Err(e)=>return Err(e.to_string())
  }}
 }
}
impl ModelProvider for Rpc {fn complete(&self,request:J)->std::result::Result<J,String>{self.request("model",request)}}
#[napi]
pub fn reply(id:String,response:String)->bool {PENDING.get_or_init(Default::default).lock().unwrap().remove(&id).map(|s|s.send(response).is_ok()).unwrap_or(false)}
#[napi]
pub fn cancel(id:String)->bool {CANCEL.get_or_init(Default::default).lock().unwrap().get(&id).map(|c|c.store(true,Ordering::Relaxed)).is_some()}
pub struct Job{request:J,rpc:Arc<Rpc>}
impl Task for Job {
 type Output=String;type JsValue=String;
 fn compute(&mut self)->Result<String>{
  let result=(||->Result<String>{
   let r=&self.request;let source=r["source"].as_str().ok_or_else(||err("source required"))?;
   let filename=r["filename"].as_str().unwrap_or("main.camel");
   let compiled=if r["resolveImports"]==true {CompiledProgram::from_source_at(filename,source)}else{CompiledProgram::from_source(filename,source)}.map_err(err)?;
   if r["action"]=="check"{return Ok(json!({"status":"PASS","declarations":compiled.declarations().iter().map(|d|json!({"name":d.name,"kind":d.kind,"site":d.site,"parameters":d.parameters.iter().map(|p|json!({"name":p.name,"type":p.ty,"optional":p.optional,"default":p.default})).collect::<Vec<_>>()})).collect::<Vec<_>>()}).to_string())}
   let mut host=Host::default();host.cancelled=Some(self.rpc.cancelled.clone());
   let allowed:Vec<String>=r["hostCapabilities"].as_array().map(|v|v.iter().filter_map(|s|s.as_str().map(str::to_owned)).collect()).unwrap_or_default();
   host.tools.restrict(&allowed);
   let rpc=self.rpc.clone();host.tools.register("nexus.call",Capability::Shell,move|args,_,site|{
    let values=args.iter().map(|a|a.to_json(site)).collect::<std::result::Result<Vec<_>,_>>()?;
    rpc.request("nexus",json!(values)).and_then(value_from_wire).map_err(|e|camel_audio_runtime::language::Error::at(site,e))
   }).map_err(err)?;
   let rpc=self.rpc.clone();host.tools.register("nexus.discover",Capability::Pure,move|_,_,site|rpc.request("discover",J::Null).and_then(value_from_wire).map_err(|e|camel_audio_runtime::language::Error::at(site,e))).map_err(err)?;
   let rpc=self.rpc.clone();host.tools.register("nexus.poll",Capability::Pure,move|_,_,site|rpc.request("poll",J::Null).and_then(value_from_wire).map_err(|e|camel_audio_runtime::language::Error::at(site,e))).map_err(err)?;
   host.provider=Some(self.rpc.clone());
   if !allowed.iter().any(|c|c=="audio"){host.recorder=Arc::new(|_|Err("Audio capability denied".into()))}
   let rpc=self.rpc.clone();host.observer=Some(Arc::new(move|event|{if let ExecutionEvent::Log{text}=event{let _=rpc.cb.call(Ok(json!({"kind":"log","payload":text}).to_string()),ThreadsafeFunctionCallMode::NonBlocking);}}));
   let defaults=Limits::default();let limits=Limits{steps:r["steps"].as_u64().unwrap_or(defaults.steps as u64) as usize,call_depth:r["callDepth"].as_u64().unwrap_or(defaults.call_depth as u64) as usize,tasks:r["tasks"].as_u64().unwrap_or(defaults.tasks as u64) as usize};
   let args=r["args"].as_array().cloned().unwrap_or_default().into_iter().map(Value::from_json).collect();
   let result=Engine::new(compiled,host).with_limits(limits).run(r["entry"].as_str().unwrap_or("Main"),args).map_err(err)?;
   // display() uses upstream serialization for portable values, preserving integer spelling.
   Ok(json!({"status":"PASS","value":wire(result.value.to_json(&serde_json::from_value(json!({"file":filename,"line":1,"column":1})).map_err(err)?).map_err(err)?),"logs":result.logs}).to_string())
  })();
  CANCEL.get_or_init(Default::default).lock().unwrap().remove(&self.rpc.job);result
 }
 fn resolve(&mut self,_:Env,output:String)->Result<String>{Ok(output)}
}
#[napi]
pub fn execute(request:String,callback:JsFunction)->Result<AsyncTask<Job>>{
 let r:J=serde_json::from_str(&request).map_err(err)?;let id=r["id"].as_str().ok_or_else(||err("id required"))?.to_owned();
 let cancelled=Arc::new(AtomicBool::new(false));let mut jobs=CANCEL.get_or_init(Default::default).lock().unwrap();
 if jobs.contains_key(&id){return Err(err("Duplicate active execution id"))}jobs.insert(id.clone(),cancelled.clone());drop(jobs);
 let cb:Callback=callback.create_threadsafe_function(0,|ctx:napi::threadsafe_function::ThreadSafeCallContext<String>|Ok(vec![ctx.env.create_string(&ctx.value)?]))?;
 Ok(AsyncTask::new(Job{request:r,rpc:Arc::new(Rpc{cb,cancelled,job:id})}))
}
