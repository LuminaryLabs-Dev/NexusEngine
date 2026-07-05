# NexusEngine 0.0.3 Release Hardening Plan

## Release status

`0.0.3` is the release-hardening branch for NexusEngine Core v0.0.3.

## Release branch

```txt
0.0.3
```

## Scope

This release line stabilizes:

```txt
runtime substrate
runtime kit contract
Domain Service Kit contract
core capability kit contract
engine surfaces
sequence runtime
sequence-node runtime
release metadata
public API freeze
release smoke gate
```

## Stable-candidate APIs

See `docs/API_SURFACE_0.0.3.md`.

## Kit status

See `docs/KIT_STATUS_0.0.3.md`.

## Required release-gate commands

```bash
npm test
npm run test:release
npm run release:manifest
```

## Release gate rule

Do not call v0.0.3 released until:

```txt
all release tests pass
public API freeze passes
DSK manifest generation passes
release docs exist
ProtoKits 0.0.3 compatibility docs exist
Stable Kits lane is created or explicitly deferred
release gate report is recorded
```

## Direct outcome

When this branch passes the gate, NexusEngine core can be consumed as the 0.0.3 runtime substrate for stable kits and ProtoKits compatibility work.
