# Ecosystem State Packet: 2026-06-22T06-05-45-0400

## Scope
- Automation: Nexus Realtime: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- Repos checked: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
- Result: partial; core remains commit-aligned with `origin/0.0.2` and `origin/main` and passes 9 smoke tests, but ecosystem proof is still red across dirty core host/docs work, new ProtoKits local-vs-release drift, ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, npm metadata, package-version policy, and public browser module loading.

## Lane Goal
- Audit NexusRealtime ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-032`.
- Latest ecosystem state packet `2026-06-21T18-05-09-0400` reported core and sibling release-ref alignment, dirty core host-surface changes with 9 passing smoke tests, ProtoKits targeted package-resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, public `Booting...`, and sibling `origin/main` freshness drift.
- Latest DSK architecture node `2026-06-21T18-18-55-0400` kept dirty host-surface work separate from DSK hardening and added Domain Command Config Ownership as hardening inventory.
- Latest ecosystem proof node `2026-06-21T18-35-45-0400` split proof into branch/ref policy, dirty-core proof boundary, sibling freshness, package resolution, aggregate-route validation, targeted DSK API installation, npm publication, and browser import deployment.
- Latest deep bug node `2026-06-21T18-48-04-0400` found `Nexus.Host` adapter graph/lifecycle ownership bugs.
- Latest domain idea node `2026-06-21T19-03-16-0400` mapped those host graph bugs into Host Graph Lifecycle Ownership planning inventory.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, disposable release checks, and Playwright launch-state inspection were authority.

## Agent Workspace State
- Read `agent-it`, `playwright`, and `human-view-orchestrator` instructions.
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this scout lane.
- Human-view validation question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes; the public DSK proof route is user-visible, so Playwright launch-state inspection was used.
- Transient Playwright CLI artifacts were removed after evidence capture.
- Experiments `npm run check` generated local route artifacts in the clean sibling checkout; because the lane created those side effects, they were restored/removed immediately after evidence capture.
- Pre-existing core worktree changes were treated as evidence only and not edited outside this lane: docs/domain and ideal docs, `src/index.js`, untracked `src/host.js`, untracked `examples/three-host/`, test harness changes, neighboring lane artifacts, and prior ecosystem tracker state.

## Latest Branch Preflight
- `npm run automation:preflight` passed at `2026-06-22T10:01:08.898Z`.
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
- Core package metadata: `nexusrealtime@0.1.0`.
- Public raw release package metadata: `nexusrealtime@0.1.0`.
- Core `npm test`: passed 9 smoke tests.

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusRealtime` -> 200 by preflight.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200 by preflight; version `0.1.0`.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> 200 by preflight.
- `https://registry.npmjs.org/nexusrealtime` -> 404 by preflight.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation, but visible state stayed `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusRealtime-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public module dependency paths remain 404:
  - `https://luminarylabs-agents.github.io/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime/src/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-foundation/index.js`
  - `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/NexusRealtime-ProtoKits/protokits/domain-service-kits/index.js`

## Files Inspected
- `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`
- `memory.md`, `README.md`, `package.json`
- `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, `docs/how-to-protokit.md`, `docs/how-to-experiment.md`
- `src/index.js`, `src/domain-service-kit.js`, `src/host.js`, `tests/`
- `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packets/nodes through `2026-06-21T18-05-09-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea packets/nodes through `2026-06-21T19-03-16-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `tests/dsk-first-wave.test.mjs`, local checkout, and disposable `origin/0.0.2`
- Sibling Experiments `package.json`, `experiments/dsk-first-wave-proof/src/proof.js`, `tests/dsk-first-wave-experiment-smoke.mjs`, `tests/canonical-game-routes-smoke.mjs`, local checkout, and disposable `origin/0.0.2`

