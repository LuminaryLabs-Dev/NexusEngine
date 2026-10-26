# Agent Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:agent`
- Status: `stable-candidate`
- Registry SHA-256: `c31d7b0cb162415ad77c669691d5683eed98cb582aa599bf6cb1e7ba505ad185`
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
| `n:agent:loop` | Own portable agent-loop composition contracts. |
| `n:agent:loop:step` | Own step envelopes and immutable outcome transitions. |
| `n:agent:loop:control` | Own per-loop lifecycle and continuation. |
| `n:agent:loop:coordination` | Own parent-child relationships and join outcomes. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `agent-cycle-kit` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |

## Lifecycle

- Duplicate install: Return the installed Agent API without duplicate state or systems.
- Snapshot: Serialize Agent state and descriptors.
- Reset: Restore the configured Agent baseline.
