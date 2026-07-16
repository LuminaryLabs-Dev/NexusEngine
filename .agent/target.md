# Development Target

## Goal

Promote a semantic Core Object Shape domain under `n:core-object` that derives validated lower-complexity geometric shapes, composes with Object Fidelity, and proves geometry and capture output through post-push smoke fixtures.

## Mode

Implementation

## Scope

- `core-object-shape-kit`
- `core-object-shape-domain`
- Meshoptimizer and portable reference shape providers
- Object Shape to Object Fidelity adapter
- optional Core Object composite domain
- public exports, package subpaths, manifest, docs, and focused tests
- input/output mesh and software capture visual smoke evidence

## Required outcome

- Object Shape owns profiles, sources, jobs, providers, derived shapes, metrics, snapshots, reset, cancellation, duplicate reuse, and stale-work rejection.
- The installed domain performs real geometry reduction through a provider, not through Unity code or Draco.
- Meshoptimizer is an interchangeable backend; a deterministic reference provider keeps headless validation operational.
- Derived shapes preserve valid indices, finite positions, nondegenerate triangles, bounds, and measurable quality evidence.
- Object Fidelity can consume a ready derived shape through `object-shape-form`.
- Capture smoke tests compare source and reduced silhouettes from multiple views and produce inspectable visual evidence.
- The solution is pushed to `main` before post-push smoke execution.

## Constraints

- Work directly on `main`.
- Do not create a pull request or branch.
- Keep renderer, GPU, Draco, and object-specific morphology outside Object Shape.
- Preserve snapshots and renderer-neutral state.
- Validate before reporting completion.
