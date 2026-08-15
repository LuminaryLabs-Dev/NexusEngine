# Composition Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:composition`
- Status: `stable-candidate`
- Registry SHA-256: `a5e0ac2156e86da208c6525d7c611d0245d7d1a57f5e5f186fbe83bac2f04e82`
- Public entry: `nexusengine/domains/composition`

## Responsibility

Own deterministic Domain and Kit discovery, dependency planning, plan identity, and exactly-once apply receipts.

## Owns

- apply receipts
- capability graph
- composition plans
- domain catalog
- kit registry metadata

## Does Not Own

- application approval
- host mutation policy
- module installation
- transport lifecycle

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `composition-registry-kit` | `nexusengine/domains/composition/registry` | Maintain normalized composition metadata and produce deterministic plans and receipts. |

## Lifecycle

- Duplicate install: Return the installed composition API without duplicating state or systems.
- Snapshot: Serialize normalized registry metadata and receipts.
- Reset: Restore configured registry records and clear mutable plan/application state.
