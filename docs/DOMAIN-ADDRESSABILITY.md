# NexusEngine Domain Addressability

## Purpose

Domain paths let humans, agents, registries, and diagnostics inspect semantic
ownership without coupling consumers to private source folders.

## Rules

```txt
Core validates the path contract.
Core manifests own all built-in semantic paths.
External Domain Service Kits may register new semantic children.
Editors and agents inspect paths and public APIs.
Registries index paths without executing metadata.
```

A path is an address, not a filesystem location. Built-in Core paths come only
from Domain manifests; runtime scanning cannot invent one.

## Core Path Shape

Examples:

```txt
n:runtime:realtime
n:object:placement
n:simulation:physics
n:presentation:graphics
```

The retired Core-prefixed namespace is invalid. Immediate parents must exist and
every built-in path has one semantic owner record.

## External Domain Service Kits

An external package may add an inspectable semantic child through the public
DSK contract:

```js
defineDomainServiceKit({
  id: "rapier-rigidbody-provider-kit",
  domain: "simulation-physics-rigidbody-provider",
  domainPath: "n:simulation:physics:rigidbody-provider",
  parentDomainPath: "n:simulation:physics",
  apiName: "rigidbodyProvider",
  stability: "experimental",
  version: "0.1.0"
});
```

The host must still approve and resolve its immutable registry source. A valid
path does not prove that external code is safe or belongs in Core.

## Inspection

```js
engine.n.path("n:simulation:physics");
engine.n.ownerOf("n:simulation:physics");
engine.n.paths();
engine.n.api("physics");
engine.n.apis();
```

Core owns path validation, registration, snapshots, and read models. Editors,
registry UIs, concrete providers, and game behavior remain outside Core.
