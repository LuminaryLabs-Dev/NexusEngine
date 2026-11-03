import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '../../src/index.js';
import {createAuthoringDomain,createAuthoringDesignKit,createAuthoringArtKit,createAuthoringInteractionKit,createAuthoringCraftKit} from '../../src/core-domains/authoring/index.js';
const available={design:createAuthoringDesignKit,art:createAuthoringArtKit,interaction:createAuthoringInteractionKit,craft:createAuthoringCraftKit};
for(const [kind,factory] of Object.entries(available))test(kind+' installs independently of other creative harnesses',()=>{
 const engine=createEngine({kits:[...createAuthoringDomain(),factory()]});
 const name='authoring'+kind[0].toUpperCase()+kind.slice(1);
 assert.ok(engine.n[name]);
 assert.equal(engine.n[name].kind,kind);
 assert.equal(engine.n[name].stages.length,6);
 assert.equal(engine.n.authoringProject.listDocuments().length,0);
 engine.n.authoringSequence.dispose();
});
