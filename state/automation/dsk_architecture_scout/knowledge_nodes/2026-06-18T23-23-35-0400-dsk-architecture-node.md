# Knowledge Nodes: dsk_architecture_scout 2026-06-18T23-23-35-0400

## Root Lesson
- id: dsk-governance-hardening-root-2026-06-18-2323
- statement: DSK remains release-aligned and test-green, but broad production use now needs a governance-hardening plan for namespace safety, install transactions, dependency policy, state contracts, and cross-domain event handoff.
- why it matters: The latest idea and bug lanes show that future DSK graphs will be larger than first-wave examples; without governance rules, service graphs can install partially, hide missing providers, expose unsafe APIs, or behave differently by install order.

## Child Nodes
- id: dsk-namespace-policy-gap-2026-06-18-2323
  parent: dsk-governance-hardening-root-2026-06-18-2323
  lesson: Plain-object `engine.n` still permits `__proto__` API behavior through the namespace prototype instead of an own property.
  evidence: `src/domain-service-kit.js:143-161` initializes `engine.n = {}` and assigns `engine.n[apiName]`; focused probe returned `own:false`, empty keys, and `protoMarker:"__proto__-api"`.
  look further: Choose null-prototype namespace plus own-property assertions, explicit reserved-key rejection, or both.
- id: dsk-install-transaction-gap-2026-06-18-2323
  parent: dsk-governance-hardening-root-2026-06-18-2323
  lesson: DSK install still mutates domain metadata, bindings, kit lists, world state, registries, scheduler, sequence runtimes, and API namespace in stages without transaction rollback.
  evidence: `src/runtime-kit.js:135-157` records DSK metadata and pushes kits before `kit.install`; collision probe left `n-late-collision-kit` in `engine.kits` and `engine.domainServiceKits` after `engine.n` collision.
  look further: Add preflight validation before mutation or wrap mutable install stages in rollback.
- id: dsk-dependency-policy-gap-2026-06-18-2323
  parent: dsk-governance-hardening-root-2026-06-18-2323
  lesson: Composer enforces all declared `requires` tokens, but direct DSK install only checks missing tokens that start with `n:`.
  evidence: `src/game-kit-composer.js:49-76` checks all requires against available providers; `src/runtime-kit.js:142-145` filters missing DSK requirements with `token.startsWith("n:")`; focused probe installed a DSK requiring missing `runtime:needed`.
  look further: Decide direct-install parity versus composer-only dependency ordering and encode the decision in tests/docs.
- id: dsk-state-contract-governance-gap-2026-06-18-2323
  parent: dsk-governance-hardening-root-2026-06-18-2323
  lesson: Reset, snapshot, serialization, and async readiness remain metadata/convention rather than enforceable promoted-DSK contracts.
  evidence: `src/domain-service-kit.js:131-139` defaults execution metadata; `tests/domain-service-kit-smoke.mjs:113-119` only proves one happy-path snapshot serialization.
  look further: Define minimal promoted-DSK API/state-adapter requirements before worker, replay, restore, or broad service graph claims.
- id: dsk-event-handoff-governance-gap-2026-06-18-2323
  parent: dsk-governance-hardening-root-2026-06-18-2323
  lesson: DSK expansion needs an event handoff policy because composed domains can be install-order fragile even when their service tokens are valid.
  evidence: Deep bug packet `2026-06-18T22-52-38-0400` reproduced RequestQueueKit reward events being lost when EconomyKit runs earlier in the same phase.
  look further: Decide whether cross-domain events are next-phase, next-tick, dependency-ordered, or configured per composition.

## Related Nodes
- source: `state/automation/dsk_architecture_scout/knowledge_nodes/2026-06-18T22-23-28-0400-dsk-architecture-node.md`
- relationship: supersedes
- reason: Keeps the same production blockers, but adds governance, event handoff, and proof-surface constraints from fresher neighboring lanes.
- source: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-18T23-01-44-0400-domain-kit-idea-node.md`
- relationship: constrains
- reason: Idea expansion now points toward governance-first DSK surfaces rather than immediate product-domain promotion.
- source: `state/automation/deep_bug_report_scout/knowledge_nodes/2026-06-18T22-52-38-0400-deep-bug-node.md`
- relationship: supports
- reason: Operations/logistics bugs provide concrete examples of why DSK dependency and event policy need hardening.
- source: `state/automation/ecosystem_proof_scout/knowledge_nodes/2026-06-18T22-40-48-0400-ecosystem-proof-node.md`
- relationship: constrains
- reason: Public proof evidence remains separate from local proof; DSK proof surfaces should not blur route HTTP 200 with browser-complete execution.

## Next Search Branches
- branch: DSK governance hardening plan
- files or folders: `src/domain-service-kit.js`, `src/runtime-kit.js`, `src/game-kit-composer.js`, `tests/domain-service-kit-smoke.mjs`
- question: What is the smallest source/test plan that locks namespace, install transaction, and dependency policy without changing the public DSK shape?
- branch: DSK state contract fixture
- files or folders: `src/domain-service-kit.js`, `tests/domain-service-kit-smoke.mjs`, `docs/domain_ideas.md`
- question: Which snapshot/reset/serialization checks are required before a DSK can be called promoted rather than merely wrapped?
- branch: DSK event handoff policy
- files or folders: `src/ecs.js`, `src/request-queue-kit.js`, `src/economy-kit.js`, `docs/kits_ideas.md`
- question: Should cross-domain events be deferred, phase-split, dependency-ordered, or surfaced through a governance/event DSK?
- branch: DSK proof surface separation
- files or folders: `docs/described_examples.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger
- question: What proof service data distinguishes local pass, raw-public availability, CDN use, npm availability, and browser-complete output?

## Not Claimed
- This node does not fix bugs, add tests, promote ProtoKits, edit public docs, prove npm availability, or prove public browser proof readiness.
