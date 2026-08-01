# Release And Operating Model

Release proof is performed against committed, reproducible sources. Local-green evidence is necessary but is not the same as a release.

## Generated Truth

The Core catalog, package exports, ownership ledger, API reference, guide indexes, MCP chapter resources, and guide identify the same registry SHA-256. Generate mode writes them; check mode rejects drift.

## Required Gates

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run core:check
npm run ownership:generate
npm run migrations:check
npm run protokits:check
npm run guide:check
npm run guide:examples
npm test
npm run test:release
npm run boundaries:check
npm run docs:check
npm pack --dry-run --json
```

Consumer repositories must install the exact packed or committed Engine source. Local symlinks and sibling private imports invalidate clean-consumer proof.

## Human Approval

After every local and hosted gate passes, present the repository identity, previous numeric branch, derived next version, exact default-branch SHA, checks, and warnings. Approval applies only to that tuple.

Immediately before branch creation, refetch the remote and confirm the default branch still points to the approved SHA. Create the immutable numeric branch with a non-force exact-SHA push, then read the remote ref back and compare it byte for byte.

## Outside This Guide Build

This documentation build does not push, publish, archive ProtoKits, mutate Google Drive, create a GitHub Release, publish npm, or create the numeric version branch. Each action has its own approval gate.
