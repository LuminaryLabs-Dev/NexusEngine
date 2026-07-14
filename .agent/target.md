# Development Target

## Goal

Add optional Core Object Fidelity and Core Capture domains that preserve object identity across multiple visual forms and coordinate view-derived evidence without owning renderer or GPU implementation.

## Mode

Implementation

## Scope

- `core-object-fidelity-kit` and `core-object-fidelity-domain`
- `core-capture-kit` and `core-capture-domain`
- public exports, package subpaths, manifests, docs, and focused smoke tests
- Core Headless Editor evidence for installed composition, snapshots, readiness, adaptation, and atomic replacement

## Required outcome

- Core Capture supports serializable requests, jobs, results, provider replacement, duplicate request reuse, failure, cancellation, snapshot, and reset.
- Object Fidelity supports profiles, forms, builds, capture dependencies, visible and complete readiness, contextual adaptation, stale-build rejection, and atomic active-package replacement.
- The active fidelity package remains usable while a replacement waits for capture.
- Duplicate builds and package commits do not repeat work.
- A tree-like object and a non-tree object use the same core contracts.
- All public state passes `structuredClone()` and contains no renderer, GPU, DOM, Canvas, Worker, or platform objects.
- Headless Editor smoke evidence completes through observed differences with zero regressions.

## Constraints

- Work directly on `main`.
- Do not create a pull request or branch.
- Keep Capture independent of why observations are requested.
- Keep Object Fidelity independent of tree morphology, creature anatomy, and renderer implementation.
- Reuse Core Object and Core Transaction Ledger contracts.
- Keep Core Compute optional.
- Validate before reporting completion.
