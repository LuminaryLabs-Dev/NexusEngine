# NexusEngine 0.0.3 Start Here

This is the entry point for the core capability-domain rebuild.

Read this first when updating `LuminaryLabs-Dev/NexusEngine` or any app that consumes the `main` branch.

```txt
NexusEngine main rebuild
  kernel
  contracts
  foundation
  core-kits
  adapters
  diagnostics
  migration docs
```

## What is changing

`NexusEngine` is moving from a flat `src/*.js` kit surface toward broad, configurable core capability domains under `src/core-kits/`.

The public target is:

```txt
createCoreDataKit()
createCoreInputKit()
createCoreGraphicsKit()
createCoreSimulationKit()
createCoreDiagnosticsKit()
createCoreMLNNKit()
createCoreAgentKit()
```

and the rest of the core capability domain set.

## What is not changing yet

Do not patch satellite repositories in this phase:

```txt
NexusEngine-ProtoKits
NexusEngine-Experiments
NexusEngine-Sandbox
NexusEngine-KitBuilder01/02/03
```

## Read next

```txt
1. docs/0.0.3/CORE-CAPABILITY-KITS.md
2. docs/0.0.3/CORE-KIT-OVERRIDE-MODEL.md
3. docs/0.0.3/EXISTING-FILE-TO-CORE-KIT-MAP.md
4. docs/0.0.3/IMPORT-MIGRATION-MAP.md
5. docs/0.0.3/BUILD-AND-VERIFY.md
```

## Rule

```txt
No boundary doc, no core.
No how-to-use doc, no core.
No snapshot/reset, no core.
No deterministic headless proof, no core.
No migration note for breaking imports, no main-branch break.
```
