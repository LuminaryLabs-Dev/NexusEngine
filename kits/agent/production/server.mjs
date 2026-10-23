import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createEngineProductionHost, TOOL_DEFINITIONS } from './index.mjs';
import { errorResult } from './receipt-mapping.mjs';
export async function startProductionMcp({dependencies=import.meta.url,legacyNames=false}={}) {
const require=createRequire(dependencies);
const {Server}=require('@modelcontextprotocol/sdk/server/index.js');
const {StdioServerTransport}=require('@modelcontextprotocol/sdk/server/stdio.js');
const {ListToolsRequestSchema,CallToolRequestSchema}=require('@modelcontextprotocol/sdk/types.js');
const toolName=name=>legacyNames?name:'production.'+name.slice(4);
let kit;
const bind = { name: toolName('kit_bind'), description: 'Bind one existing local workspace. Set writable only for user-authorized production work. Binding acquires a local host lock and persists run metadata.',
  inputSchema: { type: 'object', properties: { workspace: { type: 'string', minLength: 1 }, writable: { type: 'boolean' } }, required: ['workspace'], additionalProperties: false } };
const server = new Server({ name: 'nexus-engine-production', version: '0.4.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [bind, ...TOOL_DEFINITIONS.map(({ writes, ...tool }) => ({ ...tool, name:toolName(tool.name), annotations: { readOnlyHint: !writes, destructiveHint: false, openWorldHint: false } }))] }));
server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  try {
    const action = params.name.startsWith('production.') ? 'kit_'+params.name.slice(11) : params.name;
    let value;
    if (action === 'kit_bind') {
      if (kit) throw Error('Already bound; start a separate host for another workspace.');
      const args = params.arguments ?? {};
      if (typeof args.workspace !== 'string' || (args.writable !== undefined && typeof args.writable !== 'boolean') || Object.keys(args).some(k => !['workspace', 'writable'].includes(k))) throw Error('Invalid bind arguments.');
      kit = await createEngineProductionHost({dependencies,...args}); value = await kit.call('kit_status');
    } else {
      if (!kit) throw Error('Call kit_bind first.');
      value = await kit.call(params.name, params.arguments ?? {});
    }
    // Keep numeric samples in the local report instead of flooding model context.
    if(action==='kit_look' && value.result?.report){const {report,...files}=value.result;value={...value,result:{...files,summary:{assemblyId:report.assemblyId,artifactHash:report.artifactHash,mode:report.mode,renderer:report.renderer,camera:report.camera,focus:report.focus,views:report.views,sourceUnchanged:report.sourceUnchanged,verdict:report.verdict,consoleErrors:report.consoleErrors,remoteRequests:report.remoteRequests,frames:report.frames.map(f=>({time:f.time,image:f.image,imageHash:f.imageHash,captureAttempts:f.captureAttempts,meshes:f.meshes.length,triangles:f.meshes.reduce((sum,m)=>sum+m.triangles,0)}))},fullMetrics:'Read reportFile for per-mesh bounds and world-space vertex samples.'}};}
    const content=[{type:'text',text:JSON.stringify(value)}];
    if(action==='kit_look' && value.ok && value.result?.image){const png=await readFile(value.result.image);if(png.length<=4*1024*1024)content.push({type:'image',mimeType:'image/png',data:png.toString('base64')});}
    if(action==='kit_compare_inspections' && value.ok){for(const file of value.result.images.slice(0,2)){const png=await readFile(file);if(png.length<=4*1024*1024)content.push({type:'image',mimeType:'image/png',data:png.toString('base64')});}}
    return { content, structuredContent: value, ...(value.ok === false ? { isError: true } : {}) };
  } catch (error) { return { isError: true, content: [{ type: 'text', text: JSON.stringify(errorResult(error)) }] }; }
});
async function close() { await kit?.close(); }
process.on('SIGINT', () => close().finally(() => process.exit(0)));
process.on('SIGTERM', () => close().finally(() => process.exit(0)));
server.onclose = close;
await server.connect(new StdioServerTransport());
return server;

}
