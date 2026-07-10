# Core Headless Editor Kit

The Core Headless Editor Kit is the control-plane runtime used by humans, agents, terminal clients, automation scripts, and future visual editors to operate a NexusEngine environment.

It does not replace the Realtime Core. The Realtime Core advances game and simulation state. The Headless Editor Runtime advances editor sessions, discovers environment capabilities, routes commands, records evidence, and manages iterative work loops.

## Runtime

```js
import {
  createHeadlessEditorRuntime,
  createHeadlessEditorEnvironment
} from "nexusengine";

const environment = createHeadlessEditorEnvironment({
  id: "my-game",
  capabilities: {
    "runtime.getState": () => ({ data: engine.getState() }),
    "runtime.tick": ({ dt = 1 / 60 }) => ({ data: engine.tick(dt) }),
    "renderer.capture": () => renderer.capture()
  }
});

const editor = createHeadlessEditorRuntime({ environment });
editor.startSession("editing-session");

console.log(editor.listDomains());
console.log(editor.listCapabilities());
await editor.executeAction("runtime.tick", { dt: 1 / 60 });
```

Capabilities are permissive. An environment only registers what it supports. Missing capabilities return an `unavailable` result and do not prevent other domains from being inspected or controlled.

## Terminal client

```js
import { createHeadlessEditorTerminalClient } from "nexusengine";

const terminal = createHeadlessEditorTerminalClient({ runtime: editor });
await terminal.dispatch("status");
await terminal.dispatch("capabilities renderer");
await terminal.dispatch("call renderer.capture --label baseline");
```

Installed packages expose the `nexus-editor` binary. An environment module can be supplied with:

```bash
nexus-editor --environment ./my-environment.mjs status
nexus-editor --environment ./my-environment.mjs capabilities
nexus-editor --environment ./my-environment.mjs call runtime.tick --dt 0.016
```

## Iterative loops

Editor loops are controllable sessions, not strict autonomous gates:

```js
editor.createLoop({
  goal: "Improve the scene",
  stages: ["inspect", "capture", "observe", "compare", "decide"],
  stageActions: {
    inspect: "scene.inspect",
    capture: "renderer.capture",
    observe: "renderer.getSnapshot"
  }
});

await editor.loopContinue();
editor.acceptLoop(undefined, { note: "The iteration improved the result." });
```

## Existing evidence harness

The original finite evidence harness remains available and compatible:

```txt
read -> capture-before -> plan -> validate -> submit -> observe -> verify -> capture-after -> observed-differences
```

The persistent runtime can be passed to `createHeadlessEditorRouter({ harness, runtime })` so lifecycle commands and environment commands share one router surface.
