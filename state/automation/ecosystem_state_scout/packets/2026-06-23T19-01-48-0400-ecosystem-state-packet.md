# Ecosystem State Packet: 2026-06-23T19-01-48-0400

## Scope
- Automation: Nexus Engine: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- Repos checked: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
- Result: partial; core remains commit-aligned with the preflight-resolved release branch `0.0.2` and smoke-green, but ecosystem proof remains red. New drift since `ecosystem-root-035`: ProtoKits local `main` moved to 140 commits ahead of `origin/0.0.2` and 11 behind `origin/main`, ProtoKits local aggregate validation now fails, Experiments local `main` moved to 67 commits ahead of `origin/0.0.2` and 50 behind `origin/main`, and the optional ProtoKits jsDelivr path recovered to 200.

## Lane Goal
- Audit NexusEngine ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-035`.
- Latest ecosystem state packet `2026-06-23T06-06-22-0400` reported core commit alignment, 9 passing smoke tests, dirty core host/docs/source/test work, ProtoKits local `main` 103 ahead of `origin/0.0.2` and 30 behind `origin/main`, ProtoKits targeted package-resolution failure, Experiments release-ref aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, package-version split, public `Booting...`, optional ProtoKits jsDelivr 502, Host Public State Ownership, and DSK Extension Service Ownership as separate hardening/proof tracks.
- Latest DSK architecture packet `2026-06-23T06-17-21-0400` keeps Runtime Failure Boundary, DSK Extension Service Ownership, Host Graph Lifecycle Ownership, and Host Public State Ownership as hardening inventory separate from release/public proof.
- Latest ecosystem proof packet `2026-06-23T06-38-41-0400` keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, package-version policy, optional CDN availability, and browser import deployment as separate proof gates.
- Latest deep bug packet `2026-06-23T06-49-16-0400` adds Composition Proof Ownership evidence: mutable composer nested arrays, stale supplied-composer handoff, and mutable `engine.game` proof metadata.
- Latest domain idea packet `2026-06-23T07-02-55-0400` maps composer handoff evidence under Composition Proof Ownership planning inventory, not distribution proof.
- State packets were context only. Live source, docs, tests, git refs, preflight, sibling checks, disposable release checks, public URL checks, and Playwright launch-state inspection were authority.

## Agent Workspace State
- Read `agent-it`, `human-view-orchestrator`, and `playwright` instructions.
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this scout lane.
- Human-view mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes; the public DSK proof route is user-visible, so Playwright launch-state inspection was used.
- Playwright snapshot showed the public proof route still visible as heading `DSK first-wave proof`, description text, and `Booting...`; console output showed deployed module 404s. The screenshot command failed after snapshot capture because the CLI parsed the supplied output path as a selector, so no screenshot artifact was retained.
- Experiments `npm run check` generated route wrappers and gallery data in the sibling checkout; this lane restored `index.html`, `experiments/_shared/nexus-gallery-data.js`, restored tracked `apps/_shared/generated-app-route.js`, and removed generated `apps/*` wrappers, returning Experiments to clean `main...origin/main [behind 50]`.
- Transient `/tmp/nexusengine-ecosystem-state-20260623T2301Z` and `.playwright-cli` artifacts were removed after evidence capture.

## Latest Branch Preflight
- `npm run automation:preflight` passed at `2026-06-23T22:58:33.098Z`.
- Latest remote release branch: `0.0.2`.
- Compare target: `0.0.2`.
- Current core branch: `main`.
- Branch status: `current-differs-from-latest-release-branch`.
- Required core public links: pass.
- Optional npm metadata: 404.
- Core `HEAD`: `6c450b3073825ddd495979474f57342556658972`.
- Core `origin/main`: `6c450b3073825ddd495979474f57342556658972`.
- Core `origin/0.0.2`: `6c450b3073825ddd495979474f57342556658972`.
- Core ahead/behind vs `origin/0.0.2`: `0 0`.
- Core ahead/behind vs `origin/main`: `0 0`.
- Core package metadata: `nexusengine@0.1.0`.
- Public raw release package metadata: `nexusengine@0.1.0`.
- Core `npm test`: passed 9 smoke tests.

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight and direct fetch.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200; direct fetch reported `nexusengine@0.1.0`.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusengine` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation, but visible state stayed `Booting...`.
- Raw Experiments proof `index.html` and `src/proof.js` at `0.0.2` -> 200.
- Raw ProtoKits `docs/DSK-FIRST-WAVE-LEDGER.md`, `protokits/nexus-dsk-adapter/index.js`, and `protokits/scan-survey-kit/index.js` at `0.0.2` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200; this recovers the optional ProtoKits jsDelivr failure from the prior packet.
- Public dependency paths used by the proof route remain 404:
  - `https://luminarylabs-agents.github.io/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js`

## Files Inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`, `docs/how-to-experiment.md`
- `src/index.js`, `src/domain-service-kit.js`, `tests/`
- `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packet/node through `2026-06-23T06-06-22-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea packets/nodes through `2026-06-23T07-02-55-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `tests/dsk-first-wave.test.mjs`, local checkout, and disposable `origin/0.0.2`
- Sibling Experiments `package.json`, `tests/canonical-game-routes-smoke.mjs`, `experiments/dsk-first-wave-proof/src/proof.js`, local checkout, and disposable `origin/0.0.2`

## Ecosystem Findings
- Core branch-name drift remains: local core is on `main`, while preflight latest release branch is `0.0.2`.
- Core commit alignment remains stable: `HEAD`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs both remote refs is `0 0`.
- Core worktree remains dirty with docs, ideal docs, host source/export/test changes, neighboring lane tracker/artifact changes, and prior ecosystem lane artifacts. This lane did not edit source/docs/package/canonical memory.
- Core `npm test` passed 9 smoke tests, including `host-smoke ok`.
- Required core public links remain reachable.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits local checkout is clean on `main` at `4c571ea238a4692880ce1e47830bcf092d4b9ea3`.
- ProtoKits local `main` is now ahead of `origin/0.0.2` `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6` by `140 0`.
- ProtoKits `origin/main` advanced to `1ec419e207a001a8347eba99c065bda2a6c5bc53`; local `main...origin/main` is now `0 11`.
- ProtoKits package metadata remains `@luminarylabs/nexusengine-protokits@0.0.2`.
- ProtoKits local `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven promoted-candidate first-wave kits and says no first-wave kit is half migrated.
- ProtoKits local `npm run check` regressed from aggregate-green to red: syntax checked 477 JavaScript modules, then `tests/generic-promotion-gate-smoke.test.mjs` failed with `AssertionError [ERR_ASSERTION]: pressure emits warning transition`, actual `0`, expected `1`.
- ProtoKits local targeted DSK smoke still failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Disposable `origin/0.0.2` ProtoKits aggregate check still passed after syntax-checking 411 JavaScript modules; disposable targeted DSK smoke failed with the same missing package `nexusengine`.
- Experiments local checkout is clean on `main` at `2e66120391fa9d88e3c6a27e16bb59c82ad95a4a`.
- Experiments local `main` is no longer equal to `origin/0.0.2`; local is ahead of release `eddb8fb6a78ff2c532fadd145d5648b0761d3be1` by `67 0`.
- Experiments `origin/main` advanced to `0508a2af3c47857187f7d31cf898d061d65d8b37`; local `main...origin/main` is now `0 50`.
- Experiments package metadata remains `@luminarylabs/nexusengine-experiments@0.0.2`.
- Experiments local and disposable `npm run check` generated 100 promoted application route wrappers and gallery data for 124 routes, then failed at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke both fail after proof execution starts: `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- Experiments aggregate validation remains separate from DSK first-wave targeted proof; local `package.json` still defines `check` through `scripts/run-checks.mjs`, and the targeted DSK smoke was run separately.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed 404s for deployed NexusEngine and ProtoKits module paths.
- New neighboring context adds Composition Proof Ownership for mutable composer read models and supplied-composer handoff. It is core proof-trust hardening and does not fix package resolution, route naming, targeted DSK API installation, npm metadata, package-version policy, or public browser imports.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer/host primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- ProtoKits local drift is now both branch-policy and validation-policy risk: local available-checkout aggregate validation is no longer green, while release `origin/0.0.2` aggregate validation remains green and targeted proof remains package-resolution red.
- Experiments local drift reopened local-vs-release separation: local `main` is 67 commits ahead of `origin/0.0.2`, while both local and release layouts still fail the same aggregate route and targeted DSK gates.
- Composition Proof Ownership extends hardening inventory for `createGameKitComposer()` and `createRealtimeGame({ composer })`; it should not be treated as public proof progress.
- The recovered ProtoKits jsDelivr URL removes one optional CDN availability symptom, but public proof still fails through deployed same-origin module 404s.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`, while reporting current branch `main` and status `current-differs-from-latest-release-branch`.
- Core `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972` for all refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` and `HEAD...origin/main` both returned `0 0`.
- Core `npm test` passed 9 smoke tests.
- Direct public URL fetches returned 200 for required core GitHub/raw/jsDelivr links, 404 for npm metadata, 200 for raw proof/ledger files, 200 for ProtoKits jsDelivr `scan-survey-kit`, and 404 for deployed dependency module paths.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` at `4c571ea`, ahead of `origin/0.0.2` by 140 and behind `origin/main` by 11.
- ProtoKits local `npm run check` failed after syntax-checking 477 JavaScript modules at `tests/generic-promotion-gate-smoke.test.mjs:23` on `pressure emits warning transition`.
- ProtoKits local targeted `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2` reproduced ProtoKits aggregate pass after 411 JavaScript modules and targeted package failure.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` at `2e66120`, ahead of `origin/0.0.2` by 67 and behind `origin/main` by 50.
- Experiments local and disposable `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` on `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; console output showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Split ProtoKits proof targets into at least three explicit states: local `main` aggregate-red, release `origin/0.0.2` aggregate-green/targeted-red, and latest `origin/main` unvalidated from this lane.
- Investigate the new local ProtoKits aggregate regression in `tests/generic-promotion-gate-smoke.test.mjs` before treating local ProtoKits proof as green again.
- Split Experiments proof targets into local `main`, preflight release `origin/0.0.2`, and latest `origin/main`; local and release currently share the same aggregate/targeted failures, but local is no longer release-ref evidence.
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusengine` resolution explicitly before treating targeted first-wave DSK validation as release evidence.
- Investigate why first-wave DSK kits do not install `zoneField` under `engine.n` in Experiments targeted proof after module resolution succeeds.
- Fix or route the Experiments canonical route assertion for `the-open-above-v2` before using aggregate `npm run check` as green release evidence.
- Keep Composition Proof Ownership, Host Public State Ownership, DSK Extension Service Ownership, and Host Graph Lifecycle Ownership as hardening inventory until fixtures exist and proof/release lanes intentionally consume them.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T19-01-48-0400-ecosystem-state-node.md`.
- New root lesson: core remains aligned and smoke-green, but sibling local proof drift widened materially; ProtoKits local aggregate validation regressed, Experiments local is no longer release-ref aligned, optional ProtoKits jsDelivr recovered, and public browser proof remains stuck at `Booting...`.

## Master Tracker Updates
- Added `ecosystem-root-036`.
- Marked `ecosystem-root-035` as superseded by `ecosystem-root-036`.
- Added child branches for ProtoKits local aggregate regression, ProtoKits release targeted package resolution, Experiments local/release/main drift, public browser module 404s, recovered optional ProtoKits jsDelivr path, public consumption version policy, and composition proof hardening separation.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not claim dirty core host/docs changes are release-ready or public-consumption-ready.
- This packet does not claim ProtoKits local `main` equals the release target or `origin/main`.
- This packet does not claim ProtoKits local aggregate validation passed.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments local `main` equals the release target or `origin/main`.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not fix GitHub Pages module paths, module-source resolution, canonical route naming, DSK API installation, composer proof metadata, Host Graph Lifecycle Ownership bugs, Host Public State Ownership bugs, or DSK Extension Service Ownership bugs.
- This packet does not promote ProtoKits into core.
