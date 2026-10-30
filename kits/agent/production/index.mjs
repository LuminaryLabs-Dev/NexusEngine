export const PRODUCTION_WORKFLOWS = Object.freeze([
 {id:'asset-production/1',nodes:[{id:'brief'},{id:'model',dependencies:['brief']},{id:'refine',dependencies:['model']},{id:'inspect',dependencies:['refine']},{id:'correct',dependencies:['inspect']},{id:'prepare',dependencies:['correct']},{id:'verify',dependencies:['prepare']}],visualAcceptance:'Explicit image review is required; capture alone is not acceptance.'},
 {id:'game-production/1',nodes:[{id:'assets'},{id:'compose',dependencies:['assets']},{id:'plan-build',dependencies:['compose']},{id:'approve-build',dependencies:['plan-build']},{id:'build',dependencies:['approve-build']},{id:'runtime-proof',dependencies:['build']}],approval:'Exact source-bound Build plan approval remains mandatory.'}
]);
import { inspectGeometry, selectGeometry, validateSelection, bindSelection, MODELING_HELP } from 'nexusengine/domains/authoring';
import { compareInspections } from './inspection-comparison.mjs';
import { inspectAuthoringAsset } from './visual-inspection.mjs';
import { AUTHORING_RECIPES } from './authoring-recipes.mjs';
import { createEngine } from 'nexusengine';
import { createAuthoringDomain } from 'nexusengine/domains/authoring';
import { createAgentKit } from 'nexusengine/domains/agent';
import { createProductionStorage } from './storage.mjs';
import { createAssetRegistryKit } from 'nexusengine/domains/asset/registry';
import { createBuildDomain } from 'nexusengine/domains/build';
import { createMcpDomain, defineMcpProvider } from 'nexusengine/domains/mcp';
import { mkdir, readFile, open, rename, unlink, realpath, lstat } from 'node:fs/promises';
import path from 'node:path';
import { ENGINE_REVISION, digest, receipt, errorResult } from './receipt-mapping.mjs';

