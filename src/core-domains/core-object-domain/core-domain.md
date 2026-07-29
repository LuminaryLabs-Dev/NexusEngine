# Core Object Domain

The optional composite installs the universal Core Object identity contract
together with Shape, Fidelity, Vegetation, and Placement.

```txt
n:object
├─ n:object:shape
├─ n:object:fidelity
├─ n:object:vegetation
│  ├─ n:object:vegetation:tree
│  ├─ n:object:vegetation:foliage
│  └─ n:object:vegetation:ecology
└─ n:object:placement
```

The composite adds no state of its own. Each child remains independently installable and snapshot-capable.
