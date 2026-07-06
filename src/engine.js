import {
  createWorld,
  createScheduler
} from "./ecs.js";
import { installRuntimeKit } from "./runtime-kit.js";
import { createHeadlessRenderer } from "./renderers.js";
import { createShaderRegistry, createMaterialRegistry } from "./shaders.js";
import { createSequenceNodeRuntime } from "./sequence-node.js";
import { createSequenceRuntime } from "./sequences.js";
import {
  createEventSurface,
  createLifecycleSurface,
  createQuerySurface,
  createResourceSurface
} from "./surfaces.js";
import { createRealtimeCoreKit } from "./core-kits/realtime-core-kit/index.js";
import { createSequenceCoreKit } from "./core-kits/sequence-core-kit/index.js";

function assertSurface(surface) {
  if (!surface || typeof surface.subscribe !== "function" || typeof surface.publish !== "function") {
    throw new TypeError("Expected a subscribable surface.");
  }
}

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function array(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function defaultCoreKits(options) {
  if (options.coreKits === false) {
    return [];
  }

  if (Array.isArray(options.coreKits)) {
    return options.coreKits;
  }

  return [
    createRealtimeCoreKit(options.realtimeCore ?? options.realtime ?? {}),
    createSequenceCoreKit(options.sequenceCore ?? options.sequence ?? {})
  ];
}

function groupRecords(records, kind, keySelector) {
  const grouped = new Map();

  for (const record of records) {
    if (record.kind !== kind) {
      continue;
    }

    const key = keySelector(record);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key).push(record);
  }

  return grouped;
}

function reconcileQuerySurface(surface, world) {
  const nextMembers = new Set(world.query(...surface.components));
  const previousMembers = surface.members ?? new Set();
  const entered = [];
  const exited = [];

  for (const entity of nextMembers) {
    if (!previousMembers.has(entity)) {
      entered.push(entity);
    }
  }

  for (const entity of previousMembers) {
    if (!nextMembers.has(entity)) {
      exited.push(entity);
    }
  }

  const initialized = surface.initialized === true;
  surface.members = nextMembers;
  surface.initialized = true;

  if (!initialized && entered.length === 0 && exited.length === 0) {
    return null;
  }

  if (entered.length === 0 && exited.length === 0) {
    return null;
  }

  return {
    kind: "query",
    label: surface.label,
    components: surface.components.slice(),
    current: Array.from(nextMembers),
    entered,
    exited
  };
}

function publishSurfaceBatch(surface, batch, context) {
  if (batch === null || batch === undefined) {
    return;
  }

  if (Array.isArray(batch) && batch.length === 0) {
    return;
  }

  if (batch.kind === "query" && batch.entered.length === 0 && batch.exited.length === 0) {
    return;
  }

  surface.publish(batch, context);
}

