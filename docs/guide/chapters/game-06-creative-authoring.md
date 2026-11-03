# Using the Four Authoring Harnesses

A good game takes several kinds of creative judgment. Someone must decide what a scene is for, someone must make it visually convincing, someone must connect its interactions, and someone must look at the combined result and ask whether it works. NexusEngine's four Authoring Harnesses give these responsibilities explicit names: **Design**, **Art**, **Interaction**, and **Craft**.

These harnesses are not four competing editors or four separate copies of the game. They are optional, composable ways of planning and reviewing work through the canonical Authoring project. Their real value is clarity: the outcome of one creative discipline becomes a useful starting point for the next, while the source remains under its established owner.

## Design: make the space serve the experience

The Design Harness is concerned with structure, layout, and design intent. For our first dungeon room, its task is not simply to arrange stone blocks in a pleasing pattern. It should establish the relationship between the entrance, the chest, the door, and the exit so that the intended gameplay is understandable.

A design pass might reveal that the player can reach the exit without ever noticing the chest, or that the door is hidden behind a pillar. Those are scene-design problems. The appropriate response may be to revise object placement, camera sightlines, or room proportions using existing Assembly operations.

Design works with discoverable capabilities and constraints. It can propose a layout, but actual persisted changes must go through the Authoring project. It cannot legitimately claim to have created geometry or placed objects if the required native operations were unavailable or failed.

## Art: turn useful structures into convincing content

Art focuses on the visual realization of the game. It selects supported geometry, material, painting, rigging, and animation tools to create or refine what the player sees.

For the dungeon, Art may take the Design layout and improve the chest's silhouette, the stone surfaces, the door's proportions, and the consistency of the light fixtures. It might discover that repeated assets have mismatched material roughness, or that an important interactive object blends into the background.

The Art Harness is expected to work from actual capabilities, not invented operations. NexusEngine's Authoring tools publish supported profiles and limitations. A complex visual request may need to be simplified, built from several supported steps, or completed in an external tool with a validated import. The harness should not hide this limitation behind a successful-sounding description.

An effective art review looks at what was produced, not merely whether the operation returned a receipt. An exported asset can be structurally valid and still look wrong. That distinction is central to game quality.

## Interaction: make the player's decisions matter

Interaction connects authored content with descriptions of what should happen in response to play. In our room, it helps specify that the chest can grant a key, the locked door needs that key, and the exit depends on the door state.

This harness works with the existing Authoring Sequence and composition definitions. It does not replace runtime execution, input handling, or a concrete gameplay provider. The actual game must still install compatible behavior and prove that the interaction works in a running host.

That boundary is useful. A creative definition says *what the player should be able to do*. Runtime evidence shows *whether the game actually does it*. Keeping the two separate makes it easier to identify where a problem begins.

## Craft: judge the assembled experience

Craft looks at the combined result and directs revisions. It may conclude that the room is navigable but dull, that the door opens too quickly, or that the chest is visually too small to attract attention.

Unlike a general “polish everything” instruction, a useful review identifies the observed problem and the appropriate area to correct. If the chest is hard to notice, Art might adjust its materials while Design improves the sightline. If the interaction cue appears at the wrong distance, the Interaction or gameplay integration needs attention. Craft should not bypass these owners and silently modify the project on their behalf.

Sometimes the right answer is not to add detail but to remove distraction. A good room can become less readable as more props, effects, and interface elements are added. Craft protects the intended experience from that kind of accumulation.

## How the four responsibilities fit together

For **A Small Dungeon Adventure**, one production pass might proceed naturally:

1. Design establishes a room layout with a clear entrance, chest, door, and exit.
2. Art builds or selects the visible assets and reviews how they read in the scene.
3. Interaction defines the intended key, lock, and exit relationships.
4. Craft reviews the combined result, names specific shortcomings, and directs the affected discipline to revise them.

This is a sequence of creative responsibilities, not a claim that every game must be made in one rigid order. A camera problem can send the team back to Design. A newly implemented interaction may reveal a missing animation. The point is to preserve the context of each change rather than starting the whole project again whenever something needs improvement.

## What the production integration actually supports

The repository documents `createAuthoringDesignKit`, `createAuthoringArtKit`, `createAuthoringInteractionKit`, and `createAuthoringCraftKit`. It also provides an optional production host and runners that can coordinate discovered operations, source-bound previews and commits, observation, explicit review, and bounded revision.

In the production integration, a configured `createAuthoringProgramRunner` can compose the four disciplines as ordered steps and perform independent final verification. That is a real architectural capability, but it is **not** equivalent to installing four Kits and receiving a finished game. The surrounding host needs authorized tools, a planner, a reviewer, revision policy, and executable observation providers. The existing Agent Loop is responsible for continuation, budgets, checkpoints, and recovery.

The harnesses also do not create a second source writer. The canonical `n:authoring:project` remains responsible for persisted documents and transactions. This means changes can be associated with real source revisions and receipts, reducing the chance that a later creative pass silently overwrites newer work.

## Why observation still matters

A harness may successfully create a door, render a screenshot, or export an asset. Those results prove different things. Geometry validation says something about structure; a screenshot shows a particular visual result; a gameplay test demonstrates a particular behavior under actual runtime conditions. None is a universal substitute for the others.

A human reviewer can judge whether the visual style feels right, but that judgment should refer to the current scene and source revision. A runtime interaction needs scenario evidence from a real executable provider, not just a source-level description. An export to FBX is not proof that an external engine scene will work.

This distinction makes the overall process more dependable. It lets a creator use automation for repetitive construction and inspection while preserving the creative and technical evidence needed to accept the work.

With the four responsibilities understood, the next challenge is knowing how to test a game, recognize the real cause of a failure, and improve it without losing working parts.

Further reading: [Four Composable Authoring Harnesses](../../authoring-harnesses.md), [Core Authoring](../../../AUTHORING.md), [Visual Target Review](../../visual-target-review.md), and [Production Host](../../../kits/agent/production/README.md).
