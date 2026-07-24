# Kit Metadata Contract

Public runtime and domain-service kits must describe enough identity and
ownership for humans, agents, installers, and diagnostics to inspect them.

## Runtime Metadata

```txt
id
domain
domainPath
apiName
apiPath
visibility
stability
version
provides
requires
```

Stateful kits also document:

```txt
owned state
snapshot shape
reset behavior
repeated-install behavior
```

## Registry Metadata

A trusted registry record additionally identifies:

```txt
package
public import
factory export
manifest version
integrity or source reference
proof command
```

Registry metadata is descriptive. It does not become executable until a trusted
provider resolves the declared package and public export.

## Ownership

Metadata does not decide whether a capability belongs in Core. Apply
[`KIT-OWNERSHIP.md`](KIT-OWNERSHIP.md) first.
