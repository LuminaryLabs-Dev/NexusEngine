# core-data-kit

Purpose: durable state, snapshots, selectors, schemas, ledgers, migrations, named deterministic random streams, completion tracking, and canonical state digests.

Owns: state contracts, snapshot/loadSnapshot/reset semantics, completion and idempotency ledgers, selectors, validation, deterministic random stream lifecycle, and renderer-neutral digest records.

Does not own: persistence targets, renderer descriptors, procedural meaning, or agent decisions.

Public API: `createCoreDataKit(config?)`.

Promoted service surfaces:

```txt
engine.n.coreData.random
engine.n.coreData.completion
engine.n.coreData.digest
```

Compatibility aliases are installed only when they are not already owned: `engine.n.seedStream`, `engine.n.completion`, and `engine.n.stateDigest`.

Proof required: named-stream replay, completion duplicate handling, canonical digest stability, service snapshot/load/reset, serializable state, and deterministic headless smoke.
