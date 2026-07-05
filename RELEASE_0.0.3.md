# NexusEngine 0.0.3 Release Plan

## Release status

`0.0.3` is the release branch for NexusEngine Core v0.0.3.

`main` is the active hardening and forward-iteration branch.

The older `0.0.3` ref is no longer the authoritative branch name for the release line. It may exist as a compatibility or historical hardening ref, but documentation should point to `0.0.3` as the release branch.

## Branch roles

```txt
main
  Active hardening branch and current forward-development line.

0.0.3
  NexusEngine Core v0.0.3 release branch.

0.0.3
  Historical / compatibility release-hardening ref.
  Do not use as the canonical public branch name.
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

## Required commands before declaring release complete

```bash
npm test
npm run test:release
npm run release:manifest
```

## Release completion rule

Do not describe `0.0.3` as complete until:

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

When the release gate passes, NexusEngine Core v0.0.3 can be consumed as the runtime substrate for stable kits and ProtoKits compatibility work.