## Ecosystem Findings
- Core branch-name drift remains: local core is on `main`, and preflight marks it different from latest release branch `0.0.2`.
- Core commit alignment remains stable: `HEAD`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs both remote refs is `0 0`.
- Core worktree is dirtier than the previous ecosystem packet: host-surface work is still present, and domain/ideal docs plus neighboring lane tracker/artifact changes are visible. This lane did not edit them.
- Core `npm test` passed 9 smoke tests, including `host-smoke ok`.
- Required GitHub/raw/jsDelivr links remain reachable.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits local checkout is clean on `main` at `a23664b8e346482df773aeff9c0793919ba04ccb`.
- ProtoKits local `main` is no longer release-ref aligned: it is ahead of `origin/0.0.2` `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6` by `103 0`.
- ProtoKits local `main` is also ahead of `origin/main` `3322f1f8b2c2fa4f6c2b5b6a6bea5fa90f583a47` by `1 0`.
- ProtoKits package metadata remains `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits local `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven promoted-candidate first-wave kits and says no first-wave kit is half migrated.
- ProtoKits local `npm run check` passed after syntax-checking 470 JavaScript modules, up from the prior 411-module release-ref check.
- ProtoKits local targeted DSK smoke still failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Disposable `origin/0.0.2` ProtoKits aggregate check passed after syntax-checking 411 JavaScript modules; disposable targeted DSK smoke failed with the same missing package `nexusrealtime`.
- Experiments local checkout is clean on `main` and still equals fetched `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; ahead/behind vs `origin/0.0.2` is `0 0`.
- Experiments `origin/main` remains ahead at `6d047bb11806e3430084ddca0fb49a28f0f17a3e`; local `main...origin/main` is `0 4`.
- Experiments package metadata remains `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments local and disposable `npm run check` generated 100 promoted application route wrappers and gallery data for 124 routes, then failed at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke both fail after module resolution reaches the proof body: `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- Experiments aggregate validation remains separate from DSK first-wave targeted proof; `npm run check` still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed 404s for deployed NexusRealtime and ProtoKits module paths.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer/host primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- New Host Graph Lifecycle Ownership is fresh planning and bug context from neighboring lanes. It hardens the dirty `Nexus.Host` surface but does not fix public/module-source proof, package metadata, package-version policy, or targeted DSK API installation.
- ProtoKits local drift is now the major state change: local available-checkout validation is green at 470 modules, but it is not release-ref evidence because local `main` is 103 commits ahead of `origin/0.0.2`.
- Dirty core host/docs work stays a release-boundary signal. Passing smoke tests prove local checkout behavior only, not committed release readiness or public consumption.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`, while reporting current branch `main` and status `current-differs-from-latest-release-branch`.
- Core `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972` for all refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` and `HEAD...origin/main` both returned `0 0`.
- Core `npm test` passed 9 smoke tests.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` at `a23664b`, ahead of `origin/0.0.2` by 103 and ahead of `origin/main` by 1.
- ProtoKits local `npm run check` passed after 470 JavaScript modules; local targeted `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2` reproduced ProtoKits aggregate pass after 411 JavaScript modules and targeted package failure.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` equals `origin/0.0.2` and is behind `origin/main` by 4.
- Experiments local and disposable `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` on `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Fetch checks confirmed proof route/raw/CDN files remain public, while runtime dependency paths used by the public page remain 404.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; console output showed 404s for `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Decide whether automation/release proof requires branch-name checkout, commit equality, clean worktrees, or explicit local-vs-release separation for all three repos.
- Treat ProtoKits local `main` ahead-of-release evidence as development-state proof, not `origin/0.0.2` release proof, until the release branch advances or local changes are intentionally promoted.
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusrealtime` resolution explicitly before treating targeted first-wave DSK validation as release evidence.
- Investigate why first-wave DSK kits do not install `zoneField` under `engine.n` in Experiments targeted proof after module resolution succeeds.
- Fix or route the Experiments canonical route assertion for `the-open-above-v2` before using aggregate `npm run check` as green release evidence.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into aggregate Experiments validation or document it as required targeted evidence.
- Update public consumption wording or release policy so docs distinguish GitHub/jsDelivr branch consumption from unavailable npm registry metadata.
- Decide whether core branch `0.0.2` serving package version `0.1.0` is intentional policy or stale metadata.
- Keep Host Graph Lifecycle Ownership as hardening inventory until the dirty host surface is committed/release-scoped and fixtures exist.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-22T06-05-45-0400-ecosystem-state-node.md`.
- New root lesson: core remains release-ref aligned and smoke-green, but ProtoKits local drift reopened release-ref separation while targeted package, Experiments aggregate, targeted API, npm, package-version, public-browser, dirty-host, and host-graph-hardening gates remain open.

## Master Tracker Updates
- Added `ecosystem-root-033`.
- Marked `ecosystem-root-032` as superseded by `ecosystem-root-033`.
- Added child branches for ProtoKits local-ahead release separation, dirty core host/docs proof boundary, Experiments release-ref route/API failures, public browser module 404s, npm/package-version policy, and Host Graph Lifecycle Ownership separation.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not claim dirty core host/docs changes are release-ready or public-consumption-ready.
- This packet does not claim ProtoKits local `main` equals the release target.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths, module-source resolution, canonical route naming, DSK API installation, or Host Graph Lifecycle Ownership bugs.
- This packet does not promote ProtoKits into core.
