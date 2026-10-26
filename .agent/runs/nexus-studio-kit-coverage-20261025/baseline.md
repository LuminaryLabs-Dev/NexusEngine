# Verified Baseline

## Studio-pinned manifest

- Studio: commit `da9fa3e70734a3aaed89e8ad6e42e7206ad07e11`, version `0.7.0`, branch `main`, initially clean.
- Engine pin: `e3b9b589c9eaad144ef815ec9fa5ab20f0806424`.
- Registry snapshot: schema `nexusengine.composition-registry/3`, 199 Domains, 390 Kits, hash `sha256:681d803b228e9af2f87a0185a58d464c85544f5b292712fc9f1af25703ac178b`.
- Status: 389 `stable-candidate`, one `experimental` (`camel-runtime-kit`). All 390 manifest Kits have a public API name, a source export, and are marked installable.
- All 390 current `settingsSchema` values are open-ended objects with no declared properties. The manifest therefore does not currently contain enough field metadata to generate meaningful Kit-specific editors by itself.
- From Studio's installed package, all 390 manifest export paths resolved to functions and each default factory call returned a Kit object with the matching ID. This establishes constructor availability only; it does not prove dependency installation or behavior.
- Studio's configured-scene runtime exposes 16 explicit factories plus two runtime base Kits. The `supported()` gate blocks other Kits from scene composition, yielding 18 supported and 372 unavailable under that predicate. This predicate does not represent all Studio authoring integrations.
- Studio's Engine `authoringProject.tools()` exposes 82 typed operations. The local Nexus Engine Kit production host's discovery returned 75. The local host reports a stale Engine revision, so the two counts must not be treated as a same-revision parity check.

## Current Studio behavior and ownership

- `src/catalog.js` renders the full manifest tree but disables Kit rows where `supported()` is false.
- `src/capabilities.js`, `src/project.js`, `src/game.js`, and related compatibility modules re-export from the pinned Engine package.
- `node_modules/nexusengine/kits/simulation/configured-scene-runtime-kit/composition.js` owns the explicit runtime factory map, capability recipes, `resolveKits()`, and composition planning bridge. It selects the first supported provider for ambiguous requirements.
- `SceneProject` constructs an Engine Authoring Domain and exposes `project.tools()`, `preview()`, `execute()`, document access, and history through the Engine API.
- Missing Studio execution support must not be presented as working behavior. Feature APIs and semantics belong in NexusEngine; UI, selection, viewport, and platform services belong in Studio.

## Baseline checks

- `npm run build` in Studio passed: `Static Studio built with local dependencies and standalone game exporter.`
- No Studio source files have been edited in this run.
- Full browser/native/export acceptance remains pending until implementation is complete.
