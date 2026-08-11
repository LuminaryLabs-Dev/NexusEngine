# Cycle 004

Mission: add canonical `n:physics` and `n:render` Core domains while keeping
`0.0.4` frozen and avoiding a `0.0.5` branch.

Selected leaf: `goal-kit-n-physics-lifecycle-physics-installation-kit-c`.

Bounded action: define the manifest-owned Physics installation lifecycle
contract. No solver, body behavior, renderer behavior, or consumer integration
is included.

Outcome: the Physics composition has an explicit lifecycle ownership boundary
with a public subpath, lifecycle schema, and resettable state baseline.
