import { createCoreCapabilityKit } from "./core-capability-kit.js";

function domainKit(config, fixed) {
  return createCoreCapabilityKit({
    ...config,
    ...fixed,
    apiName: config?.apiName ?? fixed.apiName,
    metadata: {
      ...(fixed.metadata ?? {}),
      ...(config?.metadata ?? {})
    }
  });
}

export function createCoreDataKit(config = {}) {
  return domainKit(config, {
    domain: "core-data",
    apiName: "coreData",
    purpose: "Durable state, snapshots, selectors, schemas, ledgers, and migrations.",
    owns: ["serializable state", "snapshots", "selectors", "completion ledgers", "idempotency ledgers", "data migrations"],
    doesNotOwn: ["storage targets", "renderer data", "agent decisions"]
  });
}

export function createCorePersistenceKit(config = {}) {
  return domainKit(config, {
    domain: "core-persistence",
    apiName: "corePersistence",
    purpose: "Save/load targets, persistence adapters, save slots, recovery saves, and migration records.",
    owns: ["save slots", "persistence adapters", "snapshot persistence", "migration records"],
    doesNotOwn: ["state schema ownership", "cloud provider SDK specifics"]
  });
}

export function createCoreAssetsKit(config = {}) {
  return domainKit(config, {
    domain: "core-assets",
    apiName: "coreAssets",
    purpose: "Asset manifests, asset ids, readiness state, references, fallback assets, and load descriptors.",
    owns: ["asset manifests", "asset ids", "asset references", "readiness descriptors", "fallback assets"],
    doesNotOwn: ["browser loader implementation", "renderer-specific texture upload"]
  });
}

export function createCorePlatformKit(config = {}) {
  return domainKit(config, {
    domain: "core-platform",
    apiName: "corePlatform",
    purpose: "Host capability detection and fallback mode selection.",
    owns: ["host capability descriptors", "device class", "permission descriptors", "fallback mode selection"],
    doesNotOwn: ["renderer implementation", "device-specific game logic"]
  });
}

export function createCoreInputKit(config = {}) {
  return domainKit(config, {
    domain: "core-input",
    apiName: "coreInput",
    purpose: "Semantic input actions, axes, contexts, bindings, dead zones, and adapter boundaries.",
    owns: ["actions", "axes", "bindings", "contexts", "pressed/held/released state", "device adapter boundaries"],
    doesNotOwn: ["movement policy", "interaction results", "platform-specific input UI"]
  });
}

export function createCoreSpatialKit(config = {}) {
  return domainKit(config, {
    domain: "core-spatial",
    apiName: "coreSpatial",
    purpose: "Transforms, bounds, zones, coordinate spaces, distance checks, and spatial query descriptors.",
    owns: ["transforms", "bounds", "zones", "coordinate spaces", "distance descriptors", "ray/volume query descriptors"],
    doesNotOwn: ["scene graph identity", "physics resolution"]
  });
}

export function createCoreSceneKit(config = {}) {
  return domainKit(config, {
    domain: "core-scene",
    apiName: "coreScene",
    purpose: "Scene graph, object identity, spawn/despawn, parent/child relationships, layers, tags, and recipes.",
    owns: ["scene graph", "object identity", "spawn/despawn", "layers", "tags", "scene recipes"],
    doesNotOwn: ["spatial transforms", "renderer meshes", "game-specific content rules"]
  });
}

export function createCorePhysicsKit(config = {}) {
  return domainKit(config, {
    domain: "core-physics",
    apiName: "corePhysics",
    purpose: "Physics descriptors, colliders, contacts, grounding, constraints, collision queries, and adapter boundaries.",
    owns: ["colliders", "contacts", "grounding", "constraints", "collision query descriptors"],
    doesNotOwn: ["full physics engine implementation", "movement intent"]
  });
}

export function createCoreMotionKit(config = {}) {
  return domainKit(config, {
    domain: "core-motion",
    apiName: "coreMotion",
    purpose: "Intent-to-motion descriptors, movement modes, velocity state, and movement policies.",
    owns: ["movement modes", "velocity descriptors", "acceleration policy", "jump/dash/fly/swim descriptors"],
    doesNotOwn: ["raw input bindings", "physics contacts"]
  });
}

