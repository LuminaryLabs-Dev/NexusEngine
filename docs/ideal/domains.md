# Domains

This describes the ideal target architecture, not a guarantee that the current NexusRealtime implementation already satisfies every rule.

Reading order: Domains -> [Kits](kits.md) -> [Services](services.md) -> [DSK](dsk.md) -> [Composition](composition.md) -> [Shared Host](shared-host.md)

## Definition

A domain is a bounded state and meaning container. It is not the behavior object itself.

A domain answers:

- What state exists?
- What does that state mean?
- Who owns reset and snapshot boundaries?
- What inputs and outputs are allowed?
- Where does this domain sit inside a composition?

The same domain idea can appear at different scales. A fish tank, world, terrain field, route, hazard field, economy, or inspection target can all be domains if they own a clear state boundary.

## Ownership

An ideal domain owns:

- State boundaries.
- Snapshot and reset expectations.
- Input and output meaning.
- Composition identity.
- Its relationship to neighboring domains.

A domain should not own arbitrary behavior just because it contains data. Behavior belongs in kits. Stable operations over the state belong in services.

## Size Does Not Define The Domain

A domain can be tiny or massive.

```txt
fish-tank
world
terrain
route
hazard-field
economy
inspection-target
```

The size of a domain does not make it unique. A domain becomes unique because of what it owns and what role it plays in the composition.

For example, a fish tank may contain a small world domain. A large open-world game may also contain a world domain. Both can be valid because each world has a different owner, boundary, and composition path.

## Ideal Rule

Domains hold the state and meaning. They do not directly reach across the graph to mutate other domains. Cross-domain behavior should move through kits and services so the graph remains inspectable, reusable, and safe to recombine.
