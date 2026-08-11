# Cycle 020 Goal

Review and integrate the source candidate for
`master-package-n-physics-collider` without promoting proof state. Preserve one
mutable collider owner, reuse the committed Body, Shape, and Material public
contracts, and keep provider execution outside Core.

## Completion

- `collider-registry-kit` is the sole mutable owner of portable collider
  records and revisions.
- Identity, attachment, local pose, physical material reference, filtering,
  layer, mask, group, sensor, trigger, and lifecycle semantics each have one
  atomic manifest-owned contract.
- Candidate files outside `src/core-domains/physics/subdomains/collider/` remain
  quarantined and are never copied into the repository.
- Collision detection, contacts, solving, native handles, rendering, and
  gameplay effects remain outside Collider.
- This cycle may commit reviewed source, but it cannot execute feature tests,
  mutate either matrix, or claim package completion during the source-first
  phase.
- `origin/main` and `origin/0.0.4` remain unchanged and no `0.0.5` branch is
  created.
