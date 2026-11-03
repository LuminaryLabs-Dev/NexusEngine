# Building Scenes and Environments

A well-made asset becomes useful only when it belongs somewhere. A chest needs a floor beneath it, a door needs a wall opening, and a player needs enough space and visual information to decide where to go. Scene building is the process of turning separate pieces into a coherent place.

In **A Small Dungeon Adventure**, our first room contains a doorway, a chest with a key, a few pieces of decoration, a camera, and an exit. The challenge is not just to place these objects. We want a room that communicates the intended route, supports interaction, and remains easy to edit as the game evolves.

## Assemble the room from meaningful pieces

Begin with the room's major spatial forms: floor, walls, doorway, and open walking area. These establish what a player can see and where movement may eventually be allowed. Add the chest and key only after the room's scale and primary sightlines make sense.

The `n:authoring:assembly` capabilities represent shared assets, object instances, nested transforms, collections, visibility and export flags, variants, cameras, lights, and seeded surface scattering. These are Authoring source definitions. They let us construct a room from known pieces, inspect its composition, and revise parts without manually rebuilding every placement.

A shared stone-wall asset might appear a dozen times, but each instance can have its own transform. That is an important distinction: the mesh defines what the wall is, while the assembly defines where a particular instance is. If we later revise the wall's proportions, we can check whether all its placements still make sense.

Collections should reflect how a human understands the space. Grouping the room's structure, interactive objects, lighting, and decoration makes it easier to inspect and alter than assigning every object an unrelated name. Good organization is not simply cosmetic; it reduces the chance of editing the wrong instance or confusing source geometry with a placed object.

## Give the player a readable path

A level is not successful merely because its geometry is valid. A player should be able to understand the room's purpose. A darker passage may suggest mystery, while a visible chest and distinct exit door establish direction. Sightlines, contrast, and scale can guide attention more effectively than a wall of tutorial text.

For our room, we might place the chest off to one side but make it visible from the entrance. The exit door should be recognizable and its locked state should have a clear visual response. A key that blends into the floor is mechanically collectible but poorly communicated.

Use cameras and lighting to judge this work at the viewpoint the player will actually use. A top-down construction view is convenient for arranging objects; it does not replace seeing the room from play height. Inspect nearby surfaces, floor contact, shadows, clipping, and whether doorframes or pillars obstruct the camera.

NexusEngine's Authoring system stores camera and light descriptions, while presentation and rendering require a real host or provider. Authoring source should not be confused with GPU resources or rendered pixels.

## Keep scene source distinct from runtime state

This distinction becomes essential when the door opens.

The Authoring project describes the initial room: a door instance in a particular position, its visual geometry, and the authored data a game may consume. During play, the runtime may record that the door is now open, the key has been acquired, or the objective has advanced. These changing facts belong to the running game, not to an unsolicited edit of the original room.

The Editor's Play Mode validates the project, clones its accepted Authoring source into a separate engine, installs the selected composition, and advances that runtime. Stopping Play Mode does not write temporary runtime changes back into the source. That isolation makes it safe to experiment with the room without accidentally saving the state of one test run as its initial condition.

When editing, save deliberate source changes. When playing, test transient behavior. If a discovered improvement should become part of the starting level, apply it through an intentional Authoring edit.

## Plan more than one room without overbuilding

Once one room works, more rooms become a question of reuse and transitions. A consistent doorframe, floor thickness, camera treatment, and object scale help connected rooms feel like one game. Reused assets also make it practical to adjust the visual style without editing hundreds of unique files.

Scene **authoring**, scene **loading**, and scene **transition requests** are related but separate concerns. The presence of an Assembly document does not prove that a full streamed-scene lifecycle is wired into a particular game or Editor export. Scene-loading responsibilities have been undergoing an explicit cutover, and legacy entry points may remain alongside newer APIs. Check the exact installed Core revision and the relevant game's integration before documenting any transition method as production-ready.

For the dungeon, describe the desired behavior first: when the player reaches the exit and has the key, the game activates the next room; otherwise the player stays in the current one and receives a clear response. The scene system must own activation and lifecycle, while interaction or gameplay logic decides when to request a transition. The specific executable bridge must be tested in the chosen application host.

The same caution applies to navigation and physics. A visible floor is not automatically a collision surface, and a room assembled from meshes is not automatically navigable to an enemy. Those are separate capabilities whose availability and integration must be verified.

## Review the room as a place, not a list of objects

A useful scene review examines several layers. First, look at composition: proportions, spacing, silhouettes, and the relationship between entrance, chest, and exit. Then inspect technical fit: origin placement, consistent scales, visible surface intersections, object identities, and export compatibility. Finally, evaluate what a player would perceive: where attention goes, whether interactions are discoverable, and whether navigation feels comfortable.

If the chest floats above the floor, identify whether its source origin, instance transform, or the room's floor placement is wrong. Do not change three unrelated systems hoping the visual issue disappears. If the exit is hard to see, try an environmental cue or lighting change before adding a large interface overlay.

For our first milestone, the finished environment is intentionally modest. A player can enter the room and recognize the chest, key, door, and exit. The source is saved, the major objects are reusable, and the camera can inspect the scene from the intended play perspective.

Next comes the part that turns this environment into a game: connecting player input and authored objects to runtime rules.

Further reading: [Authoring Assembly](../../../AUTHORING.md#capability-profiles), [Editor Workbench](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/WORKBENCH.md), [Current Architecture](../../CURRENT-ARCHITECTURE.md), and [Composition and Recipes](06-composition-and-recipes.md).
