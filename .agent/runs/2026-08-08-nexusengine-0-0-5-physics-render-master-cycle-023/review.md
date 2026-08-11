# Cycle 023 Review

## Candidate Disposition

Rewrite required. Preserve the planned Kit identities, but do not integrate the
generic generated implementations.

## Required Corrections

- Assign `n:physics:detection` to exactly one domain owner.
- Keep only the spatial proxy index stateful; keep algorithms and result
  normalization pure.
- Define strict finite bounds, proxy, pair, intersection, penetration, sweep,
  tree, and result contracts.
- Implement deterministic pair ordering and collision-filter handling.
- Implement supported analytic and convex algorithms; reject unsupported cases
  explicitly.
- Keep contacts, events, impulses, constraints, backend objects, and gameplay
  responses outside Detection.
- Wire every Kit through manifest v2 and the canonical Physics entrypoint.
