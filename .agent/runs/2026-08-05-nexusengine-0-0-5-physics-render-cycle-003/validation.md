# Validation

## Passed

- Provider contract smoke: `node tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs`
- Full suite: `npm test` (`Passed 101 smoke tests`)
- Catalog: `npm run core:check`
- Boundaries: `npm run boundaries:check`
- Ownership: `npm run ownership:check`
- Public test surface: `npm run test:surface:check`
- Release manifest: `npm run release:manifest:check`
- Documentation and PDF: `npm run docs:check`
- Formatting: `git diff --check`

## Repair

The first `core:check` run rejected generated drift after the implementation
changed the source fingerprint. Catalog, ownership, test-surface, release
manifest, and Guide outputs were regenerated and all gates were rerun.

## Observed Results

- 19 Domain manifests
- 107 Domain records
- 161 manifest-backed atomic Kits
- 870 production modules boundary-scanned
- 208 package modules in the generated test surface
- 132 nonblank, unclipped Guide PDF pages
- Registry SHA-256: `1bd1b410fc9be476c55e80a7831f542696d3de5f9551f7d310116d11ffa16a81`

## Remaining Risk

No deterministic solver, collision backend, render domain, concrete provider,
The Open Above integration, or committed release SHA has been proven.
