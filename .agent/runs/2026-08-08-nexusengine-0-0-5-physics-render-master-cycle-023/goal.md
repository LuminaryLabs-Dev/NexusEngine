# Cycle 023 Goal

Review and integrate the source for `master-package-n-physics-detection`
without promoting proof state. Establish deterministic, provider-neutral
broad-phase, narrow-phase, convex-intersection, penetration, continuous
collision, and portable result capabilities while keeping contacts, solver
impulses, provider acceleration structures, and gameplay reactions outside
Detection.

## Completion

- Eleven atomic Detection Kits expose strict JSON-portable contracts and
  deterministic algorithms or exact-once state where state is required.
- Exactly one Kit owns `n:physics:detection`; leaf Kits provide bounded
  capability tokens without duplicate domain ownership.
- Detection consumes Shape and Collider through their public capability APIs.
- Unsupported shape pairs fail explicitly rather than returning approximate
  results presented as exact.
- This cycle may commit reviewed source, but it cannot execute feature tests,
  run generators, mutate either matrix, or claim package completion during the
  source-first phase.
- `origin/main` and `origin/0.0.4` remain unchanged and no protected branch is
  created or updated.
