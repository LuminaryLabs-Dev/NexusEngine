export const sceneRuntimeManifest = Object.freeze({
 id:'configured-scene-runtime-kit',version:'1',domainPath:'n:simulation',optional:true,
 publicSubpath:'nexusengine/kits/simulation/configured-scene-runtime',
 source:'kits/simulation/configured-scene-runtime-kit/index.js',
 factory:'createSceneRuntime',
 requires:['motion:locomotion-intent','physics:world-contact'],
 provides:['simulation:configured-scene-runtime'],
 ownership:{core:'Authoring documents, composition, locomotion, contact, player authority and progression',kit:'Configured scene lifecycle, reversible platforms, jump buffering, recovery, checkpoints, completion and optional browser host',application:'Authored scene content, tuning and route'},
 proof:['.agent/runs/2026-10-24-drift-runtime/validation.json']
});
