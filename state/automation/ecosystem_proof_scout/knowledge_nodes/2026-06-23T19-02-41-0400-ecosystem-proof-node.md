# Knowledge Nodes: ecosystem proof scout 2026-06-23T19-02-41-0400

## Root Lesson
- id: ecosystem-proof-037
- statement: Core remains commit-aligned with `origin/0.0.2` and smoke-green, but ecosystem proof is still red and live sibling drift changed materially: ProtoKits local `main` is now aggregate-red while 140 commits ahead of `origin/0.0.2` and 11 behind `origin/main`; Experiments local `main` is now 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`; ProtoKits targeted proof still cannot resolve package `nexusengine`; Experiments aggregate proof still fails on canonical route naming; Experiments targeted DSK proof still misses `engine.n.zoneField`; npm metadata is 404; and the public proof route still stalls at `Booting...` on deployed module 404s. The previously red optional ProtoKits jsDelivr `scan-survey-kit` path now returns 200.
- why it matters: Local dev evidence, release-ref evidence, latest-main freshness, public-browser evidence, dirty core work, host/DSK/composer hardening, npm/package policy, and CDN availability must stay separated until proof targets are explicitly chosen.

## Child Nodes
- id: ecosystem-proof-037-a
  parent: ecosystem-proof-037
  lesson: Core is branch-name drifted but commit-aligned with the latest release ref while carrying dirty host/docs/source work.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `6c450b3073825ddd495979474f57342556658972`; ahead/behind against `origin/0.0.2` and `origin/main` was `0 0`; `npm test` passed 9 smoke tests including `host-smoke ok`; `git status` showed dirty docs/source/test and neighboring lane files.
  look further: Decide whether release proof requires checkout of branch `0.0.2`, commit equality against the resolved target, and a clean worktree.
- id: ecosystem-proof-037-b
  parent: ecosystem-proof-037
  lesson: ProtoKits local development proof, release-ref proof, and latest-main proof diverged further, and local aggregate proof is newly red.
  evidence: ProtoKits local `main` resolved to `4c571ea238a4692880ce1e47830bcf092d4b9ea3`, `origin/main` to `1ec419e207a001a8347eba99c065bda2a6c5bc53`, and `origin/0.0.2` to `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6`; local `HEAD...origin/0.0.2` returned `140 0`; local `HEAD...origin/main` returned `0 11`; local `npm run check` failed in `generic-promotion-gate-smoke.test.mjs` because `pressure emits warning transition` saw zero warning events.
  look further: Decide whether the next proof target is local ProtoKits `main`, `origin/main`, or preflight-resolved `origin/0.0.2`; if local/main is in scope, triage the pressure warning transition regression first.
- id: ecosystem-proof-037-c
  parent: ecosystem-proof-037
  lesson: ProtoKits release-ref aggregate proof remains green, but targeted first-wave DSK proof is still package-resolution red.
  evidence: Disposable `origin/0.0.2` ProtoKits `npm run check` passed after 411 JavaScript modules; local and disposable `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate targeted first-wave DSK proof with the selected package, workspace, CDN, or link model.
- id: ecosystem-proof-037-d
  parent: ecosystem-proof-037
  lesson: Experiments local proof is no longer release-ref aligned and remains aggregate-red independent of targeted DSK proof.
  evidence: Experiments local `main` resolved to `2e66120391fa9d88e3c6a27e16bb59c82ad95a4a`, `origin/0.0.2` to `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`, and `origin/main` to `0508a2af3c47857187f7d31cf898d061d65d8b37`; local `HEAD...origin/0.0.2` returned `67 0`; local `HEAD...origin/main` returned `0 50`; local archive and disposable `origin/0.0.2` `npm run check` failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and canonical route smoke expectations for `the-open-above-v2`, and decide whether proof should inspect local, `origin/main`, or release-ref state.
- id: ecosystem-proof-037-e
  parent: ecosystem-proof-037
  lesson: Experiments targeted DSK proof reaches proof execution and still fails on missing promoted API installation.
  evidence: Local real sibling layout and disposable release layout `node tests/dsk-first-wave-experiment-smoke.mjs` failed at `experiments/dsk-first-wave-proof/src/proof.js:23` with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
  look further: Check first-wave ProtoKit return shape, DSK adapter behavior, `createRealtimeGame()` kit installation, and expected `engine.n.*` API names.
