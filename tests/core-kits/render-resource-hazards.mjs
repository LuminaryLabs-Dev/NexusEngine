import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRenderLayerGraph, resolveRenderLayerGraph, validateRenderLayerGraph
} from '../../src/core-domains/render/pipeline/contract.js';

const graph = config => createRenderLayerGraph(config);
const deps = (result,id) => result.dependencies[id] ?? [];

test('RAW, WAW and WAR are explicit in the resolved hazard plan', () => {
  const result = resolveRenderLayerGraph(graph({
    externalInputs:['input'],
    passes:[
      {id:'write-a',order:10,writes:['surface']},
      {id:'read-a',order:20,reads:['surface','input'],writes:['out']},
      {id:'write-b',order:30,writes:['surface']},
      {id:'read-b',order:40,reads:['surface']}
    ]
  }));
  assert.equal(result.valid,true);
  assert.ok(deps(result,'read-a').includes('write-a'),'RAW');
  assert.ok(deps(result,'write-b').includes('read-a'),'WAR');
  assert.ok(deps(result,'write-b').includes('write-a'),'WAW');
  assert.ok(deps(result,'read-b').includes('write-b'),'RAW second generation');
  assert.deepEqual(result.orderedPasses.map(p=>p.id),['write-a','read-a','write-b','read-b']);
  assert.ok(result.hazards.some(h=>h.type==='WAR'&&h.resourceId==='surface'));
});

test('independent readers are safely in the same batch', () => {
  const r=resolveRenderLayerGraph(graph({externalInputs:['source'],passes:[
    {id:'reader-a',reads:['source'],order:5},{id:'reader-b',reads:['source'],order:5},
    {id:'writer',writes:['source'],order:6}
  ]}));
  assert.deepEqual(r.batches[0],['reader-a','reader-b']);
  assert.deepEqual(r.batches[1],['writer']);
  assert.ok(deps(r,'writer').includes('reader-a')&&deps(r,'writer').includes('reader-b'));
});

test('serial order respects explicit dependencies even with reversed numeric order',()=>{
  const r=resolveRenderLayerGraph(graph({passes:[
    {id:'consume',order:1,reads:['color'],requires:['produce']},
    {id:'produce',order:99,writes:['color']}
  ]}));
  assert.deepEqual(r.orderedPasses.map(p=>p.id),['produce','consume']);
  assert.ok(deps(r,'consume').includes('produce'));
  assert.equal(validateRenderLayerGraph(graph({passes:[
    {id:'consume',order:1,reads:['color'],requires:['produce']},
    {id:'produce',order:99,writes:['color']}
  ]})).valid,true);
});

test('unproduced resources fail closed without fabricated writers',()=>{
  const g=graph({passes:[{id:'consume',order:0,reads:['missing']},{id:'late',order:10,writes:['missing']}]});
  const r=validateRenderLayerGraph(g);
  assert.equal(r.valid,false);
  assert.ok(r.issues.includes('unresolved-read:consume:missing'));
});

test('depth sources count as resource reads',()=>{
  const r=resolveRenderLayerGraph(graph({passes:[
    {id:'depth',order:0,writes:['depth']},
    {id:'transparent',order:1,depth:{test:true,write:false,source:'depth'}}
  ]}));
  assert.ok(deps(r,'transparent').includes('depth'));
  assert.equal(r.resourceLifetimes.depth.firstUse,0);
  assert.equal(r.resourceLifetimes.depth.lastUse,1);
});

test('cycles and invalid resource inputs are rejected',()=>{
  const c=validateRenderLayerGraph(graph({passes:[
    {id:'a',requires:['b']},{id:'b',requires:['a']}
  ]}));
  assert.equal(c.valid,false);
  assert.ok(c.issues.some(x=>x.startsWith('cyclic-pass-graph:')));
});

test('all resolved contract metadata is JSON-safe and stable',()=>{
  const g=graph({externalInputs:['input'],passes:[
    {id:'c',order:2,reads:['mid'],writes:['final']},
    {id:'a',order:0,writes:['mid']},
    {id:'b',order:1,reads:['input']}
  ]});
  const first=resolveRenderLayerGraph(g),second=resolveRenderLayerGraph(g);
  assert.equal(JSON.stringify(first),JSON.stringify(second));
  assert.equal(first.resourceLifetimes.input.external,true);
  assert.equal(first.resourceLifetimes.final.lastUse,2);
});
