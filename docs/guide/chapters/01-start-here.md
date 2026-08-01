# Start Here

NexusEngine is the reusable Core beneath games, simulations, editors, and agents. It supplies deterministic runtime primitives and universal semantic capabilities. It does not supply every useful feature.

The shortest correct rule is:

```txt
NexusEngine                  universal Core behavior
NexusEngine-Kits             reusable optional behavior
Experiments and games        authored product behavior
Hosts and adapters           platform and vendor implementations
```

## Who This Guide Is For

- Application developers who need to assemble a runtime.
- Kit authors who need to choose an owner and dependency contract.
- Host authors who connect browsers, renderers, storage, networks, or SDKs.
- Agents that inspect and plan compositions through MCP.
- Maintainers migrating code to the `0.0.4` semantic Domain model.

## Reading Paths

**Build something:** read First Runtime, Domains And Atomic Kits, then Composition And Recipes.

**Integrate a platform:** read Registries And Security, then Hosts, Providers, And Adapters.

**Use an agent:** read Composition And Recipes, then MCP Agent Workflow.

**Maintain Core:** read State, Lifecycle, And Idempotence, Testing And Proof, and Migrating To 0.0.4.

## The Non-Negotiable Boundary

A Core atom has one responsibility, is product-neutral, installs idempotently, owns explicit state, supports snapshot and reset, isolates nondeterminism, and has direct proof. If any requirement is unknown, the behavior remains outside Core until proved.

This fail-closed rule keeps Core small enough to understand and flexible enough to compose.

## Sources Of Truth

1. Domain manifest v2 records and the source they reference.
2. Generated catalog, package exports, ownership ledger, and registry hash.
3. This modular guide.
4. Migration and extraction ledgers.

Historical plans, generated run packets, and the retired ProtoKit repository are evidence. They do not override the active manifest catalog.
