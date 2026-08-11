# Cycle 006

Mission: add canonical `n:physics` and `n:render` Core domains while keeping
`0.0.4` frozen and avoiding a `0.0.5` branch.

Selected leaf: `goal-kit-n-physics-contracts-physics-state-schema-kit-c`.

Bounded action: define the portable Physics state schema Kit for snapshots,
replay, and persistence. No solver, backend, or renderer behavior is included.

Outcome: state snapshots have a versioned schema boundary and reject invalid,
nonportable, cyclic, or non-finite data before normalization.
