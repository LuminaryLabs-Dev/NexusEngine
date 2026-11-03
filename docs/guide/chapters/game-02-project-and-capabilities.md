# Setting Up a Project and Choosing Capabilities

With a small playable goal in mind, the next question is practical: where does the game live, and which parts of NexusEngine will it use?

NexusEngine is not a monolithic game editor in which every feature is automatically enabled. It is a reusable runtime with clearly owned capabilities. The surrounding repositories provide optional gameplay systems, a visual workbench, and examples of complete applications. Understanding this arrangement early prevents a common mistake: assuming that a feature mentioned in the Engine's catalog is already an installed, production-ready feature in your game.

## Understand the four places your work can belong

**NexusEngine Core** owns universal runtime behavior and Authoring services. Object identity, lifecycle, deterministic state changes, scene-related contracts, and the canonical Authoring project belong here when their implementation meets Core's ownership rules.

**NexusEngine-Kits** is the first-party registry for optional behavior that should be reusable across games but does not belong in Core. A genre-specific mechanic, an optional provider, or a useful gameplay composition may live there. The registry includes candidates and placeholders as well as official implementations, so its contents must be checked before use.

**NexusEngine-Editor** is the human-facing workbench. It offers a viewport, outliner, inspector, composition panels, project save/load, Play Mode, and build/export entry points. The Editor displays and invokes Core behavior; it is not supposed to invent a second authoritative copy of game or asset state.

**Your game repository** contains the actual product. It owns the dungeon's room layouts, rules, narrative, HUD, difficulty, tuned values, selected dependencies, and publishable application. A generic key-and-lock facility might be reusable, but the rule that the final dungeon door needs the blue key belongs to this particular game.

The repository boundaries are explained in [Core ownership](../../KIT-OWNERSHIP.md), the [Kits catalog](https://github.com/LuminaryLabs-Dev/NexusEngine-Kits), and the [Editor README](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor).

## Open the Authoring workbench

For a local authoring session, the Editor repository documents this starting point:

~~~sh
npm ci
npm run authoring -- create --project /absolute/path/to/my-dungeon
npm run authoring -- open --project /absolute/path/to/my-dungeon
~~~

Run these commands from a reviewed checkout of `LuminaryLabs-Dev/NexusEngine-Editor`, with its documented Node environment and pinned Core dependency. They create or open a **Core Authoring project**, not a complete playable game template. The workbench provides an outliner and viewport for creating and inspecting source assets and scene content.

An Authoring project has its own portable source and persistence format. The Editor also retains an older static project format; opening one does not silently migrate it to the other. This distinction matters if you are returning to an older project or exchanging files with a teammate. See the [Editor Authoring guide](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/AUTHORING.md) and [Workbench reference](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/WORKBENCH.md).

At this stage, our dungeon project can have an empty scene and a few planned assets. That is a sensible starting point. Do not confuse a saved Authoring project with a built game.

## Discover capabilities before deciding how to build

Instead of guessing which operation exists, inspect the installed Authoring tools and composition registry. The portable Authoring surface exposes `project.tools()`, which describes registered operation IDs, schemas, effects, supported profiles, and limits. The Editor exposes Domain and Kit discovery through its Composition workbench.

This matters when the asset designer says “give the chest an inset lid,” or the gameplay designer says “give the door a hinge.” Mesh editing and runtime constraint solving are different capabilities. Discovery should answer whether the necessary editing operation is present, whether a compatible runtime behavior is installable, and whether a real provider can execute it.

There are three useful outcomes:

| What you discover | What to do |
| --- | --- |
| The capability is implemented in Core | Use the supported public API, with its documented limits |
| A compatible, proven optional Kit exists | Review its dependency, environment, status, and integrity; then compose it |
| The required behavior is not available | Implement a scoped game feature or an appropriate new reusable Kit, and prove it before relying on it |

Do not copy private source files from another Domain merely because they appear to solve the problem. NexusEngine expects application code to use public package exports and explicit adapters between ownership boundaries.

## Treat readiness as evidence, not a label

The Kits repository distinguishes official implementations from candidates, scaffolds, and metadata placeholders. A searchable Kit is not necessarily installable. Likewise, a Core Domain may provide portable contracts before a concrete external backend exists. The new Physics and Render foundations developed toward 0.0.5 illustrate this distinction: portable descriptions and lifecycle records are useful work, but they are not proof of a finished renderer or solver.

When following a tutorial, pay attention to the Engine revision it describes. The guide book is currently versioned `0.0.4`, while the main branch contains development work toward `0.0.5`. The Editor pins a particular Core commit for its Authoring host. Some Authoring documentation counts refer to different installed compositions or revisions. Use the exact commit, generated manifests, and test evidence for the version you are running, rather than treating a count in prose as a stable API guarantee.

## Compose the game deliberately

At runtime, `createEngine()` installs a small default set of runtime atoms. Other domains and optional Kits are installed explicitly. Composition examines dependencies and produces a reviewable plan. The game's chosen capabilities should be deliberate: player input, object identity, spatial placement, gameplay rules, and the selected presentation or simulation host each have a reason to be present.

For our dungeon, the first composition should be minimal. We need enough functionality to represent the player, place the room and interactive objects, accept an action, change game state, and show the result. Combat, network play, sophisticated AI, and extensive physics can wait until the basic experience proves itself.

The [Composition and Recipes](06-composition-and-recipes.md) chapter explains how these selections are validated and applied. For now, remember that a recipe selects capabilities and settings; it does not magically author a complete level or provide missing executable code.

## Separate editing from playing

Authoring changes source documents through validated transactions. Play Mode creates an isolated runtime from the accepted source snapshot and selected composition. Stopping play does not silently write temporary runtime state back into the edited project. This separation protects the carefully authored room from accidental changes caused by a test run.

Before moving forward, make sure you can open the project, identify the Authoring tools it exposes, and explain where the first room's source and game-specific rules will live. In the next chapter, we will put those tools to use by creating the visible objects the room needs.

Further reading: [Authoring](../../../AUTHORING.md), [First Runtime](03-first-runtime.md), and [Editor Workbench](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/WORKBENCH.md).
