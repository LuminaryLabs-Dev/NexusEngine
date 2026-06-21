# Domain Service Kits

This describes the ideal target architecture, not a guarantee that the current NexusRealtime implementation already satisfies every rule.

Reading order: [Domains](domains.md) -> [Kits](kits.md) -> [Services](services.md) -> DSK -> [Composition](composition.md) -> [Shared Host](shared-host.md)

## Definition

A Domain Service Kit, or DSK, is the packaged contract that combines domain ownership, kit behavior, and service bridge.

It is the unit that says:

- This is the domain I own.
- These are the behaviors I install.
- These are the services I expose.
- These are the capabilities I provide.
- These are the capabilities I require.
- This is how my state snapshots and resets.

## Ideal Metadata

An ideal DSK declares:

- Stable `id`.
- `domain`.
- `stability`.
- `version`.
- `provides`.
- `requires`.
- Lifecycle expectations.
- Service API.
- Snapshot expectations.
- Reset expectations.

The metadata is not decoration. It is what lets a large graph be inspected, validated, migrated, and safely recomposed.

## Namespacing And Token Ownership

DSKs need namespacing because thousands of kits may exist in the same ecosystem.

Namespacing should make these questions answerable:

- Which kit owns this service?
- Which domain owns this state?
- Which provider satisfies this token?
- Which composition path mounted this instance?
- Which service can be called safely?

Without namespacing and token ownership, large kit graphs collapse into hidden collisions, duplicate providers, and ambiguous state.

## Async-Ready, Linear Today

An ideal DSK should be serializable and async-ready by contract, even if execution is linear today.

That means the DSK should describe:

- State that can be snapshotted.
- Inputs that can be declared.
- Outputs that can be inspected.
- Reset behavior that is deterministic.
- Boundaries that could later move to async workers, remote streams, or isolated host instances.

## Ideal Rule

A DSK is not just a kit name. It is the durable contract that makes reusable domains safe to install, inspect, compose, reset, and eventually scale.
