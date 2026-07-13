# Core Startup Domain

`n:core-startup` is the optional, renderer-neutral authority for whether a NexusEngine application launch became usable.

## Owns

- launch identity and terminal outcome
- required preparation facts and receipts
- continuation choice: new, restored, recovered, or safe
- structured startup failure
- first successful presented-frame receipt
- playable-ready acknowledgement
- renderer-neutral startup descriptors

## Does not own

- module or asset transport
- kit installation mechanics
- save migration mechanics
- renderer creation
- DOM or native loading-screen layout
- splash order, minimum display time, tips, or player-facing copy
- gameplay rules

## Human model

```txt
Start the application
→ prepare what it needs
→ continue or begin
→ present one successful frame
→ let the player enter
```

The Core Startup Domain records those facts. Product startup sequences decide what the player sees and hears. Hosts perform browser/native work. Renderers present descriptors.

## Install

```js
import { createEngine } from "nexusengine/engine";
import { createCoreStartupKit } from "nexusengine/core-startup";

const engine = createEngine({
  kits: [createCoreStartupKit()]
});

engine.n.coreStartup.launch({
  launchId: "startup:game:1",
  projectId: "my-game",
  preparations: [
    { id: "composition", label: "Game composition" },
    { id: "renderer", label: "Renderer" },
    { id: "world", label: "World presentation" }
  ]
});
```

## API

```txt
launch(request)
addPreparation(descriptor)
working(id, progress, detail)
ready(id, receipt, detail)
skip(id, detail)
reportPreparation(id, report)
selectContinuation(selection)
presentFirstFrame(receipt)
enter({ inputReady })
fail(failure)
cancel(reason)
retry(request)
getPreparation(id)
listPreparations()
getDescriptor()
getState()
getSnapshot()
loadSnapshot(snapshot)
reset()
```

## Readiness rule

An application is not ready merely because JavaScript loaded or a renderer object exists. `enter()` succeeds only when every required preparation is ready, the first successful frame has been presented, and input is ready.

## Startup sequence boundary

A product sequence owns:

```txt
studio and game splashes
minimum display times
skip rules
loading tips
save-slot messaging
legal notices
music and fades
error/retry experience
```

The sequence reads Core Startup facts and produces presentation descriptors. Core Startup contains no product copy or asset references.
