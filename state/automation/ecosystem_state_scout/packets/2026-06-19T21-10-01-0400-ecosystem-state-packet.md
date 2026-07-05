# Ecosystem State Packet: 2026-06-19T21-10-01-0400

## Scope
- Audit NexusEngine ecosystem state across core, ProtoKits, Experiments, DSK promotion ledgers, branch targets, public links, and proof paths.
- Lane is advisory only. It writes only this packet, one knowledge node, and the lane tracker update.

## Lane Goal
- Audit NexusEngine ecosystem state, drift, and proof readiness.

## Prior State Context
- Previous ecosystem root: `ecosystem-root-022`.
- Previous lesson: core was current and validation-green, but distribution proof remained blocked by module-source strategy; ProtoKits fetched `origin/0.0.2` was 26 commits ahead of local, Experiments was 24 commits ahead of local, and public browser proof stalled at `Booting...`.
- Neighboring lanes now add AR/spatial read-model inventory after compatibility/content-safety:
  - DSK architecture node `2026-06-19T20-24-13-0400` keeps runtime failure-boundary, lifecycle parity, query/command semantics, experience-edge, read-model/orchestration, compatibility/content-safety, proof taxonomy, and module-source proof separate.
  - Ecosystem proof node `2026-06-19T20-39-49-0400` keeps local available-checkout proof separate from fetched-ref, aggregate, targeted, browser, npm, package-version, and hardening proof claims.
  - Deep bug node `2026-06-19T20-53-37-0400` adds AR launch preconditions, AR support-state aliasing, explicit preferred-mode fallback policy, and SpatialRoom getter aliasing.
  - Domain idea node `2026-06-19T21-01-07-0400` converts AR launch and SpatialRoom rows into planning inventory, not distribution proof.
- State packets were context only. Live source, docs, tests, git refs, public URLs, and Playwright launch state were treated as authority.

## Agent Workspace State
- Used `agent-it` mentality and read `.agent/start-here.md`, `.agent/operating-model.md`, `.agent/automation-rules.md`, `.agent/report-format.md`, `.agent/AGENT_MEMORY.md`, `.agent/CHANGE_LOG.md`, and `memory.md`.
- Repo-level `AGENTS.md` file is absent; user-provided AGENTS instructions were treated as active turn instructions.
- Used Human View Orchestration. Mandatory question: Have I checked what the human would actually see, and do I need screenshots, visual inspection, launch-state inspection, or before/after comparison to validate this properly? Answer: yes; launch-state inspection is required because the public proof route is user-visible and can be HTTP 200 while stuck.
- Used Playwright CLI wrapper. Snapshot showed heading `DSK first-wave proof` plus visible `Booting...`; wrapper reported four console errors.
- Playwright scratch files and disposable fetched-ref extraction folders from this run were removed.
- No source, tests, public docs, package metadata, deployment files, `.agent`, or canonical repo memory files were edited by this lane.

## Latest Branch Preflight
- Command: `npm run automation:preflight`
- UTC timestamp: `2026-06-20T01:07:47.954Z`
- latest remote release branch: `0.0.2`
- compare target: `0.0.2`
- current branch: `0.0.2`
- branch status: `current-is-latest-release-branch`
- required public links: pass
- optional npm metadata: 404
- package metadata: `nexusengine@0.1.0`
- core `HEAD`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- core `origin/0.0.2`: `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`
- core ahead/behind: `0 0`

## Public Links Checked
- `https://github.com/LuminaryLabs-Dev/NexusEngine` -> 200 by preflight
- `https://raw.githubusercontent.com/LuminaryLabs-Dev/NexusEngine/0.0.2/package.json` -> 200 by preflight
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Dev/NexusEngine@0.0.2/src/index.js` -> 200 by preflight
- `https://registry.npmjs.org/nexusengine` -> 404, optional preflight link
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/experiments/dsk-first-wave-proof/` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/index.html` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-Experiments/0.0.2/experiments/dsk-first-wave-proof/src/proof.js` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/docs/DSK-FIRST-WAVE-LEDGER.md` -> 200
- `https://raw.githubusercontent.com/LuminaryLabs-Agents/NexusEngine-ProtoKits/0.0.2/protokits/nexus-dsk-adapter/index.js` -> 200
- `https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusEngine-ProtoKits@0.0.2/protokits/scan-survey-kit/index.js` -> 200
- `https://luminarylabs-agents.github.io/NexusEngine/src/index.js` -> 404
- `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-foundation/index.js` -> 404
- `https://luminarylabs-agents.github.io/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js` -> 404
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine/src/index.js` -> 404
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-foundation/index.js` -> 404
- `https://luminarylabs-agents.github.io/NexusEngine-Experiments/NexusEngine-ProtoKits/protokits/domain-service-kits/index.js` -> 404
- Playwright opened the public proof route. Human-visible state remained heading `DSK first-wave proof` with status `Booting...`; console evidence reported four errors.

