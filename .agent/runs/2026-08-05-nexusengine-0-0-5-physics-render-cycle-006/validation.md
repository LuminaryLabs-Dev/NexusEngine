# Validation

## Passed

- State-schema smoke: `node tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs`
- Full suite: `npm test` (`Passed 101 smoke tests`)
- Catalog: `npm run core:check`
- Boundaries: `npm run boundaries:check`
- Ownership: `npm run ownership:check`
- Public test surface: `npm run test:surface:check`
- Release manifest: `npm run release:manifest:check`
- Documentation and PDF: `npm run docs:check`
- Formatting: `git diff --check`

## Observed Results

- 19 Domain manifests
- 107 Domain records
- 163 manifest-backed atomic Kits
- 872 production modules boundary-scanned
- 210 package modules in the generated test surface
- 132 nonblank, unclipped Guide PDF pages
- Registry SHA-256: `9ddd8e97be2b56ee6db534edeffd500e80fcc79937c5d5c90d4691300523fa92`

## Acceptance

The state schema exposes a versioned contract, accepts portable finite state,
normalizes the schema marker, and rejects invalid revisions, non-array body or
collider collections, Maps, non-finite numbers, functions, and cycles.

## Remaining Risk

No deterministic solver, collision backend, render domain, concrete provider,
The Open Above integration, or committed release SHA has been proven.
