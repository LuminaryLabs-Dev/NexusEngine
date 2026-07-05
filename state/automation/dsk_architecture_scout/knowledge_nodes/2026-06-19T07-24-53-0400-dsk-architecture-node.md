# Knowledge Nodes: dsk_architecture_scout 2026-06-19T07-24-53-0400

## Root Lesson
- id: dsk-receipt-integrity-fixture-root-2026-06-19-0724
- statement: DSK remains release-aligned and test-green, but promotion fixtures must now include receipt identity, event idempotency, claim policy, and request identity alongside namespace, install, dependency, state-contract, service-call, operations data, and spatial/mobility gates.
- why it matters: Fresh source and probe evidence shows domain APIs can keep state mostly correct while corrupting result ids, repeating events, or generating duplicate request ids; those receipts feed telemetry, replay, rewards, logistics, and public proof rows.

## Child Nodes
- id: dsk-release-aligned-still-context-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Core still matches the latest release branch, so the new DSK conclusion is not caused by branch drift.
  evidence: `npm run automation:preflight` resolved `latestReleaseBranch: 0.0.2`; `HEAD` and `origin/0.0.2` both resolved to `96a0c16340c50832cdb5c4c81101b87b3f0c6fa0`; ahead/behind was `0 0`; `npm test` passed 8 smoke tests.
  look further: Keep resolving latest release branch every run and treat prior packet commit hashes as context only.
- id: dsk-install-hardening-unchanged-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Namespace, failed-install transaction, and direct dependency policy blockers remain unchanged on the live checkout.
  evidence: `src/domain-service-kit.js:143-161` still uses plain-object `engine.n` and late API assignment; `src/runtime-kit.js:135-157` still records DSK metadata and pushes kits before late install hooks; `src/runtime-kit.js:142-145` still filters missing direct DSK requirements to `n:` tokens; focused probe returned `own:false` for `__proto__`, retained `n-late-collision-kit` after collision, and installed a kit requiring missing `runtime:needed`.
  look further: Add fixtures for reserved API names, install rollback, and direct-install dependency policy before new DSK promotion claims.
- id: dsk-receipt-id-separation-gap-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Timing/action services need result receipt ids that cannot be overwritten by query/window snapshot fields.
  evidence: `src/timing-window-kit.js:49-58` returns active window snapshots with `id: window.id`; `src/timing-window-kit.js:72-78` assigns action result `id`, then spreads the active window object afterward; focused probe returned result id `strike` and window id `strike` for a generated action receipt.
  look further: Decide whether result id separation is a DSK fixture section, a receipt-identity ProtoKit, or both.
- id: dsk-event-and-claim-idempotency-gap-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Interaction and reward services need transition-only event emission or explicit already-complete/already-claimed receipts.
  evidence: `src/interaction-target-kit.js:56-66` lets explicit target input mutate already-complete targets and emits completion whenever `target.complete` is true; probe returned completion batches `[["switch-a"], ["switch-a"]]`. `src/collectible-kit.js:43-49` and `src/collectible-kit.js:73-79` emit `CollectibleClaimed` without checking whether state changed; probe returned claim batches `[["coin-a"], ["coin-a"]]` while collected state stayed `["coin-a"]`.
  look further: Define duplicate event policy: silent suppression, rejected receipt, or explicit duplicate/unchanged receipt.
- id: dsk-request-identity-gap-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Request/logistics services need generated id allocation that is collision-free across authored, restored, and manually created requests.
  evidence: `src/request-fulfillment-kit.js:14-26` generates fallback ids as `request-${index + 1}` and `src/request-fulfillment-kit.js:98-104` creates manual requests from current array length; probe returned created id `request-2` and ids `["request-2", "request-2"]`.
  look further: Add generated-id fixtures before request, route, cargo, reward, or logistics DSK promotion language expands.
- id: dsk-proof-boundary-updated-2026-06-19-0724
  parent: dsk-receipt-integrity-fixture-root-2026-06-19-0724
  lesson: Sibling latest-ref validation is green for this run, but public browser proof and aggregate DSK proof coverage remain separate from DSK hardening.
  evidence: Ecosystem state node `2026-06-19T07-11-00-0400` says core, ProtoKits, and Experiments are clean/aligned and validation-green; ecosystem proof node `2026-06-19T06-46-32-0400` and state node `2026-06-19T07-11-00-0400` keep public proof at `Booting...`, aggregate DSK smoke coverage incomplete, npm metadata unavailable, and DSK hardening gates open.
  look further: Keep distribution proof, aggregate validation, and runtime-hardening fixture proof as separate review gates.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T06-24-24-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Preserves the spatial/mobility fixture root but adds receipt integrity gates from fresher bug and idea lanes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T06-53-41-0400-deep-bug-node.md`
- relationship: constrains
- reason: Timing receipt id overwrite, repeated interaction completion, duplicate collectible claims, and request id collisions are now DSK promotion fixture inputs.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T07-01-13-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts receipt bugs into receipt identity, event idempotency, claim policy, request identity, and proof-row planning inventory.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T07-11-00-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Sibling latest-ref validation is no longer the active blocker for this run, but public proof, aggregate DSK smoke, npm, package-version, and hardening gates remain open.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T06-46-32-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Public browser proof and aggregate DSK smoke gaps remain separate from runtime invariant hardening.

## Next Search Branches
- branch: DSK promotion hardening fixture plan
  files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`, selected domain smoke coverage
  question: What is the smallest executable fixture set that locks namespace, install rollback, dependency policy, reset/snapshot contract, service-call policy, operations data, spatial/mobility invariants, and receipt integrity?
- branch: receipt-identity-and-event-idempotency-fixtures
  files or folders: `src/timing-window-kit.js`, `src/interaction-target-kit.js`, `src/collectible-kit.js`, `src/request-fulfillment-kit.js`, smoke coverage
  question: Which result identity, completion event, claim event, and request id rows must pass before timing, interaction, reward, or logistics DSK promotion?
- branch: spatial-mobility-fixtures
  files or folders: `src/spatial-scale-kit.js`, `src/scenario-duration-kit.js`, `src/hazard-field-kit.js`, `src/vehicle-dynamics-kit.js`, smoke coverage
  question: Which transition receipts, immediate thresholds, generated hazard ids, and resource capacity rules must pass before spatial/mobility DSK promotion?
- branch: public-proof-separation
  files or folders: `/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments/experiments/dsk-first-wave-proof`, sibling fetched refs, public CDN/raw URLs
  question: Which evidence belongs to runtime hardening versus browser-complete public proof and aggregate validation?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, wire aggregate DSK proof, fix public proof routes, or prove browser-complete public DSK proof.
