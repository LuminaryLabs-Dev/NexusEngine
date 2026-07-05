# Knowledge Nodes: ecosystem_state_scout 2026-06-20T03-07-30-0400

## Root Lesson
- id: ecosystem-root-026
- statement: Core remains current and validation-green, but ecosystem proof is still blocked by one module-source strategy: ProtoKits local and fetched validation cannot resolve package `nexusengine`, local Experiments targeted proof fails through ProtoKits, fetched Experiments targeted proof still assumes sibling `NexusEngine/src/index.js`, and public browser proof still stalls at `Booting...`.
- why it matters: Promotion review still cannot collapse local, fetched-ref, aggregate, targeted, browser, npm, package-version, and hardening claims into one proof. ProtoKits latest release ref advanced again to `9ab73e0`, so the proof gap widened from 31 to 39 commits behind local while the blocker itself stayed the same.

## Child Nodes
- id: core-current-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Core still matches the preflight-resolved latest release branch and passes its smoke suite.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2`; core `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Continue resolving latest release branch with preflight every run.
- id: protokits-latest-ref-drift-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: ProtoKits fetched latest release ref advanced and remains unvalidated because package `nexusengine` is unresolved.
  evidence: Local ProtoKits `HEAD` was `f006fa3bbe5721b0aa073de2bca08a452bd8e492`; fetched `origin/0.0.2` advanced to `9ab73e086e06c345409a32c74791b45307dde4ac`; ahead/behind was `0 39`; disposable fetched-ref `npm run check` syntax-checked 362 JavaScript modules and failed with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; targeted DSK smoke failed for the same package.
  look further: Validate fetched ProtoKits with the same package, workspace, CDN, or link model selected for local and public proof.
- id: local-available-checkout-regression-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Local available-checkout DSK proof remains red because package `nexusengine` is not resolvable from ProtoKits.
  evidence: ProtoKits local `npm run check` failed after 330 syntax-checked modules with 110 import-smoke failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`; ProtoKits local `node tests/dsk-first-wave.test.mjs` failed for the same package; Experiments local `node tests/dsk-first-wave-experiment-smoke.mjs` failed through local ProtoKits `protokits/nexus-dsk-adapter/index.js` for the same package.
  look further: Make local workspace/package resolution explicit before treating available-checkout proof as evidence.
- id: experiments-targeted-fetched-ref-resolution-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Experiments fetched aggregate proof still passes while targeted DSK proof remains blocked by sibling-relative imports.
  evidence: Local Experiments `HEAD` was `799fad882461502faa84b132f70de011e7dbe0cb`; fetched `origin/0.0.2` was `81b39bccadf2cdf8269df24cd4970a5b2d7ebbd9`; ahead/behind was `0 10`; disposable fetched-ref `npm run check` generated 100 flat route wrappers and passed; targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
  look further: Run targeted DSK proof with the same module-source strategy intended for public proof.
- id: public-proof-import-shape-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: The public DSK proof route remains HTTP-visible but browser-stuck at `Booting...`.
  evidence: Curl returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console and request history showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or a build-step import map for the public proof route.
- id: aggregate-targeted-proof-boundary-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Experiments aggregate validation is green but still separate from DSK first-wave targeted proof.
  evidence: Disposable fetched Experiments `npm run check` passed, but `package.json` aggregate script does not include `tests/dsk-first-wave-experiment-smoke.mjs`; both local and fetched targeted DSK smoke commands failed.
  look further: Decide whether the DSK first-wave proof smoke belongs in `npm run check`, `npm run check:deploy`, or a required targeted evidence checklist.
- id: hardening-boundary-separation-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Composition-proof ownership and runtime identity/lifecycle rows are real hardening inventory, not fixes for module-source proof.
  evidence: DSK architecture node `2026-06-20T02-23-35-0400`, deep bug node `2026-06-20T02-54-27-0400`, and domain idea node `2026-06-20T03-01-44-0400` add provider/binding ownership, ECS definition identity, SequenceNode idempotency/history/type policy, AR source consistency, and event-bus lifecycle parity as separate validation rows.
  look further: Route hardening fixtures separately from distribution/module-source proof work.
- id: public-consumption-npm-gap-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: GitHub/raw/jsDelivr consumption remains reachable while npm package metadata still returns 404.
  evidence: `npm run automation:preflight` returned 200 for required GitHub/raw/jsDelivr links and 404 for `https://registry.npmjs.org/nexusengine`.
  look further: `README.md`, `package.json`, npm publication policy, and public consumption wording.
- id: package-version-policy-2026-06-20-0307
  parent: ecosystem-root-026
  lesson: Release branch `0.0.2` still serves package metadata version `0.1.0`.
  evidence: Local package metadata reports `nexusengine@0.1.0`; preflight confirmed raw public `0.0.2/package.json` is reachable.
  look further: Branch naming policy, package version policy, and README release wording.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T01-59-37-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves the module-source blocker and local proof regression while updating ProtoKits fetched-ref drift to `9ab73e0` and confirming current public browser state.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T02-40-59-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps local, fetched-ref, aggregate, targeted, browser, npm, package-version, hardening, and proof-signal claims separate.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-20T02-23-35-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps composition-proof ownership and runtime failure-boundary hardening separate from module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T02-54-27-0400-deep-bug-node.md`
- relationship: references
- reason: Treats runtime binding ownership, ECS definition identity, install-only SequenceNode idempotency, and disposed event-bus parity as hardening inputs, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T03-01-44-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms the new idea family is runtime identity and lifecycle ownership, not a duplicate module-source family.

## Next Search Branches
- branch: module-source-strategy
  files or folders: `package.json`, sibling package metadata, ProtoKits DSK adapter, Experiments proof import maps, public CDN/raw URLs
  question: Should release proof resolve NexusEngine through package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps?
- branch: protokits-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, fetched `origin/0.0.2`
  question: Can ProtoKits validate locally and at fetched ref without relying on an undeclared package?
- branch: experiments-targeted-dsk-local-and-fetched
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`, fetched `origin/0.0.2`, sibling path layout
  question: Can Experiments targeted DSK proof pass with the intended module-source strategy across local and disposable layouts?
- branch: public-proof-import-shape
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/index.html`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, or a build-step import map?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should the DSK first-wave proof smoke be part of `npm run check`, `npm run check:deploy`, or documented as required targeted evidence?
- branch: moving-sibling-release-ref
  files or folders: sibling `origin/0.0.2` refs, automation packets, release evidence checklist
  question: How should proof packets handle sibling release refs that advance during a scout run?
- branch: hardening-boundary
  files or folders: `src/game-kit-composer.js`, `src/runtime-kit.js`, `src/ecs.js`, `src/sequence-node*.js`, `src/ar-launcher.js`, neighboring DSK/deep-bug/domain nodes
  question: Which hardening rows belong in executable runtime fixtures after module-source proof is separated?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim ProtoKits local or fetched `origin/0.0.2` passed validation.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim composition-proof ownership, runtime identity/lifecycle ownership, proof-signal integrity, or AR/spatial rows are fixed.
