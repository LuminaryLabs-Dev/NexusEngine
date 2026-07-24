# ProtoKit Experiment Loop

This is the repeatable loop for building high-fidelity experiments without editing NexusEngine core.

Read this with:

```txt
docs/protokit-boundaries.md
docs/how-to-protokit.md
docs/how-to-experiment.md
docs/visual-target-review.md
```

## Goal

Use NexusEngine as a read-only runtime dependency while building reusable behavior in ProtoKits and proving it in Experiments.

## Loop

```txt
1. Read NexusEngine context.
2. Select one Experiment target.
3. Generate a target image.
4. Compare target image against the live Experiment.
5. Convert differences into ProtoKit gaps and Experiment gaps.
6. Build/refine reusable behavior in NexusEngine-ProtoKits.
7. Update NexusEngine-Experiments to compose those ProtoKits.
8. Validate ProtoKits and Experiments.
9. Repeat until the Experiment is visibly and semantically closer to the target.
```

## Required Start

```txt
1. Use agent-it.
2. Read docs/protokit-boundaries.md.
3. Read docs/how-to-protokit.md.
4. Read docs/how-to-experiment.md.
5. Read docs/visual-target-review.md.
6. Read latest automation packets for current proof, bug, and idea state.
```

## Skill Flow

```txt
imagegen -> target image
Playwright/human-view -> current experiment capture
visual-target-review -> differences
sequence-it -> bounded execution sequence
simulate-it -> likely outcome check
audit-it -> boundary and risk check
plan-it -> exact plan
do-it -> implementation
harness-it -> repeatable validation harness when needed
```

## Work Routing

```txt
Reusable domain behavior -> NexusEngine-ProtoKits/protokits/
Playable proof -> NexusEngine-Experiments/experiments/
Game-specific rendering/input/UI/content -> NexusEngine-Experiments
NexusEngine core -> read-only, no edits
```

## Validation

Run only the checks for repos changed:

```txt
NexusEngine-ProtoKits:
  npm run check

NexusEngine-Experiments:
  npm run check
```

Do not run a NexusEngine implementation pass because NexusEngine is not edited in this loop.

## Restart Conditions

Restart the loop if:

```txt
NexusEngine core would need edits
Experiment still visibly misses the target
Reusable behavior is implemented inside the Experiment
ProtoKit owns browser rendering, DOM, input listeners, or game-specific content
New ProtoKit lacks owns/provides/requires/used-by
Stateful ProtoKit lacks snapshot/reset expectations
ProtoKits validation fails
Experiments validation fails
Visuals improve but reusable architecture gets weaker
```

## Stop Conditions

Stop when:

```txt
NexusEngine is untouched
Reusable behavior lives in ProtoKits
Playable proof lives in Experiments
Live Experiment is closer to the target image
ProtoKits validation passes
Experiments validation passes
Remaining blockers are documented
```