const json = value => JSON.stringify(value, null, 2) + '\n';
const text = value => { if (typeof value !== 'string' || !value.trim()) throw Error('Nonempty string required.'); return value; };
const clone = value => structuredClone(value);
const schema = (properties = {}, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const string = { type: 'string', minLength: 1 };
const object = { type: 'object', additionalProperties: true };

export const TOOL_DEFINITIONS = [
  ['kit_status', 'Read bound revision, project state, sessions and asset readiness.', schema()],
  ['kit_discover', 'Discover current typed Authoring operations, schemas, import/export formats and build targets.', schema()],
  ['kit_recipes', 'List reusable native authoring recipes and stages.', schema()],
  ['kit_look', 'Render a canonical GLB from six fixed views at requested pose times. Writes evidence only; appearance requires review.', schema({assemblyId:string,destination:string,times:{type:'array',minItems:1,maxItems:8,items:{type:'number',minimum:0,maximum:3600}},mode:{enum:['surface','wireframe','normals']},focus:{type:'array',maxItems:20,items:string},view:{enum:['front','back','right','left','top','oblique']},camera:object,selection:object},['assemblyId','destination']),true],
  ['kit_inspect_geometry','Inspect bounded native mesh topology, face normals, element IDs and placement metadata.',schema({meshId:string,offset:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:100}},['meshId'])],
  ['kit_select_geometry','Resolve explicit IDs or complete faces inside mesh-local bounds, with optional expansion. Returns a revision-bound selection; source unchanged.',schema({meshId:string,expectedRevision:{type:'integer'},mode:{enum:['object','face','edge','vertex']},ids:{type:'array',maxItems:500,items:string},bounds:schema({min:{type:'array',minItems:3,maxItems:3,items:{type:'number'}},max:{type:'array',minItems:3,maxItems:3,items:{type:'number'}}},['min','max']),action:{enum:['expand','contract','connected','loop','ring']}},['meshId','expectedRevision','mode'])],
  ['kit_compare_inspections','Compare verified captured images and source revisions under identical viewing settings; no automatic aesthetic verdict.',schema({before:string,after:string,destination:string,reason:string,finding:string},['before','after','destination','reason','finding']),true],
  ['kit_read', 'Read one editable document or the current document index.', schema({ id: string })],
  ['kit_author', 'Preview or execute typed Project operations; supply the current epoch and edit revisions from kit_read.', schema({ request: object, selection:object, preview: { type: 'boolean' } }, ['request']), true],
  ['kit_history', 'Undo or redo with current epoch and a unique requestId.', schema({ direction: { enum: ['undo', 'redo'] }, requestId: string, epoch: { type: 'integer' } }, ['direction', 'requestId', 'epoch']), true],
  ['kit_import', 'Import a file under the bound workspace through the canonical importer. Optional resources map encoded resource names to workspace files.', schema({ requestId: string, file: string, format: { enum: ['obj', 'glb', 'fbx', 'usdz'] }, prefix: string, resources: object }, ['requestId', 'file', 'format', 'prefix']), true],
  ['kit_validate', 'Validate the entire current Authoring Project.', schema()],
  ['kit_save', 'Save editable Project through generation-guarded filesystem persistence.', schema({ requestId: string, destination: string, expectedGeneration: { type: 'integer', minimum: 0 } }, ['requestId', 'destination', 'expectedGeneration']), true],
  ['kit_load', 'Load a saved Project after complete canonical package validation.', schema({ source: string }, ['source']), true],
  ['kit_prepare_asset', 'Validate, encode and publish an assembly, then register and verify content-addressed asset readiness.', schema({ requestId: string, assemblyId: string, assetId: string, format: { enum: ['glb', 'fbx', 'usdz'] }, destination: string, profile: object, provenance: object }, ['requestId', 'assemblyId', 'assetId', 'format', 'destination']), true],
  ['kit_verify_asset', 'Recheck all published asset member hashes through the Core asset provider; historical readiness alone is insufficient.', schema({ assetId: string }, ['assetId']), true],
  ['kit_build_plan', 'Create a source-bound Build plan for a workspace project; no toolchain execution.', schema({ project: string, targets: { type: 'array', items: string, minItems: 1 }, profile: string }, ['project', 'targets'])],
  ['kit_build_apply', 'Execute a previously returned plan with approval for its exact hash.', schema({ planId: string, approvePlan: string, destination: string }, ['planId', 'approvePlan']), true],
  ['kit_build_receipt', 'Read one persistent build receipt.', schema({ planId: string }, ['planId'])],
  ['kit_task', 'Create/read/revise/complete a bounded Core task graph. Completion requires a retained successful adapter receipt.', schema({ action: { enum: ['create', 'read', 'revise', 'complete'] }, id: string, nodes: { type: 'array', items: object }, workflowId:string, nodeId: string, receiptId: string }, ['action', 'id']), true],
  ['kit_session', 'Create/read/respond/result using the Core answer-session contract. Results require a retained adapter receipt.', schema({ action: { enum: ['create', 'read', 'respond', 'result'] }, id: string, intent: string, response: object, receiptId: string }, ['action', 'id']), true],
  ['kit_recover', 'Acknowledge an interrupted host call as unverified after inspection. Preserve its record and allow a fresh source-bound request; never claim it completed.', schema({ requestId: string, resolution: { enum: ['discard-unverified'] }, reason: string }, ['requestId', 'resolution', 'reason']), true]
].map(([name, description, inputSchema, writes = false]) => ({ name, description, inputSchema, writes }));

