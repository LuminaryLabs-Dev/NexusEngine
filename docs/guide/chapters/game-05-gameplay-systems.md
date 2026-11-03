# Connecting Gameplay Systems

Our dungeon room now has a shape, a camera, a chest, a key, and a door. It still is not a game. A game responds to the player, remembers meaningful events, and gives the player a reason to make decisions. Connecting those responses is the purpose of the runtime.

NexusEngine is designed around small capabilities with clear responsibilities. That can initially seem more complicated than attaching one enormous “gameplay script” to every object. In practice, it makes features easier to understand: you can change how a door looks without changing the key rule, or change the key rule without rebuilding the door mesh.

## Follow one interaction all the way through

Consider the moment the player tries to open the dungeon door. The visible door exists in the authored room. The runtime knows which object the player is approaching. Input supplies an explicit action. Interaction logic determines whether the action is allowed. The game checks whether the player holds the key, updates the door state if appropriate, and requests a visible response.

A useful way to think about it is:

~~~text
player action
  -> identify the target
  -> evaluate the game rule
  -> change owned runtime state
  -> present the result
  -> test what the player observes
~~~

The important detail is that the door model does not have to own every step. Object identity, placement, interaction, progression, animation, and presentation can be provided by different capabilities. The game's rule about which key opens which door remains in the game itself.

A door is “working” only when the whole chain is present. A source animation may play beautifully in isolation while the player has no way to trigger it. Conversely, a runtime flag might become `open: true` while the screen never shows the door moving. Both are incomplete gameplay.

## Start with input and movement

The first useful gameplay test is whether the player can move and see the environment respond. NexusEngine has Core input, actor/player, world, spatial, and motion-related capabilities, but the exact controller behavior and concrete host must be selected and verified. A game should not assume that importing an actor Domain automatically gives it the controls, collision, and camera feel of a finished third-person game.

Decide what a single input means. Does pressing an interaction key target the nearest object, the object under a pointer, or the one the camera is facing? What happens when nothing is in range? Which system owns the player's current position, and which presentation provider turns that position into a visible frame?

Make a very small controller first, then evaluate the result at normal play speed. Check that movement is predictable, that the camera helps rather than obstructs, and that the player cannot unintentionally bypass the room's intended boundaries. When physical collision is required, choose and prove an executable physics or collision provider rather than mistaking portable contracts for a solver.

## Give game state one clear owner

The first room needs to remember a few facts: whether the key is available, whether the player has collected it, whether the door is locked, and whether the exit objective has been completed. These are small pieces of data, but ambiguous ownership causes surprisingly difficult bugs.

For example, suppose the UI reports that the key was collected while the door still reads an older inventory copy. NexusEngine's ownership principle is intended to prevent that kind of drift. A feature should update its authoritative state and let other systems observe or query it through public capabilities. It should not maintain unrelated shadow versions merely for convenience.

Think carefully about replay and repeated actions. Clicking the chest twice should not grant two copies of a one-time reward. A door that is already open should not restart an invalid transition every frame. Deterministic operations, explicit request identities, and idempotent behavior are especially useful in these situations, but the game's rules must still be designed correctly.

## Make progress visible

The player needs feedback. A lock that refuses to open should provide a recognizable cue. When the key is collected, it should visibly disappear from the world or change state, and the game should communicate the acquisition. When the exit becomes available, the player should be able to tell.

NexusEngine distinguishes presentation meaning from the concrete technology that draws it. Cameras, material descriptions, animation cues, UI intent, and sound may involve presentation contracts and external implementations. A game still has to choose the visual language, timing, and actual host behavior.

For a beginner, a simple on-screen indication that the key is held can be enough. Later, the same idea can become a more polished inventory UI, an animated key icon, a glow on the door, or contextual dialogue. Good feedback should clarify the game state without overwhelming the player.

## Add enemies only after the first loop works

The complete dungeon idea includes a guardian. That expands the problem considerably: an enemy needs identity, position, perception or decision rules, movement, attack behavior, health, hit response, and some form of collision or combat evaluation. A character model with an idle animation provides only part of that system.

Some of those elements may come from Core, a proven optional Kit, or a concrete provider. Other parts, such as the guardian's specific behavior and difficulty, belong to the game. Treat the system as a set of dependencies and verify each one. The first vertical slice can legitimately end with a key and door if enemy behavior has not yet been integrated and tested.

The same principle applies to inventory, dialogue, saving, and progression. Start with a bounded example; expand after it survives real testing.

## Separate source definitions from runtime execution

Authoring can describe a sequence or composition, but a description is not the same thing as a running system. The `n:authoring:sequence` profile stores finite operation sequences associated with existing Runtime Sequence services. Actual gameplay execution requires the relevant runtime to be installed and connected. The Interaction Authoring Harness can help define relationships, but it does not independently become the gameplay engine.

The Editor's isolated Play Mode is useful for checking that accepted source and selected runtime composition work together. Be careful not to assume that an asset export, Authoring snapshot, or a successful composition plan proves that an entire game has been assembled. Each produces different evidence.

## Know when the first loop is genuinely playable

Our room reaches its first meaningful gameplay milestone when a player can enter, move predictably, acquire the key, receive feedback, open the door under the right condition, and reach the exit. Try the wrong order too: opening the locked door first, interacting with the chest twice, or approaching the exit before the objective is complete.

If those actions behave consistently, we have the beginnings of a real game. If they only work when driven by a testing script or manual state manipulation, the player-facing interaction is not complete yet.

The next chapter explains how the four Authoring Harnesses can support this work without confusing creative planning, asset production, interaction definitions, and final review.

Further reading: [Domains and Atomic Kits](04-domains-and-atoms.md), [State and Lifecycle](05-state-lifecycle-idempotence.md), [Composition and Recipes](06-composition-and-recipes.md), and [Physics First Slice](../../PHYSICS-FIRST-SLICE.md).
