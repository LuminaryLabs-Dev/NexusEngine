# Interaction Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:interaction`
- Status: `stable-candidate`
- Registry SHA-256: `1efce68a440c6655baa3025381d1b544d34b8833b43e6c7a3b69162417d886c6`
- Public entry: `nexusengine/domains/interaction`

## Responsibility

Own targets, affordances, activation progress, semantic requirements, prompts, and completion results.

## Owns

- activation state
- affordances
- interaction results
- interaction targets

## Does Not Own

- UI rendering
- device polling
- game dialogue
- physics hit testing

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:interaction:input` | Own semantic input actions, axes, contexts, bindings, dead zones, and adapter contracts. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `interaction-kit` | `nexusengine/domains/interaction/runtime` | Manage interaction targets, affordances, activation, and results. |
| `input-contract-kit` | `nexusengine/domains/interaction/input` | Normalize semantic input actions, axes, contexts, and bindings. |

## Lifecycle

- Duplicate install: Return the installed Interaction API without duplicate state or systems.
- Snapshot: Serialize Interaction state and descriptors.
- Reset: Restore the configured Interaction baseline.
