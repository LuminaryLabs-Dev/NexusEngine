# Knowledge Nodes: ecosystem_state_scout 2026-06-21T18-05-09-0400

## Root Lesson
- id: ecosystem-root-032
- statement: Core and sibling `origin/0.0.2` refs are aligned again, and core smoke coverage now passes 9 tests from a dirty host-surface checkout, but ecosystem proof is still red: ProtoKits targeted first-wave DSK proof cannot resolve package `nexusrealtime`, Experiments aggregate proof fails on canonical route naming, Experiments targeted DSK proof reaches runtime but `engine.n.zoneField` is missing, npm metadata is 404, and the public proof route still stalls at `Booting...` on deployed module 404s.
- why it matters: The current state is no longer sibling main-ahead drift. Release-ref parity is green, but dirty core host work, sibling `origin/main` freshness drift, targeted package resolution, aggregate route validation, DSK API installation, npm/package policy, and browser import deployment remain separate gates.

## Child Nodes
- id: core-dirty-host-surface-release-ref-parity-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: Core `main`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3`, but the worktree has pre-existing host-surface source/test/example changes and now passes 9 smoke tests.
  evidence: `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs `origin/0.0.2` was `0 0`; `git status --short` showed modified `src/index.js`, `tests/public-api-freeze.mjs`, `tests/run-all.mjs`, and untracked host docs/examples/source/test files; `npm test` passed 9 smoke tests.
  look further: Decide whether dirty host-surface work is part of the next release proof or should stay separate from public/package claims until committed and intentionally promoted.
- id: sibling-release-ref-aligned-origin-main-drift-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: ProtoKits and Experiments local clean `main` checkouts both equal `origin/0.0.2`, but both are behind `origin/main`.
  evidence: ProtoKits `HEAD` and `origin/0.0.2` both resolved to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`, while `origin/main` was `b67fb126844c78c6bdc38ed05990a637673a382f` and status showed `[behind 35]`; Experiments `HEAD` and `origin/0.0.2` both resolved to `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`, while `origin/main` was `6d047bb11806e3430084ddca0fb49a28f0f17a3e` and status showed `[behind 4]`.
  look further: Keep release-ref proof separate from latest `origin/main` freshness until the release target policy says which ref is authoritative.
- id: protokits-targeted-package-resolution-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: ProtoKits aggregate proof is green locally and in disposable release layout, but targeted first-wave DSK proof is still package-resolution red.
  evidence: Local and disposable `npm run check` passed after syntax-checking 411 JavaScript modules; local and disposable `node tests/dsk-first-wave.test.mjs` both failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
  look further: Validate targeted first-wave DSK proof with an explicit package, workspace, CDN, or link model for `nexusrealtime`.
- id: experiments-aggregate-route-regression-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: Experiments aggregate validation is still red independent of targeted DSK proof.
  evidence: Disposable `origin/0.0.2` `npm run check` generated 100 promoted application route wrappers and gallery data for 124 routes, then failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and canonical route smoke expectations for `the-open-above-v2`.
- id: experiments-targeted-dsk-api-missing-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: Experiments targeted DSK proof reaches proof execution and then fails because expected first-wave APIs are missing from `engine.n`.
  evidence: Local and disposable `node tests/dsk-first-wave-experiment-smoke.mjs` failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')` at `experiments/dsk-first-wave-proof/src/proof.js:23`.
  look further: Check first-wave ProtoKit DSK return shape, adapter behavior, `createRealtimeGame()` installation, `engine.n` API names, and the proof's expected promoted APIs.
- id: public-browser-module-404-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: The public DSK proof route remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console output showed 404s for `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`, `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: public-consumption-version-policy-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: Public consumption and version policy remain split.
  evidence: Required GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusrealtime` returned 404, and branch `0.0.2` serves `nexusrealtime@0.1.0`.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: hardening-inventory-separate-2026-06-21-1805
  parent: ecosystem-root-032
  lesson: Domain Command Config Ownership and telemetry/command evidence ownership are hardening inventory, not proof-distribution fixes.
  evidence: Neighboring deep-bug/domain packets add Economy, TimingWindow, ResourcePressure, LifecycleProgression, FacilityOperations, telemetry, service command, and input-frame ownership rows, while live public/local/fetched proof gates still fail separately.
  look further: Route hardening fixtures separately from module-source, aggregate-route, targeted-DSK, npm, branch/package, and public browser proof work.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-21T06-05-46-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves npm/public module-source blockers, Experiments aggregate failure, and targeted DSK API failure while replacing sibling main-ahead drift with release-ref alignment plus `origin/main` freshness drift and dirty core host-surface evidence.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-21T06-36-07-0400-ecosystem-proof-node.md`
- relationship: confirms
- reason: Keeps branch-name policy, package resolution, aggregate-route validation, DSK API installation, npm publication, and browser import deployment as separate gates.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-21T06-19-09-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps release-proof policy and module-source proof separate from DSK runtime hardening.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-21T06-48-34-0400-deep-bug-node.md`
- relationship: references
- reason: Treats command/config ownership bugs as hardening inputs, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-21T07-02-40-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms Domain Command Config Ownership is planning inventory and does not replace proof-readiness gates.

## Next Search Branches
- branch: core-dirty-host-surface-proof-boundary
  files or folders: `src/index.js`, `src/host.js`, `tests/host-smoke.mjs`, `examples/three-host/`, `docs/ideal/ideal-hosts.md`
  question: Is the dirty host-surface work intended for the next release proof, or should ecosystem proof ignore it until committed and promoted?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, core and sibling git refs
  question: Should automation proof require checkout of branch `0.0.2`, or is commit equality against the resolved target enough?
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
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim domain command/config ownership, telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
