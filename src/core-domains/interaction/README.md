# Interaction Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:interaction`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
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
| `n:interaction:assistance-target` | Own assistance target urgency, attachment, completion, loss, and deterministic selection. |
| `n:interaction:environmental-affordance` | Own portable affordance proximity and activation state. |
| `n:interaction:request` | Own portable request queue and fulfillment boundaries. |
| `n:interaction:request:queue` | Own queued request patience, fulfillment, expiry, and effect descriptors. |
| `n:interaction:request:fulfillment` | Own spatial request destination, deadline, completion, expiry, and reward state. |
| `n:interaction:transfer-zone` | Own portable transfer-zone acceptance, dwell, capacity, occupancy, and completion state. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `interaction-kit` | `nexusengine/domains/interaction/runtime` | Manage interaction targets, affordances, activation, and results. |
| `input-contract-kit` | `nexusengine/domains/interaction/input` | Normalize semantic input actions, axes, contexts, and bindings. |
| `assistance-target-kit` | `nexusengine/domains/interaction/assistance-target` | Own assistance target urgency, attachment, terminal completion, loss, and deterministic selection. |
| `environmental-affordance-kit` | `nexusengine/domains/interaction/environmental-affordance` | Own read-only affordance proximity queries and exact-once activation progress. |
| `request-queue-kit` | `nexusengine/domains/interaction/request/queue` | Own deterministic queued requests, patience, fulfillment, expiry, and portable effect descriptors. |
| `request-fulfillment-kit` | `nexusengine/domains/interaction/request/fulfillment` | Own spatial request destinations, deadlines, completion, expiry, and reward totals. |
| `transfer-zone-kit` | `nexusengine/domains/interaction/transfer-zone` | Own accepted types, dwell, capacity, occupancy, and exact-once transfer completions. |
| `occupant-request-adapter-kit` | `nexusengine/domains/interaction/adapters/occupant-request` | Translate Occupant Flow need records into exact-once Request Queue entries. |
| `transport-request-adapter-kit` | `nexusengine/domains/interaction/adapters/transport-request` | Translate Transport Route arrivals into exact-once Request Queue fulfillment commands. |
| `request-economy-adapter-kit` | `nexusengine/domains/interaction/adapters/request-economy` | Translate fulfilled or expired Request Queue outcomes into exact-once Economy transactions. |

## Lifecycle

- Duplicate install: Return the installed Interaction API without duplicate state or systems.
- Snapshot: Serialize Interaction state and descriptors.
- Reset: Restore the configured Interaction baseline.
