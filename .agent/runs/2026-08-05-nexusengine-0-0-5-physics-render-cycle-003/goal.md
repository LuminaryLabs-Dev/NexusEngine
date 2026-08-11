# Cycle 003

Mission: add canonical `n:physics` and `n:render` Core domains while keeping
`0.0.4` frozen and avoiding a `0.0.5` branch.

Selected leaf: `goal-kit-n-physics-contracts-physics-provider-contract-kit-i`.

Bounded action: implement stable provider-contract introspection on the
manifest-owned Physics provider Kit. No concrete backend or consumer behavior
is included.

Outcome: providers can be inspected and validated against a versioned,
renderer-neutral contract before composition selects a concrete implementation.
