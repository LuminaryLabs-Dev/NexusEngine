# Visual Target Review

Use this checklist to compare an intended visual target with a live experiment
or game.

## Compare

- camera, scale, and composition
- lighting, terrain, density, and mood
- actor and interactable readability
- UI and feedback
- semantic gameplay promise
- missing behavior and missing proof

## Classify Each Difference

| Classification | Owner |
| --- | --- |
| Core invariant gap | NexusEngine after ownership-gate approval |
| Reusable optional behavior gap | NexusEngine-Kits or another trusted registry |
| Experiment gap | Experiment or game repository |
| Data or config gap | Current owner of the authored data |
| Validation gap | Repository that makes the unproven claim |
| Out of scope | Record only |

## Output

```txt
Target intent:
Current visible state:
Differences:
Ownership for each difference:
Validation gaps:
Next approved change:
```

Visual similarity does not decide architecture. Use
[`KIT-OWNERSHIP.md`](KIT-OWNERSHIP.md) for every production destination.
