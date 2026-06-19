# Knowledge Nodes: dsk_architecture_scout 2026-06-19T01-24-20-0400

## Root Lesson
- id: dsk-promotion-policy-hardening-root-2026-06-19-0124
- statement: DSK remains release-aligned and test-green, but production promotion now needs hardening fixtures that combine namespace, install, dependency, state-contract, accepted-mutation, idempotency, time, and config policy.
- why it matters: Current DSK probes reconfirm install-level blockers, while the latest bug and idea lanes show promoted domains can also fail through pre-acceptance side effects, repeated completion events, lost large-delta progress, and non-finite config state.

## Child Nodes
- id: dsk-namespace-policy-gap-2026-06-19-0124
  parent: dsk-promotion-policy-hardening-root-2026-06-19-0124
  lesson: Plain-object `engine.n` still permits `__proto__` behavior through the namespace prototype instead of an own property.
  evidence: `src/domain-service-kit.js:143-161` initializes `engine.n = {}` and assigns `engine.n[apiName]`; focused probe returned `own:false`, empty keys, and `protoMarker:"__proto__-api"`.
  look further: Choose null-prototype namespace, explicit reserved-key rejection, own-property assertions, or a combined policy.
- id: dsk-install-transaction-gap-2026-06-19-0124
  parent: dsk-promotion-policy-hardening-root-2026-06-19-0124
  lesson: DSK install mutates metadata and kit lists before late install/API failures, leaving partial state after an error.
  evidence: `src/runtime-kit.js:135-157` records DSK metadata and pushes kits before `kit.install`; collision probe left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`.
  look further: Add preflight validation before mutation or wrap all mutable install stages in rollback.
- id: dsk-dependency-policy-gap-2026-06-19-0124
  parent: dsk-promotion-policy-hardening-root-2026-06-19-0124
  lesson: Composer enforces all `requires` tokens, but direct DSK install still only rejects missing `n:` requirements.
  evidence: `src/game-kit-composer.js:49-76` checks all requires; `src/runtime-kit.js:142-145` filters missing DSK requirements by `token.startsWith("n:")`; focused probe installed a DSK requiring missing `runtime:needed`.
  look further: Decide and test direct-install parity versus composer-only dependency ordering.
- id: dsk-state-contract-gap-2026-06-19-0124
  parent: dsk-promotion-policy-hardening-root-2026-06-19-0124
  lesson: Reset, snapshot, serialization, and async readiness are still metadata/convention rather than enforceable promoted-DSK interfaces.
  evidence: `src/domain-service-kit.js:131-139` defaults execution metadata; `tests/domain-service-kit-smoke.mjs:113-119` only proves one happy-path JSON-serializable snapshot.
  look further: Define minimal promoted-DSK API/state-adapter requirements before replay, restore, worker, network, or broad service graph claims.
- id: dsk-service-call-policy-gap-2026-06-19-0124
  parent: dsk-promotion-policy-hardening-root-2026-06-19-0124
  lesson: Promotion review now needs service-call policy fixtures, not only install and terminal-state fixtures.
  evidence: Deep bug node `2026-06-19T00-54-03-0400` reports objective reset leakage, repeated completion events, lifecycle costs before accepted starts, transport under-travel on large deltas, and schedule `NaN` scale; domain idea node `2026-06-19T01-00-48-0400` maps these into accepted mutation, completion idempotency, simulation time, and config normalization.
  look further: Add multi-domain promotion fixtures for accepted/rejected receipts, one-shot completion, large-delta catch-up, and finite config normalization.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-19T00-23-44-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Keeps the same DSK hardening root but adds fresher accepted-mutation, idempotency, time, and config blockers from neighboring lanes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-19T00-54-03-0400-deep-bug-node.md`
- relationship: constrains
- reason: Runtime domain bugs show promoted DSK governance must include reset/idempotency, accepted mutation, large-delta, and config semantics.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T01-00-48-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts the latest bug evidence into accepted mutation, completion idempotency, time policy, and config policy planning inventory.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T01-11-04-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Release alignment and validation-green status remain separate from sibling dirt, public-browser proof, npm availability, and package-version policy.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T23-39-46-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Proof categories should stay explicit because HTTP-visible routes and local smokes do not equal browser-complete DSK proof.

## Next Search Branches
- branch: DSK promotion policy fixture plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `src/objective-flow-kit.js`, `src/lifecycle-progression-kit.js`, `src/transport-route-kit.js`, `src/schedule-kit.js`, smoke coverage
- question: What is the smallest test-first plan that locks namespace, transaction, dependency, state-contract, accepted-mutation, idempotency, time, and config behavior before promotion language expands?
- branch: DSK install hardening fixture plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
- question: Which namespace, rollback, direct dependency, and provider diagnostics should be fixed before DSKs scale?
- branch: DSK proof coverage categories
- files or folders: `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger
- question: How should promotion evidence distinguish local, aggregate, raw-public, CDN, npm, and browser-complete proof?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, or prove browser-complete public DSK proof.
