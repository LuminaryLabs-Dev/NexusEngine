# Lighting Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:lighting`
- Status: `stable-candidate`
- Registry SHA-256: `d915cfbca15391703b688464816228a0cefe36ec9281c550c80d0ccaa5a90e47`
- Public entry: `nexusengine/domains/lighting`

## Responsibility

Own portable light definitions, reflection policy, negotiation and observation records.

## Owns

- Own portable light definitions, reflection policy, negotiation and observation records.

## Does Not Own

- application presets
- provider handles
- renderer execution

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `lighting-descriptor-kit` | `nexusengine/domains/lighting/descriptions` | Own portable lighting descriptions. |
| `reflection-descriptor-kit` | `nexusengine/domains/lighting/reflection` | Describe renderer-neutral reflection probes, plans, and update policy. |

## Lifecycle

- Duplicate install: Return the installed Lighting API without duplicate state or systems.
- Snapshot: Serialize Lighting state and descriptors.
- Reset: Restore the configured Lighting baseline.
