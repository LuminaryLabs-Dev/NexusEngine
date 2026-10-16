import { spawnSync } from "node:child_process";
import { contentIntegrity } from '../../../contracts.js';

const COMMANDS = Object.freeze({
  cargo: ["--version"],
  cmake: ["--version"],
  gradle: ["--version"],
  java: ["--version"],
  rustc: ["--version"]
});

export function createToolchainDiscoveryService(config = {}) {
  function inspect(command) {
    const result = spawnSync(command, config.arguments?.[command] ?? COMMANDS[command] ?? ["--version"], {
      encoding: "utf8",
      shell: false,
      timeout: Number(config.timeoutMs ?? 5000)
    });
    return Object.freeze({
      command,
      available: result.status === 0,
      version: result.status === 0 ? String(result.stdout || result.stderr).trim().split("\n")[0] : null,
      error: result.error?.message ?? (result.status === 0 ? null : String(result.stderr ?? "").trim() || "command-unavailable")
    });
  }

  function discover(commands = Object.keys(COMMANDS)) {
    return Object.freeze(commands.map(inspect));
  }
  function selectCpp({source,includeDirectories=[],standard='c++20',candidates=[process.env.CXX,'c++'].filter(Boolean)}={}) {
    if(typeof source!=='string'||!source.length||source.length>65536)throw new TypeError('A bounded compiler probe source is required.');
    if(!['c++17','c++20','c++23'].includes(standard))throw new TypeError('Unsupported C++ probe standard.');
    const attempts=[];
    for(const command of [...new Set(candidates)]) {
      const version=inspect(command);
      const result=spawnSync(command,['-x','c++',`-std=${standard}`,'-fsyntax-only',...includeDirectories.flatMap(directory=>['-I',directory]),'-'],{input:source,encoding:'utf8',shell:false,timeout:10000,maxBuffer:256*1024});
      const attempt={command,version:version.version,ok:result.status===0,diagnostic:result.status===0?null:String(result.error?.message??result.stderr).slice(0,4000)};
      attempts.push(attempt);
      if(attempt.ok)return Object.freeze({ok:true,command,version:version.version,standard,probeHash:contentIntegrity(source),attempts});
    }
    return Object.freeze({ok:false,standard,probeHash:contentIntegrity(source),attempts});
  }

  return Object.freeze({ inspect, discover, selectCpp });
}

export default createToolchainDiscoveryService;
