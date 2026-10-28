import { authoringFixture } from "../helpers/authoring-fixture.mjs";
import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "../../src/core-domains/authoring/index.js";
import {authoringDomainManifest} from '../../src/core-domains/authoring/index.js';
import {buildAuthoringCapabilityLedger} from '../../src/core-domains/authoring/contracts/capabilities.js';
const engine = createEngine({ kits: createAuthoringDomain() });
const p = engine.n.authoringProject;
// Discovery and readiness use existing contracts; neither executes nor authorizes tools.
{
 const manifest=authoringDomainManifest,commands=p.tools(),identity='synthetic-source-v1';
 const build=(evidence=[],overrides={})=>buildAuthoringCapabilityLedger({manifest,commands,implementationIdentity:identity,evidence,...overrides});
 const ledger=build();
 assert.equal(ledger.executionAuthority,false);
 assert.equal(new Set(ledger.capabilities.map(c=>c.operationId)).size,commands.length);
 assert.ok(ledger.capabilities.every(c=>c.verification.status==='unverified'));
 const bevel=ledger.capabilities.find(c=>c.id==='mesh.topology#bevel');
 assert.equal(bevel.selector.value,'bevel');
 assert.ok(bevel.limitations.some(x=>x.includes('convex')));
 assert.equal(ledger.capabilities.find(c=>c.id==='mesh.cube').support,'undeclared');
 const types=commands.find(c=>c.id==='mesh.topology').inputSchema.properties.parameters.properties.operation.enum;
 assert.deepEqual(ledger.capabilities.filter(c=>c.operationId==='mesh.topology').map(c=>c.selector.value).sort(),[...types].sort());
 const evidence={capabilityId:bevel.id,profileVersion:bevel.version,contractHash:bevel.contractHash,
   implementationIdentity:identity,receiptRef:'synthetic-fixture:not-live-proof',scenarios:['convex-chamfer'],result:'passed'};
 const status=(reports,overrides)=>build(reports,overrides).capabilities.find(c=>c.id===bevel.id).verification.status;
 assert.equal(status([evidence]),'verified');
 assert.equal(status([{...evidence,profileVersion:2}]),'stale');
 assert.equal(status([{...evidence,contractHash:'old'}]),'stale');
 assert.equal(status([evidence],{implementationIdentity:'changed-source'}),'stale');
 assert.equal(status([evidence,{...evidence,result:'failed'}]),'failed');
 assert.throws(()=>build([{...evidence,scenarios:[]}]),/evidence/);
 assert.throws(()=>build([{...evidence,capabilityId:'missing'}]),/undiscovered/);
 assert.throws(()=>build([],{manifest:{publicKits:[]}}),/owner/);
 assert.deepEqual(build(),build([],{commands:[...commands].reverse()}));
 const tampered=structuredClone(commands);tampered.find(c=>c.id==='mesh.topology').capabilities[0].selector.value='not-a-tool';
 assert.throws(()=>build([],{commands:tampered}),/enum/);
 const toolCount=p.tools().length,before=p.getSnapshot();let calls=0;
 const definition={id:'mesh.ledger-probe',domainPath:'n:authoring:mesh',parameters:{fields:[]},execute:()=>{calls++;}};
 assert.throws(()=>p.registerOperation({...definition,capabilities:[{id:'bad',version:0,description:'bad',limitations:[],verifierRefs:[]}]}));
 assert.throws(()=>p.registerOperation({...definition,capabilities:[{id:'mesh.cube',version:1,description:'Duplicate identity',limitations:[],verifierRefs:[]}]}),{code:'AUTHORING_CAPABILITY_CONFLICT'});
 assert.equal(p.tools().length,toolCount);
 p.registerOperation(definition);
 assert.ok(build([],{commands:p.tools()}).capabilities.some(c=>c.id==='mesh.ledger-probe'));
 assert.equal(calls,0);assert.deepEqual(p.getSnapshot(),before);
 console.log('Authoring ledger automatic discovery, schema selectors, evidence freshness and no-authority checks passed');
}
const request = (requestId, operations) => ({
  requestId,
  epoch: p.context().epoch,
  operations,
});
const create = request("__proto__", [
  { id: "mesh.cube", args: { id: "__proto__", size: 2 } },
]);
const receipt = p.execute(create);
assert.equal(p.getDocument("__proto__").content.vertices.length, 8);
assert.deepEqual(p.execute(create), receipt);
assert.throws(
  () =>
    p.execute({
      ...create,
      operations: [{ id: "mesh.cube", args: { id: "x" } }],
    }),
  { code: "AUTHORING_REQUEST_CONFLICT" },
);
let before = p.getSnapshot();
assert.throws(() =>
  p.execute(
    request("rollback", [
      { id: "mesh.cube", args: { id: "second" } },
      { id: "missing", args: {} },
    ]),
  ),
);
assert.deepEqual(p.getSnapshot(), before);
const original = p.getDocument("__proto__");
const edit = request("move", [
  {
    id: "mesh.transform",
    args: {
      id: "__proto__",
      expectedRevision: original.revision,
      translation: [2, 0, 0],
    },
  },
]);
const preview = p.preview(edit);
assert.deepEqual(p.getSnapshot(), before);
p.acceptPreview(preview);
assert.deepEqual(engine.n.authoringMesh.inspect("__proto__").bounds, {
  min: [1, -1, -1],
  max: [3, 1, 1],
});
assert.throws(() => p.acceptPreview(preview), {
  code: "AUTHORING_STALE_PREVIEW",
});
assert.equal(original.content.vertices[0].position[0], -1);
p.undo({ requestId: "undo", epoch: 1 });
assert.equal(p.getDocument("__proto__").hash, original.hash);
assert.ok(p.getDocument("__proto__").revision > original.revision);
p.redo({ requestId: "redo", epoch: 1 });
const moved = p.getDocument("__proto__");
p.execute(
  request("select", [
    {
      id: "editing.select",
      args: { id: "selection", meshId: "__proto__", mode: "face", ids: ["f0"] },
    },
  ]),
);
assert.equal(engine.n.authoringEditing.inspect("selection").vertices.length, 4);
const saved = p.getSnapshot();
for (const malformed of [
  { ...saved, schema: "future" },
  { ...saved, clock: Number.MAX_SAFE_INTEGER + 1 },
  { ...saved, undo: [{ deltas: [{ id: "x", before: null, after: null }] }] },
]) {
  assert.throws(() => p.loadSnapshot(malformed));
  assert.deepEqual(p.getSnapshot(), saved);
}
p.loadSnapshot(saved);
assert.equal(p.context().epoch, 2);
assert.ok(p.getDocument("__proto__").revision > moved.revision);
assert.equal(p.getDocument("__proto__").hash, moved.hash);
assert.deepEqual(p.execute(create), receipt);
assert.throws(() => p.execute({ ...edit, requestId: "old-unretained" }), {
  code: "AUTHORING_STALE_EPOCH",
});
assert.throws(() => p.execute(request("stale", edit.operations)), {
  code: "AUTHORING_STALE_REVISION",
});
for (const name of ["update", "applyCommand", "configure", "setDescriptor"])
  assert.throws(() => p[name]({}), { code: "AUTHORING_RAW_MUTATION" });
