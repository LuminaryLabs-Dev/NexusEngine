# Knowledge Nodes: ecosystem_state_scout 2026-06-21T06-05-46-0400

## Root Lesson
- id: ecosystem-root-031
- statement: Core commit alignment remains stable even though the local branch name is now `main`, but ecosystem proof is still red: ProtoKits targeted first-wave DSK proof cannot resolve package `nexusengine`, Experiments aggregate proof fails on canonical route naming, Experiments targeted DSK proof reaches runtime but `engine.n.zoneField` is missing, npm metadata is 404, and the public proof route still stalls at `Booting...` on deployed module 404s.
- why it matters: Release proof can no longer be summarized as only module-source strategy. Branch-name vs commit alignment, aggregate-route validation, targeted DSK API installation, public browser imports, npm/package policy, and hardening inventory must stay separate.

## Child Nodes
- id: core-main-equals-release-ref-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: Core is on branch `main`, so preflight reports branch-name drift, but the commit still equals `origin/0.0.2`.
  evidence: Preflight resolved `latestReleaseBranch: 0.0.2` and `branchStatus: current-differs-from-latest-release-branch`; `HEAD`, `origin/main`, and `origin/0.0.2` all resolved to `ff97ba47af4197952eca0aded593d66e1a0e4887`; ahead/behind vs `origin/0.0.2` was `0 0`; `npm test` passed 8 smoke tests.
  look further: Decide whether release proof requires branch-name checkout or commit equality against the preflight target.
- id: protokits-main-ahead-targeted-package-resolution-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: ProtoKits local and detached aggregate checks pass, but targeted first-wave DSK proof is still blocked by bare `nexusengine` package resolution.
  evidence: Local ProtoKits `main` was ahead of fetched `origin/0.0.2` by `21 0`; local `npm run check` passed after 398 syntax-checked modules; detached `origin/0.0.2` `npm run check` passed after 385 syntax-checked modules; local and detached `node tests/dsk-first-wave.test.mjs` both failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
  look further: Validate ProtoKits targeted DSK proof with the same package, workspace, CDN, or link model selected for release/public proof.
- id: experiments-aggregate-route-regression-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: Experiments aggregate validation is currently red independent of DSK targeted proof.
  evidence: Local Experiments `main` was ahead of fetched `origin/0.0.2` by `9 0`; local and detached `npm run check` both failed in `tests/canonical-game-routes-smoke.mjs` with `the-open-above-v2 route should not be versioned`.
  look further: Inspect generated application routes and the canonical route smoke expectation for `the-open-above-v2`.
- id: experiments-targeted-dsk-api-missing-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: Experiments targeted DSK proof no longer fails only on missing sibling files; with sibling release extractions present, it reaches proof execution and then `engine.n.zoneField` is undefined.
  evidence: Local and detached `node tests/dsk-first-wave-experiment-smoke.mjs` failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')` at `experiments/dsk-first-wave-proof/src/proof.js:23`.
  look further: Check first-wave ProtoKit DSK return shape, `createRealtimeGame()` installation, `engine.n` API names, and the proof's expected promoted APIs.
- id: public-browser-module-404-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: The public DSK proof route remains HTTP-visible but browser-incomplete.
  evidence: Fetch returned 200 for the proof route; Playwright snapshot showed heading `DSK first-wave proof`, description text, and `Booting...`; console/request output showed 404s for `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`, `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`, and `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`.
  look further: Choose CDN `0.0.2`, same-origin deployed assets, or build-step import maps for public proof.
- id: public-consumption-version-policy-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: Public consumption and version policy remain split.
  evidence: Core release branch `0.0.2` serves `nexusengine@0.1.0`; npm metadata for `nexusengine` remains 404; required GitHub/raw/jsDelivr links are reachable.
  look further: Branch naming policy, package version policy, public consumption wording, and npm publication policy.
- id: hardening-inventory-separate-2026-06-21-0605
  parent: ecosystem-root-031
  lesson: Telemetry/command evidence ownership and procedural/navigation state ownership are still hardening inventory, not proof-distribution fixes.
  evidence: Neighboring DSK/deep-bug/domain packets add telemetry selected-value, service command metadata, input frame, and procedural/navigation ownership rows, while live public/local/fetched proof gates still fail separately.
  look further: Route hardening fixtures separately from module-source, aggregate-route, targeted-DSK, npm, and public browser proof work.

## Related Nodes
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T18-11-35-0400-ecosystem-state-node.md`
- relationship: supersedes
- reason: Preserves npm/public module-source blockers while adding branch-name drift, sibling main-ahead state, Experiments aggregate failure, and targeted DSK API installation failure.
- source: `state/automation/ecosystem_proof_scout/packets/2026-06-20T18-41-30-0400-ecosystem-proof-state-packet.md`
- relationship: confirms
- reason: The proof lane already separated sibling checkout drift, module-source proof, aggregate proof, and browser proof.
- source: `state/automation/dsk_architecture_scout/packets/2026-06-20T18-23-40-0400-dsk-architecture-state-packet.md`
- relationship: constrains
- reason: Keeps telemetry/command evidence ownership as DSK hardening inventory, not distribution proof.
- source: `state/automation/domain_kit_idea_expander/packets/2026-06-20T19-02-02-0400-domain-kit-idea-expansion-packet.md`
- relationship: references
- reason: Confirms duplicate proof-readiness and telemetry/command idea additions should be deferred rather than duplicated.

## Next Search Branches
- branch: branch-name-vs-ref-alignment
  files or folders: `npm run automation:preflight`, `git rev-parse HEAD origin/main origin/0.0.2`
  question: Should automation proof require checkout of the latest release branch name, or is commit equality against the resolved target enough?
- branch: protokits-targeted-package-resolution
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/package.json`, `protokits/nexus-dsk-adapter/index.js`, `tests/dsk-first-wave.test.mjs`
  question: Which module-source model makes targeted first-wave DSK proof resolve `nexusengine` in local and detached release layouts?
- branch: experiments-aggregate-canonical-route
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/canonical-game-routes-smoke.mjs`, generated route wrappers, `index.html`
  question: Why is `the-open-above-v2` still versioned in aggregate route validation?
- branch: experiments-targeted-dsk-api-installation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof/src/proof.js`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/domain-foundation`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits/protokits/domain-service-kits`
  question: Why are expected first-wave APIs missing from `engine.n` after proof kit installation?
- branch: public-proof-import-shape
  files or folders: public DSK proof route, raw proof source, public CDN/raw URLs
  question: Should public proof modules resolve through CDN `0.0.2`, same-origin deployed assets, package dependency, or import maps?
- branch: aggregate-dsk-proof-validation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/package.json`, `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/tests/dsk-first-wave-experiment-smoke.mjs`
  question: Should DSK first-wave proof be included in aggregate validation after route smoke is green?

## Not Claimed
- This node does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This node does not claim branch names match latest release branch names.
- This node does not claim ProtoKits targeted DSK validation passed.
- This node does not claim Experiments aggregate validation passed.
- This node does not claim Experiments local or fetched `origin/0.0.2` passed targeted DSK validation.
- This node does not claim Experiments aggregate validation covers DSK first-wave proof.
- This node does not claim the public DSK proof works in-browser.
- This node does not prove npm installability.
- This node does not promote ProtoKits into core.
- This node does not claim telemetry/command evidence ownership, procedural/navigation ownership, scheduler/world mutation isolation, query read-model isolation, runtime identity/lifecycle ownership, composition-proof ownership, proof-signal integrity, AR/spatial rows, or content-boundary/objective rows are fixed.
