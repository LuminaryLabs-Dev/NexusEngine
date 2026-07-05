# NexusRealtime 0.0.3 Branch Policy

## Current rule

Use this branch model for NexusRealtime Core v0.0.3:

```txt
main
  Active hardening and forward-iteration branch.

0.0.3
  Release branch for NexusRealtime Core v0.0.3.

release/0.0.3-upgrade
  Historical / compatibility hardening ref.
  Not the canonical release branch name.
```

## Public wording

Use:

```txt
Nexus Engine, powered by NexusRealtime Core v0.0.3, is active in release hardening.
```

Use after the release gate passes:

```txt
NexusRealtime Core v0.0.3 is released.
```

Avoid:

```txt
stable/0.0.3 is live
```

unless a stable branch is explicitly created and the release gate report is recorded.

## Update rule

When docs mention the active v0.0.3 release branch, they should point to:

```txt
0.0.3
```

When docs mention ongoing hardening work, they should point to:

```txt
main
```

When docs mention `release/0.0.3-upgrade`, they should describe it only as a historical or compatibility ref.

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
