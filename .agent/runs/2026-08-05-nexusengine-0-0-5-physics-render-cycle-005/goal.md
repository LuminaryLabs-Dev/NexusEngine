# Cycle 005

Mission: add canonical `n:physics` and `n:render` Core domains while keeping
`0.0.4` frozen and avoiding a `0.0.5` branch.

Selected leaf: `goal-kit-n-physics-lifecycle-physics-installation-kit-i`.

Bounded action: implement repeat-safe Physics installation `install`, `start`,
and `stop` transitions using the existing operation receipt mechanism.

Outcome: lifecycle state changes require operation IDs, replay returns the
original receipt, invalid transitions fail before mutation, and no backend
behavior is introduced.
