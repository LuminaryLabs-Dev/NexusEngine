import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createAgentAnswerSession } from "../../core-domains/agent/interaction/answer-session.js";
const usage = "Usage: nexusengine agent ask <intent> --project <path> | next|context|respond|result|resume --session <id> --project <path> [--file <json-file>]";
function opts(argv){const out={words:[]};for(let i=0;i<argv.length;i++){const a=argv[i];if(["--project","--session","--file"].includes(a)){if(!argv[i+1])throw new TypeError("Missing "+a);out[a.slice(2)]=argv[++i];}else if(a.startsWith("--"))throw new TypeError("Unknown option "+a);else out.words.push(a);}return out;}
const print=x=>process.stdout.write(JSON.stringify(x,null,2)+"\n");
export async function runAgentCli(argv){
  const a=opts(argv),[command,...args]=a.words;
  if(!command || command==="help"){process.stdout.write(usage+"\n");return;}
  if(!a.project)throw new TypeError("--project is required.");
  const root=resolve(a.project),dir=join(root,".nexus-agent");
  const validId=id=>{if(typeof id!=="string"||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw new TypeError("Invalid session ID.");return id;};
  const location=id=>join(dir,validId(id)+".json");
  const save=async snapshot=>{await mkdir(dir,{recursive:true});const file=location(snapshot.id),tmp=file+"."+process.pid+".tmp";await writeFile(tmp,JSON.stringify(snapshot,null,2));await rename(tmp,file);};
  if(command==="ask"){const intent=args.join(" ");if(!intent)throw new TypeError("Intent required.");const id="session-"+Date.now()+"-"+process.pid;const session=createAgentAnswerSession({id,intent,project:root});await save(session.snapshot());print(session.ask());return;}
  if(!["next","context","respond","result","resume"].includes(command))throw new TypeError("Unknown command "+command);
  const id=validId(a.session),snapshot=JSON.parse(await readFile(location(id),"utf8"));const session=createAgentAnswerSession({id,intent:snapshot.intent,project:root,maxTurns:Math.max(128,snapshot.turn+1)});session.resume(snapshot);
  if(command==="next"){print(session.next());return;}
  if(command==="context"){print(session.context());return;}
  if(command==="resume"){print({session:session.snapshot(),next:session.next()});return;}
  if(!a.file)throw new TypeError("--file is required.");
  const input=JSON.parse(await readFile(resolve(a.file),"utf8"));
  const result=command==="respond"?session.respond(input):session.result(input);
  await save(session.snapshot());print(result);
}
