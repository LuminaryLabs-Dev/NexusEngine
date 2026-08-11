# Policy Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:policy`
- Status: `stable-candidate`
- Registry SHA-256: `8bb0900127eded3eba62ade325c4b3f488b70b62e78c625be184fa2b2b83cbb8`
- Public entry: `nexusengine/domains/policy`

## Responsibility

Own product-neutral permission, guard, sandbox, and runtime safety decisions.

## Owns

- allowed actions
- blocked actions
- guards
- permissions
- sandbox rules

## Does Not Own

- application approval UI
- business policy
- identity provider
- platform sandbox implementation

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `policy-kit` | `nexusengine/domains/policy/guard` | Evaluate declarative runtime safety and permission rules. |

## Lifecycle

- Duplicate install: Return the installed Policy API without duplicate state or systems.
- Snapshot: Serialize Policy state and descriptors.
- Reset: Restore the configured Policy baseline.
