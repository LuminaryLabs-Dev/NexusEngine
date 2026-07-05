# Knowledge Nodes: ecosystem proof scout 2026-06-22T06-36-22-0400

## Root Lesson
- id: ecosystem-proof-034
- statement: Core remains commit-aligned with `origin/0.0.2` and smoke-green, but ecosystem proof is still red and ProtoKits release evidence has split again: local ProtoKits `main` is clean and aggregate-green at 470 modules, yet it is 103 commits ahead of `origin/0.0.2`; targeted ProtoKits proof still cannot resolve package `nexusengine`, Experiments aggregate proof still fails on canonical route naming, Experiments targeted DSK proof still misses `engine.n.zoneField`, npm metadata is 404, and the public proof route still stalls at `Booting...` on deployed module 404s.
- why it matters: The proof failure is now a policy and distribution split, not only a code-test split. Local development proof, release-ref proof, public-browser proof, dirty core host proof, npm/package proof, and hardening inventory must stay separated.

## Child Nodes
- id: ecosystem-proof-034-a
  parent: ecosystem-proof-034
  lesson: Core is branch-name drifted but commit-aligned with the latest release ref while carrying dirty host-surface work.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` and `origin/main` was `0 0`; `npm test` passed 9 smoke tests including `host-smoke ok`; `git status` showed dirty host/docs/source/test and neighboring lane files.
  look further: Decide whether release proof requires checkout of branch `0.0.2`, commit equality against the resolved target, and a clean worktree.
- id: ecosystem-proof-034-b
  parent: ecosystem-proof-034
  lesson: ProtoKits local development proof and release-ref proof are no longer the same surface.
  evidence: ProtoKits local `main` resolved to `a23664b8e346482df773aeff9c0793919ba04ccb`, `origin/main` to `3322f1f8b2c2fa4f6c2b5b6a6bea5fa90f583a47`, and `origin/0.0.2` to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; local `HEAD...origin/0.0.2` returned `103 0`; local `HEAD...origin/main` returned `1 0`; local `npm run check` passed after 470 modules.
  look further: Decide whether the next proof target is local ProtoKits `main`, `origin/main`, or preflight-resolved `origin/0.0.2`.
- id: ecosystem-proof-034-c
  parent: ecosystem-proof-034
  lesson: ProtoKits release-ref aggregate proof is green, but targeted first-wave DSK proof is still package-resolution red.
  evidence: Disposable `origin/0.0.2` ProtoKits `npm run check` passed after 411 JavaScript modules; local and disposable `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate targeted first-wave DSK proof with the selected package, workspace, CDN, or link model.
- id: ecosystem-proof-034-d
  parent: ecosystem-proof-034
  lesson: Experiments release-ref aggregate validation is red independent of targeted DSK proof.
  evidence: Experiments local `main` equals `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; disposable `origin/0.0.2` `npm run check` failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and canonical route smoke expectations for `the-open-above-v2`.
- id: ecosystem-proof-034-e
  parent: ecosystem-proof-034
  lesson: Experiments targeted DSK proof reaches proof execution and fails on missing promoted API installation.
  evidence: Local and disposable `node tests/dsk-first-wave-experiment-smoke.mjs` failed at `experiments/dsk-first-wave-proof/src/proof.js:23` with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
  look further: Check first-wave ProtoKit return shape, DSK adapter behavior, `createRealtimeGame()` kit installation, and expected `engine.n.*` API names.
- id: ecosystem-proof-034-f
  parent: ecosystem-proof-034
  lesson: Public DSK proof remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console/network output showed 404s for deployed `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: ecosystem-proof-034-g
  parent: ecosystem-proof-034
  lesson: Public consumption and version policy remain split.
  evidence: Required GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusengine` returned 404, and branch `0.0.2` serves `nexusengine@0.1.0`.
  look further: Decide branch naming, package version, public consumption wording, and npm publication policy.
- id: ecosystem-proof-034-h
  parent: ecosystem-proof-034
  lesson: Host Graph Lifecycle Ownership and other hardening inventory remain separate from distribution proof.
  evidence: Neighboring DSK/deep-bug/domain nodes keep host adapter capability ownership, duplicate adapter identity, non-atomic unmount, snapshot purity, command/config ownership, telemetry, scheduler/world, query/read-model, and runtime failure-boundary work as hardening rows while live proof gates fail separately.
  look further: Route hardening fixtures separately from package resolution, route naming, targeted DSK API installation, npm, and public browser proof.
- id: ecosystem-proof-034-i
  parent: ecosystem-proof-034
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Boundary docs keep core as runtime/DSK/composer/host primitive owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports and targeted API installation without moving route ownership or reusable implementation into core.

## Related Nodes
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-21T18-35-45-0400-ecosystem-proof-node.md`
- relationship: supersedes
- reason: Preserves branch/ref policy, dirty-core proof boundary, package resolution, aggregate-route validation, targeted DSK API installation, npm, public browser, hardening, and ownership gates while adding current ProtoKits local-vs-release separation.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T06-05-45-0400-ecosystem-state-node.md`
- relationship: confirms
- reason: Confirms ProtoKits local-ahead split plus unchanged package, aggregate, targeted API, npm, package-version, public browser, and dirty-host proof gates.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-22T06-19-35-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps Host Graph Lifecycle Ownership, runtime failure-boundary, and ProtoKits local-vs-release separation from replacing distribution proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-21T18-48-04-0400-deep-bug-node.md`
- relationship: references
- reason: Treats host graph lifecycle bugs as hardening inputs, not proof-route fixes.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-21T19-03-16-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms Host Graph Lifecycle Ownership is planning inventory and does not replace proof-readiness gates.

## Next Search Branches
- branch: protokits-local-vs-release-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, fetched `origin/0.0.2`, `origin/main`, package metadata, release branch policy
  question: Should proof consume local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, core and sibling git refs
  question: Should automation proof require checkout of branch `0.0.2`, commit equality against the resolved target, and/or clean worktrees?
- branch: dirty-host-surface-release-boundary
  files or folders: `src/index.js`, `src/host.js`, `tests/host-smoke.mjs`, `examples/three-host/`, `docs/ideal/ideal-hosts.md`
  question: Is the dirty host-surface work intended for release proof, or should ecosystem proof ignore it until committed and promoted?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `tests/dsk-first-wave.test.mjs`, `protokits/nexus-dsk-adapter/index.js`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusengine` locally and in detached release layouts?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why does aggregate validation still see `the-open-above-v2` as versioned?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?
- branch: host-graph-release-boundary
  files or folders: `src/host.js`, `tests/host-smoke.mjs`, host graph packets/nodes
  question: Should host graph hardening fixtures wait until the dirty host surface is committed or explicitly release-scoped?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host-surface changes are release-ready.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits local `main` is release-ref proof.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim host graph lifecycle ownership, domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
