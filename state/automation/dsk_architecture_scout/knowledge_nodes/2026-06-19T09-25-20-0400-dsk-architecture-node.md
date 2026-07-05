# Knowledge Nodes: dsk_architecture_scout 2026-06-19T09-25-20-0400

## Root Lesson
- id: dsk-source-state-fixture-root-2026-06-19-0925
- statement: DSK remains release-aligned and test-green, but promotion fixtures must now include source-state integrity: authored-source isolation, reset-source guarantees, retention-limit normalization, and initial terminal-state receipts alongside namespace, install, dependency, state-contract, service-call, operations, spatial/mobility, receipt, bridge, step, and wrapper-state gates.
- why it matters: Fresh source and probe evidence shows dataset-heavy services can mutate caller-authored nested config and reset from that mutated source, economy retention can keep evidence when asked to keep none, and pursuit-pressure scenarios can begin terminal by band without terminal or recovery receipts.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Core still matches the latest release branch, so the new source-state conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat prior packet commit hashes as context only.
- id: dsk-install-hardening-unchanged-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Namespace, failed-install transaction, and direct dependency policy blockers remain unchanged on the live checkout.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late install hooks; `src/runtime-kit.js:142-145` still filters missing direct DSK requirements to `n:` tokens; probe returned `own:false`, retained `n-late-collision-kit` after collision, and installed a kit requiring missing `runtime:needed`.
  look further: Add fixtures for reserved API names, install rollback, and direct-install dependency policy before new DSK promotion claims.
- id: dsk-authored-source-isolation-gap-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Dataset-heavy services need clone/freeze isolation so runtime state cannot mutate caller-authored nested config.
  evidence: `src/water-surface-kit.js:11-25`, `src/route-field-kit.js:11-31`, and `src/render-descriptor-kit.js:10-24` keep nested caller objects; probe changed WaterSurface tags to `["safe","runtime"]`, RouteField tags to `["route","runtime"]`, and RenderDescriptor material tags to `["visual","runtime"]`.
  look further: Add authored-source isolation fixtures for dataset-heavy services before reset, replay, restore, or proof snapshots are trusted.
- id: dsk-reset-source-policy-gap-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Reset APIs need an explicit source policy that separates authored config, restored state, runtime state, and reset output.
  evidence: `src/water-surface-kit.js:97-99` and `src/route-field-kit.js:78-80` rebuild from captured config; after runtime nested metadata mutation, reset output preserved the mutated tags.
  look further: Add reset-source fixtures that mutate runtime state, reset, and assert caller config plus reset output remain clean or document shared mutable datasets.
- id: dsk-retention-limit-policy-gap-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Economy, telemetry, and proof-history services need shared zero, negative, and non-finite retention-limit semantics.
  evidence: `src/economy-kit.js:56` applies `.slice(-Number(request.ledgerLimit ?? 120))`; probe showed `ledgerLimit:0` retained one transaction, `transaction-1`.
  look further: Decide whether zero retention means no entries, invalid config, or a documented minimum before ledger/proof rows are promoted.
- id: dsk-initial-terminal-receipt-gap-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Pressure and recovery domains need initial terminal-state derivation and receipt policy before they gate scenario proof.
  evidence: `src/pursuit-pressure-kit.js:28-42` derives `band` from `startDistance` but sets `caught:false`; probe started `{band:"caught", caught:false, distance:5}`, ticked to `{band:"danger", caught:false, distance:10}`, and observed `caughtBatches:0`, `recoveredBatches:0`.
  look further: Define install/reset receipts or normalized starting state for initially caught/lost/completed services.
- id: dsk-proof-boundary-still-separated-2026-06-19-0925
  parent: dsk-source-state-fixture-root-2026-06-19-0925
  lesson: Source-state hardening remains separate from public browser proof, aggregate validation, and npm/public distribution.
  evidence: Ecosystem state node `2026-06-19T09-12-09-0400` keeps Experiments latest-ref validation, browser-complete public proof, aggregate DSK smoke coverage, npm metadata, package-version policy, and DSK hardening/source-state gates open.
  look further: Keep runtime hardening fixtures, targeted proof, aggregate validation, npm availability, and browser-complete public proof as separate evidence categories.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T08-23-23-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves bridge phase, step receipt, and wrapper-state fixture gates but adds source-state integrity from fresher neighboring lanes and live probes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T08-56-02-0400-deep-bug-node.md`
- relationship: constrains
- reason: Dataset/reset, ledger retention, and pursuit initial-state bugs are now DSK promotion fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T09-00-53-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts source-state bugs into authored-source, reset-source, retention-limit, initial-terminal, and proof-row planning inventory.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T09-12-09-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Public proof, aggregate proof, npm metadata, package-version policy, and DSK hardening/source-state gates remain separate.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T08-48-39-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Targeted local proof is not enough to claim latest-ref, aggregate, browser-complete, or runtime-hardening proof.

## Next Search Branches
- branch: DSK promotion hardening fixture plan
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, selected domain kits, smoke coverage
  question: What is the smallest executable fixture set that locks namespace, install rollback, dependency policy, reset/snapshot contract, service-call policy, operations data, spatial/mobility invariants, receipt integrity, bridge phase, wrapper state, and source-state integrity?
- branch: authored-source-and-reset-fixtures
  files or folders: `src/water-surface-kit.js`, `src/route-field-kit.js`, `src/render-descriptor-kit.js`, dataset-heavy kits
  question: Which services keep caller-owned nested objects in runtime state, and should they clone, freeze, or clone-plus-freeze authored datasets?
- branch: retention-limit-fixtures
  files or folders: `src/economy-kit.js`, `src/telemetry-kit.js`, proof/history ledger surfaces
  question: Which zero, negative, non-finite, and positive retention rows must pass before ledger/proof snapshots are trusted?
- branch: initial-terminal-receipt-fixtures
  files or folders: `src/pursuit-pressure-kit.js`, recovery/objective/scenario pressure kits
  question: Which domains can start terminal and need install/reset receipts or normalized non-terminal starting state?
- branch: public-proof-separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof`, sibling fetched refs, public CDN/raw URLs
  question: Which evidence belongs to runtime hardening versus browser-complete public proof and aggregate validation?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, wire aggregate DSK proof, fix public proof routes, or prove browser-complete public DSK proof.
