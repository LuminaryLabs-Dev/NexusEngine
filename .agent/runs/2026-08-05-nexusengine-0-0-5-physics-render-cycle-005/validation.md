# Validation

## Passed

- Lifecycle smoke: `node tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs`
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
- Registry SHA-256: `0998da780da78ee125334269b1b2d0d64e9edd411b65711a3dc8939317359e04`

## Acceptance

Install transitions to `ready`, the same operation ID replays the original
receipt, a changed operation ID cannot repeat an invalid transition, stop
returns to `uninstalled`, and start from `uninstalled` fails before mutation.

## Remaining Risk

No deterministic solver, collision backend, render domain, concrete provider,
The Open Above integration, or committed release SHA has been proven.
