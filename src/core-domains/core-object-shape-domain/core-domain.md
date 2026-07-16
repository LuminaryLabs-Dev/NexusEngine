# Core Object Shape Domain

`n:object:shape` is the optional semantic child of Core Object that owns source and derived geometric shapes.

## Owns

- source and derived shape descriptors
- preservation profiles and targets
- content-addressed derivation jobs
- provider coordination and waiting state
- metrics and quality evidence
- validation, failure, cancellation, snapshots, and reset

## Does not own

- object identity or lifecycle
- runtime fidelity adaptation
- capture rendering
- materials or lighting
- Three.js, WebGPU, GPU buffers, or host workers
- asset compression or Draco encoding
- tree, creature, building, or vehicle semantics

## Composition

```txt
Core Object defines the object.
Object Shape derives geometric expressions.
Capture derives observed expressions.
Object Fidelity chooses and packages valid forms.
Graphics presents the chosen form.
```
