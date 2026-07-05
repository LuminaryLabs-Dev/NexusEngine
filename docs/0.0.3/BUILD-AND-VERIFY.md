# Build And Verify

Use this to verify the core capability-domain rebuild.

## Main repo verification

```txt
npm install
npm test
```

## Direct smoke tests

```txt
node tests/public-api-freeze.mjs
node tests/core-capability-domain-barrels-smoke.mjs
node tests/core-kits/core-data-kit-smoke.mjs
node tests/core-kits/core-input-kit-smoke.mjs
node tests/core-kits/core-graphics-kit-smoke.mjs
node tests/core-kits/core-simulation-kit-smoke.mjs
node tests/core-kits/core-interaction-kit-smoke.mjs
node tests/core-kits/core-mlnn-kit-smoke.mjs
node tests/core-kits/core-agent-kit-smoke.mjs
node tests/core-kits/core-custom-replacement-smoke.mjs
```

## What should pass

```txt
public-api-freeze ok
core capability domain barrel smoke ok
core-data-kit piece smoke ok
core-input-kit piece smoke ok
core-graphics-kit piece smoke ok
core-simulation-kit piece smoke ok
core-interaction-kit piece smoke ok
core-mlnn-kit piece smoke ok
core-agent-kit piece smoke ok
core custom replacement smoke ok
Passed 18 smoke tests.
```

## Migration verification for downstream apps

```txt
1. Pull latest NexusEngine main.
2. Search for old imports:
   grep -R "createInputIntentKit\|createRenderDescriptorKit\|createTelemetryKit" src apps examples
3. Update imports using docs/0.0.3/IMPORT-MIGRATION-MAP.md.
4. Prefer piece imports when the app only needs a primitive:
   nexusengine/core-kits/core-simulation-kit
5. Run the downstream app smoke command.
6. Record failures in the app migration issue.
```

## Common failures

```txt
Missing export:
  App is using an old flat import after compatibility was removed.

Missing engine namespace:
  App still expects engine.inputIntent instead of engine.n.coreInput.

Missing subpath export:
  App is using a core-kit subpath before pulling the package.json export update.

Missing config field:
  App passed old kit-specific config into a broader core capability factory.
```

## Rule

Do not remove compatibility until this doc has been used to verify both NexusEngine and at least one downstream app migration path.
