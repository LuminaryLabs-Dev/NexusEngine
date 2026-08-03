# Agent Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:agent`
- Status: `stable-candidate`
- Registry SHA-256: `c8a8d2391cc647772b76ca4293cf2b89f7ba3976b122bdd545c6e9143a7ecb3b`
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

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `agent-cycle-kit` | `nexusengine/domains/agent/cycle` | Record observations, action proposals, decision cycles, and execution receipts. |

## Lifecycle

- Duplicate install: Return the installed Agent API without duplicate state or systems.
- Snapshot: Serialize Agent state and descriptors.
- Reset: Restore the configured Agent baseline.
