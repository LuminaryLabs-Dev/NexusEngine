# Cycle 022 Goal

Review and integrate the source candidate for
`master-package-n-render-surface` without promoting proof state. Establish
strict provider-neutral Surface contracts for window, offscreen, swapchain,
viewport, scissor, resize, fullscreen, and format semantics while keeping host
handles, GPU swapchains, and frame execution outside Core.

## Completion

- Nine atomic Surface Kits expose strict JSON-portable contracts and
  deterministic exact-once state transitions.
- Each Kit has one manifest-owned public source and no hidden provider or host
  behavior.
- Surface depends only on the public Render and Device contracts required by
  its portable semantics.
- This cycle may commit reviewed source, but it cannot execute feature tests,
  run generators, mutate either matrix, or claim package completion during the
  source-first phase.
- `origin/main` and `origin/0.0.4` remain unchanged and no protected branch is
  created or updated.