## Files Inspected
- `.agent/start-here.md`
- `.agent/operating-model.md`
- `.agent/automation-rules.md`
- `.agent/report-format.md`
- `.agent/AGENT_MEMORY.md`
- `.agent/CHANGE_LOG.md`
- `memory.md`
- `README.md`
- `package.json`
- `docs/described_examples.md`
- `docs/domain_ideas.md`
- `docs/kits_ideas.md`
- `docs/how-to-protokit.md`
- `docs/how-to-experiment.md`
- `src/index.js`
- `src/domain-service-kit.js`
- `tests/`
- `state/automation/KNOWLEDGE_NODE_CONTRACT.md`
- `state/automation/ecosystem_state_scout/PROMPT.md`
- `state/automation/ecosystem_state_scout/master_ecosystem_state.md`
- latest ecosystem state packets/nodes: `2026-06-19T18-09-41-0400`, `2026-06-19T19-10-05-0400`, `2026-06-19T20-10-14-0400`
- latest neighboring packet/node sets from `dsk_architecture_scout`, `ecosystem_proof_scout`, `deep_bug_report_scout`, and `domain_kit_idea_expander`
- sibling package metadata and DSK proof files in `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits` and `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments`

## Ecosystem Findings
- Core remains current on the preflight-resolved latest release branch and `npm test` passed 8 smoke tests.
- Core worktree still has pre-existing modified/untracked automation and planning files. This run did not touch them except the allowed ecosystem state tracker plus new packet/node.
- Local available-checkout proof remains green:
  - ProtoKits `npm run check` passed.
  - ProtoKits `node tests/dsk-first-wave.test.mjs` passed.
  - Experiments `node tests/dsk-first-wave-experiment-smoke.mjs` passed.
- Sibling latest-ref drift is unchanged from the prior ecosystem run:
  - ProtoKits local `HEAD` is `40d70b9`; fetched `origin/0.0.2` is `f0fa45a75eea2c4b88683fe3bf146b0453812820`; ahead/behind is `0 26`.
  - Experiments local `HEAD` is `6d90b9b`; fetched `origin/0.0.2` is `799fad882461502faa84b132f70de011e7dbe0cb`; ahead/behind is `0 24`.
- Detached fetched-ref proof is still blocked by module-source strategy:
  - ProtoKits fetched `origin/0.0.2` failed `npm run check` during `smoke:imports` after checking 311 JavaScript modules, with 110 import failures rooted in `ERR_MODULE_NOT_FOUND` for package `nexusengine` from `protokits/nexus-dsk-adapter/index.js`.
  - ProtoKits fetched targeted `node tests/dsk-first-wave.test.mjs` failed because package `nexusengine` was not resolvable.
  - Experiments fetched `origin/0.0.2` aggregate `npm run check` passed in a disposable tree, generated 100 flat routes, and included `tropical-island-scene-static-smoke`.
  - Experiments fetched targeted `node tests/dsk-first-wave-experiment-smoke.mjs` failed because `experiments/dsk-first-wave-proof/src/proof.js` resolved `../../../../NexusEngine/src/index.js` to missing `/private/tmp/NexusEngine/src/index.js`.
- Public proof is still HTTP-visible but browser-incomplete:
  - The proof route returns 200 and renders heading text.
  - Human-visible Playwright state remains `Booting...`.
  - Deployed sibling module paths still return 404.
- Package policy remains unresolved:
  - Latest release branch is `0.0.2`.
  - Local and public raw `package.json` report version `0.1.0`.
  - npm registry metadata remains unavailable.

