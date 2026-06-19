# Knowledge Nodes: dsk_architecture_scout 2026-06-19T00-23-44-0400

## Root Lesson
- id: dsk-state-policy-hardening-root-2026-06-19-0023
- statement: DSK remains release-aligned and test-green, but production promotion now needs one hardening plan that joins namespace safety, install transactions, dependency policy, state contracts, and domain state-machine semantics.
- why it matters: The latest source probes reconfirm install-level blockers, while neighboring bug and idea lanes show promoted DSK graphs can also fail through contradictory terminal states, unenforced transfer constraints, restored-counter drift, repeated input edges, and unclear proof coverage.

## Child Nodes
- id: dsk-namespace-policy-gap-2026-06-19-0023
  parent: dsk-state-policy-hardening-root-2026-06-19-0023
  lesson: Plain-object `engine.n` still permits `__proto__` behavior through the namespace prototype instead of an own property.
  evidence: `src/domain-service-kit.js:143-161` initializes `engine.n = {}` and assigns `engine.n[apiName]`; focused probe returned `own:false`, empty keys, and `protoMarker:"__proto__-api"`.
  look further: Choose null-prototype namespace, explicit reserved-key rejection, own-property assertions, or a combined policy.
- id: dsk-install-transaction-gap-2026-06-19-0023
  parent: dsk-state-policy-hardening-root-2026-06-19-0023
  lesson: DSK install mutates metadata and kit lists before late install/API failures, leaving partial state after an error.
  evidence: `src/runtime-kit.js:135-157` records DSK metadata and pushes kits before `kit.install`; collision probe left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits`.
  look further: Add preflight validation before mutation or wrap all mutable install stages in rollback.
- id: dsk-dependency-policy-gap-2026-06-19-0023
  parent: dsk-state-policy-hardening-root-2026-06-19-0023
  lesson: Composer enforces all `requires` tokens, but direct DSK install still only rejects missing `n:` requirements.
  evidence: `src/game-kit-composer.js:49-76` checks all requires; `src/runtime-kit.js:142-145` filters missing DSK requirements by `token.startsWith("n:")`; focused probe installed a DSK requiring missing `runtime:needed`.
  look further: Decide and test direct-install parity versus composer-only dependency ordering.
- id: dsk-state-contract-gap-2026-06-19-0023
  parent: dsk-state-policy-hardening-root-2026-06-19-0023
  lesson: Reset, snapshot, serialization, and async readiness are still metadata/convention rather than enforceable promoted-DSK interfaces.
  evidence: `src/domain-service-kit.js:131-139` defaults execution metadata; `tests/domain-service-kit-smoke.mjs:113-119` only proves one happy-path JSON-serializable snapshot.
  look further: Define minimal promoted-DSK API/state-adapter requirements before replay, restore, worker, network, or broad service graph claims.
- id: dsk-domain-state-machine-policy-gap-2026-06-19-0023
  parent: dsk-state-policy-hardening-root-2026-06-19-0023
  lesson: Promotion review now needs state-machine fixtures, not only install fixtures.
  evidence: Deep bug node `2026-06-18T23-53-22-0400` reports lost targets completing, transfer constraints ignored, initial progress counts mismatching flags, and held input emitting repeated pressed events; domain idea node `2026-06-19T00-00-19-0400` maps these into state-policy, transfer-policy, input-edge, and proof-coverage inventory.
  look further: Add multi-domain promotion fixtures for terminal states, transfer capacity/accepts/dwell, restored counters, and pressed/held/released input semantics.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T23-23-35-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Keeps the same install-hardening root but adds fresher state-machine policy blockers from neighboring lanes.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T23-53-22-0400-deep-bug-node.md`
- relationship: constrains
- reason: Runtime domain bugs show promoted DSK governance must include terminal-state, transfer, progress, and input semantics.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T00-00-19-0400-domain-kit-idea-node.md`
- relationship: expands
- reason: Converts the latest bug evidence into DSK policy domains and proof-coverage planning inventory.
- source: `state/automation/ecosystem_state_scout/knowledge_nodes/2026-06-19T00-11-28-0400-ecosystem-state-node.md`
- relationship: constrains
- reason: Local branch and proof stability remain separate from browser-complete public proof, npm availability, and package version policy.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T23-39-46-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Proof categories should stay explicit because HTTP-visible routes and local smokes do not equal browser-complete DSK proof.

## Next Search Branches
- branch: DSK hardening fixture plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
- question: What is the smallest test-first plan that locks namespace, transaction, dependency, and state-contract behavior without changing the public DSK shape unnecessarily?
- branch: DSK state-machine promotion gates
- files or folders: `src/assistance-target-kit.js`, `src/transfer-zone-kit.js`, `src/landmark-guidance-kit.js`, `src/environmental-affordance-kit.js`, `src/input-intent-kit.js`, promotion smoke coverage
- question: Which terminal-state, transfer, restored-count, and input-edge invariants must be true before a domain can be promoted as a DSK?
- branch: DSK proof coverage categories
- files or folders: `docs/described_examples.md`, `docs/domain_ideas.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger
- question: How should promotion evidence distinguish local, aggregate, raw-public, CDN, npm, and browser-complete proof?

## Not Claimed
- This node does not fix bugs, add tests, edit public docs, promote ProtoKits, publish npm metadata, or prove browser-complete public DSK proof.
