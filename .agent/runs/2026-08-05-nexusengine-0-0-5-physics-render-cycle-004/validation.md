# Validation

## Passed

- Physics contract and installation smoke: `node tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs`
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
- 162 manifest-backed atomic Kits
- 871 production modules boundary-scanned
- 209 package modules in the generated test surface
- 132 nonblank, unclipped Guide PDF pages
- Registry SHA-256: `016da6a1b7c25a036ef66e53b81cb36cfe1e4e79592b5ed8362e674cb3e09373`

## Remaining Risk

No deterministic solver, collision backend, render domain, concrete provider,
The Open Above integration, or committed release SHA has been proven.
