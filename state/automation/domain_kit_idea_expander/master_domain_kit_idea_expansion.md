# Domain And Kit Idea Expansion Tracker

This tracker records durable lessons from the idea expansion automation. It is allowed to summarize changes made to `docs/domain_ideas.md`, `docs/kits_ideas.md`, and `docs/described_examples.md`, but it must not claim implementation or proof.

## Current Rule

- Expand idea docs only from described examples, packet evidence, repeated service needs, or clear DSK boundary gaps.
- Keep source, tests, package metadata, public docs, and memory untouched from this lane.
- Treat ideas as planning inventory until a human chooses promotion, implementation, or proof work.

## Latest Run

- Status: fourth run complete.
- Latest packet: `state/automation/domain_kit_idea_expander/packets/2026-06-19T02-02-08-0400-domain-kit-idea-expansion-packet.md`
- Latest node: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T02-02-08-0400-domain-kit-idea-node.md`
- Added idea families: operations data integrity, immutable config, stable id allocation, finite transaction policy, restored resource state, and operations invariant proof.
- Next search item: decide which operations data-integrity responsibilities should become standalone DSK services versus promotion fixture requirements on occupant, facility, economy, pressure, request, and proof domains.

## Current Root Lessons

- id: domain-kit-idea-root-2026-06-19-0202
- status: active
- latest packet: `state/automation/domain_kit_idea_expander/packets/2026-06-19T02-02-08-0400-domain-kit-idea-expansion-packet.md`
- latest node: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T02-02-08-0400-domain-kit-idea-node.md`
- summary: Fresh neighboring bug evidence points to operations data integrity around immutable authored config, stable generated identity, finite transaction gates, restored resource state, and operations invariant proof rows.
- id: domain-kit-idea-root-2026-06-19-0100
- status: extended-by-operations-data-root
- latest packet: `state/automation/domain_kit_idea_expander/packets/2026-06-19T01-00-48-0400-domain-kit-idea-expansion-packet.md`
- latest node: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T01-00-48-0400-domain-kit-idea-node.md`
- summary: Fresh neighboring bug evidence points to accepted mutation, completion idempotency, simulation time catch-up, and config normalization policy around objective, lifecycle, transport, and schedule services.
- id: domain-kit-idea-root-2026-06-19-0000
- status: extended-by-mutation-time-root
- latest packet: `state/automation/domain_kit_idea_expander/packets/2026-06-19T00-00-19-0400-domain-kit-idea-expansion-packet.md`
- latest node: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-19T00-00-19-0400-domain-kit-idea-node.md`
- summary: Fresh neighboring bug/proof evidence points to a state-policy expansion layer around terminal states, transfer constraints, restored progress, input edge semantics, and proof coverage mapping.
- id: domain-kit-idea-root-2026-06-18-2301
- status: extended-by-state-policy-root
- latest packet: `state/automation/domain_kit_idea_expander/packets/2026-06-18T23-01-44-0400-domain-kit-idea-expansion-packet.md`
- latest node: `state/automation/domain_kit_idea_expander/knowledge_nodes/2026-06-18T23-01-44-0400-domain-kit-idea-node.md`
- summary: The best first expansion pass adds governance and proofability domains around the existing idea graph: service registry, install transaction, event handoff, retention policy, proof surface, and economy ledger ideas.

## Branch Tree

