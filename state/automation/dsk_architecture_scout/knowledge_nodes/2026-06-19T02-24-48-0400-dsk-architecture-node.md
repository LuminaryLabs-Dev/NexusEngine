# Knowledge Nodes: dsk_architecture_scout 2026-06-19T02-24-48-0400

## Root Lesson
- id: dsk-operations-data-integrity-root-2026-06-19-0224
- statement: DSK remains release-aligned and test-green, but production promotion now needs one hardening fixture plan that joins install safety, service-call policy, and operations data integrity.
- why it matters: Current DSK probes reconfirm namespace, transaction, and dependency blockers, while fresh operations probes show promoted service graphs can also fail through mutable authored config, duplicate generated ids, non-finite ledger mutations, and contradictory restored state.

## Child Nodes
- id: dsk-namespace-policy-gap-2026-06-19-0224
  parent: dsk-operations-data-integrity-root-2026-06-19-0224
  lesson: Plain-object `engine.n` still permits `__proto__` behavior through the namespace prototype instead of an own property.
  evidence: `src/domain-service-kit.js:143-161` initializes `engine.n = {}` and assigns `engine.n[apiName]`; focused probe returned `own:false`, empty keys, and `protoMarker:"__proto__-api"`.
  look further: Choose null-prototype namespace, explicit reserved-key rejection, own-property assertions, or a combined policy.
- id: dsk-install-transaction-gap-2026-06-19-0224
  parent: dsk-operations-data-integrity-root-2026-06-19-0224
  lesson: DSK install mutates metadata and kit lists before late install/API failures, leaving partial state after an error.
  evidence: `src/runtime-kit.js:135-157` records DSK metadata and pushes kits before `kit.install`; collision probe left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`.
  look further: Add preflight validation before mutation or wrap all mutable install stages in rollback.
- id: dsk-dependency-policy-gap-2026-06-19-0224
  parent: dsk-operations-data-integrity-root-2026-06-19-0224
  lesson: Composer enforces all `requires` tokens, but direct DSK install still only rejects missing `n:` requirements.
  evidence: `src/game-kit-composer.js:49-76` checks all requires; `src/runtime-kit.js:142-145` filters missing DSK requirements by `token.startsWith("n:")`; focused probe installed a DSK requiring missing `runtime:needed`.
  look further: Decide and test direct-install parity versus composer-only dependency ordering.
- id: dsk-state-contract-gap-2026-06-19-0224
  parent: dsk-operations-data-integrity-root-2026-06-19-0224
  lesson: Reset, snapshot, serialization, and async readiness are still metadata/convention rather than enforceable promoted-DSK interfaces.
  evidence: `src/domain-service-kit.js:131-139` defaults execution metadata; `tests/domain-service-kit-smoke.mjs:113-119` only proves one happy-path JSON-serializable snapshot.
  look further: Define minimal promoted-DSK API/state-adapter requirements before replay, restore, worker, network, or broad service graph claims.
- id: dsk-operations-data-integrity-gap-2026-06-19-0224
  parent: dsk-operations-data-integrity-root-2026-06-19-0224
  lesson: Promotion review now needs operations data integrity fixtures, not only install and service-call fixtures.
  evidence: Probes confirmed OccupantFlow reset reused mutated spawn-rule timing, generated ids duplicated `occupant-1`, Facility/Economy committed non-finite ledger state, and ResourcePressure exposed contradictory depletion flags; deep bug node `2026-06-19T01-53-53-0400` records the same class.
  look further: Add promotion fixtures for immutable authored config, collision-free generated ids, finite ledger mutations, and initial/restored state consistency.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T01-24-20-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Keeps the same DSK hardening root but adds operations data integrity blockers from fresher neighboring lanes and live probes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T01-53-53-0400-deep-bug-node.md`
- relationship: constrains
- reason: Runtime operations bugs show promoted DSK governance must include immutable config, identity, finite transactions, and restored-state consistency.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T02-02-08-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts the latest operations bug evidence into operations data integrity planning inventory.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-19T01-44-00-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Proof gates remain split across local targeted proof, aggregate checks, public browser completion, sibling cleanliness, and npm availability.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T01-11-04-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Branch alignment and validation-green status remain separate from sibling dirt, browser proof, npm metadata, and version policy.

## Next Search Branches
- branch: DSK promotion hardening fixture plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/objective-flow-kit.js`, `src/lifecycle-progression-kit.js`, `src/transport-route-kit.js`, `src/schedule-kit.js`, `src/occupant-flow-kit.js`, `src/facility-operations-kit.js`, `src/economy-kit.js`, `src/resource-pressure-kit.js`, smoke coverage
- question: What is the smallest test-first plan that locks namespace, transaction, dependency, state-contract, service-call, and operations data integrity behavior before promotion language expands?
- branch: DSK install hardening fixture plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
- question: Which namespace, rollback, direct dependency, and provider diagnostics should be fixed before DSKs scale?
- branch: DSK operations data integrity gates
- files or folders: `src/occupant-flow-kit.js`, `src/facility-operations-kit.js`, `src/economy-kit.js`, `src/resource-pressure-kit.js`, operations smoke coverage
- question: Which immutable-config, stable-id, finite-transaction, and restored-state invariants must be true before operations domains are promoted as DSKs?
- branch: DSK proof coverage categories
- files or folders: `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger
- question: How should promotion evidence distinguish local, aggregate, raw-public, CDN, npm, and browser-complete proof?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, clean sibling worktrees, or prove browser-complete public DSK proof.
