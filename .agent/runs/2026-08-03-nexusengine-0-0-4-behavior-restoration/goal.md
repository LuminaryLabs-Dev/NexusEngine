# Development Target

## Goal

Restore the 26 reusable behavior modules removed at
`a68544434424438491be1398e3f3d5aced5bc5ee` as manifest-owned, atomic,
idempotent NexusEngine `0.0.4` Core Kits using the exact last complete source at
`a9adca5b3620f996f00860358c4864dd4bdfa6d9` as historical evidence.

## Architecture Contract

- Implement 27 behavior atoms because legacy World Physics splits into World
  Contact and Soft Respawn.
- Place every atom under the narrowest semantic recursive Core Domain.
- Add nine optional adapter Kits for cross-domain effects and six recipe-data
  compositions; base Kits cannot import private siblings or auto-install peers.
- Use existing `createDomainKit`, `defineDomainServiceKit`, Foundation, Data,
  Transaction, and Sequence contracts. Do not add a parallel lifecycle helper.
- Keep authored presets, game rules, concrete renderers, and platform providers
  outside runtime Core.
- Keep the package root minimal. Publish only generated semantic subpaths and
  `engine.n` APIs; add no forwarding exports or historical aliases.

## Behavioral Contract

- Same Kit ID and manifest/source fingerprint installs once and returns the
  original Kit; changed content under the same ID fails before mutation.
- Stateful APIs provide cloned state/snapshots, validated repeat-stable load and
  reset, side-effect-free queries, and exact-once command envelopes.
- Same operation ID and request hash returns the exact original receipt without
  state or event mutation. Changed content under the same operation ID fails.
- Snapshots are finite JSON-portable data without functions, providers, Map,
  Set, `Infinity`, or hidden runtime handles.
- Events occur only after accepted state transitions. No Kit may call
  `engine.tick(0)` internally.
- Preserve validated historical behavior while correcting every defect recorded
  in `docs/migrations/0.0.4-restored-behaviors.json`.

## Required Deliverables

- 26/26 source-disposition and migration rows with exact commit lineage, old
  exports/APIs, defects, replacements, transforms, proof, and consumer status.
- 27 behavior atom manifests, nine adapter manifests, six recipe records,
  generated package exports, Core catalog, API reference, ownership evidence,
  Guide/PDF source, MCP resources, and changelog entries.
- Regression proof for historical defects plus install, reset, snapshot/load,
  replay, duplicate-command, changed-content, deep-clone, invalid-input,
  deterministic ordering, composition, and clean-tarball behavior.
- A read-only post-restoration audit of NexusEngine-Kits at
  `93734356f1124d6ff49eb7ca8d05fcd28b2732fe` and the frozen ProtoKit inventory
  at `0d102649267737230d618b30fe6f9465b198d234` for later Core candidates.

## Safety And Scope

- Work only on the isolated restoration branch rooted at
  `58fa721db73992d77d6866b282494a559f0ec13c`.
- Do not modify consumer, experiment, game, Editor, Simulator, Kits, ProtoKits,
  or showcase repositories.
- Never stash, reset, rebase, force-clean, or absorb unrelated worktrees.
- Do not push, publish, deploy, create the `0.0.4` branch, or mutate external
  services without separate explicit approval.
