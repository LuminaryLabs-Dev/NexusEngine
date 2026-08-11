# Cycle 018 Goal

Complete `master-package-n-render-material` as one bounded package: implement
and prove the nine canonical `n:render:material` Kits, preserve Presentation,
Physics, Shader, Texture, Resource, Pipeline, and provider ownership, reconcile
all 63 detailed actions, and select but do not begin the next package.

## Completion

- All nine Material Kits are manifest-owned, public only through generated
  subpaths, exact-once, reset-stable, snapshot-stable, and JSON-portable.
- Material records validate exact Shader programs and variants, Texture views
  and residency, sampler state, parameter shapes, aggregate instances,
  provider observations, and resident semantic cache Resources.
- Presentation remains the owner of authored visual meaning. Physics Material
  remains the owner of physical coefficients. Providers remain the owner of
  GPU bind groups, sampler objects, uploads, handles, and execution.
- Worktree and exact-commit package proof pass before matrix promotion.
- `origin/main` and `origin/0.0.4` remain unchanged and no `0.0.5` branch is
  created.
