# NexusEngine 0.0.4 Release Candidate

## Status

The remote default branch is the integration line for `0.0.4`. Publication,
GitHub release creation, and the immutable numeric branch are separate
approval-gated actions.

## Outcome

```txt
Agent connects
-> discovers semantic Domains, atoms, recipes, and exact sources
-> validates and creates a stable plan
-> human approves that exact plan
-> transactional host applies it exactly once
-> receipt persists across restart
-> application continues without the agent
```

## Hard Cutover

Core implementations now have one manifest-owned semantic location. Old root
symbols, Core-prefixed identities, old subpaths, concrete adapters, optional
gameplay, and forwarding aliases are removed. Consumers use the
[migration guide](docs/migrations/0.0.4-domain-cutover.md), not compatibility
code.

## Build Proof

`n:build` is packaged with NexusEngine but is not part of `createEngine()` or
the application runtime graph. Its Web Live and Web Static targets pass fresh
artifact startup in Chromium and preserve the source project byte for byte.
Repeated apply returns the original receipt, while a mixed Web/native request
preserves successful Web output and remains failed until every native target
passes.

Android XR and PCVR currently produce deterministic, reviewable, fail-closed
plans. A plan is not a native artifact. Release remains blocked until the
selected source revisions, generated Rust semantics, native host builders,
package validators, OpenXR runtimes, and one real headset in each target lane
pass. The Open Above showcase and clean consumer SHA propagation are also
release requirements.

## Required Proof

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx --no-install playwright install chromium
npm run core:check
npm run core:contracts
npm run protokits:check
npm run ownership:generate
npm run migrations:check
npm run release:manifest:check
npm run docs:check
npm test
npm run test:release
npm run boundaries:check
npm pack --dry-run --json
```

Engine, Kits, Editor, and Simulator consumer proof must use committed or packed
dependencies without local symlinks. The exact remote default-branch SHA must
pass local and hosted gates before a human can approve creation of immutable
branch `0.0.4` at that same SHA.