export function createCoreSimulationKit(config = {}) {
  return domainKit(config, {
    domain: "core-simulation",
    apiName: "coreSimulation",
    purpose: "Deterministic resource meters, pressure channels, timers, objectives, routes, checkpoints, and hazards.",
    owns: ["resource meters", "pressure channels", "timers", "cooldowns", "objectives", "routes", "checkpoints", "hazards"],
    doesNotOwn: ["game-specific loop fiction", "rendering", "raw input"]
  });
}

export function createCoreInteractionKit(config = {}) {
  return domainKit(config, {
    domain: "core-interaction",
    apiName: "coreInteraction",
    purpose: "Targets, affordances, activation progress, prompts, semantic requirements, and interaction result events.",
    owns: ["targets", "affordances", "activation progress", "prompts", "interaction result events"],
    doesNotOwn: ["raw input device handling", "renderer UI implementation"]
  });
}

export function createCoreGraphicsKit(config = {}) {
  return domainKit(config, {
    domain: "core-graphics",
    apiName: "coreGraphics",
    purpose: "Renderer-agnostic presentation descriptors, materials, instances, lighting, VFX, LOD, and adapter contracts.",
    owns: ["render descriptors", "material descriptors", "lighting descriptors", "VFX descriptors", "LOD descriptors", "quality profiles"],
    doesNotOwn: ["renderer implementation", "DOM/WebGL side effects"]
  });
}

export function createCoreCameraKit(config = {}) {
  return domainKit(config, {
    domain: "core-camera",
    apiName: "coreCamera",
    purpose: "Camera targets, follow modes, shake, FOV policy, camera volumes, occlusion policy, and XR/head boundaries.",
    owns: ["camera targets", "follow modes", "shake descriptors", "FOV policy", "camera volumes", "occlusion policy"],
    doesNotOwn: ["renderer camera object", "raw XR session"]
  });
}

export function createCoreAnimationKit(config = {}) {
  return domainKit(config, {
    domain: "core-animation",
    apiName: "coreAnimation",
    purpose: "Animation descriptors and state: clips, blends, poses, transitions, procedural hooks, and timeline events.",
    owns: ["clips", "blends", "poses", "transition rules", "timeline events"],
    doesNotOwn: ["renderer animation mixer", "asset loading"]
  });
}

export function createCoreAudioKit(config = {}) {
  return domainKit(config, {
    domain: "core-audio",
    apiName: "coreAudio",
    purpose: "Audio cues, music state, ambient zones, mix groups, volume policy, spatial audio descriptors, and adapter boundaries.",
    owns: ["audio cues", "music state", "ambient zones", "mix groups", "volume policy", "spatial audio descriptors"],
    doesNotOwn: ["AudioContext implementation", "asset decoding"]
  });
}

export function createCoreUIKit(config = {}) {
  return domainKit(config, {
    domain: "core-ui",
    apiName: "coreUI",
    purpose: "UI descriptors for HUDs, menus, prompts, notifications, panels, focus, selection, and accessibility.",
    owns: ["HUD descriptors", "menu descriptors", "prompt descriptors", "notifications", "focus state", "selection state"],
    doesNotOwn: ["DOM rendering", "React components", "native UI implementation"]
  });
}

export function createCoreNetworkKit(config = {}) {
  return domainKit(config, {
    domain: "core-network",
    apiName: "coreNetwork",
    purpose: "Session, peer, message envelope, event sync, state sync, authority, latency, reconnect, and collaboration contracts.",
    owns: ["sessions", "peers", "message envelopes", "sync policies", "authority descriptors", "reconnect state"],
    doesNotOwn: ["transport provider SDK", "backend service implementation"]
  });
}

export function createCoreDiagnosticsKit(config = {}) {
  return domainKit(config, {
    domain: "core-diagnostics",
    apiName: "coreDiagnostics",
    purpose: "Telemetry, runtime snapshots, replay fixtures, determinism guards, performance counters, kit health, and promotion evidence.",
    owns: ["telemetry", "runtime snapshots", "replay fixtures", "determinism guards", "performance counters", "kit health reports"],
    doesNotOwn: ["external observability vendor integration"]
  });
}

