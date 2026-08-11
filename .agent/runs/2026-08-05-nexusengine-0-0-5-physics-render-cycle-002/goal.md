# Cycle 002

Mission: add canonical `n:physics` and `n:render` Core domains while keeping
`0.0.4` frozen and avoiding a `0.0.5` branch.

Selected leaf: `goal-kit-n-physics-contracts-physics-provider-contract-kit-c`.

Bounded action: define a manifest-owned Physics provider-contract Kit that
describes and validates provider method shape. It does not implement a solver,
install a provider, own rendering, or modify consumers.

Outcome: the provider boundary is independently inspectable through
`engine.n.physicsProviderContract`, with a public package subpath and generated
registry evidence.
