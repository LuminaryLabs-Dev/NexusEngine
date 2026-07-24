# Experiment And Game Workflow

Experiments and games prove complete experiences by composing NexusEngine Core
with trusted registry kits.

## Repository Roles

```txt
NexusEngine
  universal Core contracts and behavior

NexusEngine-Kits
  reusable optional behavior

Experiment or game repository
  rendering, input, UI, authored content, presets, and product tuning
```

## Workflow

1. Define the smallest playable claim.
2. Inventory existing Core and trusted kit capabilities.
3. Classify every missing behavior with
   [`KIT-OWNERSHIP.md`](KIT-OWNERSHIP.md).
4. Add reusable optional behavior to NexusEngine-Kits with a manifest, public
   export, installer path, and focused proof.
5. Keep complete game behavior and authored content in the experiment or game.
6. Install dependencies through public package entrypoints.
7. Run headless composition proof, then browser proof.
8. Record gaps as suggestions unless implementation was explicitly approved.

## Experiment Ownership

An experiment may own:

- scene composition and camera framing
- browser routes and app lifecycle
- input mapping
- UI and accessibility
- authored worlds, objectives, copy, assets, and presets
- product-specific balance and tuning
- visual and playable proof

It must not hide a reusable implementation that belongs in a trusted kit.

## Validation

```txt
headless behavior proof
installed package proof
reset and snapshot proof when stateful
browser startup and console proof
playable interaction proof
visual comparison
```

An experiment can reveal a missing Core primitive, but Core work requires a
separate ownership-gate decision. Use
[`visual-target-review.md`](visual-target-review.md) to classify visible gaps.
