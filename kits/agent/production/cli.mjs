import {createEngineProductionHost} from './index.mjs';
export async function runProductionCli({argv=process.argv.slice(2),dependencies=import.meta.url}={}) {
const args = argv;
const writable = args.includes('--write');
const workspaceAt = args.indexOf('--workspace');
if (workspaceAt < 0 || !args[workspaceAt + 1]) throw Error('Usage: nexus-engine-kit --workspace PATH [--write] TOOL [JSON_ARGUMENTS]');
const remaining = args.filter((_, i) => i !== workspaceAt && i !== workspaceAt + 1).filter(x => x !== '--write');
const kit = await createEngineProductionHost({ dependencies, workspace: args[workspaceAt + 1], writable });
try { console.log(JSON.stringify(await kit.call(remaining[0] ?? 'production.status', JSON.parse(remaining[1] ?? '{}')), null, 2)); }
finally { await kit.close(); }

}
