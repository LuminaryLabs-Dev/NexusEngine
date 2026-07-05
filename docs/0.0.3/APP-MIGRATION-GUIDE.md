# App Migration Guide

This guide is for apps that consume `LuminaryLabs-Dev/NexusEngine` from `main`.

## Who needs this

Use this guide when an app imports flat kit factories directly and wants to move to core capability domains.

## Minimum migration

```txt
1. Pull latest NexusEngine main.
2. Run npm test in NexusEngine.
3. Replace old flat imports using IMPORT-MIGRATION-MAP.md.
4. Run the downstream app smoke test.
5. Record failures and update app docs.
```

## Common import updates

```txt
createInputIntentKit       -> createCoreInputKit
createRenderDescriptorKit  -> createCoreGraphicsKit
createInteractionTargetKit -> createCoreInteractionKit
createTelemetryKit         -> createCoreDiagnosticsKit
```

## Example

Old:

```js
import { createInputIntentKit } from "nexusengine";
```

New:

```js
import { createCoreInputKit } from "nexusengine";
```

## Smoke command

```txt
npm install
npm test
```

## Satellite repos

Do not update ProtoKits, Experiments, Sandbox, or KitBuilder repos in this phase. They need their own migration packets later.
