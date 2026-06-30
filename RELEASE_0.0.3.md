# NexusRealtime 0.0.3 Release Hardening Plan

## Release status

`0.0.3` is a release-hardening branch. It is not the final `stable/0.0.3` branch until the release gate passes.

## Release branch

```txt
release/0.0.3-upgrade
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

## Required commands before stable branch

```bash
npm test
npm run test:release
npm run release:manifest
```

## Stable branch rule

Do not cut `stable/0.0.3` until:

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

When this branch passes the gate, NexusRealtime core can be consumed as the 0.0.3 runtime substrate for stable kits and ProtoKits compatibility work.