- parent: domain-kit-idea-root-2026-06-19-0202
- child: operations-data-integrity-domain-2026-06-19-0202
- relationship: Occupant/facility/economy/resource-pressure invariant bugs converted into reusable operations data-integrity planning boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, `src/facility-operations-kit.js`, `src/economy-kit.js`, `src/resource-pressure-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0202
- child: immutable-config-kit-2026-06-19-0202
- relationship: Spawn-rule reset leakage converted into immutable authored config and reset-from-source kit candidate.
- look further: `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, authored experiment datasets
- parent: domain-kit-idea-root-2026-06-19-0202
- child: stable-id-allocation-kit-2026-06-19-0202
- relationship: Generated duplicate id bug converted into collision-free allocation policy kit candidate.
- look further: `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, `src/request-queue-kit.js`, `src/cargo-manifest-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0202
- child: finite-transaction-policy-kit-2026-06-19-0202
- relationship: Facility/economy non-finite ledger poison bug converted into finite transaction gate candidate.
- look further: `docs/kits_ideas.md`, `src/facility-operations-kit.js`, `src/economy-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0202
- child: restored-resource-state-kit-2026-06-19-0202
- relationship: Initial/restored resource pressure contradiction converted into restored-state consistency kit candidate.
- look further: `docs/kits_ideas.md`, `src/resource-pressure-kit.js`, `src/scenario-driver-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0100
- child: accepted-mutation-domain-2026-06-19-0100
- relationship: Lifecycle accepted-mutation bug converted into reusable validate-before-side-effects planning boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/lifecycle-progression-kit.js`, `src/economy-kit.js`, `src/objective-flow-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0100
- child: completion-idempotency-kit-2026-06-19-0100
- relationship: Objective reset/repeated-completion bugs converted into one-shot completion and reset policy kit candidate.
- look further: `docs/kits_ideas.md`, `src/objective-flow-kit.js`, `src/scenario-driver-kit.js`, proof harnesses
- parent: domain-kit-idea-root-2026-06-19-0100
- child: simulation-time-policy-domain-2026-06-19-0100
- relationship: Transport large-delta and schedule scale bugs converted into reusable time-step policy boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/transport-route-kit.js`, `src/schedule-kit.js`, `src/lifecycle-progression-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0100
- child: config-normalization-domain-2026-06-19-0100
- relationship: Non-finite schedule config converted into generic pre-simulation config validation boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/schedule-kit.js`, authored experiment datasets
- parent: domain-kit-idea-root-2026-06-19-0000
- child: terminal-state-policy-domain-2026-06-19-0000
- relationship: Recovery/objective terminal-state bugs converted into reusable state-policy planning boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/assistance-target-kit.js`, `src/objective-flow-kit.js`, `src/request-fulfillment-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0000
- child: transfer-constraint-domain-2026-06-19-0000
- relationship: TransferZone constraint gaps converted into reusable transfer policy boundary.
- look further: `docs/kits_ideas.md`, `src/transfer-zone-kit.js`, `src/cargo-manifest-kit.js`, `src/route-field-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0000
- child: input-edge-semantics-domain-2026-06-19-0000
- relationship: Held-input repeated pressed events converted into reusable input edge/held policy boundary.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/input-intent-kit.js`
- parent: domain-kit-idea-root-2026-06-19-0000
- child: proof-coverage-matrix-kit-2026-06-19-0000
- relationship: Public proof and aggregate-command gaps converted into proof coverage matrix kit candidate.
- look further: `docs/described_examples.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger
- parent: domain-kit-idea-root-2026-06-18-2301
- child: composition-governance-domain-2026-06-18-2301
- relationship: DSK hardening gaps converted into reviewable idea boundaries.
- look further: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `examples/described-examples/composition-audit-rules.md`, `src/domain-service-kit.js`, `src/runtime-kit.js`
- parent: domain-kit-idea-root-2026-06-18-2301
- child: event-handoff-domain-2026-06-18-2301
- relationship: operations/logistics event-order bug converted into a reusable cross-domain event policy candidate.
- look further: `src/ecs.js`, `src/request-queue-kit.js`, `src/economy-kit.js`, `src/sequence-node.js`
- parent: domain-kit-idea-root-2026-06-18-2301
- child: proof-surface-domain-2026-06-18-2301
- relationship: public proof route drift converted into a validation-facing proof surface candidate.
- look further: sibling Experiments DSK proof route, sibling ProtoKits DSK ledger, public CDN/raw module-source choices

## Open Search Branches

