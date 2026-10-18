//! Raw ABI. Asyncify preserves the real interpreter's stack at host_request.
use camel_audio_runtime::language::{CompiledProgram,Engine,Host,Limits,Capability,Value,ModelProvider,ExecutionEvent,Site};
use serde_json::{Value as J,json};
use std::sync::Arc;
const MAX_PACKET: usize = 1024 * 1024;
#[link(wasm_import_module = "camel")]
unsafe extern "C" {
 fn host_request(request: *const u8, len: usize, response: *mut u8, capacity: usize) -> usize;
 fn log(text: *const u8, len: usize);
}
fn wire(value:J)->J { match value {
 J::Number(ref n) if n.as_i64().is_some_and(|x| !(-9007199254740991..=9007199254740991).contains(&x)) => json!({"$camel":"bigint","value":n.to_string()}),
 J::Array(v)=>J::Array(v.into_iter().map(wire).collect()),
 J::Object(v)=>J::Object(v.into_iter().map(|(k,v)|(k,wire(v))).collect()), v=>v
}}
fn from_wire(value:J)->Result<Value,String>{
 if value["$camel"]=="bigint" {return value["value"].as_str().ok_or("Big integer text required")?.parse::<i64>().map(Value::Int).map_err(|_|"Integer exceeds Camel i64 range".into())}
 match value { J::Array(v)=>Ok(Value::Array(v.into_iter().map(from_wire).collect::<Result<_,_>>()?)),
 J::Object(v)=>Ok(Value::Object(v.into_iter().map(|(k,v)|Ok((k,from_wire(v)?))).collect::<Result<_,String>>()?)), v=>Ok(Value::from_json(v)) }
}
fn request(kind:&str,payload:J)->Result<J,String>{
 let bytes=json!({"kind":kind,"payload":wire(payload)}).to_string().into_bytes();
 if bytes.len()>MAX_PACKET{return Err("Camel host request exceeds 1 MiB".into())}
 let mut response=vec![0u8;MAX_PACKET];
 let len=unsafe{host_request(bytes.as_ptr(),bytes.len(),response.as_mut_ptr(),response.len())};
 if len>response.len(){return Err("Camel host response exceeds 1 MiB".into())}
 let reply:J=serde_json::from_slice(&response[..len]).map_err(|e|e.to_string())?;
 if reply["ok"]==true{Ok(reply["value"].clone())}else{Err(reply["error"].as_str().unwrap_or("Host call failed").into())}
}
struct Rpc;
impl ModelProvider for Rpc {fn complete(&self,r:J)->Result<J,String>{request("model",r)}}
fn execute(r:J)->Result<J,String>{
 let source=r["source"].as_str().ok_or("source required")?;
 let filename=r["filename"].as_str().unwrap_or("main.camel");
 if r["resolveImports"]==true{return Err("Browser filesystem imports unavailable".into())}
 let compiled=CompiledProgram::from_source(filename,source).map_err(|e|e.to_string())?;
 if r["action"]=="check" {return Ok(json!({"status":"PASS","declarations":compiled.declarations().iter().map(|d|json!({"name":d.name,"kind":d.kind,"site":d.site,"parameters":d.parameters.iter().map(|p|json!({"name":p.name,"type":p.ty,"optional":p.optional,"default":p.default})).collect::<Vec<_>>()})).collect::<Vec<_>>()}))}
 let mut host=Host::default();
 host.tools.register("nexus.call",Capability::Shell,|args,_,site|{
  let values=args.iter().map(|a|a.to_json(site)).collect::<Result<Vec<_>,_>>()?;
  request("nexus",json!(values)).and_then(from_wire).map_err(|e|camel_audio_runtime::language::Error::at(site,e))
 }).map_err(|e|e.to_string())?;
 for (name,kind) in [("nexus.discover","discover"),("nexus.poll","poll"),("nexus.input","input"),("nexus.update","update")] {
  host.tools.register(name,Capability::Pure,move|_,_,site|request(kind,J::Null).and_then(from_wire).map_err(|e|camel_audio_runtime::language::Error::at(site,e))).map_err(|e|e.to_string())?;
 }
 host.provider=Some(Arc::new(Rpc));
 host.observer=Some(Arc::new(|event|{if let ExecutionEvent::Log{text}=event{unsafe{log(text.as_ptr(),text.len())}}}));
 let defaults=Limits::default();
 let limits=Limits{steps:r["steps"].as_u64().unwrap_or(defaults.steps as u64) as usize,call_depth:r["callDepth"].as_u64().unwrap_or(defaults.call_depth as u64) as usize,tasks:r["tasks"].as_u64().unwrap_or(defaults.tasks as u64) as usize};
 let args=r["args"].as_array().cloned().unwrap_or_default().into_iter().map(from_wire).collect::<Result<Vec<_>,_>>()?;
 let output=Engine::new(compiled,host).with_limits(limits).run(r["entry"].as_str().unwrap_or("Main"),args).map_err(|e|e.to_string())?;
 let site=Site{file:filename.into(),line:1,column:1,offset:0,end_line:1,end_column:1,end_offset:0};
 Ok(json!({"status":"PASS","value":wire(output.value.to_json(&site).map_err(|e|e.to_string())?),"logs":output.logs}))
}
#[no_mangle]
pub extern "C" fn camel_alloc(len:usize)->*mut u8 {let boxed=vec![0u8;len].into_boxed_slice();Box::into_raw(boxed) as *mut u8}
#[no_mangle]
pub unsafe extern "C" fn camel_free(ptr:*mut u8,len:usize){drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr,len)))}
// The returned pointer/length are read after the instrumented export finishes.
static mut RESULT:Vec<u8>=Vec::new();
#[no_mangle]
pub unsafe extern "C" fn camel_execute(ptr:*const u8,len:usize){
 let result=serde_json::from_slice(std::slice::from_raw_parts(ptr,len)).map_err(|e|e.to_string()).and_then(execute);
 RESULT=match result {Ok(value)=>json!({"ok":true,"value":value}),Err(error)=>json!({"ok":false,"error":error})}.to_string().into_bytes();
}
#[no_mangle]
pub unsafe extern "C" fn camel_result_ptr()->*const u8 {(&*std::ptr::addr_of!(RESULT)).as_ptr()}
#[no_mangle]
pub unsafe extern "C" fn camel_result_len()->usize {(&*std::ptr::addr_of!(RESULT)).len()}
