# Kit Ownership

**Status:** canonical
**Updated:** 2026-07-23

## Rule

```txt
NexusEngine:
  atomic + idempotent + fully reusable Core behavior

NexusEngine-Kits:
  reusable + optional, niche, genre, or platform behavior

Experiment/game repository:
  complete games, presets, authored content, and product behavior
```

## Decision Gate

| Question | Required for Core |
| --- | --- |
| Does the module have one atomic responsibility? | Yes |
| Can install, reset, and reapply avoid duplicate effects? | Yes |
| Is it reusable without a product, genre, or platform assumption? | Yes |
| Is its state deterministic and serializable where applicable? | Yes |
| Does focused proof cover the public and composed path? | Yes |
| Is Core ownership intentional and documented? | Yes |

Every answer must be proved. Unknown or unproven behavior leaves Core until it
passes the gate.

## Destination Rules

| Classification | Destination |
| --- | --- |
| Universal Core primitive, invariant, or domain | NexusEngine |
| Reusable optional, niche, genre, or platform behavior | NexusEngine-Kits or another trusted registry |
| Complete game, preset, authored content, product tuning | Experiment or game repository |
| Unknown ownership | Outside Core pending evidence |
| Minimal scenario proving a generic invariant | `tests/` or `tests/fixtures/` |

## Test Fixture Exception

A niche-looking fixture may remain only when all conditions hold:

- it lives under `tests/` or `tests/fixtures/`
- it proves a named generic Core invariant
- it is not exported or registered at runtime
- production source does not import it
- it contains minimal synthetic data rather than a hidden game

## Public Interface

NexusEngine has no forwarding exports for migrated behavior. Registry metadata
is descriptive until a trusted provider resolves executable code.

The current migration removes fishing, Reef Rescue, AR and platform adapters,
optional gameplay factories, rendering-specific fishing hooks, and complete
game presets from Core. Fishing is provided by
`@luminarylabs/nexusengine-kits/fishing-kit`; complete games remain outside both
packages.

## Machine Ledger

[`KIT-OWNERSHIP.json`](KIT-OWNERSHIP.json) records every production module
reachable from a package entrypoint and every migrated production owner:

```txt
path
public exports
responsibility
atomic
idempotent
fully reusable
product or genre specific
current consumers
destination
proof
```

Regenerate it with:

```bash
npm run ownership:generate
```

Review the diff. A generator result is evidence, not permission to bypass the
decision gate.

## Change Process

1. Classify ownership before implementation.
2. Prove replacement behavior in its destination.
3. Remove the old implementation and public exports in one coordinated change.
4. Update the ledger, migration guide, source-local contracts, and tests.
5. Prove no public Core entrypoint can reach the migrated module.

The retired ProtoKit workflow is historical only. New optional behavior goes to
a trusted registry package.
