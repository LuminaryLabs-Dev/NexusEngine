# 002: Large Manager Kits And Internal Kits

This note explains how large domain kits and smaller internal kits can coexist.

## Main idea

```txt
A large manager/base kit can remain the public domain boundary.

Internal kits can exist inside it when the manager kit has smaller meaningful parts.
```

A large kit is not a failure.

A large kit becomes hard to work with when all behavior is hidden in one undifferentiated source folder.

## Composite kit example

```txt
kits/
└── connected-card-graph/
    ├── README.md
    ├── kit.json
    ├── package.json
    ├── index.ts
    └── kits/
        ├── graph-model/
        ├── graph-registry/
        ├── graph-selection/
        ├── graph-layout/
        ├── graph-validation/
        ├── graph-snapshot/
        └── graph-events/
```

In this example:

```txt
connected-card-graph:
  the public domain kit

graph-model:
  nodes, edges, cards, graph identity

graph-registry:
  add, remove, lookup, and registration behavior

graph-selection:
  selected node and edge state

graph-layout:
  layout hints, positions, and layout strategy

graph-validation:
  graph invariants and invalid edge checks

graph-snapshot:
  export and import of serialized graph state

graph-events:
  normalized graph events
```

## Public versus internal

Internal kits do not have to be published as standalone packages.

They can be private to the parent kit.

They still deserve a small README and kit metadata because that makes them easier for agents and developers to reason about.

## When to split

Split a large kit when one of these is true:

```txt
the kit has separate data model, events, validation, rendering, or persistence concerns
one part can be tested independently
one part may be reused by another kit
one part needs different risk or security notes
a future agent would otherwise edit a huge file blindly
```

## When not to split

Do not split when:

```txt
the boundary only creates ceremony
the internal kit has no independent behavior
the parent kit becomes harder to understand
the split hides simple logic behind too many layers
```
