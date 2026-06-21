# Knowledge Nodes: ecosystem proof scout 2026-06-21T06-36-07-0400

## Root Lesson
- id: ecosystem-proof-032
- statement: Core commit parity and smoke tests are green, but ecosystem proof remains red because ProtoKits targeted first-wave DSK cannot resolve package `nexusrealtime`, Experiments aggregate validation fails on canonical route naming, Experiments targeted DSK proof misses `engine.n.zoneField`, npm metadata is 404, and the public browser proof stays at `Booting...`.
- why it matters: The current release proof cannot be summarized as one module-source blocker. Branch-name policy, package resolution, aggregate-route validation, DSK API installation, npm publication, and browser import deployment must be tracked as separate gates.

## Child Nodes
- id: ecosystem-proof-032-a
  parent: ecosystem-proof-032
  lesson: Core is branch-name drifted but commit-aligned with the latest release ref.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `ff97ba47af4197952eca0aded593d66e1a0e4887`; ahead/behind against `origin/0.0.2` was `0 0`; `npm test` passed 8 smoke tests.
  look further: Decide whether release proof requires checkout of branch `0.0.2` or commit equality against the resolved target.
- id: ecosystem-proof-032-b
  parent: ecosystem-proof-032
  lesson: ProtoKits aggregate proof is green, but targeted first-wave DSK proof is still package-resolution red.
  evidence: Available ProtoKits `main` at `d94b43889dd0eb22df041e49b4efda30e7db375f` is `21 0` against `origin/0.0.2`; local `npm run check` passed after 398 JavaScript modules; detached `origin/0.0.2` `npm run check` passed after 385 JavaScript modules; both targeted `node tests/dsk-first-wave.test.mjs` runs failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
  look further: Validate targeted first-wave DSK proof with the selected package, workspace, CDN, or link model.
- id: ecosystem-proof-032-c
  parent: ecosystem-proof-032
  lesson: Experiments aggregate validation is red independent of targeted DSK proof.
  evidence: Available Experiments `main` at `0e8ccf63a2383edbd55d15f3d81d4b802f6771c8` is `9 0` against `origin/0.0.2`; disposable local and detached `origin/0.0.2` `npm run check` failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and canonical route smoke expectations for `the-open-above-v2`.
- id: ecosystem-proof-032-d
  parent: ecosystem-proof-032
  lesson: Experiments targeted DSK proof now reaches proof execution and fails on missing promoted API installation.
  evidence: Local and detached `node tests/dsk-first-wave-experiment-smoke.mjs` failed at `experiments/dsk-first-wave-proof/src/proof.js:23` with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
  look further: Check first-wave ProtoKit return shape, DSK adapter behavior, `createRealtimeGame()` kit installation, and expected `engine.n.*` API names.
- id: ecosystem-proof-032-e
  parent: ecosystem-proof-032
  lesson: Public DSK proof remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console showed 404s for deployed `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: ecosystem-proof-032-f
  parent: ecosystem-proof-032
  lesson: Public consumption and version policy remain split.
  evidence: Required GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Decide branch naming, package version, public consumption wording, and npm publication policy.
- id: ecosystem-proof-032-g
  parent: ecosystem-proof-032
  lesson: Telemetry/command and runtime hardening inventory remains separate from distribution proof.
  evidence: Neighboring DSK/deep-bug/domain nodes keep telemetry selected-value snapshots, service command metadata, input-frame ownership, namespace safety, install rollback, dependency parity, and binding ownership as hardening rows while live proof gates fail separately.
  look further: Route hardening fixtures separately from package resolution, route naming, targeted DSK API installation, npm, and public browser proof.
- id: ecosystem-proof-032-h
  parent: ecosystem-proof-032
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Boundary docs keep core as runtime/DSK/composer owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusRealtime core.
  look further: Fix proof routing/imports and targeted API installation without moving route ownership or reusable implementation into core.

## Related Nodes
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-20T18-41-30-0400-ecosystem-proof-node.md`
- relationship: supersedes
- reason: Preserves available-checkout versus release-proof separation while adding current branch-name drift, ProtoKits aggregate-green/targeted-red split, Experiments aggregate route failure, and targeted `engine.n.zoneField` failure.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T06-05-46-0400-ecosystem-state-node.md`
- relationship: confirms
- reason: Confirms branch-name drift, ProtoKits targeted package resolution, Experiments aggregate/targeted failures, npm 404, and public browser module 404s.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-21T06-19-09-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps release-proof policy and module-source proof separate from DSK runtime hardening.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-20T17-54-14-0400-deep-bug-node.md`
- relationship: references
- reason: Treats telemetry, operations command, and input-frame ownership bugs as hardening inputs, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-20T19-02-02-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms no duplicate idea row is needed for proof drift or telemetry/command evidence.

## Next Search Branches
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, core git refs, release policy
  question: Should proof require checking out `0.0.2`, or is commit equality against the resolved target sufficient?
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
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should DSK first-wave proof become aggregate validation after route smoke and API installation are green?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched targeted DSK validation passed.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