export async function createEngineProductionHost({ workspace, writable = false, authorize = null, agentId = "nexus-engine-kit", dependencies, budgets = {} } = {}) {
  const root = await realpath(path.resolve(text(workspace)));
  if (!(await lstat(root)).isDirectory()) throw Error('Workspace must be a directory.');
  // Reject symlink traversal, including metadata, on every host path.
  async function inside(relative, { allowRoot = false } = {}) {
    text(relative);
    const target = path.resolve(root, relative), rel = path.relative(root, target);
    if ((!allowRoot && !rel) || rel.startsWith('..' + path.sep) || rel === '..' || path.isAbsolute(rel)) throw Error('Path escapes workspace.');
    let current = root;
    for (const part of rel.split(path.sep).filter(Boolean)) {
      current = path.join(current, part);
      try { if ((await lstat(current)).isSymbolicLink()) throw Error('Workspace symlink traversal rejected.'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return target;
  }
  const stateDir = await inside('.nexus-engine-kit');
  await mkdir(stateDir, { recursive: true });
  const lockPath = path.join(stateDir, 'writer.lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await readFile(lockPath, 'utf8'));
    if (!Number.isSafeInteger(pid) || pid < 1) throw Error('Invalid workspace lock; inspect before recovery.');
    try { process.kill(pid, 0); throw Error('Workspace is already bound by a live host.'); }
    catch (e) { if (e.code !== 'ESRCH') throw e; }
    await unlink(lockPath); lock = await open(lockPath, 'wx');
  }
  await lock.writeFile(String(process.pid));
  let engine, closed = false, closing, serial = Promise.resolve();
  const allowed = async (action, args) => writable && (authorize ? await authorize({ action, args, workspace: root }) === true : true);
  const plans = new Map();
  let storage, receipts;
  const file = path.join(stateDir, 'checkpoint.json');
  try {
    storage = createProductionStorage(stateDir, budgets); receipts = storage.receipts;
    engine = createEngine({ kits: [ ...createAuthoringDomain({project:{maxHistoryBytes:budgets.maxHistoryBytes??4*1024*1024,historyArchive:storage.historyArchive,maxReceipts:1000000,maxReceiptBytes:budgets.maxReceiptBytes??256*1024,receiptArchive:storage.historyArchive}}), createAssetRegistryKit(),
      createAgentKit({ eventState:"delta", maxProposals:32, ledger:{maxRecords:32,maxBytes:256*1024,retrieve:id=>{const value=receipts.get(id);return value?{id,agentId:value.agentId??id.slice(0,id.lastIndexOf(":")),action:value.action,accepted:value.ok,result:{requestId:id,receiptRef:{id,storage:"production-receipts"}}}:null;}}, listTools: () => engine.n.authoringProject.tools(), authorizeTool: () => writable }),
      ...createMcpDomain({ authorize: ({ tool, arguments: args }) => allowed(tool.name, args) }) ] });
    engine.n.agent.registerAgent({ id: agentId });
    const project = engine.n.authoringProject;
    const workflows = engine.n.agent.workflows;
    for (const definition of PRODUCTION_WORKFLOWS) workflows.register(definition);
    const build = createBuildDomain({ stateRoot: path.join(stateDir, 'build-state'), artifactRoot: path.join(stateDir, 'artifacts') });
    let sequence = 0, pending = null, interrupted = null;
    async function checkpoint() {
      const state = { schema:'nexus-engine-kit.checkpoint/2', engineRevision:ENGINE_REVISION, sequence, pending, interrupted,
        source:storage.put(project.getStorageSnapshot()), context:engine.n.agent.context.snapshot(),asset:engine.n.asset.getSnapshot(),
        interaction:workflows.snapshot(), plans:[...plans] };
      storage.write('checkpoint.json',state);
    }
    let checkpointExists = false;
    try {
      const checkpointBytes=await readFile(file,'utf8'); const state = JSON.parse(checkpointBytes); checkpointExists = true;
      if (![ENGINE_REVISION, '4905af9a566d66d3cd283dcb4f1032d9150110f3+integration-candidate.1', '081fea1cdd9ca1662bc15116e7174d9c27821630', ...[1,2,3,4].map(version=>`081fea1cdd9ca1662bc15116e7174d9c27821630+agent-production.${version}`)].includes(state.engineRevision)) throw Error('Checkpoint revision mismatch.');
      if (state.schema === 'nexus-engine-kit.checkpoint/1') {
        storage.atomic(path.join(stateDir,'checkpoint-v1-preserved.json'),checkpointBytes);
        project.loadSnapshot(state.source);
        workflows.restore({definitions:PRODUCTION_WORKFLOWS,sessions:state.sessions,graphs:state.graphs});
        for (const [id,value] of state.receipts) receipts.set(id,value);
      } else if (state.schema === 'nexus-engine-kit.checkpoint/2') {
        project.loadStorageSnapshot(storage.get(state.source)); workflows.restore(state.interaction);
      } else throw Error('Unsupported checkpoint schema.');
      engine.n.agent.context.restore(state.context);engine.n.asset.loadSnapshot(state.asset);
      for (const [id,value] of state.plans??[]) plans.set(id,value);
      sequence = state.sequence; interrupted = state.interrupted ?? state.pending;
    } catch(error) { if(error.code!=='ENOENT' || checkpointExists)throw error; }
    try { sequence=Math.max(sequence,storage.read('sequence.json').sequence); } catch(error){if(error.code!=='ENOENT')throw error;}
    // Hydration never republishes historical executions.
    await engine.n.runtime.commitOperation();
    let commitFailure = null;

    engine.n.asset.registerProvider({ id: 'nexus-engine-kit.files', async load(request) {
      const source = request.asset?.source ?? request.source;
      const bytes = await readFile(await inside(source.path));
      if (digest(bytes) !== source.hash) throw Error('Prepared asset integrity mismatch.');
      for (const member of source.files ?? []) if (digest(await readFile(await inside(member.path))) !== member.hash) throw Error('Prepared asset dependency integrity mismatch.');
      return { hash: digest(bytes), byteLength: bytes.length, path: source.path };
    } });
    function retained(id) { const value = receipts.get(id); if (!value?.ok) throw Error('A retained successful adapter receipt is required.'); return {requestId:value.requestId,action:value.action,ok:value.ok,engineRevision:value.engineRevision}; }
    async function execute(name, input) {
      switch (name) {
        case 'kit_status': return { engineRevision: ENGINE_REVISION, writable, context: project.context(), pending: interrupted,
          sessions: workflows.sessions(), tasks: workflows.taskIds(), receipts: receipts.size,
          diagnostics:{runtime:engine.n.runtime.operationDiagnostics(),ledger:engine.n.agent.executionDiagnostics(),receipts:receipts.diagnostics(),history:project.historyDiagnostics()},
          assets: Object.values(engine.n.asset.getSnapshot().assets).map(a => ({ id: a.id, status: engine.n.asset.getStatus(a.id) })) };
        case 'kit_discover': return { engineRevision: ENGINE_REVISION, tools: project.tools(), kinds: project.kinds(),
          imports: engine.n.authoringImport.formats(), exports: engine.n.authoringExport.formats(), targets: build.listTargets(), modelingHelp:MODELING_HELP, workflows:workflows.discover(), interactionLimits:workflows.limits, connection:{schema:"nexusengine.agent-connection/1",agentId,transport:["programmatic","mcp","cli"],receiptMode:"durable-reference",budgets:{maxInputBytes:8*1024*1024,...budgets}} };
        case 'kit_recipes': return {recipes:AUTHORING_RECIPES,implementation:'nexusengine/kits/agent/production/recipes',guide:'skills/nexus-engine-kit/routes/expert-authoring.md'};
        case 'kit_inspect_geometry': return inspectGeometry(engine,input);
        case 'kit_select_geometry': return selectGeometry(engine,input);
        case 'kit_compare_inspections': return compareInspections({beforeFile:await inside(input.before),afterFile:await inside(input.after),destination:await inside(input.destination),reason:input.reason,finding:input.finding,inside});
        case 'kit_look': return inspectAuthoringAsset({engine,assemblyId:input.assemblyId,destination:await inside(input.destination),times:input.times,mode:input.mode,focus:input.focus,view:input.view,camera:input.camera,selection:input.selection?validateSelection(engine,input.selection):undefined,dependencies});
        case 'kit_read': return input.id ? { document: project.getDocument(input.id), context: project.context() } : { documents: project.listDocuments(), context: project.context() };
        case 'kit_author': {
          if (!Array.isArray(input.request.operations)) throw Error('Typed operations required.');
          for (const operation of input.request.operations) if (!engine.n.agent.toolAccess.resolve(agentId, operation.id).ok) throw Error('Authoring operation unavailable.');
          const request=input.selection?bindSelection(engine,input.request,input.selection):input.request;
          try { return input.preview ? project.preview(request) : project.execute(request); }
          catch(error){if(request.operations?.some(op=>MODELING_HELP[op.id]))error.message += ' Modeling guidance: '+JSON.stringify(request.operations.map(op=>MODELING_HELP[op.id]).filter(Boolean));throw error;}
        }
        case 'kit_history': return project[input.direction]({ requestId: input.requestId, epoch: input.epoch });
        case 'kit_import': {
          const resources = {};
          for (const [name, file] of Object.entries(input.resources ?? {})) resources[name] = await readFile(await inside(file));
          const request = { requestId: input.requestId, format: input.format, prefix: input.prefix, bytes: await readFile(await inside(input.file)), resources };
          const before = project.context();
          // Use Core's own importer and snapshot validator on disposable prospective state.
          // Some pinned animated format profiles import successfully but cannot restore.
          const staged = createEngine({ kits: createAuthoringDomain() });
          staged.n.authoringProject.loadSnapshot(project.getSnapshot({immutable:true}));
          await staged.n.authoringImport.import(request);
          staged.n.authoringProject.validateSnapshot(staged.n.authoringProject.getSnapshot({immutable:true}));
          if (JSON.stringify(before) !== JSON.stringify(project.context())) throw Error('Source changed during import preflight.');
          return engine.n.authoringImport.import(request);
        }
        case 'kit_validate': return engine.n.authoringValidation.project();
        case 'kit_save': return engine.n.authoringPersistence.save({ requestId: input.requestId, expectedGeneration: input.expectedGeneration, target: { storage: 'filesystem', path: await inside(input.destination) } });
        case 'kit_load': return engine.n.authoringPersistence.load({ source: { storage: 'filesystem', path: await inside(input.source) } });
        case 'kit_prepare_asset': {
          const validation = engine.n.authoringValidation.project(); if (validation.errors) throw Error('Authoring Project validation failed.');
          const result = await engine.n.authoringExport.export({ requestId: input.requestId, assemblyId: input.assemblyId,
            format: input.format, ...(input.profile ? { profile: input.profile } : {}), target: { storage: 'filesystem', path: await inside(input.destination) } });
          const artifact = result.artifact;
          if (!artifact) throw Error('Exporter omitted published artifact path.');
          const artifactPath = path.relative(root, artifact);
          const members = Object.entries(result.files).map(([name, hash]) => ({ path: path.relative(root, path.join(path.dirname(artifact), name)), hash }));
          engine.n.asset.registerAsset({ id: input.assetId, type: input.format, providerId: 'nexus-engine-kit.files', contentHash: result.hash,
            source: { path: artifactPath, hash: result.hash, files: members }, metadata: { provenance: input.provenance ?? { origin: 'unspecified', license: 'unspecified' }, source: result.receipt.source, units: project.getDocument(input.assemblyId).content.units } });
          await engine.n.asset.invalidate(input.assetId);
          const readiness = await engine.n.asset.request(input.assetId);
          if (engine.n.asset.getStatus(input.assetId) !== 'ready') throw Error('Asset did not reach ready state.');
          return { assetId: input.assetId, artifact: artifactPath, files: result.files, hash: result.hash, validation: result.validation, exportReceipt: result.receipt, readiness };
        }
        case 'kit_verify_asset': {
          if (!engine.n.asset.getAsset(input.assetId)) throw Error('Unknown prepared asset.');
          await engine.n.asset.invalidate(input.assetId);
          const readiness = await engine.n.asset.request(input.assetId);
          if (engine.n.asset.getStatus(input.assetId) !== 'ready') throw Error('Asset did not reach ready state.');
          return { assetId: input.assetId, status: 'ready', readiness };
        }
        case 'kit_build_plan': {
          const request = { ...input, project: await inside(input.project, { allowRoot: true }) };
          const result = await build.plan(request); plans.set(result.id, request); return result;
        }
        case 'kit_build_apply': {
          if (input.approvePlan !== input.planId || !plans.has(input.planId)) throw Error('Approval must match a retained exact plan hash.');
          const fresh = await build.plan(plans.get(input.planId)); if (fresh.id !== input.planId) throw Error('Build source changed; prepare and approve a new plan.');
          return build.apply(input.planId, { planId: input.approvePlan, approved: true, actor: agentId }, input.destination ? { out: await inside(input.destination) } : {});
        }
        case 'kit_build_receipt': return { receipt: await build.getReceipt(input.planId) };
        case 'kit_task': {
          if(input.action==='create') { workflows.createTask(input.id,input.nodes,input.workflowId); engine.n.agent.context.put(agentId,`task:${input.id}`,{id:input.id},{source:'engine:workflow'}); }
          const graph=workflows.task(input.id);
          if(input.action==='complete')graph.complete(input.nodeId,retained(input.receiptId));
          if(input.action==='revise')graph.revise(input.nodeId);
          return {snapshot:graph.snapshot(),ready:graph.ready()};
        }
        case 'kit_session': {
          if(input.action==='create') {workflows.createSession(input.id,input.intent,path.basename(root));engine.n.agent.context.put(agentId,`session:${input.id}`,{id:input.id},{source:'engine:workflow'});}
          const session=workflows.session(input.id);
          if(input.action==='respond') {if(input.response?.action==='complete')retained(input.response.payload?.receiptId);session.respond(input.response);}
          if(input.action==='result')session.result({...retained(input.receiptId),requestId:session.snapshot().history.at(-1)?.id});
          return {snapshot:session.snapshot(),next:session.next()};
        }
        case 'kit_recover': {
          if (!interrupted || interrupted.requestId !== input.requestId) throw Error('Interrupted request identity does not match.');
          const abandoned = { requestId: interrupted.requestId, action: interrupted.action, ok: false, status: 'interrupted-unverified', reason: input.reason, engineRevision: ENGINE_REVISION };
          receipts.set(interrupted.requestId, abandoned); interrupted = null; return { reconciled: abandoned };
        }
        default: throw Error('Unknown tool.');
      }
    }
    engine.n.mcp.registerProvider(defineMcpProvider({ id: 'nexus-engine-production', version: '0.4.0', tools: TOOL_DEFINITIONS.map(tool => ({
      name: tool.name, description: tool.description, inputSchema: tool.inputSchema,
      ...(tool.writes ? { approval: 'required' } : {}), annotations: { readOnlyHint: !tool.writes, destructiveHint: false, openWorldHint: false },
      handler: input => execute(tool.name, input)
    })) }));
    async function call(name, args = {}, { signal } = {}) {
      const run = async () => {
        if (closed) throw Error('Host is closed.');
        signal?.throwIfAborted();
        name = name.startsWith('production.') ? 'kit_' + name.slice(11) : name;
        if(commitFailure)throw Error('Previous operation commit failed; close and recover this host before continuing: '+commitFailure.message);
        const tool = TOOL_DEFINITIONS.find(t => t.name === name); if (!tool) throw Error('Unknown tool.');
        if (JSON.stringify(args).length > 8 * 1024 * 1024) throw Error('Request exceeds the 8 MiB host input budget.');
        if (tool.writes && interrupted && name !== 'kit_recover') throw Error('Interrupted request requires inspection and kit_recover before further mutations.');
        if (tool.writes && !await allowed(name, args)) throw Error('Workspace write permission denied.');
        const requestId = `${agentId}:${++sequence}`;
        const before = project.context();
        try { storage.write('sequence.json',{sequence}); } catch(error) {commitFailure=error;throw error;}
        pending = tool.writes ? { requestId, action: name, source: before, arguments: clone(args) } : null;
        if(tool.writes || name==='kit_build_plan') await checkpoint();
        engine.n.agent.observe(agentId, { requestId, action: name, source: before });
        engine.n.agent.proposeAction(agentId, { id: requestId, action: name, payload: { requestId } });
        try {
          const envelope = await engine.n.mcp.callTool(name, args);
          const result = envelope.structuredContent ?? envelope.content;
          const value = {...receipt(requestId, name, result, before, project.context()),agentId};
          // Build services return explicit failed receipts rather than always throwing.
          if (result?.ok === false || (name === 'kit_validate' && result.errors > 0) || (name === 'kit_build_apply' && result.status !== 'succeeded')) value.ok = false;
          try {receipts.set(requestId, value);} catch(error) {commitFailure=error;throw error;}
          pending = null;
          engine.n.agent.recordExecution({ id: requestId, agentId, action: name, accepted: value.ok, result: {requestId,ok:value.ok,receiptRef:{id:requestId,storage:"production-receipts"}} });
          try {
            await engine.n.runtime.commitOperation({persist:async()=>{
              storage.write('sequence.json',{sequence});
              if(tool.writes || name==='kit_build_plan')await checkpoint();
            }});
          } catch(error) {commitFailure=error;throw error;}
          return clone(value);
        } catch (error) {
          if(!commitFailure)try{receipts.set(requestId, { requestId, action: name, ...errorResult(error), engineRevision: ENGINE_REVISION });}catch(storageError){commitFailure=storageError;throw storageError;}
          if(!commitFailure){pending=null;try{await engine.n.runtime.commitOperation({persist:async()=>{storage.write('sequence.json',{sequence});if(tool.writes || name==='kit_build_plan')await checkpoint();}});}catch(commitError){commitFailure=commitError;}}
          throw error;
        }
      };
      const next = serial.then(run); serial = next.catch(() => {}); return next;
    }
    engine.n.mcp.registerProvider(defineMcpProvider({id:'nexus-engine-production.connection',version:'0.4.0',tools:TOOL_DEFINITIONS.map(tool=>({
      name:'production.'+tool.name.slice(4),description:tool.description,inputSchema:tool.inputSchema,
      ...(tool.writes?{approval:'required'}:{}),handler:input=>call(tool.name,input)
    }))}));
    return Object.freeze({ call, workspace: root, engine, workflows, readReceipt:id=>receipts.get(id),
      close() { return closing ??= (async()=>{closed=true;await serial;try{if(!commitFailure)await checkpoint();}finally{await lock.close();await unlink(lockPath);}})(); } });
  } catch (error) { await lock.close(); await unlink(lockPath); throw error; }
}
