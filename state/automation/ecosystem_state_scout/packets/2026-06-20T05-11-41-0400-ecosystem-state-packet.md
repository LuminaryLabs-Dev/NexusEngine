# Ecosystem State Packet: 2026-06-20T05-11-41-0400

## Scope
- Automation: Nexus Engine: Ecosystem State Packet
- Workspace: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine`
- Repos checked: NexusEngine core, NexusEngine-ProtoKits, NexusEngine-Experiments
- Result: partial; core and ProtoKits are latest-release aligned, but package/module-source proof still blocks ProtoKits validation, Experiments targeted proof, and public browser proof.

## Lane Goal
- Audit NexusEngine ecosystem state, drift, and proof readiness across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.

## Prior State Context
- Current lane tracker latest root before this run: `ecosystem-root-027`.
- Latest ecosystem state packet/node `2026-06-20T04-10-40-0400` kept the shared module-source blocker open and recorded ProtoKits fetched `origin/0.0.2` at `82c879f`, 7 commits ahead of local.
- Latest DSK architecture node `2026-06-20T04-22-52-0400` added content-boundary/objective rows while keeping runtime failure-boundary and module-source proof separate.
- Latest ecosystem proof node `2026-06-20T04-42-18-0400` reported ProtoKits local metadata aligned at `0.0.2`, fetched `origin/0.0.2` at `3d42b72`, and the same package/public proof failures.
- Latest deep bug node `2026-06-20T04-54-16-0400` added query read-model isolation risks across public query helpers and engine read methods.
- Latest domain idea node `2026-06-20T05-02-13-0400` mapped that into Query Read Model Isolation planning inventory.
- State packets were context only. Live source, docs, tests, git refs, public URLs, preflight, and Playwright launch state were authority for this run.

## Agent Workspace State
- Read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Agent rules require preflight branch resolution, public-link checks, lane-local evidence, and no source/docs/package/canonical-memory edits from this lane.
- Used Playwright and Human View Orchestration for the public proof route. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Yes: the public proof route is launch-state-visible, so Playwright snapshot/console inspection was used.
- Worktree had pre-existing modified docs/automation trackers and many untracked automation artifacts before this run. This lane wrote only this packet, its knowledge node, and the lane master tracker update.
- Temporary Playwright CLI artifacts and disposable fetched-ref extraction folders were removed after inspection.

## Latest Branch Preflight
- `npm run automation:preflight` passed at `2026-06-20T09:08:07.635Z`.
- Latest remote release branch: `0.0.2`.
- Compare target: `0.0.2`.
- Current branch: `0.0.2`.
- Branch status: `current-is-latest-release-branch`.
- Required core public links: pass.
- Optional npm metadata: 404.
- Core `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- Core `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- Core ahead/behind: `0 0`.
- Core package metadata: `nexusengine@0.1.0`.
- Core `npm test`: passed 8 smoke tests.

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200.
- `https://registry.npmjs.org/nexusengine` -> 404.
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200 by fetch and Playwright navigation, but browser state stayed `Booting...`.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200.
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200.
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200.
- Public module dependency paths remain 404:
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
- `state/automation/README.md`, `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/ecosystem_state_scout/PROMPT.md`, `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- Latest current-lane ecosystem packets/nodes `2026-06-20T04-10-40-0400` and `2026-06-20T03-07-30-0400`
- Latest neighboring DSK architecture, ecosystem proof, deep bug, and domain idea nodes through `2026-06-20T05-02-13-0400`
- Sibling ProtoKits `package.json`, `docs/DSK-FIRST-WAVE-LEDGER.md`, `protokits/nexus-dsk-adapter/index.js`, `tests/dsk-first-wave.test.mjs`, local checkout, and fetched `origin/0.0.2`
- Sibling Experiments `package.json`, `experiments/dsk-first-wave-proof/index.html`, `experiments/dsk-first-wave-proof/src/proof.js`, `tests/dsk-first-wave-experiment-smoke.mjs`, local checkout, and fetched `origin/0.0.2`

## Ecosystem Findings
- Core remains current on the preflight-resolved latest release branch `0.0.2`; `HEAD` equals `origin/0.0.2` and `npm test` passed all 8 smoke tests.
- Required core GitHub/raw/jsDelivr links remain reachable.
- Optional npm registry metadata remains unavailable with HTTP 404, so npm-backed consumption is not proven.
- Branch/package policy remains unresolved: release branch `0.0.2` serves package metadata version `0.1.0`.
- ProtoKits drift closed this run: local `HEAD` and `origin/0.0.2` both resolved to `3d42b725dd166274ff6c5452beef86ef17863852`, ahead/behind `0 0`.
- ProtoKits package metadata is now locally aligned at `@luminarylabs/nexusengine-protokits@0.0.2`.
- ProtoKits local validation remains red: `npm run check` syntax-checked 370 JavaScript modules, then `smoke:imports` failed with 110 ProtoKit index import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits local targeted DSK smoke remains red: `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits disposable fetched-ref validation remains red at the same aligned ref `3d42b725dd166274ff6c5452beef86ef17863852`; aggregate and targeted checks fail on missing package `nexusengine`.
- Experiments local checkout remains clean but behind fetched `origin/0.0.2`: local `57b3d668891794ddad00c765ce4faf342a3d9000`, origin `3e047f693f3ed58cab1c362deb09a597398d05e5`, ahead/behind `0 2`.
- Experiments local targeted DSK validation remains red: `node tests/dsk-first-wave-experiment-smoke.mjs` failed because sibling ProtoKits `protokits/nexus-dsk-adapter/index.js` could not resolve package `nexusengine`.
- Experiments disposable fetched-ref aggregate validation passed: `npm run check` generated 100 flat route wrappers and passed the aggregate smoke chain.
- Experiments disposable fetched-ref targeted DSK validation still failed: `node tests/dsk-first-wave-experiment-smoke.mjs` could not resolve sibling `/private/.../NexusEngine/src/index.js` from proof imports.
- Public DSK proof remains HTTP-visible but not browser-complete: Playwright snapshot showed heading `DSK first-wave proof`, description text, and visible `Booting...`; console showed 404s for deployed sibling module paths.
- Experiments aggregate validation remains a separate green claim from targeted DSK proof; `package.json` aggregate `check` does not include `tests/dsk-first-wave-experiment-smoke.mjs`.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains stable: core owns runtime/DSK/composer primitives and invariants, ProtoKits owns reusable implementations, and Experiments owns playable/browser proof.
- Content-boundary/objective hardening remains separate from distribution proof.
- New query read-model isolation evidence adds another hardening family for public query helpers, engine read methods, nested metadata/hazard isolation, and stored query proof snapshots.
- Query read-model isolation is important for future proof snapshots, but it does not change the current module-source blocker.
- The active ecosystem blocker remains one module-source strategy that works for local ProtoKits, fetched ProtoKits, local Experiments targeted proof, fetched Experiments targeted proof, aggregate-vs-targeted proof, and public browser loading.

