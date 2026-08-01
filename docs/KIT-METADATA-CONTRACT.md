# Kit Metadata Contract

Public Runtime Kits and Domain Service Kits must expose stable identity,
ownership, lifecycle, and dependency records for humans, agents, installers,
and diagnostics.

## Core Atom Metadata

Every public Core atom is declared by one Domain manifest v2 record:

```txt
stable Kit ID and version
one semantic responsibility
Domain path, parent, and API name
requires and provides tokens
idempotency-key semantics
duplicate-install behavior
snapshot schema and reset behavior
supported environments
settings schema
executable source module and export
public package subpath
proof references and distinct consumers
```

The generator rejects missing proof and any public source with ambiguous
ownership. Compliance values are explicit evidence, not inferred booleans.

## Registry Source Metadata

An executable registry record additionally identifies:

```txt
registry owner and record status
package name and exact version
canonical package subpath
factory export name
supported environment
immutable source commit
SHA-256 integrity
requires and provides tokens
settings schema
requested permissions
```

Unresolved placeholders are non-installable. Metadata retrieval never imports
or executes code. A host may execute only after plan validation, immutable
source resolution, integrity verification, and explicit human approval.

Missing packages are reported in a structured installation receipt. Core never
installs packages during Composition apply.

## Ownership

Metadata describes a capability; it does not admit one into Core. Apply
[Kit Ownership](KIT-OWNERSHIP.md) first. Optional or platform-specific behavior
belongs in an external registry package even when its metadata is complete.
