# Knowledge Nodes: ecosystem proof scout 2026-06-21T18-35-45-0400

## Root Lesson
- id: ecosystem-proof-033
- statement: Release-ref parity is green across core, ProtoKits, and Experiments, but ecosystem proof remains red because ProtoKits targeted first-wave DSK cannot resolve package `nexusrealtime`, Experiments aggregate validation fails on canonical route naming, Experiments targeted DSK proof misses `engine.n.zoneField`, npm metadata is 404, and the public browser proof stays at `Booting...`.
- why it matters: The current proof failure is not branch drift. It is a set of distinct gates: release-policy, dirty-core proof boundary, sibling `origin/main` freshness, package resolution, aggregate-route validation, DSK API installation, npm publication, and browser import deployment.

## Child Nodes
- id: ecosystem-proof-033-a
  parent: ecosystem-proof-033
  lesson: Core is branch-name drifted but commit-aligned with the latest release ref while carrying dirty host-surface work.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` was `0 0`; `npm test` passed 9 smoke tests including `host-smoke ok`; `git status` showed dirty host source/test/example files.
  look further: Decide whether release proof requires checkout of branch `0.0.2`, commit equality against the resolved target, and a clean worktree.
- id: ecosystem-proof-033-b
  parent: ecosystem-proof-033
  lesson: ProtoKits release-ref aggregate proof is green, but targeted first-wave DSK proof is still package-resolution red.
  evidence: Available ProtoKits `main` equals `origin/0.0.2` at `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; local and disposable `npm run check` passed after 411 JavaScript modules; local and disposable `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
  look further: Validate targeted first-wave DSK proof with the selected package, workspace, CDN, or link model.
- id: ecosystem-proof-033-c
  parent: ecosystem-proof-033
  lesson: Experiments release-ref aggregate validation is red independent of targeted DSK proof.
  evidence: Available Experiments `main` equals `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; disposable `origin/0.0.2` `npm run check` failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and canonical route smoke expectations for `the-open-above-v2`.
- id: ecosystem-proof-033-d
  parent: ecosystem-proof-033
  lesson: Experiments targeted DSK proof reaches proof execution and fails on missing promoted API installation.
  evidence: Local and disposable `node tests/dsk-first-wave-experiment-smoke.mjs` failed at `experiments/dsk-first-wave-proof/src/proof.js:23` with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
  look further: Check first-wave ProtoKit return shape, DSK adapter behavior, `createRealtimeGame()` kit installation, and expected `engine.n.*` API names.
- id: ecosystem-proof-033-e
  parent: ecosystem-proof-033
  lesson: Public DSK proof remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console showed 404s for deployed `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: ecosystem-proof-033-f
  parent: ecosystem-proof-033
  lesson: Sibling release refs are aligned, but sibling `origin/main` freshness drift is separate from release proof.
  evidence: ProtoKits local `main` equals `origin/0.0.2` but is behind `origin/main` by 35; Experiments local `main` equals `origin/0.0.2` but is behind `origin/main` by 4.
  look further: Decide whether proof should track latest release branch only or also flag freshness against sibling `origin/main`.
- id: ecosystem-proof-033-g
  parent: ecosystem-proof-033
  lesson: Public consumption and version policy remain split.
  evidence: Required GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Decide branch naming, package version, public consumption wording, and npm publication policy.
- id: ecosystem-proof-033-h
  parent: ecosystem-proof-033
  lesson: Domain Command Config Ownership and other hardening inventory remains separate from distribution proof.
  evidence: Neighboring DSK/deep-bug/domain nodes keep Economy, TimingWindow, ResourcePressure, LifecycleProgression, FacilityOperations, telemetry, service command, input-frame, namespace safety, install rollback, dependency parity, and binding ownership as hardening rows while live proof gates fail separately.
  look further: Route hardening fixtures separately from package resolution, route naming, targeted DSK API installation, npm, and public browser proof.
- id: ecosystem-proof-033-i
  parent: ecosystem-proof-033
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusRealtime core.
  look further: Fix proof routing/imports and targeted API installation without moving route ownership or reusable implementation into core.

## Related Nodes
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-21T06-36-07-0400-ecosystem-proof-node.md`
- relationship: supersedes
- reason: Preserves branch-name policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, and public browser gates while adding current release-ref parity, dirty core host-surface context, and sibling `origin/main` freshness drift.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T18-05-09-0400-ecosystem-state-node.md`
- relationship: confirms
- reason: Confirms release-ref alignment, dirty core host-surface context, ProtoKits targeted package failure, Experiments aggregate/targeted failures, npm 404, and public browser module 404s.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-21T18-18-55-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps Domain Command Config Ownership and runtime hardening separate from distribution/module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-21T06-48-34-0400-deep-bug-node.md`
- relationship: references
- reason: Treats Economy, TimingWindow, ResourcePressure, LifecycleProgression, and FacilityOperations command/config bugs as hardening inputs, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-21T07-02-40-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms Domain Command Config Ownership is planning inventory and does not replace proof-readiness gates.

## Next Search Branches
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, core and sibling git refs
  question: Should automation proof require checkout of branch `0.0.2`, commit equality against the resolved target, and/or clean worktrees?
- branch: dirty-host-surface-release-boundary
  files or folders: `src/index.js`, `src/host.js`, `tests/host-smoke.mjs`, `examples/three-host/`, `docs/ideal/ideal-hosts.md`
  question: Is the dirty host-surface work intended for release proof, or should ecosystem proof ignore it until committed and promoted?
- branch: sibling-origin-main-freshness
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments`
  question: Do `origin/main` advances need separate proof before the next release branch moves?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/package.json`, `tests/dsk-first-wave.test.mjs`, `protokits/nexus-dsk-adapter/index.js`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusrealtime` locally and in detached release layouts?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why does aggregate validation still see `the-open-above-v2` as versioned?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host-surface changes are release-ready.
- This node does not claim branch names match latest release branch names.
- This node does not claim sibling `origin/main` freshness is irrelevant.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