export function createCorePolicyKit(config = {}) {
  return domainKit(config, {
    domain: "core-policy",
    apiName: "corePolicy",
    purpose: "Permissions, guards, allowed/blocked actions, sandbox rules, tool/action policy, and runtime safety checks.",
    owns: ["allowed action policy", "blocked action policy", "permission gates", "sandbox rules", "promotion restrictions"],
    doesNotOwn: ["agent planning", "product-specific moderation policy"]
  });
}

export function createCoreCompositionKit(config = {}) {
  return domainKit(config, {
    domain: "core-composition",
    apiName: "coreComposition",
    purpose: "Visible kit graph state: manifests, dependencies, requires/provides maps, composition plans, promotion metadata, and health state.",
    owns: ["kit manifests", "dependency graph", "requires/provides map", "composition plans", "domain graph snapshots", "kit health state"],
    doesNotOwn: ["low-level kit install mechanics", "game-specific kit bundles"]
  });
}

export function createCoreMLNNKit(config = {}) {
  return domainKit({
    ...config,
    createApi(context) {
      const models = new Map((config.models ?? []).map((model) => [model.id, structuredClone(model)]));
      return {
        registerModel(model = {}) {
          if (!model.id) throw new TypeError("core-mlnn model requires id.");
          models.set(model.id, structuredClone(model));
          context.baseApi.setDescriptor("models", model.id, model);
          return structuredClone(model);
        },
        getModels() {
          return Array.from(models.values()).map((model) => structuredClone(model));
        },
        infer(request = {}) {
          const modelId = request.modelId ?? this.getModels()[0]?.id ?? "mock-model";
          const result = {
            id: request.id ?? `inference:${modelId}`,
            modelId,
            kind: request.kind ?? models.get(modelId)?.kind ?? "mock",
            input: structuredClone(request.input ?? null),
            output: structuredClone(request.mockOutput ?? { label: "mock", score: 1 }),
            metadata: structuredClone(request.metadata ?? {})
          };
          context.baseApi.setDescriptor("inferenceResults", result.id, result);
          return result;
        },
        ...(config.createApi?.(context) ?? {})
      };
    }
  }, {
    domain: "core-mlnn",
    apiName: "coreMLNN",
    purpose: "Model and neural-network capability: registries, descriptors, inference requests/results, embeddings, classifications, perception, generation, and adapter boundaries.",
    owns: ["model registry", "model descriptors", "inference requests", "inference results", "embedding descriptors", "classification descriptors"],
    doesNotOwn: ["agent goals", "agent planning", "tool execution", "raw backend SDK ownership"]
  });
}

export function createCoreAgentKit(config = {}) {
  return domainKit({
    ...config,
    createApi(context) {
      const agents = new Map((config.agents ?? []).map((agent) => [agent.id, structuredClone(agent)]));
      const proposals = [];
      return {
        registerAgent(agent = {}) {
          if (!agent.id) throw new TypeError("core-agent agent requires id.");
          agents.set(agent.id, structuredClone(agent));
          context.baseApi.setDescriptor("agents", agent.id, agent);
          return structuredClone(agent);
        },
        getAgents() {
          return Array.from(agents.values()).map((agent) => structuredClone(agent));
        },
        observe(agentId, observation = {}) {
          const id = `${agentId}:observation:${proposals.length}`;
          const descriptor = { id, agentId, observation: structuredClone(observation) };
          context.baseApi.setDescriptor("observations", id, descriptor);
          return descriptor;
        },
        proposeAction(agentId, action = {}) {
          const proposal = {
            id: action.id ?? `${agentId}:proposal:${proposals.length + 1}`,
            agentId,
            action: action.action ?? action.type ?? "noop",
            payload: structuredClone(action.payload ?? {}),
            evidence: structuredClone(action.evidence ?? {})
          };
          proposals.push(proposal);
          context.baseApi.setDescriptor("actionProposals", proposal.id, proposal);
          return structuredClone(proposal);
        },
        getActionProposals() {
          return structuredClone(proposals);
        },
        ...(config.createApi?.(context) ?? {})
      };
    }
  }, {
    domain: "core-agent",
    apiName: "coreAgent",
    purpose: "Agent observation, planning, decision-cycle, action proposal, execution ledger, and replay evidence capability.",
    owns: ["agent identity", "goals", "observations", "decision cycles", "action proposals", "execution ledger", "agent telemetry"],
    doesNotOwn: ["raw model loading", "model backend implementation", "unbounded tool execution"]
  });
}