const other = createEngine({ kits: createAuthoringDomain() });
assert.equal(other.n.authoringProject.listDocuments().length, 0);
for (const kit of createAuthoringDomain()) engine.installKit(kit);
assert.equal(p.listDocuments().length, 2);
p.reset();
assert.equal(p.context().epoch, 3);
assert.equal(p.listDocuments().length, 0);
assert.throws(() => p.execute(create), { code: "AUTHORING_STALE_EPOCH" });
const sparse = Array(3);
sparse[1] = 1;
assert.throws(() =>
  p.execute(
    request("sparse", [{ id: "mesh.cube", args: { id: "bad", size: sparse } }]),
  ),
);
const getter = [0];
Object.defineProperty(getter, "0", {
  get() {
    throw Error("getter invoked");
  },
});
assert.throws(
  () =>
    p.execute(
      request("getter", [
        { id: "mesh.cube", args: { id: "bad", size: getter } },
      ]),
    ),
  { code: "AUTHORING_INVALID_INPUT" },
);
console.log(
  "Authoring foundation: installed edits, staged rollback, stable history, restore epochs, retries and isolation passed.",
);

const fresh = other.n.authoringProject;
fresh.execute({
  requestId: "create-edit",
  epoch: 1,
  operations: [
    { id: "mesh.cube", args: { id: "staged" } },
    {
      id: "mesh.transform",
      args: { id: "staged", expectedRevision: 0, translation: [1, 0, 0] },
    },
  ],
});
assert.equal(other.n.authoringMesh.inspect("staged").bounds.max[0], 2);
const checkpoint = fresh.getSnapshot(),
  pending = {
    requestId: "after-checkpoint",
    epoch: 1,
    operations: [{ id: "mesh.cube", args: { id: "recovered" } }],
  };
fresh.recover(checkpoint, [{ action: "execute", request: pending }]);
assert.equal(fresh.getDocument("recovered").kind, "mesh");
const recoveredState = fresh.getSnapshot();
assert.throws(() =>
  fresh.recover(checkpoint, [
    { action: "execute", request: pending },
    { action: "invalid", request: {} },
  ]),
);
assert.deepEqual(fresh.getSnapshot(), recoveredState);
assert.equal(fresh.execute(pending).requestId, "after-checkpoint");
// Editing a small vertex set shares every unchanged immutable element and face.
{
  const f = authoringFixture();
  f.command("mesh.cube", { id: "shared" });
  const before = f.project.getDocument("shared").content;
  f.edit("mesh.transform", {
    id: "shared",
    selection: { mode: "vertex", ids: ["v0"] },
    translation: [0, 0.05, 0],
  });
  const after = f.project.getDocument("shared").content;
  assert.notEqual(after.vertices[0], before.vertices[0]);
  assert.equal(after.vertices[1], before.vertices[1]);
  assert.equal(after.faces, before.faces);
  assert.ok(Object.isFrozen(after.vertices[1]));
}
