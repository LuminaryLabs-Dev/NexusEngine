# Core Headless Editor Kit

The Core Headless Editor Kit is the control-plane runtime used by humans, agents, terminal clients, automation scripts, and future visual editors to operate a NexusEngine environment.

It does not replace the Realtime Core. The Realtime Core advances game and simulation state. The Headless Editor advances editor sessions, discovers environment capabilities, routes commands, records evidence, and manages iterative work loops.

## Target-driven repository development

NexusEngine repository development uses:

```txt
AGENTS.md
→ mandatory development protocol

.agent/target.md
→ current goal and acceptance contract

.agent/tracker.md
→ generated controller state and resume point

.agent/runs/<run-id>/
→ plans, ledgers, validation, verification, differences, and reports

.agent/evidence/<run-id>/
→ machine-readable repository, module, kit, test, runtime, and snapshot evidence
```

There is no static development profile. The guided controller discovers the repository and infers reliability checks from the target, changed files, module graph, kit graph, contracts, state ownership, renderer or host involvement, and existing tests.

```js
import {
  startGuidedDevelopmentSession,
  resumeGuidedDevelopmentSession
} from "nexusengine";

const run = await startGuidedDevelopmentSession({
  root: process.cwd()
});

console.log(await run.status());
console.log(await run.next());

// The controller advances automatic routes and stops when code or fixture
// evidence must be supplied by the agent or an adapter.
await run.continue();
```

The status packet includes the route reason, inferred checks, required and missing evidence, next command, completion confidence, and whether agent or user action is required.

## Synthesized reliability fixtures

The reliability layer converts inferred checks into an explicit fixture plan. Repository-safe checks run automatically:

```txt
repository-integrity
public-export-integrity
test-coverage
```

Checks requiring real project semantics remain capability-backed instead of being guessed:

```txt
kit-composition
installed-api-parity
descriptor-integrity
snapshot-reset-replay
deterministic-replay
runtime-tick
browser-startup
```

The controller records automatic results, identifies missing executors, and blocks completion until every required check and hard evidence gate passes.

## Repository development environment

`createRepositoryDevelopmentEnvironment()` exposes a guided capability surface over a repository and, optionally, an existing NexusEngine instance and browser driver:

```js
import {
  createHeadlessEditorRuntime,
  createRepositoryDevelopmentEnvironment
} from "nexusengine";

const environment = createRepositoryDevelopmentEnvironment({
  root: process.cwd(),
  engine,
  browserDriver,
  executors: {
    "kit.compareDirectAndInstalledApi": runInstalledParityFixture
  }
});

const editor = createHeadlessEditorRuntime({ environment });
```

The environment provides repository search and inspection, module graph and public export validation, engine and kit inspection, domain invocation, test execution, risk guidance, and guided run control. Capabilities that require project-specific semantics return `unavailable` until an executor, engine, or browser driver is supplied.

## Guided CLI

From a repository containing `.agent/target.md`:

```bash
nexus-editor target
nexus-editor start
nexus-editor resume
nexus-editor status
nexus-editor next
nexus-editor continue
nexus-editor report
```

Use `--runtime` to force the generic terminal runtime command surface.

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

Capabilities remain permissive. An environment registers only what it supports. Missing capabilities return an `unavailable` result and do not prevent other domains from being inspected or controlled.

## Terminal client

```js
import { createHeadlessEditorTerminalClient } from "nexusengine";

const terminal = createHeadlessEditorTerminalClient({ runtime: editor });
await terminal.dispatch("status");
await terminal.dispatch("capabilities renderer");
await terminal.dispatch("call renderer.capture --label baseline");
```

Installed packages expose the `nexus-editor` binary. A custom environment module can be supplied with:

```bash
nexus-editor --runtime --environment ./my-environment.mjs status
nexus-editor --runtime --environment ./my-environment.mjs capabilities
nexus-editor --runtime --environment ./my-environment.mjs call runtime.tick --dt 0.016
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

## Finite evidence harness

The bounded evidence harness remains available inside guided development and for disposable integrations:

```txt
read -> capture-before -> plan -> validate -> submit -> observe -> verify -> capture-after -> observed-differences
```