export function createEngine(options = {}) {
  const world = options.world ?? createWorld();
  const scheduler = options.scheduler ?? createScheduler();
  const clock = options.clock ?? { delta: 1 / 60, elapsed: 0, frame: 0 };
  const renderer = options.renderer ?? createHeadlessRenderer();
  const shaderRegistry = options.shaderRegistry ?? createShaderRegistry();
  const materialRegistry = options.materialRegistry ?? createMaterialRegistry();
  const registry = {
    event: [],
    resource: [],
    query: [],
    lifecycle: []
  };

  function registerSurface(surface) {
    assertSurface(surface);

    if (!registry[surface.kind]) {
      throw new Error(`Unsupported surface kind: ${surface.kind}`);
    }

    registry[surface.kind].push(surface);
    return surface;
  }

  function unregisterSurface(surface) {
    assertSurface(surface);

    if (!registry[surface.kind]) {
      return false;
    }

    const index = registry[surface.kind].indexOf(surface);
    if (index === -1) {
      return false;
    }

    registry[surface.kind].splice(index, 1);
    surface.dispose();
    return true;
  }

  function eventSurface(eventDefinition, surfaceOptions = {}) {
    return registerSurface(createEventSurface(eventDefinition, surfaceOptions));
  }

  function resourceSurface(resourceDefinition, surfaceOptions = {}) {
    return registerSurface(createResourceSurface(resourceDefinition, surfaceOptions));
  }

  function querySurface(components, surfaceOptions = {}) {
    return registerSurface(createQuerySurface(components, surfaceOptions));
  }

  function lifecycleSurface(surfaceOptions = {}) {
    return registerSurface(createLifecycleSurface(surfaceOptions));
  }

  function tick(delta = clock.delta) {
    const nextDelta = number(delta, clock.delta ?? 1 / 60);
    clock.delta = nextDelta;
    clock.elapsed = number(clock.elapsed, 0) + nextDelta;
    clock.frame = number(clock.frame, 0) + 1;
    world.__nexusClock = clock;
    world.__nexusRenderer = renderer;

    const lifecycleBatch = [{
      kind: "lifecycle",
      topic: "tick",
      stage: "start",
      frame: clock.frame,
      delta: clock.delta,
      elapsed: clock.elapsed
    }];
    let journal = [];

    scheduler.run(world, {
      onPhaseStart(phaseName) {
        lifecycleBatch.push({
          kind: "lifecycle",
          topic: "phase",
          stage: "start",
          phase: phaseName,
          frame: clock.frame,
          delta: clock.delta,
          elapsed: clock.elapsed
        });
      },

      onPhaseEnd(phaseName) {
        lifecycleBatch.push({
          kind: "lifecycle",
          topic: "phase",
          stage: "end",
          phase: phaseName,
          frame: clock.frame,
          delta: clock.delta,
          elapsed: clock.elapsed
        });
      },

      onDrain({ journal: drainedJournal }) {
        journal = drainedJournal.slice();
      }
    });

    const journalContext = {
      engine,
      world,
      scheduler,
      clock,
      frame: clock.frame,
      delta: clock.delta,
      elapsed: clock.elapsed
    };

    const eventGroups = groupRecords(journal, "event", (record) => record.event.name);
    const resourceGroups = groupRecords(journal, "resource", (record) => record.resource.name);
    const lifecycleRecords = journal
      .filter((record) => record.kind === "component" || record.kind === "entity")
      .map((record) => ({
        ...record,
        kind: "lifecycle",
        topic: record.kind
      }));

    for (const surface of registry.event) {
      publishSurfaceBatch(surface, eventGroups.get(surface.event.name) ?? null, journalContext);
    }

    for (const surface of registry.resource) {
      publishSurfaceBatch(surface, resourceGroups.get(surface.resource.name) ?? null, journalContext);
    }

    for (const surface of registry.query) {
      publishSurfaceBatch(surface, reconcileQuerySurface(surface, world), journalContext);
    }

    lifecycleBatch.push(...lifecycleRecords);
    lifecycleBatch.push({
      kind: "lifecycle",
      topic: "tick",
      stage: "end",
      frame: clock.frame,
      delta: clock.delta,
      elapsed: clock.elapsed,
      entityCount: world.entityCount
    });

    for (const surface of registry.lifecycle) {
      const topics = surface.topics ?? [];
      const batch = topics.length > 0
        ? lifecycleBatch.filter((record) => topics.includes(record.topic))
        : lifecycleBatch.slice();
      publishSurfaceBatch(surface, batch, journalContext);
    }

    if (engine.sequenceRuntime) {
      engine.sequenceRuntime.tick(clock.delta);
    }

    if (engine.sequenceNodeRuntime && engine.driveSequenceNodesWithTick !== false) {
      engine.sequenceNodeRuntime.frame({
        source: "engine",
        payload: {
          delta: clock.delta,
          elapsed: clock.elapsed,
          frame: clock.frame
        },
        frame: clock.frame,
        delta: clock.delta,
        elapsed: clock.elapsed,
        meta: {
          engine,
          world,
          clock
        }
      });
    }

    return world;
  }

  const engine = {
    world,
    scheduler,
    clock,
    renderer,
    shaderRegistry,
    materialRegistry,
    __nexusSurfaceRegistry: registry,
    kit: null,
    kits: [],
    kitBindings: {},
    sequenceRuntime: options.sequenceRuntime ?? createSequenceRuntime(),
    sequenceNodeRuntime: options.sequenceNodeRuntime ?? createSequenceNodeRuntime({
      library: options.sequenceNodeLibrary,
      kitRegistry: options.sequenceKitRegistry,
      historyLimit: options.sequenceNodeHistoryLimit
    }),
    sequenceKitRegistry: { ...(options.sequenceKitRegistry ?? {}) },
    driveSequenceNodesWithTick: options.driveSequenceNodesWithTick ?? true,
    registerSurface,
    unregisterSurface,
    eventSurface,
    resourceSurface,
    querySurface,
    lifecycleSurface,
    installKit(kit, kitOptions = options) {
      return installRuntimeKit(engine, kit, kitOptions);
    },
    dispatchSequenceEvent(eventOrType, payload = {}, meta = {}) {
      return engine.sequenceNodeRuntime.dispatch(eventOrType, payload, meta);
    },
    startSequenceNode(id, payload = {}) {
      return engine.sequenceNodeRuntime.start(id, payload);
    },
    mountSequenceNode(nodeOrNodes, mountOptions = {}) {
      return engine.sequenceNodeRuntime.mount(nodeOrNodes, mountOptions);
    },
    registerSequenceNodeType(typeDefinition) {
      return engine.sequenceNodeRuntime.registerType(typeDefinition);
    },
    bindSequenceNodeSurfaces(planOrOptions = {}) {
      return engine.sequenceNodeRuntime.bindEngineSurfaces(planOrOptions);
    },
    bindSequenceNodeFrameDriver(frameOptions = {}) {
      return engine.sequenceNodeRuntime.bindFrameDriver(frameOptions);
    },
    tick,
    step: tick
  };

  for (const surface of options.surfaces ?? []) {
    registerSurface(surface);
  }

  engine.sequenceRuntime.bind(engine);
  engine.sequenceNodeRuntime.bind(engine);

  for (const kit of defaultCoreKits(options)) {
    engine.installKit(kit, options);
  }

  if (options.sequenceNodes) {
    engine.sequenceNodeRuntime.mount(options.sequenceNodes);
  }

  if (options.bindSequenceNodeSurfaces) {
    engine.sequenceNodeRuntime.bindEngineSurfaces(options.bindSequenceNodeSurfaces);
  }

  if (options.autoStartSequenceNodes) {
    for (const node of array(options.sequenceNodes)) {
      if (node?.id) engine.sequenceNodeRuntime.start(node.id);
    }
  }

  for (const kit of options.kits ?? []) {
    engine.installKit(kit, options);
  }

  if (options.kit) {
    engine.installKit(options.kit, options);
  }

  return engine;
}

export const createRealtimeEngine = createEngine;
