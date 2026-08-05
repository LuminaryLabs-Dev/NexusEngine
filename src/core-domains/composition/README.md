# Composition Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:composition`
- Status: `stable-candidate`
- Registry SHA-256: `740e0916c8017e4e2a91be79c7b02359c4fa1186d7174a52d6311ec8563cb3af`
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
