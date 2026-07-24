# Development Target

## Goal

Make NexusEngine Core and its active documentation enforce one ownership rule:
production code in NexusEngine must be atomic, idempotent, fully reusable,
product-agnostic Core behavior.

## Mode

Implementation

## Scope

- Inventory every NexusEngine production module and public export.
- Record canonical ownership and destination in `docs/KIT-OWNERSHIP.md`.
- Move stable reusable non-Core fishing behavior, renderer bindings, and shaders
  to NexusEngine-Kits.
- Move Reef Rescue to a dedicated game repository because the existing
  NexusEngine-Experiments worktree has unrelated uncommitted Image Editor work.
- Remove migrated implementation files and public exports from NexusEngine.
- Remove fishing-specific renderer, shader, sequence, terrain, and realism
  production hooks.
- Keep niche test fixtures only when they prove generic Core invariants and
  have no production reachability.
- Create `docs/README.md` as the active documentation router.
- Convert ProtoKit creation guidance to historical migration guidance.
- Correct repo instructions, memory, manifests, inventories, and automation
  language so no active workflow creates ProtoKits.
- Add a breaking migration guide with no compatibility forwarding exports.

## Required outcome

- Every NexusEngine public production module has a recorded owner,
  classification, destination, consumer evidence, and proof.
- NexusEngine public entrypoints cannot reach fishing, Reef Rescue, or another
  migrated niche implementation.
- `createFishingKit` and `createReefRescueKit` are not NexusEngine exports.
- The fishing kit installs through NexusEngine-Kits using only public
  NexusEngine APIs and passes behavior, export, manifest, registry, and
  installer checks.
- Reef Rescue runs from a dedicated game repository using NexusEngine plus the
  external fishing kit.
- No active documentation or automation instructs a human or agent to create,
  implement, or update a ProtoKit.
- Historical and generated evidence remains unchanged and clearly non-current.
- A fresh reader can answer the five ownership questions in the approved plan
  from the README documentation path.
- All focused Core tests, full NexusEngine tests, NexusEngine-Kits checks,
  registry installation proof, documentation links, import boundaries, and Git
  cleanliness checks pass.

## Constraints

- Work on local integration branches; do not push, release, or deploy.
- Do not touch the dirty NexusEngine-Experiments worktree.
- Do not modify generated vendor snapshots or historical evidence.
- Do not stash, reset, discard, force, or delete preservation assets.
- Fail closed: unknown or unproven production behavior does not remain Core.
- A reusable but optional, niche, or genre-specific capability belongs in
  NexusEngine-Kits or another trusted registry package.
- Complete games, authored presets, and product behavior belong in Experiments
  or a dedicated game repository.
- Niche scenarios may remain only under tests as minimal, non-exported fixtures
  that prove a documented generic Core invariant.
- Immediate API removal occurs only after the external replacement passes.
- Do not add deprecated or forwarding exports in NexusEngine.
