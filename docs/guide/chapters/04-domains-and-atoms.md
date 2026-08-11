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

## Canonical Physics Foundation

`n:physics` owns the canonical Physics identity. Its `n:physics:contracts`
subdomain owns the portable provider, state, command, event, and query
boundaries. Each boundary is an independently installable atomic Kit with one
generated public subpath.

Contract records are strict and JSON-portable. They reject unknown top-level
fields, non-finite numbers, functions, platform handles, cycles, and non-plain
objects, then normalize accepted records into deterministic key order. The
contract package does not claim body ownership, collision detection, solving,
or provider execution; those capabilities promote only with their own proof.

The existing `n:simulation:physics` surface remains separate during the staged
`0.0.5` implementation. Its eventual cutover is not implied by the presence of
the new contract package.

`n:physics:lifecycle` is the next canonical subdomain. It separates six reasons
to change:

- Installation owns aggregate phase and provider identity.
- Startup owns readiness requests and provider receipts.
- Step owns strict step ordering and provider-neutral frame receipts.
- Shutdown owns stop requests and completion receipts.
- Reset restores the composed lifecycle through public APIs.
- Snapshot captures and restores those APIs atomically.

The lifecycle does not call a solver or install a concrete provider. A later
provider package consumes its portable requests and supplies the reviewed
receipts. Failed coordinated mutations restore every touched lifecycle state.

`n:physics:material` separates six physical material responsibilities:

- Friction normalizes static, dynamic, rolling, spinning, and anisotropic data.
- Restitution normalizes bounce coefficient and activation threshold.
- Density uses positive kilograms-per-cubic-meter records.
- Surface owns physical classification and portable tags only.
- Combine Policy resolves two materials symmetrically without solving contact.
- Physics Material owns immutable IDs and exact-once registry mutations.

The material registry depends on the five specialist capabilities through
public tokens. A material record contains no shader, texture, sound, particle,
collider, solver impulse, or provider handle. Those concerns remain separate
even when a product maps one physical surface to visual and audio effects.

`n:physics:world` separates seven solver-facing environment responsibilities:

- World Settings normalizes coordinate handedness, length units, up axis,
  optional bounds, and out-of-bounds policy.
- Gravity Field owns uniform and point-gravity acceleration records.
- Force Field owns non-gravity force or acceleration records.
- Wind Field owns uniform, deterministic gust, and corridor flow velocity.
- Time Scale combines explicit Physics-only scale records deterministically.
- Simulation Region resolves physical simulate, sleep, or disable behavior.
- Physics World owns immutable world IDs and references the six capabilities.

World sampling is read-only and provider-neutral. It returns portable
acceleration, force, wind velocity, region, bounds, and scaled-delta records.
Authored weather stays under `n:world:weather`; atmosphere corridors and game
routes stay with World or the product; Runtime owns clocks and schedules; later
Body and Solver packages consume the Physics output.

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
