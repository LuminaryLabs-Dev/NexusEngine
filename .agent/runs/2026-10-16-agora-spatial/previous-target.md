# Development Target

## Current milestone: one complete Physics-to-render path

Continue on `main` without creating development, testing, staging, or numeric
release branches. Preserve `origin/0.0.4`. The user explicitly authorized
implementation and pushing the validated first slice to `main` on 2026-10-09.
This replaces the old numeric-branch/freeze and one-atomic-package-per-turn
execution policy; it does not remove any remaining 0.0.5 feature requirements.

Use the existing Core owners, one external Rapier provider and one Three.js
view to prove actual `engine.tick(1/60)` execution: falling, ground response,
friction, bounce, a sensor, a raycast, and a hinge. Then prove reset,
snapshot/load, deterministic replay, invalid-input rejection, and rollback
when a participant or later tick phase fails. Concrete providers belong in
`LuminaryLabs-Dev/NexusEngine-Kits`; authored scene and camera settings remain
host-owned. Do not recreate existing Kits or add another body state owner.

The first slice may be committed as development work with explicit evidence
and recorded baseline failures. Do not call it the whole 0.0.5 release or bump
the version simply to match the target. Advanced Physics, all remaining Render
packages, additional providers, The Open Above, MCP and full release gates
remain required under `.agent/versions/0.0.5/`.

## Evidence and boundaries

Read `docs/PHYSICS-FIRST-SLICE.md` for the new public methods, proof commands,
and limits. Source and tests decide behavior; older matrix counts and readiness
summaries are historical projections until individually reconciled. No detailed
node is promoted merely because one first-slice test passes.

The reviewed Editor commit supplies a finite nine-stage evidence harness, not
the historical `nexus-editor` persistent controller CLI. Use that finite harness
for this bounded attempt and record the unavailable persistent-controller path.
Do not manually edit `.agent/tracker.md` or fabricate its state.

WebGL2, GPU hardware, XR, and The Open Above proof are separate from software
Three.js SVG frame proof. Never present software-frame evidence as GPU proof.
Existing strict Authoring and IndexedDB ownership failures must stay visible;
`--allow-pending` catalog generation is not a strict release-check pass.

## Push policy

Only the existing `main` refs may advance. Before a remote write, name the exact
repository and action. Use expected-head checks and non-forced fast-forwards;
reconcile concurrent work instead of overwriting it. No npm publication, tags,
releases, deployment, Drive mutation, or hardware installation is authorized.
