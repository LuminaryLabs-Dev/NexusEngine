# Core Object Domain

`n:object` owns renderer-neutral object identity and intrinsic descriptors. Its
subdomains add selectable shape, fidelity, vegetation, and placement behavior.

```text
n:object
├── n:object:shape
├── n:object:fidelity
├── n:object:vegetation
│   ├── n:object:vegetation:tree
│   ├── n:object:vegetation:foliage
│   └── n:object:vegetation:ecology
└── n:object:placement
```

Use `createCoreObjectDomain()` to receive enabled Kits in dependency order.
Placement reads bounds, pivot, and ground-anchor data from the Object registry;
it does not own mesh generation, rendering, physics, world generation, or
agent review.
