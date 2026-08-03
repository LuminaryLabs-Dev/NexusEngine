# Actor Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:actor`
- Status: `stable-candidate`
- Registry SHA-256: `b7aaf0c3c56ec5e6c0c3b3a9a087d68f46ef42a1e2b0f758704870ec36cba1c2`
- Public entry: `nexusengine/domains/actor`

## Responsibility

Own neutral embodied actor identity and shared actor references.

## Owns

- actor identity
- actor lifecycle contracts
- embodiment references

## Does Not Own

- AI decisions
- game factions
- player input
- rendering

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:actor:creature` | Own neutral creature embodiment definitions and references. |
| `n:actor:character` | Own active embodied character identity and neutral runtime bindings. |
| `n:actor:player` | Own neutral player identity, possession, control authority, and spawn generations. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `actor-registry-kit` | `nexusengine/domains/actor/registry` | Own neutral actor identities and embodiment references. |
| `creature-registry-kit` | `nexusengine/domains/actor/creature` | Register and resolve neutral creature embodiment definitions. |
| `character-registry-kit` | `nexusengine/domains/actor/character` | Register and resolve active embodied character descriptors. |
| `player-authority-kit` | `nexusengine/domains/actor/player` | Track player identity, possession, control authority, and spawn generations. |

## Lifecycle

- Duplicate install: Return the installed Actor API without duplicate state or systems.
- Snapshot: Serialize Actor state and descriptors.
- Reset: Restore the configured Actor baseline.
