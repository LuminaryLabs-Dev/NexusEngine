# core-persistence-kit

Purpose: save/load targets, save slots, persistence adapters, recovery saves, and migration records.

Owns: persistence descriptors, adapter boundaries, saved snapshot records, save slot metadata.

Does not own: state schema meaning or cloud provider SDK implementation.

Public API: `createCorePersistenceKit(config?)`.

Proof required: memory adapter smoke, snapshot persistence smoke, migration record smoke, deterministic headless smoke.
