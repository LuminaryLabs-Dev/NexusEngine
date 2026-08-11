# Validation

## Passed

- Canonical contract smoke: `node tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs`
- Existing Physics domain smoke: `node tests/core-domains/core-physics-domain-smoke.mjs`
- Existing provider smoke: `node tests/core-kits/core-physics-provider-smoke.mjs`
- Full suite: `npm test` (`Passed 101 smoke tests`)
- Catalog: `npm run core:check`
- Boundaries: `npm run boundaries:check`
- Ownership: `npm run ownership:check`
- Public test surface: `npm run test:surface:check`
- Release manifest: `npm run release:manifest:check`
- Documentation and PDF: `npm run docs:check`

## Observed Results

- 19 Domain manifests
- 107 Domain records
- 160 manifest-backed atomic Kits
- 869 production modules boundary-scanned
- 207 package modules in the generated test surface
- 132 nonblank, unclipped guide PDF pages
- Registry SHA-256: `7da50d885dccc1ff6324e7f777531d989bc399127b87e57bcb88d19789b8faf5`

## Remaining Risk

This proves only the contract slice. No deterministic solver, collision
backend, render domain, concrete provider, The Open Above integration, or
committed release SHA has been proven.
