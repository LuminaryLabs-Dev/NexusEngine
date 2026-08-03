# Composition Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:composition`
- Status: `stable-candidate`
- Registry SHA-256: `267ff7b50e8011b2f1f21f506e20a10f5d5a68a1bd8c63c51cf1221b9432a807`
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
