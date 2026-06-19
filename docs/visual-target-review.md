# Visual Target Review

Use this checklist when generating a target image and comparing it to the live experiment.

## Goal

Generate a visual target for what the experiment should feel like, then compare it to the browser-visible experiment and convert the differences into ProtoKit and Experiment work.

## Target Image Requirements

The target image should show:

```txt
camera angle
world scale
main actor or player viewpoint
important interactable objects
lighting and mood
terrain/world structure
UI or no-UI expectation
visual density
semantic gameplay promise
```

## Comparison Checklist

Compare target image vs live experiment across:

```txt
composition
camera
scale
lighting
terrain/world structure
actor readability
object density
UI/HUD
feedback
mood
semantic gameplay meaning
missing domain behavior
missing kit behavior
renderer-only vs simulation ownership
```

## Difference Classification

Classify each difference as one of:

```txt
ProtoKit gap
  reusable domain behavior is missing or weak

Experiment gap
  composition, rendering, input, UI, content, or scene preset needs work

Data/config gap
  existing kit can do it but needs better config or authored data

Validation gap
  behavior exists but lacks proof, smoke test, snapshot, or browser check

Out of scope
  target image asks for something outside the current experiment goal
```

## Output Shape

```txt
Target image intent:
- ...

Current visible state:
- ...

Differences:
- ...

ProtoKit gaps:
- ...

Experiment gaps:
- ...

Validation gaps:
- ...

Next update:
- ...
```

