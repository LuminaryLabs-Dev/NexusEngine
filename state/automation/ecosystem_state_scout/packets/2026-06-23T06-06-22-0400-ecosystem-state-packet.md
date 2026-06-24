# Ecosystem State Packet: 2026-06-23T06-06-22-0400

## Scope
- Automation: Nexus Realtime: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusRealtime`
- Repos checked: NexusRealtime core, NexusRealtime-ProtoKits, NexusRealtime-Experiments
- Result: partial; core remains commit-aligned with the live latest release branch `0.0.2` and smoke-green, but ecosystem proof remains red across ProtoKits local-vs-release separation, ProtoKits targeted package resolution, Experiments aggregate route validation, Experiments targeted DSK API installation, public browser module loading, npm metadata, package-version policy, dirty core host/docs release boundary, Host Graph Lifecycle Ownership, Host Public State Ownership, DSK Extension Service Ownership, and a current optional ProtoKits jsDelivr proof-path failure.

## Lane Goal
- Audit NexusRealtime ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-034`.
- Latest ecosystem state packet `2026-06-22T18-07-07-0400` reported core commit alignment, 9 passing smoke tests, dirty core host/docs/source/test work, ProtoKits local `main` 103 commits ahead of `origin/0.0.2`, ProtoKits targeted package-resolution failure, Experiments aggregate route failure, targeted `engine.n.zoneField` failure, npm 404, package-version split, public `Booting...`, Host Graph Lifecycle Ownership, and DSK Extension Service Ownership as separate hardening/proof tracks.
- Latest DSK architecture node `2026-06-22T18-19-08-0400` keeps DSK Extension Service Ownership as core hardening, not module-source or public proof.
- Latest ecosystem proof node `2026-06-22T18-36-17-0400` keeps branch/ref policy, package resolution, aggregate-route validation, targeted DSK API installation, npm, package-version policy, and browser import deployment as separate gates.
- Latest deep bug node `2026-06-22T18-49-24-0400` adds Host Public State Ownership evidence around mutable root `provides`, public `adapterRecords`, record/lifecycle disagreement, and mount side-effect leaks.
- Latest domain idea node `2026-06-22T19-04-12-0400` maps Host Public State Ownership under Host Graph Lifecycle Ownership, separate from DSK extension hardening and public proof.
- State packets were context only. Live source, docs, tests, git refs, preflight, sibling checks, disposable release checks, public URL checks, and Playwright launch-state inspection were authority.

## Agent Workspace State
- Read `agent-it`, `playwright`, and `human-view-orchestrator` instructions.
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this scout lane.
- Human-view question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes; the public DSK proof route is user-visible, so Playwright launch-state inspection and screenshot capture were used.
- First preflight at `2026-06-23T10:02:20.998Z` resolved `0.0.2` but aborted the required jsDelivr check; second preflight at `2026-06-23T10:02:46.811Z` passed all required links. Direct curl also returned 200 for the core jsDelivr URL, so the first abort is recorded as transient.
- Experiments `npm run check` generated route wrappers and gallery data in the sibling checkout; this lane restored `index.html` and `experiments/_shared/nexus-gallery-data.js`, removed generated `apps/*` wrappers, and returned Experiments to clean `main...origin/main [behind 29]`.
- Transient `/tmp/nexusrealtime-ecosystem-state-20260623-*` and `.playwright-cli` artifacts were removed after evidence capture.

## Latest Branch Preflight
- Latest remote release branch: `0.0.2`.
- Compare target: `0.0.2`.
- Current core branch: `main`.
- Branch status: `current-differs-from-latest-release-branch`.
- Required core public links: pass on second preflight.
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
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusRealtime/0.0.2/package.json` -> 200 by preflight; direct fetch reported `nexusrealtime@0.1.0`.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusRealtime@0.0.2/src/index.js` -> first preflight aborted, second preflight 200, direct curl 200.
- `https://registry.npmjs.org/nexusrealtime` -> 404 by preflight and direct curl.
- `https://luminarylabs-agents.github.io/NexusRealtime-Experiments/experiments/dsk-first-wave-proof/` -> 200 by curl and Playwright navigation, but visible state stayed `Booting...`.
- Raw Experiments proof `index.html` and `src/proof.js` at `0.0.2` -> 200.
- Raw ProtoKits `docs/DSK-FIRST-WAVE-LEDGER.md`, `protokits/nexus-dsk-adapter/index.js`, and `protokits/scan-survey-kit/index.js` at `0.0.2` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 502 after retry; this is a current optional ProtoKits CDN proof-path failure.
- Public dependency paths used by the proof route remain 404:
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
- `src/index.js`, `src/domain-service-kit.js`, `tests/`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`, `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packet/node through `2026-06-22T18-07-07-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea packets/nodes through `2026-06-22T19-04-12-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `tests/dsk-first-wave.test.mjs`, local checkout, and disposable `origin/0.0.2`
- Sibling Experiments `package.json`, `tests/canonical-game-routes-smoke.mjs`, `experiments/dsk-first-wave-proof/src/proof.js`, local checkout, and disposable `origin/0.0.2`

