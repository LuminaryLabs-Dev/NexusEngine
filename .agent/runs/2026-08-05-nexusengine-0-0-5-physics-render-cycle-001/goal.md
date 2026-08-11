# Cycle 001

Mission: add the canonical `n:physics` Core domain without implementing a
backend or changing consumers.

Selected leaf: `goal-kit-n-physics-contracts-physics-domain-contract-kit-c`.

Scope boundary:

- Add the manifest-owned `n:physics` domain and its public contract Kit.
- Expose the `nexusengine/domains/physics` and `/contract` subpaths.
- Preserve the existing provider-neutral implementation and direct legacy
  fixtures while preventing duplicate `engine.n.physics` installation.
- Regenerate catalog, ownership, guide, MCP resource, package-surface, and
  release-manifest outputs.
- Do not implement a physics backend, render domain, consumer integration,
  push, release branch, or `0.0.5` branch in this cycle.
