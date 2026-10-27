# Agent Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:agent`
- Status: `stable-candidate`
- Registry SHA-256: `3124512704a4926c3fd145bf84076f9957a7647dceb52954b1757bc99ec68525`
- Public entry: `nexusengine/domains/agent`

## Responsibility

Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts.

## Owns

- action proposals
- agent observations
- decision cycles
- execution receipts

## Does Not Own

- LLM prompting
- game AI policy
- host tool execution
- model provider

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:agent:graph` | Own bounded typed agent-work topology and revisioned atomic graph operations. |
| `n:agent:goal` | Own outcome meaning, conditional checks and revision-linked verification over Agent graphs. |
| `n:agent:decision` | Own typed judgments, classification questions and evidence-bound proposal selections. |
| `n:agent:loop` | Own portable agent-loop composition contracts. |
| `n:agent:loop:step` | Own step envelopes and immutable outcome transitions. |
| `n:agent:loop:control` | Own per-loop lifecycle and continuation. |
| `n:agent:loop:coordination` | Own parent-child relationships and join outcomes. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `agent-graph-kit` | `nexusengine/domains/agent/graph` | Maintain bounded typed graphs with atomic patches, traversal and replay. |
| `agent-goal-kit` | `nexusengine/domains/agent/goal` | Interpret Agent graphs as evidence-bound conditional goals. |
| `agent-goal-loop-kit` | `nexusengine/domains/agent/loop/goal-graph` | Optionally follow goal graphs through existing model-neutral loop ports. |
| `agent-decision-kit` | `nexusengine/domains/agent/decision` | Validate and retain versioned typed judgments bound to Agent proposals and evidence. |
| `agent-cycle-kit` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |

## Lifecycle

- Duplicate install: Return the installed Agent API without duplicate state or systems.
- Snapshot: Serialize Agent state and descriptors.
- Reset: Restore the configured Agent baseline.