## Ecosystem Findings
- Core branch-name drift remains: local core is on `main`, while preflight latest release branch is `0.0.2`.
- Core commit alignment remains stable: `HEAD`, `origin/main`, and `origin/0.0.2` all resolve to `6c450b3073825ddd495979474f57342556658972`; ahead/behind vs both remote refs is `0 0`.
- Core worktree remains dirty with docs, ideal docs, host source/export/test changes, neighboring lane tracker/artifact changes, and prior ecosystem lane artifacts. This lane did not edit source/docs/package/canonical memory.
- Core `npm test` passed 9 smoke tests, including `host-smoke ok`.
- Required core public links are currently reachable after the transient first jsDelivr abort.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits local checkout is clean on `main` at `a23664b8e346482df773aeff9c0793919ba04ccb`.
- ProtoKits local `main` remains ahead of `origin/0.0.2` `a4d6a59f10df0c9967eeb72bf1552ce78e4972f6` by `103 0`.
- ProtoKits `origin/main` advanced to `476178b6baba291dbe39f7261b8c37255adf9a8f`; local `main...origin/main` is now `0 30`.
- ProtoKits package metadata remains `@luminarylabs/nexusrealtime-protokits@0.0.2`.
- ProtoKits local `docs/DSK-FIRST-WAVE-LEDGER.md` still lists seven promoted-candidate first-wave kits and says no first-wave kit is half migrated.
- ProtoKits local `npm run check` passed after syntax-checking 470 JavaScript modules.
- ProtoKits local targeted DSK smoke still failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Disposable `origin/0.0.2` ProtoKits aggregate check passed after syntax-checking 411 JavaScript modules; disposable targeted DSK smoke failed with the same missing package `nexusrealtime`.
- Experiments local checkout is clean on `main` and still equals fetched `origin/0.0.2` at `eddb8fb6a78ff2c532fadd145d5648b0761d3be1`; ahead/behind vs `origin/0.0.2` is `0 0`.
- Experiments `origin/main` advanced to `9fb36c4cec023df8df427b681855ed1fa5cfb03c`; local `main...origin/main` is now `0 29`.
- Experiments package metadata remains `@luminarylabs/nexusrealtime-experiments@0.0.2`.
- Experiments local and disposable `npm run check` generated 100 promoted application route wrappers and gallery data for 124 routes, then failed at `tests/canonical-game-routes-smoke.mjs` because `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke both fail after proof execution starts: `engine.n.zoneField` is undefined at `experiments/dsk-first-wave-proof/src/proof.js:23`.
- Experiments aggregate validation remains separate from DSK first-wave targeted proof; `npm run check` still does not include `tests/dsk-first-wave-experiment-smoke.mjs`.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console output showed 404s for deployed NexusRealtime and ProtoKits module paths.
- New neighboring context extends Host Graph Lifecycle Ownership with Host Public State Ownership. It is hardening inventory and does not fix package resolution, route naming, targeted DSK API installation, npm metadata, package-version policy, or public browser imports.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer/host primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- Host Public State Ownership now extends Host Graph Lifecycle Ownership with root capability ownership, private adapter records, record/lifecycle parity, and mount transaction boundaries.
- DSK Extension Service Ownership remains separate hardening inventory for `extendDomainServiceKit()` API/token parity, base-plus-extension install atomicity, and ECS definition identity.
- ProtoKits local drift remains a proof-policy signal: local available-checkout validation is green at 470 modules, but it is not release-ref evidence because local `main` is 103 commits ahead of `origin/0.0.2` and now 30 commits behind `origin/main`.
- Dirty core host/docs work stays a release-boundary signal. Passing smoke tests prove local checkout behavior only, not committed release readiness or public consumption.

## Evidence
- `npm run automation:preflight` first returned `requiredPublicLinksOk:false` because core jsDelivr aborted; the rerun returned `requiredPublicLinksOk:true`, latest branch `0.0.2`, and npm 404.
- Direct core jsDelivr curl returned 200 and 10,444 bytes.
- Core `git rev-parse HEAD origin/main origin/0.0.2` returned `6c450b3073825ddd495979474f57342556658972` for all refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` and `HEAD...origin/main` both returned `0 0`.
- Core `npm test` passed 9 smoke tests.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` at `a23664b`, ahead of `origin/0.0.2` by 103 and behind `origin/main` by 30.
- ProtoKits local `npm run check` passed after 470 JavaScript modules; local targeted `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusrealtime`.
- Disposable release layout with core, ProtoKits, and Experiments extracted at `origin/0.0.2` reproduced ProtoKits aggregate pass after 411 JavaScript modules and targeted package failure.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed clean local `main` equals `origin/0.0.2` and is behind `origin/main` by 29.
- Experiments local and disposable `npm run check` failed at `tests/canonical-game-routes-smoke.mjs` on `the-open-above-v2 route should not be versioned`.
- Experiments local and disposable targeted DSK smoke failed with `TypeError: Cannot read properties of undefined (reading 'zoneField')`.
- Fetch checks confirmed proof route/raw files remain public, while runtime dependency paths used by the public page remain 404.
- ProtoKits raw `scan-survey-kit/index.js` returned 200 while the equivalent jsDelivr URL returned 502.
- Playwright opened the public DSK proof route; snapshot showed `Booting...`; screenshot was captured transiently; console output showed 404s for `NexusRealtime/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Decide whether automation/release proof requires branch-name checkout, commit equality, clean worktrees, or explicit local-vs-release separation for all three repos.
- Treat ProtoKits local `main` as development-state proof, not `origin/0.0.2` release proof, until the release branch advances or local changes are intentionally promoted.
- Investigate the new ProtoKits `origin/main` gap separately from the preflight-resolved release branch.
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusrealtime` resolution explicitly before treating targeted first-wave DSK validation as release evidence.
- Investigate why first-wave DSK kits do not install `zoneField` under `engine.n` in Experiments targeted proof after module resolution succeeds.
- Fix or route the Experiments canonical route assertion for `the-open-above-v2` before using aggregate `npm run check` as green release evidence.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into aggregate Experiments validation or document it as required targeted evidence.
- Recheck the optional ProtoKits jsDelivr `scan-survey-kit` path before claiming CDN-backed ProtoKits proof.
- Keep Host Public State Ownership, DSK Extension Service Ownership, and Host Graph Lifecycle Ownership as hardening inventory until fixtures exist and proof/release lanes intentionally consume them.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-23T06-06-22-0400-ecosystem-state-node.md`.
- New root lesson: proof gates remain red, sibling `origin/main` drift widened, optional ProtoKits jsDelivr proof path is currently failing, and Host Public State Ownership adds host hardening risk without changing distribution proof status.

## Master Tracker Updates
- Added `ecosystem-root-035`.
- Marked `ecosystem-root-034` as superseded by `ecosystem-root-035`.
- Added child branches for widened sibling `origin/main` drift, optional ProtoKits CDN proof-path failure, Host Public State Ownership separation, and refreshed core, ProtoKits, Experiments, public browser, npm/package, DSK extension, and host graph gates.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not claim dirty core host/docs changes are release-ready or public-consumption-ready.
- This packet does not claim ProtoKits local `main` equals the release target or `origin/main`.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim local branch names match latest release branch names.
- This packet does not claim ProtoKits targeted first-wave DSK validation passed.
- This packet does not claim Experiments aggregate validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths, module-source resolution, ProtoKits CDN availability, canonical route naming, DSK API installation, Host Graph Lifecycle Ownership bugs, Host Public State Ownership bugs, or DSK Extension Service Ownership bugs.
- This packet does not promote ProtoKits into core.
