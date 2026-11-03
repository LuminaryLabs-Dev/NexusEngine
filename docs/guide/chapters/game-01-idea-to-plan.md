# From Game Idea to Development Plan

A game usually starts as a description of an experience, not a list of components. You might say, “I want the player to explore an abandoned dungeon, open doors, defeat a guardian, and escape with a treasure.” That tells us what the player should feel and do, but it does not yet tell us what to build. The first useful step is to turn that idea into a small, complete experience that we can actually play.

Throughout this part of the guide, we will use a fictional project called **A Small Dungeon Adventure**. It is a teaching example, not a claim that a finished game is bundled with NexusEngine. The full idea includes several rooms, an enemy, inventory, and progression. We will deliberately begin with less: one room, a controllable character or viewpoint, one door, a collectible object, and an exit. That is enough to expose most of the important connections between assets, input, game rules, runtime state, scene construction, and testing.

## Begin with the player's experience

Before choosing tools, picture a single minute of play. The player enters a stone chamber, looks around, approaches a chest, takes a key, opens a door, and walks through it. They should understand what they can interact with, see an appropriate response when they act, and know when they have succeeded.

This is the **core loop**: explore, notice, interact, receive feedback, and progress. It is more useful as a starting point than a promise of fifty levels or hundreds of assets, because it can be observed and evaluated. If the player cannot tell whether the door opened, the experience is not complete, even if the underlying state changed correctly.

Write down a few qualities of the intended experience as well. Is movement deliberate or quick? Is the dungeon oppressive or inviting? Should the door feel heavy? A technically correct feature can still fail these expectations. These decisions will later shape camera placement, animation, lighting, sound, collision, and timing.

## Separate the idea into things the game needs

For our first room, the requirements become clearer when we group them by responsibility:

| Part of the experience | What we need |
| --- | --- |
| A place to explore | Room geometry, visible surfaces, lighting, camera |
| A player who can act | Input mapping, movement behavior, spatial state |
| Something worth noticing | Chest or key asset, placement, visual feedback |
| An interactive door | Door object, interaction condition, state, animation |
| A reason to continue | Objective and completion rule |
| A reliable result | Playtesting, saved source, verified playable output |

Notice that “door” appears in several different ways. The wooden model is an asset. Its position belongs to the scene. Whether it is locked is gameplay state. The rule that consumes a key is game-specific behavior. An animation shows the change to the player. Treating those as distinct concerns makes it easier to improve one without accidentally changing the others.

NexusEngine's division of responsibility follows a similar idea. Core provides reusable, product-neutral capabilities. Optional Kits provide reusable specialized behavior. The game repository owns its particular rules, content, visual choices, and tuning. A host or provider connects the runtime to a browser, a renderer, a physics implementation, or another platform. The [NexusEngine Mental Model](02-mental-model.md) explains these boundaries in detail; for now, the important lesson is that a game feature may involve several owners without belonging entirely to any one of them.

## Choose an achievable first milestone

The first milestone should not be “generate the dungeon.” It should be “play one room from entrance to exit.” This focuses effort on a complete vertical slice rather than an impressive pile of disconnected parts.

For this example, completion means the player can start the game, move through the room, notice and acquire a key, use it to open the door, reach the exit, and receive clear feedback. The test must also show that invalid actions behave correctly: the door should not open before the necessary condition is met, and repeated interactions should not duplicate rewards.

A full combat system is intentionally outside this first milestone. We can introduce an enemy once the simpler loop works, and only after verifying that the required movement, collision, combat, and simulation providers are genuinely available. A proposed Kit or an entry in a registry is not proof that the behavior executes.

## Build in dependency order

Some work can happen in parallel; other work cannot. A prop can be modeled before its exact gameplay behavior is decided, but its scale and orientation should be defined before it is placed throughout a level. The interaction rule depends on stable object identities. Testing the door requires a running application, not just an isolated mesh preview. Packaging depends on knowing which runtime host and target the game actually uses.

A useful order is to establish the project and its capabilities, create a few reusable assets, assemble the room, wire the smallest interaction, observe it during play, and then refine what the player sees and feels. That does not mean art must be “finished” before gameplay starts. It means each stage should leave the next one with enough real information to proceed.

As a concrete example, a simple door mesh and a temporary interaction cue are better early investments than ten highly polished doors with no way to use them. Once the interaction works, we can improve the handle, proportions, opening animation, lighting, and sound in a controlled way.

## Describe success, not just tasks

A task might say “make a door.” A useful result says “a player standing within interaction range can open the unlocked door, and cannot open it when it is locked.” That description tells the developer what to inspect and test. It also makes the boundary between artwork and behavior clear.

For each important part of the game, keep a short statement of its intended effect, its dependencies, and how someone will recognize success. These notes are not a special NexusEngine file format. They are ordinary design decisions that help humans judge whether the result matches the intention.

By the end of this chapter, we have a believable first goal: **one room that feels like the beginning of a game**. Next we will decide where that project lives, what NexusEngine already provides, and what we must build ourselves.

Further reading: [Domains and Atomic Kits](04-domains-and-atoms.md), [Composition and Recipes](06-composition-and-recipes.md), and [Kit Ownership](../../KIT-OWNERSHIP.md).
