# Services

This describes the ideal target architecture, not a guarantee that the current NexusRealtime implementation already satisfies every rule.

Reading order: [Domains](domains.md) -> [Kits](kits.md) -> Services -> [DSK](dsk.md) -> [Composition](composition.md) -> [Shared Host](shared-host.md)

## Definition

A service is the bridge and API layer that acts on domain state.

Services let kits coordinate without freely reaching into each other's internals. They expose stable operations over domain state while keeping ownership clear.

Core phrase:

```txt
Domains hold the state, kits install the behavior, services bridge the behavior.
```

## Controlled Verbs

An ideal service exposes controlled verbs such as:

- Inspect object.
- Stream chunk.
- Resolve boundary.
- Query path.
- Reset domain.
- Emit proof.
- Read snapshot.
- Apply authored input.

These verbs make behavior explicit. They also make it easier to test, log, replay, validate, and replace a kit without breaking the rest of the graph.

## What Services Are Not

Services do not replace domains. The domain still owns the state boundary.

Services do not replace kits. The kit still installs resources, events, systems, and lifecycle behavior.

Services do not own product presentation. They should expose reusable operations, not browser UI, story copy, or route-specific rendering.

## Ideal Rule

A service is the stable bridge between reusable behavior and owned domain state. If two kits need to collaborate, they should use services and declared contracts instead of hidden shared mutation.
