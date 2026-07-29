# NexusEngine 0.0.4 Release Candidate

## Status

`main` is the integration branch for `0.0.4`. This repository can be committed
and consumed before publication, but npm publication and a GitHub release are
separate approval-gated actions.

## Outcome

```txt
Agent connects
-> discovers Domains and Kits
-> creates a stable plan
-> human approves
-> trusted host applies it exactly once
-> application persists the receipt
-> runtime continues without the agent
```

Core owns deterministic composition contracts. Applications own executable
trust, approval, mutation, persistence, and lifecycle.

## Breaking Cutover

Composition and Object implementations now have one domain-owned location.
Legacy package aliases were removed and were not replaced with forwarding
exports. Use [the migration map](docs/migrations/0.0.4-domain-cutover.md).

## Required Proof

```bash
npm test
npm run test:release
npm run ownership:generate
npm run release:manifest
npm run docs:check
```

Consumer proof must use a packed or committed NexusEngine dependency without a
local symlink. Publication is not part of this release-candidate gate.
