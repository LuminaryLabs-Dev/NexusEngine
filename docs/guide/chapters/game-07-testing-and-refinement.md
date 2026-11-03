# Playtesting, Reviewing, and Improving

A feature is not finished simply because the code ran or the model exported. It is finished when the intended behavior can be observed and repeated, and when the result is suitable for the game being made. This difference becomes obvious the first time a technically valid door refuses to open, a character slides across the floor, or an otherwise impressive room is confusing to navigate.

In **A Small Dungeon Adventure**, our first test is straightforward: can a person start in the room, discover the key, use it on the door, and reach the exit? We will use that journey to understand several kinds of evidence.

## First ask what you are trying to prove

Different tests answer different questions. A mesh validator can identify missing references or invalid topology, but not whether the chest looks attractive. A successful state transition shows that data changed, but not whether the player saw the change. A build that creates files proves something about packaging, but not whether the game launches correctly in the intended browser or device.

| Kind of review | What it can establish | What it cannot establish alone |
| --- | --- | --- |
| Source validation | Document structure, references, supported profiles | Visual appeal or gameplay feel |
| Runtime test | A specified rule or state transition occurred | That the result was understandable to a player |
| Render review | What a particular camera and provider displayed | That all interactions work |
| Gameplay scenario | A real sequence of player actions succeeds | That every other scenario succeeds |
| Performance measurement | Observed cost on a measured workload | Universal performance on other devices |
| Build validation | Files and dependencies meet the target's checks | Real execution on untested hardware |

The most convincing result combines evidence. For our key-and-door loop, we want accepted source, a runtime that actually executes the interaction, a visible response, a successful completion condition, and a packaged application that can be opened independently.

## Test the ordinary path and the wrong path

Begin with the expected sequence. Start the game, move to the chest, acquire the key, approach the door, open it, and reach the exit. Observe what happens after every action. Does the key disappear from the world? Does the interface acknowledge collection? Does the door open at the expected moment? Can the player see the exit once the door moves?

Then try actions in the wrong order. Approach the door before taking the key. Try collecting the same key twice. Leave the interaction area while an animation is playing. Repeat the open command. Restart the runtime and compare the intended initial state.

These are not merely “edge cases.” They are often the clearest way to discover a hidden ownership or synchronization problem. If the UI says a key was collected but the door still refuses it, determine whether the game has two inconsistent copies of that fact. If the door opens twice, check whether the interaction is being repeated without a proper state guard.

A well-defined test names the relevant setup, player action, expected change, and observable result. It does not require exposing every internal function to the reader.

## See the actual pixels

Visual review should use a real rendered frame from the same kind of pipeline that the player will see. The NexusEngine Editor provides a viewport, and its Authoring examples demonstrate rendering and inspection of exported assets. That is more informative than judging source mesh data alone.

Compare the result to the intended scene. Is the room readable from the actual camera? Does the chest stand out enough? Are the floor and wall seams obvious? Do materials respond plausibly to lighting? Are objects intersecting, hovering, or casting distracting shadows?

When evaluating animated content, inspect movement over time. A single still frame can conceal sliding feet, poor pivots, abrupt transitions, and unstable camera behavior. If a problem appears only while playing, capture the relevant sequence or repeat it under the same conditions.

It is useful to keep a short record of what the screenshot or clip actually shows and which source revision produced it. A screenshot made before a later edit cannot prove the later asset looks correct.

## Fix the cause, not just the symptom

Suppose the chest appears to float above the floor. That could come from its mesh origin, the Assembly instance transform, or the position of the floor. Investigate which source owns the discrepancy before changing anything. Correcting all three at once might conceal the issue while introducing new alignment errors elsewhere.

The same method works for game feel. If the door looks too light, the problem may be its hinge pivot, opening speed, easing, sound, or a mismatch between animation and player input. A longer animation is not automatically better. Observe, change one relevant factor, and compare the result.

For repeated assets, validate shared-source changes against multiple instances. Improving a wall mesh in one room should not create gaps in another. For gameplay, rerun scenarios that consume the changed state, not only the one that originally failed.

This targeted approach preserves working systems and makes each correction explainable.

## Use the Engine's evidence where it belongs

Core Authoring operations produce source-bound receipts, validations, revisions, and recovery information. Play Mode isolates the test runtime from source. The production harness can retain observation and explicit review results when configured. The Build system records target plans and artifacts with immutable source identities.

These are complementary sources of evidence. A transaction receipt proves that a particular edit was accepted. A format validation report describes a particular encoded artifact. A gameplay scenario demonstrates a sequence of actions. A human or agent review evaluates whether the result met the creative intention.

The current Core documentation also records incomplete development gates, notably in the 0.0.5 Physics and Render work. A guide should not erase those warnings because a narrow demonstration happened to work. When a provider has only been tested under a mock device or in a particular browser, state that limitation.

## Know when to stop refining

Games can be improved indefinitely. For a first vertical slice, agree on a small set of acceptance conditions before polishing. The player must understand where to go, movement must be controllable, the key-and-door rule must behave correctly, the scene must be visually legible, and the build must run in the selected environment.

Optional decoration, a more elaborate animation, or an enemy can wait if they do not help prove the first experience. Conversely, a highly polished chest is not enough to accept a room in which the door never opens.

Our dungeon room is ready to move toward packaging only after the full interaction has been tested in a real runtime and the visible result has been reviewed. The guide's example remains illustrative until someone actually runs that integration and retains its evidence; the prose here is not a test report.

Next we will distinguish several kinds of export and learn what it takes to deliver a game someone else can start and play.

Further reading: [Testing and Proof](10-testing-and-proof.md), [Visual Target Review](../../visual-target-review.md), [Editor Authoring Validation](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/docs/AUTHORING-VALIDATION.md), and [Physics First Slice](../../PHYSICS-FIRST-SLICE.md).