- branch: operations-data-integrity-boundary
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, `src/facility-operations-kit.js`, `src/economy-kit.js`, `src/resource-pressure-kit.js`
- branch: immutable-config-reset-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, `src/schedule-kit.js`, `src/objective-flow-kit.js`, authored experiment datasets
- branch: stable-id-allocation-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/kits_ideas.md`, `src/occupant-flow-kit.js`, `src/request-queue-kit.js`, `src/cargo-manifest-kit.js`, telemetry/proof harnesses
- branch: finite-transaction-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/kits_ideas.md`, `src/facility-operations-kit.js`, `src/economy-kit.js`, `src/lifecycle-progression-kit.js`
- branch: restored-resource-state-policy
- owner: domain_kit_idea_expander
- priority: medium
- next files: `docs/kits_ideas.md`, `src/resource-pressure-kit.js`, `src/scenario-driver-kit.js`, proof harnesses
- branch: accepted-mutation-boundary
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/lifecycle-progression-kit.js`, `src/economy-kit.js`, `src/objective-flow-kit.js`
- branch: completion-idempotency-reset-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/kits_ideas.md`, `src/objective-flow-kit.js`, `src/scenario-driver-kit.js`, proof harnesses
- branch: simulation-time-catchup-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/transport-route-kit.js`, `src/schedule-kit.js`, `src/lifecycle-progression-kit.js`, `src/scenario-duration-kit.js`
- branch: config-normalization-policy
- owner: domain_kit_idea_expander
- priority: medium
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/schedule-kit.js`, `src/transport-route-kit.js`, `src/objective-flow-kit.js`, authored experiment datasets
- branch: state-transition-policy-boundary
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/assistance-target-kit.js`, `src/objective-flow-kit.js`, `src/request-fulfillment-kit.js`
- branch: transfer-constraint-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/kits_ideas.md`, `src/transfer-zone-kit.js`, `src/cargo-manifest-kit.js`, `src/route-field-kit.js`
- branch: input-edge-policy
- owner: domain_kit_idea_expander
- priority: medium
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `src/input-intent-kit.js`, interaction and transfer event consumers
- branch: proof-coverage-matrix
- owner: domain_kit_idea_expander
- priority: medium
- next files: `docs/described_examples.md`, `docs/kits_ideas.md`, sibling Experiments DSK proof route, sibling ProtoKits ledger
- branch: composition-governance-canonicalization
- owner: domain_kit_idea_expander
- priority: high
- next files: `docs/domain_ideas.md`, `docs/kits_ideas.md`, `examples/described-examples/composition-audit-rules.md`
- branch: event-handoff-policy
- owner: domain_kit_idea_expander
- priority: high
- next files: `src/ecs.js`, `src/request-queue-kit.js`, `src/economy-kit.js`, `src/sequence-node.js`
- branch: proof-surface-public-evidence
- owner: domain_kit_idea_expander
- priority: medium
- next files: `docs/described_examples.md`, `docs/kits_ideas.md`, sibling Experiments proof route, sibling ProtoKits ledger

## Resolved Or Superseded

- id: domain-kit-idea-root-2026-06-19-0100
- reason: Extended, not superseded, by the operations data-integrity expansion run; accepted mutation, idempotency, time, and config ideas remain active context.
- evidence: `state/automation/domain_kit_idea_expander/packets/2026-06-19T02-02-08-0400-domain-kit-idea-expansion-packet.md`
- id: domain-kit-idea-root-2026-06-19-0000
- reason: Extended, not superseded, by the mutation/time/config expansion run; state-policy, transfer, input, and proof-coverage ideas remain active context.
- evidence: `state/automation/domain_kit_idea_expander/packets/2026-06-19T01-00-48-0400-domain-kit-idea-expansion-packet.md`
- id: domain-kit-idea-root-2026-06-18-2301
- reason: Extended, not superseded, by the state-policy expansion run; governance/proof/event-handoff ideas remain active context.
- evidence: `state/automation/domain_kit_idea_expander/packets/2026-06-19T00-00-19-0400-domain-kit-idea-expansion-packet.md`
- id: pending-first-run
- reason: First packet and knowledge node were written.
- evidence: `state/automation/domain_kit_idea_expander/packets/2026-06-18T23-01-44-0400-domain-kit-idea-expansion-packet.md`
