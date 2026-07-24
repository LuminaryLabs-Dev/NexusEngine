# NexusEngine 0.0.3 Branch Policy

## Current rule

Use this branch model for NexusEngine Core v0.0.3:

```txt
main
  Active hardening and forward-iteration branch.

0.0.3
  Release branch for NexusEngine Core v0.0.3.
```

## Public wording

Use:

```txt
Nexus Engine, powered by NexusEngine Core v0.0.3, is active in release hardening.
```

Use after the release gate passes:

```txt
NexusEngine Core v0.0.3 is released.
```

Avoid claiming release completion until the release gate report is recorded.

## Update rule

When docs mention the active v0.0.3 release branch, they should point to:

```txt
0.0.3
```

When docs mention ongoing hardening work, they should point to:

```txt
main
```

Do not introduce compatibility or historical hardening branch names for v0.0.3.

## Release gate checklist

Before calling the release complete:

```txt
npm test passes
npm run test:release passes
npm run release:manifest passes
public API freeze is accepted
DSK manifest generation is accepted
release docs exist
ProtoKits compatibility docs exist
Stable Kits lane is created or explicitly deferred
release gate report is recorded
```
