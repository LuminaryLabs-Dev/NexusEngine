# The NexusEngine Mental Model

NexusEngine separates meaning from implementation. A Domain names a semantic owner. An atomic Kit installs one capability. A provider performs work behind a contract. An adapter translates between boundaries. A recipe selects and configures atoms without becoming a new runtime owner.

## The Vocabulary

| Term | Meaning | Example |
| --- | --- | --- |
| Engine | Runtime container for state, systems, events, resources, and installed Kits | `createEngine()` |
| Domain | Semantic ownership boundary | `n:object`, `n:simulation:motion` |
| Atomic Kit | One installable, idempotent responsibility | Object registry or placement |
| Provider | Replaceable implementation of a Domain contract | Physics backend or speech synthesis |
| Adapter | Translation across two public contracts | Motion plan to physics drive request |
| Recipe | Data selecting Domains, Kits, and settings | Object plus Placement composition |
| Registry | Non-executable metadata describing exact sources | Package, version, commit, integrity |
| Host | Application-owned lifecycle and platform boundary | Editor, browser application, server |

## How these pieces form a game

Picture a locked door in a dungeon. An authored mesh and material give it a recognizable appearance. An Assembly instance places it in the room. An Object capability gives the instance an identity. Input and Interaction help decide when the player can act, while the game's own rule determines whether a key is required. A presentation provider shows the door opening. The playable application brings those responsibilities together.

No single system has to own the entire door experience. This is why NexusEngine makes a distinction between reusable capabilities and authored product behavior. The same underlying object and interaction concepts can support a dungeon door, a vehicle hatch, or a cabinet in a simulation, while the details of when and why each one opens remain with the product.

The [game-building chapters](game-01-idea-to-plan.md) develop this example from an idea into something that can be tested.

## State Has One Owner

Every durable concept has one state owner. Other Domains refer to that state through descriptors, identifiers, commands, events, or public APIs. They do not keep shadow copies that can drift.

For example, Object owns object identity and intrinsic geometry meaning. Placement owns where an object is placed. A renderer may project both into a scene, but renderer objects are not Core state.

## Composition Is Additive

Atoms declare `requires` and `provides` tokens. Composition resolves those edges into an ordered plan. Local idempotence makes repeated installation safe; the composition receipt makes the complete accepted plan exactly-once across process restarts.

## Core Does Not Mean Default

A capability may be universal and still opt-in. Core means the behavior satisfies the ownership contract. It does not mean every engine instance installs it automatically.

## Data Is Not A Runtime Owner

Authored presets, balance values, levels, quests, materials, and complete game loops remain recipe or product data. Core can define the schema and deterministic evaluator while the product owns the authored values.
