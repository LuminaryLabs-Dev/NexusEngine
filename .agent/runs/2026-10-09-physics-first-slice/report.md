# Physics first-slice verification

Target: connect existing Core state owners to one external Physics provider and
one visible Three.js view. Full 0.0.5 release, GPU and XR are not certified.

Source bases: Engine `093a86c8ee1f089d361acea0bff801cb47ea0658`, Kits
`85709ae3752239c21039328206bf24f8e4f0f15c`. Editor finite harness:
`ccd3d2ee450a7674e7f65faffa5ef4fa0c86ceb5`.

The actual finite harness completed read, capture-before, plan, validate,
submit, observe, verify, capture-after, and observed-differences. It executed
24 Core/ECS regressions, 381 manifest-backed Kit contract checks, 12 Physics
integration tests from an independently packed consumer, and the browser
software-frame proof. The installed Engine and Kits packages are real tarball
extractions; no sibling source alias or symlink is used.

Two independent 1,200-tick traces match at every tick. Tests cover a falling
box, ground response, friction, bounce, a pass-through sensor, raycast, hinge,
reset, snapshot/replay, malformed snapshots, unsupported friction, and injected
late Simulation and cleanup failures. The browser records 333 actual ticks,
17,526 changed pixels, exact mesh/Core/Spatial pose equality, replay and zero
page errors. Three SVGRenderer is explicitly selected; WebGL2 context creation
is unavailable. One upstream Rapier initialization warning remains visible.

The Kits full `npm run check` passes, with its reported pre-existing audit
warnings. Engine `docs:check`, `core:contracts`, and the focused Core suite pass.
Strict Engine generation still rejects unproven Authoring; Core boundary check
still rejects the existing IndexedDB provider location. These baseline failures
are not waived. The catalog was refreshed with the existing development
`--allow-pending` option, not promoted through strict release gates.

Core owners changed: Runtime/Realtime, Physics Body Registry, Physics Step,
and ECS transaction behavior. External owners: Rapier provider, explicit
Simulation adapter, Three primitive view. Source hashes and logs accompany this
report. No detailed 0.0.5 matrix node is automatically marked complete.

Persistent `nexus-editor` guided controller was unavailable in the reviewed
Editor; its real finite verification API was used instead. The generated
`.agent/tracker.md` is left untouched. No numeric branch, release, tag, npm
publication, deployment, or The Open Above changes are included.
