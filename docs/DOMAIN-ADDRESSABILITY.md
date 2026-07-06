# Nexus Engine Domain Addressability

## Purpose

Nexus Engine uses an open domain-path layer so humans, agents, editors, registries, and diagnostics can inspect what each Domain Kit owns without locking the engine to a fixed list of paths.

## Rule

```txt
Core validates path shape.
Domain Kits register paths.
Editors and agents inspect paths.
Registries index paths.
New paths remain open.
```

A path like `n:physics:rigidbody` is an address. It is not a whitelist entry.

## What Belongs In Core

Core owns only the contracts and read models:

```txt
domain path validation
domain API registration
runtime event envelopes
snapshot contracts
reset contracts
permission policy checks
composition graph read model
diagnostics read model
```

## What Stays Outside Core

These stay in editors, ProtoKits, kit registries, game repos, or adapter repos:

```txt
editor UI
Kits dock
Inspector dock
Proof dock
Three.js renderer kits
Rapier adapter kits
kit-registry.json
build/export kits
game-specific kits
```

## Domain Kit Shape

A Domain Kit can declare:

```js
defineDomainServiceKit({
  domain: "physics-rigidbody",
  domainPath: "n:physics:rigidbody",
  parentDomainPath: "n:physics",
  stability: "experimental",
  version: "0.1.0"
});
```

The Realtime Core registers the path and API so tools can ask:

```js
engine.n.path("n:physics:rigidbody");
engine.n.paths();
engine.n.api("physicsRigidbody");
engine.n.apis();
```

## Final Rule

```txt
Nexus Engine stays expandable because the path layer is open.
A new path is allowed when a Domain Kit owns it, declares it, and can be inspected.
```
