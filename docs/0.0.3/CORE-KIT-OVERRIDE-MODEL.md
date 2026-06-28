# Core Kit Override Model

Core capability domains must be configurable and oversteppable without forking the core.

## First principle

```txt
Use composable pieces first.
Use umbrella factories when you want a default domain stack.
Use custom replacement kits when the game/app needs a different path.
```

## Piece-first usage

A game or ProtoKit can use an individual piece without loading the whole umbrella domain.

```js
import {
  createResourceMeter,
  createPressureChannel
} from "nexusrealtime/core-kits/core-simulation-kit";
```

## Umbrella usage

Use the umbrella factory for convenient default installation under `engine.n.*`.

```js
createCoreSimulationKit({
  config: {
    profile: "default-simulation"
  }
});
```

## Four override layers

### 1. Data configuration

Use data configuration for normal app/project differences.

```js
createCoreInputKit({
  actions: ["jump", "grab", "confirm"],
  bindings: {
    keyboard: { jump: "Space" },
    gamepad: { jump: "ButtonA" }
  }
});
```

### 2. Policy override

Use policy overrides for project-specific decision rules.

```js
createCoreInteractionKit({
  policies: {
    canUseAffordance({ actor, target, state }) {
      return target.enabled && !state.completed?.[target.id];
    }
  }
});
```

### 3. Adapter override

Use adapter overrides for renderer, host, network, storage, model, or device integration.

```js
createCoreGraphicsKit({
  adapters: {
    renderer: customRendererAdapter
  }
});
```

### 4. Domain extension

Use domain extension when a future ProtoKit needs to build a larger bubble on top of core.

```js
extendDomainServiceKit(coreInputKit, {
  id: "flight-input-extension",
  domain: "flight-input",
  requires: ["n:core-input"],
  services: ["flight-actions"]
});
```

## Custom replacement proof

A game can skip a core umbrella factory and install a custom DSK instead. The engine does not require `createCoreInputKit()` or any other core kit.

```js
createRealtimeGame({
  kits: [myCustomInputKit]
});
```

## Rule

```txt
Configure through data first.
Use pieces directly when that is enough.
Use umbrella factories for default domain installation.
Override policy when data is not enough.
Swap adapters for host/backend integration.
Extend domains for larger ProtoKit bubbles.
Do not copy core internals into ProtoKits.
```