- id: ecosystem-proof-037-f
  parent: ecosystem-proof-037
  lesson: Public DSK proof remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed 404s for deployed `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, package dependency, or build-step import maps for public proof.
- id: ecosystem-proof-037-g
  parent: ecosystem-proof-037
  lesson: Public consumption and version policy remain split, but the checked ProtoKits jsDelivr path recovered.
  evidence: Required core GitHub/raw/jsDelivr links returned 200, npm metadata for `nexusengine` returned 404, branch `0.0.2` serves `nexusengine@0.1.0`, raw ProtoKits `scan-survey-kit/index.js` returned 200, and the equivalent jsDelivr URL now returned 200.
  look further: Decide branch naming, package version, public consumption wording, npm publication policy, and whether ProtoKits proof should rely on raw GitHub, jsDelivr, same-origin deployment, or package resolution.
- id: ecosystem-proof-037-h
  parent: ecosystem-proof-037
  lesson: Host Public State Ownership, DSK Extension Service Ownership, and Composer Proof Ownership are hardening inventory, not distribution or public proof fixes.
  evidence: Neighboring nodes report mutable host state, DSK extension transaction/API parity gaps, and mutable composer read-model handoff; live proof gates still fail separately on package resolution, route naming, targeted DSK API installation, npm, package-version policy, and public browser imports.
  look further: Route host, DSK extension, and composer fixtures to non-scout hardening lanes while keeping package/workspace/CDN/same-origin/build-step import-map decisions in ecosystem/proof lanes.
- id: ecosystem-proof-037-i
  parent: ecosystem-proof-037
  lesson: Core/ProtoKits/Experiments ownership boundaries still hold.
  evidence: Boundary docs keep core as runtime/DSK/composer/host primitive owner, ProtoKits as reusable implementation owner, and Experiments as playable/browser proof owner; this run found no reason to move proof routing or reusable implementation into NexusEngine core.
  look further: Fix proof routing/imports and targeted API installation without moving route ownership or reusable implementation into core.

## Related Nodes
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-23T06-38-41-0400-ecosystem-proof-node.md`
- relationship: supersedes
- reason: Preserves the same release/public proof split with current live evidence, new ProtoKits aggregate failure, new Experiments local/release drift, and recovered optional ProtoKits jsDelivr availability.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T06-06-22-0400-ecosystem-state-node.md`
- relationship: updates
- reason: Replaces stale ProtoKits/Experiments drift counts and stale optional ProtoKits jsDelivr 502 with current proof-state evidence.
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-23T06-17-21-0400-dsk-architecture-node.md`
- relationship: constrains
- reason: Keeps DSK Extension Service Ownership, runtime failure-boundary, and host public-state fixtures separate from distribution/module-source proof.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-23T06-49-16-0400-deep-bug-node.md`
- relationship: references
- reason: Supplies composer read-model handoff and proof metadata drift evidence.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-23T07-02-55-0400-domain-kit-idea-node.md`
- relationship: references
- reason: Confirms composer handoff extends Composition Proof Ownership and does not replace proof-readiness gates.

## Next Search Branches
- branch: protokits-local-vs-release-vs-main-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits`, fetched `origin/0.0.2`, fetched `origin/main`, package metadata, release branch policy
  question: Should proof consume local ProtoKits `main`, `origin/main`, or the preflight-resolved release branch?
- branch: protokits-local-aggregate-regression
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/tests/generic-promotion-gate-smoke.test.mjs`, `generic-pressure-loop-kit`
  question: Why did `pressure emits warning transition` stop emitting one warning event in local ProtoKits `npm run check`?
- branch: experiments-local-vs-release-vs-main-proof
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`, fetched `origin/main`, fetched `origin/0.0.2`
  question: Should proof consume local Experiments `main`, `origin/main`, or the preflight-resolved release branch now that local is ahead of release and behind main?
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, core and sibling git refs
  question: Should automation proof require checkout of branch `0.0.2`, commit equality against the resolved target, and/or clean worktrees?
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
- branch: hardening-proof-separation
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/host.js`, hardening packets/nodes
  question: Which host, DSK extension, and composer fixtures belong to core hardening while proof claims remain blocked on module source and public routes?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim dirty core host/docs/source changes are release-ready.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits local `main` is release-ref proof or latest-main proof.
- This node does not claim ProtoKits local aggregate validation passed.
- This node does not claim ProtoKits targeted first-wave DSK validation passed.
- This node does not claim Experiments local `main` is release-ref proof or latest-main proof.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim DSK Extension Service Ownership, Host Graph Lifecycle Ownership, Host Public State Ownership, Composition Proof Ownership, Domain Command Config Ownership, Telemetry Command Evidence Ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, proof-signal integrity, AR/spatial rows, content-boundary/objective rows, or runtime failure-boundary rows are fixed.