## Domain And Kit Expansion Signals
- Core/ProtoKits/Experiments ownership remains consistent: core owns runtime, ECS, scheduler, DSK contract, composer, stable primitives, and validation invariants; ProtoKits owns reusable domain implementations; Experiments owns playable/browser proof routes.
- New neighboring hardening inventory is AR/spatial read-model proof:
  - AR launch preconditions when `createARKit()` is missing.
  - AR preferred-mode fallback policy for explicit unsupported/unknown modes.
  - AR launcher support-state snapshot isolation.
  - SpatialRoom getter isolation for active buildings and anchors.
- This inventory is useful for future executable fixtures, but it does not change the current distribution proof blocker.

## Evidence
- `npm run automation:preflight` -> passed; latest branch `0.0.2`; required public links OK; npm metadata 404.
- `git status --short --branch` in core -> `## 0.0.2...origin/0.0.2` plus pre-existing modified/untracked automation and planning files.
- `git rev-parse HEAD origin/0.0.2` in core -> both `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`.
- `git rev-list --left-right --count HEAD...origin/0.0.2` in core -> `0 0`.
- `npm test` in core -> passed 8 smoke tests.
- ProtoKits status after fetch -> `## 0.0.2...origin/0.0.2 [behind 26]`; local `40d70b93bef6a0e88dadc48067aa4fd2844284f8`, origin `f0fa45a75eea2c4b88683fe3bf146b0453812820`, ahead/behind `0 26`.
- ProtoKits local `npm run check` -> passed; checked 294 JavaScript modules and imported 236 ProtoKit index modules.
- ProtoKits local `node tests/dsk-first-wave.test.mjs` -> passed.
- ProtoKits fetched-ref disposable `npm run check` -> failed; fetched ref `f0fa45a75eea2c4b88683fe3bf146b0453812820`; 110 import smoke failures rooted in missing package `nexusengine`.
- ProtoKits fetched-ref disposable `node tests/dsk-first-wave.test.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for package `nexusengine`.
- Experiments status after fetch -> `## 0.0.2...origin/0.0.2 [behind 24]`; local `6d90b9b01a5aeac0209a2c8f2ce30f670be92a9f`, origin `799fad882461502faa84b132f70de011e7dbe0cb`, ahead/behind `0 24`.
- Experiments local `node tests/dsk-first-wave-experiment-smoke.mjs` -> passed.
- Experiments fetched-ref disposable `npm run check` -> passed; generated 100 flat experiment route wrappers.
- Experiments fetched-ref disposable `node tests/dsk-first-wave-experiment-smoke.mjs` -> failed with `ERR_MODULE_NOT_FOUND` for `/private/tmp/NexusEngine/src/index.js`.
- `curl` public proof route/raw/CDN checks -> proof/raw/CDN files 200, deployed sibling module paths 404.
- Playwright launch-state inspection -> visible `Booting...`; four console errors.

## Suggested Canonical Updates
- Decide one module-source model for release proof: package/workspace dependency, CDN `0.0.2`, same-origin deployed assets, or build-step import maps.
- After that decision, align all three proof surfaces to it:
  - ProtoKits fetched-ref validation
  - Experiments fetched-ref targeted DSK validation
  - public browser proof route
- Keep AR/spatial read-model hardening separate from module-source proof. It should become fixture inventory, not a replacement distribution gate.

## Knowledge Nodes
- Write `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T21-10-01-0400-ecosystem-state-node.md`.
- New root id: `ecosystem-root-023`.

## Master Tracker Updates
- Add `ecosystem-root-023`.
- Mark `ecosystem-root-022` superseded by the current run.
- Add/update branch focus for `module-source-strategy`, `protokits-fetched-ref-drift`, `experiments-targeted-dsk-fetched-ref`, `public-proof-import-shape`, `ar-spatial-read-model-hardening`, npm metadata, and package-version policy.

## Not Claimed
- This packet does not fix, publish, pull, merge, rebase, deploy, or update public claims.
- This packet does not edit source, tests, public docs, package metadata, `.agent`, `memory.md`, ProtoKits, or Experiments.
- This packet does not claim ProtoKits fetched `origin/0.0.2` passed validation.
- This packet does not claim Experiments fetched `origin/0.0.2` passed targeted DSK validation.
- This packet does not claim Experiments aggregate validation covers DSK first-wave proof.
- This packet does not claim the public DSK proof works in-browser.
- This packet does not prove npm installability.
- This packet does not promote ProtoKits into core.
- This packet does not claim AR/spatial read-model rows are fixed.
