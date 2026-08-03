# Domains And Atomic Kits

The semantic path tells you where a responsibility belongs. The manifest tells tools and humans what that owner may and may not do.

## Domain Manifest V2

Every top-level semantic Domain declares:

- stable identity, path, immediate parent, label, version status
- one responsibility and explicit owned meaning
- forbidden responsibilities
- owned state and schema
- inputs, systems, outputs, and lifecycle
- required and optional dependencies
- public atomic Kits, providers, and adapters
- settings schema and proof references

Generation fails when a public atom lacks source or proof. Compliance is never inferred from a folder name.

## Semantic Families

| Family | Main paths |
| --- | --- |
| Runtime | `n:runtime`, realtime, data, transaction, persistence, sequence, startup |
| Composition | `n:composition`, `n:mcp`, `n:policy` |
| World | `n:spatial`, scale, `n:object`, `n:world`, navigation, generation, terrain, water, scene, weather, asset |
| Simulation | `n:simulation`, physics, recovery, motion, economy, operations, hazard, pursuit, progression, `n:compute`, model |
| Actors | `n:actor`, creature, character, player, `n:agent` |
| Interaction | `n:interaction`, input |
| Presentation | output, graphics, camera, animation, audio, UI, speech, capture, sky |
| Infrastructure | `n:network`, `n:diagnostics`, contract-only `n:host` |

The generated Domain Index appendix contains every active path.

## Restored Behavior Shape

Twenty-six historical source modules become 27 atomic behaviors because the
old World Physics module mixed contact and recovery ownership. Those behaviors
are now separate World Contact and Soft Respawn atoms. None of the historical
root aliases return.

The restoration ledger validates each historical source checksum, every old
export, its corrected semantic owner, and its proof. A behavior with a
game-adjacent name can remain Core only when its manifest describes a universal
primitive without authored rules, presets, rendering ownership, or hidden
cross-Domain effects.

## Atomicity Test

An atom should have one reason to change. If a module owns inventory, combat, rendering, and progression together, it is a composition or product feature, not an atom.

Splitting is semantic, not file-count driven. Several source files may implement one indivisible lifecycle. Conversely, one legacy file may contain several owners and must be separated.

## Dependency Tokens

Use capability tokens for behavior dependencies and Domain paths for semantic presence. Requirements must describe what the atom consumes; providers list what they supply. Composition rejects missing providers, cycles, identity collisions, and changed content.

## Public Imports

Only generated package exports are public. Production code does not import private files from sibling Domains. Cross-Domain collaboration goes through a public subpath or an explicit adapter.