## Evidence
- `npm run automation:preflight` passed and resolved latest branch `0.0.2`.
- Core `git rev-parse HEAD origin/0.0.2` returned `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0` for both refs.
- Core `git rev-list --left-right --count HEAD...origin/0.0.2` returned `0 0`.
- Core `npm test` passed 8 smoke tests.
- ProtoKits `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local and origin at `3d42b72`, ahead/behind `0 0`.
- ProtoKits local `npm run check` failed after 370 syntax-checked modules; `smoke:imports` reported 110 import failures rooted in missing package `nexusengine`.
- ProtoKits local `node tests/dsk-first-wave.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- ProtoKits disposable fetched `origin/0.0.2` failed aggregate and targeted checks on missing package `nexusengine`.
- Experiments `git fetch --prune origin`, status, rev-parse, and ahead/behind checks showed local `57b3d66`, origin `3e047f6`, and ahead/behind `0 2`.
- Experiments local `node tests/dsk-first-wave-experiment-smoke.mjs` failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine` from local ProtoKits `protokits/nexus-dsk-adapter/index.js`.
- Experiments disposable fetched `origin/0.0.2` at `3e047f693f3ed58cab1c362deb09a597398d05e5` passed `npm run check` and failed targeted DSK smoke on missing sibling `NexusEngine/src/index.js`.
- Fetch checks confirmed proof route/raw/CDN files remain public, while runtime dependency paths used by the public page remain 404.
- Playwright CLI opened the public DSK proof route; snapshot showed `Booting...`; console history showed 404s for `NexusEngine/src/index.js`, ProtoKits `domain-foundation`, and ProtoKits `domain-service-kits`.

## Suggested Canonical Updates
- Pick one module-source strategy for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- Make ProtoKits declare or model `nexusengine` resolution explicitly before treating local or fetched ProtoKits validation as release evidence.
- Validate Experiments targeted DSK proof locally and from fetched `origin/0.0.2` with the same module-source strategy intended for public proof.
- Wire `tests/dsk-first-wave-experiment-smoke.mjs` into aggregate Experiments validation or document it as required targeted evidence.
- Update public consumption wording or release policy so docs distinguish GitHub/jsDelivr branch consumption from unavailable npm registry metadata.
- Decide whether core branch `0.0.2` serving package version `0.1.0` is intentional policy or stale metadata.
- Keep query read-model isolation, content-boundary/objective, runtime identity/lifecycle, and composition-proof rows separate from public module-loading proof.

## Knowledge Nodes
- Wrote `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-20T05-11-41-0400-ecosystem-state-node.md`.
- New root lesson: core and ProtoKits are latest-release aligned, but proof remains blocked by module-source strategy; ProtoKits metadata alignment removes one stale-package signal without fixing local/fetched validation, Experiments targeted proof, public browser proof, npm, package-version, or aggregate-vs-targeted proof boundaries.

## Master Tracker Updates
- Added `ecosystem-root-028`.
- Marked `ecosystem-root-027` as superseded by `ecosystem-root-028`.
- Added child branches for ProtoKits aligned-ref package resolution, Experiments targeted proof, public browser proof, aggregate-vs-targeted proof, npm/package-version split, and query read-model hardening separation.

## Not Claimed
- This packet does not edit source, tests, README, package metadata, public claims, release branches, deployments, `.agent`, canonical memory, ProtoKits, or Experiments.
- This packet does not pull, merge, rebase, reset, fast-forward, or publish sibling repos.
- This packet does not publish npm metadata or prove npm installability.
- This packet does not claim ProtoKits local or fetched `origin/0.0.2` validation passed.
- This packet does not claim Experiments local or fetched targeted DSK validation passed.
- This packet does not claim Experiments aggregate validation includes DSK first-wave proof coverage.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not fix GitHub Pages module paths or module-source resolution.
- This packet does not promote ProtoKits into core.
- This packet does not claim query read-model isolation, content-boundary/objective, runtime identity/lifecycle, composition-proof ownership, or runtime failure-boundary rows are fixed.
