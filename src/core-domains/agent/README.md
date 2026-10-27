# Agent Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:agent`
- Status: `stable-candidate`
- Registry SHA-256: `a49b310d0bf31ffb0a1b52b532ed92490e94a7ada5a2110453d21cb8eb529c6f`
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
| `n:agent:decision` | Own typed judgments, classification questions and evidence-bound proposal selections. |
| `n:agent:loop` | Own portable agent-loop composition contracts. |
| `n:agent:loop:step` | Own step envelopes and immutable outcome transitions. |
| `n:agent:loop:control` | Own per-loop lifecycle and continuation. |
| `n:agent:loop:coordination` | Own parent-child relationships and join outcomes. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `agent-decision-kit` | `nexusengine/domains/agent/decision` | Validate and retain versioned typed judgments bound to Agent proposals and evidence. |
| `agent-cycle-kit` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |

## Lifecycle

- Duplicate install: Return the installed Agent API without duplicate state or systems.
- Snapshot: Serialize Agent state and descriptors.
- Reset: Restore the configured Agent baseline.
