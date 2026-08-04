# Agent Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:agent`
- Status: `stable-candidate`
- Registry SHA-256: `0fe0ffcc730675224e5a487231520ffec4f07153e8665fe18ccef21743adb9aa`
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
