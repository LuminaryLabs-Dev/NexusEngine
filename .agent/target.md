# Development Target

## Goal

Make skinned-object and skinned-tree shape reduction provably safe inside the existing `n:object:shape` domain by treating provider output as a candidate that must pass structural, deformation, and silhouette qualification before Object Fidelity may consume it.

## Mode

Implementation

## Scope

- `core-object-shape-kit`
- Meshoptimizer and deterministic reference shape providers
- `skinned-organic-production` shape profile
- Object Shape to Object Fidelity adapter
- candidate, qualification, fallback, rejection, snapshot, and stale-work contracts
- focused Headless Editor and installed-composition smoke tests
- public exports and test registration

## Required outcome

- Meshoptimizer output is recorded as a candidate, not immediately published as a ready shape.
- Safe production mode keeps the original skeleton, bind contract, vertex layout, skin indices, and skin weights.
- Protected branch roots and deformation zones must remain referenced by approved geometry.
- Deterministic validation checks indices, finite values, bones, weights, weight normalization, protected vertices, multi-pose deformation, and multi-view silhouette overlap.
- Rejected candidates retain inspectable qualification evidence.
- Failed reductions retry progressively safer ratios and finally the source shape.
- Only approved shapes are published through `getShape()` and accepted by `object-shape-form`.
- Stale, failed, and rejected work cannot replace an approved shape or Fidelity package.
- Snapshots preserve candidates, qualification evidence, jobs, rejected results, and approved shapes.
- Headless fixtures prove approval, rejection, fallback, duplicate reuse, stale blocking, Fidelity gating, snapshot restore, and deterministic evidence.

## Constraints

- Work directly on `main`.
- Do not create a pull request or branch.
- Extend Object Shape; do not add another domain.
- Keep renderer, GPU, capture implementation, tree morphology, and production skeleton reduction outside this change.
- Keep automatic skeleton reduction experimental and disabled by default.
- Preserve renderer-neutral serializable state.
- Validate before reporting completion.
