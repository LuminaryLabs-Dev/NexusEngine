import {
  createUniformGridPartition,
  createFlatWorldSurface,
} from "nexusengine/domains/world";
import { createEngine, defineRuntimeKit } from "nexusengine";
import { normalizeInputIntent } from "nexusengine/domains/interaction/input";
import { analyticShapeIntersection } from "nexusengine/domains/physics/detection";
import { compositionFor, factories } from "./composition.js";
import { defineDomainServiceKit } from "nexusengine/domain-service-kit";
import { sha256Integrity } from "nexusengine/foundation";
import { platformOffset } from "./platform-motion.js";
export function createSceneRuntime(
  data,
  geometry,
  sampleSurface = () => ({ groundHeight: -1000, surface: { fallZone: true } }),
  syncPlatforms = () => {},
  suppliedEngine = null,
) {
  const configurationHash = sha256Integrity(JSON.stringify({data,geometry}));
  if (suppliedEngine?.n.sceneRuntime) {
    const installed = suppliedEngine.n.sceneRuntime;
    if (installed.configurationHash !== configurationHash) throw Error("Scene runtime is already installed with another configuration.");
    return installed;
  }
  geometry = structuredClone(geometry);
  const { bindings, settings } = data,
    composition = compositionFor(bindings, data.kits);
  if (JSON.stringify(composition.tree) !== JSON.stringify(data.composition))
    throw Error("Saved capabilities differ from trusted Engine composition.");
  const controllerId = Object.keys(bindings).find(
      (id) => bindings[id].player && geometry[id],
    ),
    playerId = controllerId
      ? bindings[controllerId].characterId || controllerId
      : null,
    targets = Object.keys(bindings).filter(
      (id) => bindings[id].collectible && geometry[id],
    );
  const state = {
    status: "playing",
    score: 0,
    paused: false, grounded: false, jumps: 0, checkpoint: null, events: [], platforms: {},
    respawns: 0,
    elapsed: 0,
    position: playerId ? [...geometry[playerId].position] : null,
    collected: [],
    secondsLeft: settings.seconds,
  };
  const config = {
    "action-locomotion-kit": {
      actorId: playerId ?? "player",
      speed: bindings[controllerId]?.speed ?? 4,
      sprintSpeed: bindings[controllerId]?.speed ?? 4,
      jumpSpeed: settings.jumpSpeed ?? 7,
      gravity: settings.rolling ? (settings.gravity ?? 18) : 0,
      groundAcceleration: settings.rolling ? (settings.acceleration ?? 12) : 56,
      groundDrag: settings.rolling ? 2 : 0,
      killY: settings.rolling ? (settings.killY ?? -8) : -26,
      start: playerId
        ? { x: state.position[0], y: state.position[1], z: state.position[2] }
        : {},
      grounded: true,
    },
    "lifecycle-progression-kit": {
      items: targets.map((id) => ({
        id,
        durationSeconds: 0,
        effects: { points: bindings[id].points },
      })),
    },
    "world-contact-kit": {
      bounds: {
        minX: -settings.bounds,
        maxX: settings.bounds,
        minZ: -settings.bounds,
        maxZ: settings.bounds,
      },
      groundOffset: settings.rolling ? (geometry[playerId]?.radius ?? 0.5) : 0,
      killY: settings.rolling ? (settings.killY ?? -8) : -40,
    },
  };
  const kits = composition.plan.order
    .filter((k) => factories[k.registryId])
    .map((k) => factories[k.registryId](config[k.registryId] ?? {}));
  const engine = suppliedEngine ?? createEngine({ kits });
  if (suppliedEngine) for (const kit of kits) engine.installKit(kit);
  connectScene(engine, data, geometry);
  let delta = 0,
    input = { x: 0, y: 0 },
    frame = 0;
  const clicks = [];
  const bases = structuredClone(geometry);
  const platforms = Object.keys(bindings).filter(id => bindings[id].movingPlatform && geometry[id]);
  const checkpoints = Object.keys(bindings).filter(id => bindings[id].checkpoint && geometry[id]);
  const finishes = Object.keys(bindings).filter(id => bindings[id].finish && geometry[id]);
  for (const id of platforms) {
    const b = bindings[id], start = bases[id].position, end = start.map((v,i) => v + b.travel[i]);
    engine.n.motion.submitTrajectory({id: "platform-" + id, actorId:id, loop:true,
      points: [{time:0,position:{x:start[0],y:start[1],z:start[2]}},
        {time:b.travelSeconds,position:{x:end[0],y:end[1],z:end[2]}},
        {time:b.travelSeconds+b.pauseSeconds,position:{x:end[0],y:end[1],z:end[2]}},
        {time:2*b.travelSeconds+b.pauseSeconds,position:{x:start[0],y:start[1],z:start[2]}},
        {time:2*(b.travelSeconds+b.pauseSeconds),position:{x:start[0],y:start[1],z:start[2]}}]});
  }
  let supportId = null, jumpHeld = false, jumpBuffer = 0, coyote = 0;
  let spawn = playerId ? [...geometry[playerId].position] : null;
  const emit = (type, position = state.position) => state.events.push({type, position: position && [...position]});
  const cameraId = Object.keys(bindings).find(
      (id) => bindings[id].camera && geometry[id],
    ),
    camera = engine.n.camera.smoothing;
  camera.createController({ id: "game-camera" });
  camera.snap("game-camera", {
    position: cameraId ? geometry[cameraId].position : [12, 10, 14],
    lookPoint: [0, 0, 0],
    fov: cameraId ? bindings[cameraId].fov : 42,
  });
  const intersects = (position, nodeId) =>
    analyticShapeIntersection({
      shapeA: {
        id: "player-shape",
        type: "sphere",
        radius: settings.rolling ? (geometry[playerId]?.radius ?? 0.5) : 0.42,
      },
      poseA: { position },
      shapeB: {
        id: "obstacle-shape",
        type: "box",
        halfExtents: geometry[nodeId].halfExtents,
      },
      poseB: {
        position:
          geometry[nodeId].collisionPosition ?? geometry[nodeId].position,
      },
    })?.intersects;
  function collect(id) {
    if (!targets.includes(id) || state.collected.includes(id)) return;
    const result = engine.n.lifecycleProgression.start({
      operationId: `collect-${id}`,
      itemId: id,
    }).result;
    state.collected.push(id);
    state.score += result.effects.points;
    emit("pickup", geometry[id].collisionPosition ?? geometry[id].position);
  }
  engine.installKit(
    defineRuntimeKit({
      id: "configured-scene-simulation-kit",
      systems: [
        {
          phase: "simulate",
          system() {
            if (state.status !== "playing" || state.paused) return;
            state.events = [];
            frame++;
            state.elapsed += delta;
            state.secondsLeft = Math.max(
              0,
              Math.ceil(settings.seconds - state.elapsed),
            );
            const deltas = {};
            for (const id of platforms) {
              const offset = platformOffset(bindings[id], state.elapsed);
              const next = bases[id].position.map((v,i) => v + offset[i]);
              deltas[id] = next.map((v,i) => v - geometry[id].position[i]);
              geometry[id].position = next;
              geometry[id].collisionPosition = bases[id].collisionPosition.map((v,i) => v + offset[i]);
              state.platforms[id] = next;
            }
            syncPlatforms(state.platforms);
            if (supportId && deltas[supportId] && state.grounded) {
              state.position = state.position.map((v,i) => v + deltas[supportId][i]);
              engine.n.actionLocomotion.update({position: {x:state.position[0], y:state.position[1], z:state.position[2]}});
            }
            if (
              playerId &&
              engine.n.player.get(
                bindings[controllerId].playerId || "player-" + controllerId,
              )?.controlStatus === "enabled"
            ) {
              const radius = geometry[playerId]?.radius ?? 0.5;
              const surface = settings.rolling
                ? sampleSurface(state.position, state.position[1] + 0.35)
                : {
                    groundHeight: state.position[1],
                    normal: { x: 0, y: 1, z: 0 },
                  };
              const grounded = !surface.surface?.fallZone && state.position[1] <= surface.groundHeight + radius + 0.1;
              coyote = grounded ? 0.10 : Math.max(0, coyote - delta);
              jumpBuffer = Math.max(0, jumpBuffer - delta);
              const jump = !!settings.jumping && jumpBuffer > 0 && coyote > 0;
              if (jump) {
                engine.n.actionLocomotion.update({grounded:true});
                jumpBuffer = 0; coyote = 0; supportId = null;
              }
              const move = engine.n.actionLocomotion.step({
                operationId: `move-${frame}`,
                delta,
                input: { x: input.x, z: input.y, jump },
                contact: {
                  grounded:
                    !surface.surface?.fallZone &&
                    state.position[1] <= surface.groundHeight + radius + 0.1,
                  groundHeight:
                    surface.groundHeight + (settings.rolling ? radius : 0),
                },
              }).result;
              if (move.transitions.includes("jump-started")) {state.jumps++; emit("jump");}
              const proposed = [
                move.position.x,
                move.position.y,
                move.position.z,
              ];
              const nextSurface = settings.rolling
                ? sampleSurface(
                    proposed,
                    Math.max(state.position[1], proposed[1]) + radius + 0.5,
                    state.position,
                    radius,
                  )
                : surface;
              const contact = engine.n.worldContact.resolve({
                operationId: `contact-${frame}`,
                body: {
                  id: playerId,
                  position: move.position,
                  velocity: move.velocity,
                },
                sample: nextSurface,
              }).result;
              const wall = settings.rolling
                ? !nextSurface.surface?.fallZone &&
                  (nextSurface.wall ||
                    nextSurface.groundHeight + radius >
                      Math.max(state.position[1], proposed[1]) + 0.35)
                : Object.keys(bindings).some(
                    (id) =>
                      id !== playerId &&
                      bindings[id].collider &&
                      geometry[id] &&
                      intersects(proposed, id),
                  );
              if (
                settings.rolling &&
                (move.recoveryRequired || contact.recoveryRequired)
              ) {
                state.position = [...spawn];
                state.grounded = false; supportId = null; coyote = 0; jumpBuffer = 0;
                emit("respawn");
                state.respawns++;
                engine.n.actionLocomotion.update({
                  position: {
                    x: state.position[0],
                    y: state.position[1],
                    z: state.position[2],
                  },
                  velocity: { x: 0, y: 0, z: 0 },
                  grounded: true,
                });
              } else if (
                wall ||
                (!settings.rolling && contact.recoveryRequired)
              ) {
                if (settings.rolling) state.position[1] = proposed[1];
                state.grounded = false; supportId = null;
                engine.n.actionLocomotion.update({
                  position: {
                    x: state.position[0],
                    y: state.position[1],
                    z: state.position[2],
                  },
                  velocity: { x: 0, y: move.velocity.y, z: 0 },
                });
              } else {
                const corrected = settings.rolling
                  ? contact.correction
                  : { position: move.position, velocity: move.velocity };
                if (contact.contact.grounded && !state.grounded) emit("land");
                state.grounded = contact.contact.grounded;
                supportId = state.grounded ? nextSurface.surface?.colliderId : null;
                state.position = [
                  corrected.position.x,
                  corrected.position.y,
                  corrected.position.z,
                ];
                engine.n.actionLocomotion.update({
                  position: corrected.position,
                  velocity: corrected.velocity,
                  grounded: contact.contact.grounded,
                });
              }
              for (const id of checkpoints) {
                if (intersects(state.position, id) && state.checkpoint !== id) {
                  state.checkpoint = id;
                  const base = bases[id];
                  spawn = [base.collisionPosition[0], base.collisionPosition[1] + base.halfExtents[1] + radius + 0.1, base.collisionPosition[2]];
                  emit("checkpoint");
                }
              }
              if (settings.mode === "proximity")
                for (const id of targets)
                  if (intersects(state.position, id)) collect(id);
            }
            for (const [i, id] of clicks.splice(0).entries()) {
              engine.n.interaction.stepInteractor({
                id: "pointer",
                frame: frame * 1000 + i * 2,
                pressed: true,
                targetId: id,
              });
              const result = engine.n.interaction.stepInteractor({
                id: "pointer",
                frame: frame * 1000 + i * 2 + 1,
                pressed: false,
                targetId: id,
              });
              if (
                result.events.some((e) => e.type === "activate") &&
                settings.mode === "pointer"
              )
                collect(id);
            }
            if (state.score >= settings.goal && (!finishes.length || (state.position && finishes.some(id => intersects(state.position, id))))) {
              state.status = "won"; emit("victory");
            }
            else if (state.elapsed >= settings.seconds) state.status = "lost";
          },
        },
      ],
    }),
  );
  const mutableApis = ["actionLocomotion", "worldContact", "lifecycleProgression", "interaction", "input", "motion", "player"].filter(id => engine.n[id]?.getSnapshot && engine.n[id]?.loadSnapshot);
  function snapshot() {
    return structuredClone({schema:"nexusengine.configured-scene-snapshot/1", configurationHash,
      state, geometry, delta, input, frame, clicks, supportId, jumpHeld, jumpBuffer, coyote, spawn,
      clock:engine.getTickSnapshot(), apis:Object.fromEntries(mutableApis.map(id => [id,engine.n[id].getSnapshot()]))});
  }
  function applySnapshot(value) {
    for(const id of mutableApis) engine.n[id].loadSnapshot(value.apis[id]);
    engine.loadTickSnapshot(value.clock);
    for(const key of Object.keys(state)) delete state[key]; Object.assign(state,structuredClone(value.state));
    geometry = structuredClone(value.geometry);delta=value.delta;input=structuredClone(value.input);frame=value.frame;
    clicks.splice(0,clicks.length,...value.clicks);supportId=value.supportId;jumpHeld=value.jumpHeld;jumpBuffer=value.jumpBuffer;coyote=value.coyote;spawn=structuredClone(value.spawn);
    syncPlatforms(state.platforms);
  }
  const api = {
    configurationHash,
    state,
    getSnapshot:snapshot,
    loadSnapshot(value) {
      const portable = JSON.stringify(value,(_k,v) => {if(typeof v === "number" && !Number.isFinite(v))throw Error("Snapshot numbers must be finite.");return v;});
      const next=JSON.parse(portable);
      if(next.schema!=="nexusengine.configured-scene-snapshot/1" || next.configurationHash!==configurationHash ||
         !next.state || !Array.isArray(next.state.collected) || !["playing","won","lost"].includes(next.state.status) ||
         !Number.isFinite(next.state.elapsed) || next.state.elapsed < 0 || !Number.isFinite(next.state.score) ||
         !Number.isSafeInteger(next.frame) || next.frame < 0 || !next.apis || !next.geometry || !Array.isArray(next.clicks) ||
         Object.keys(bases).some(id => !next.geometry[id]) || next.state.collected.some(id=>!targets.includes(id)))
        throw Error("Invalid configured scene snapshot.");
      const before=snapshot();try{applySnapshot(next);}catch(error){applySnapshot(before);throw error;}
      return snapshot();
    },
    reset(){applySnapshot(initialSnapshot);return structuredClone(state);},
    playerId,
    camera: () => camera.snap("game-camera"),
    pause() {state.paused = !state.paused;},
    hit(id) {
      clicks.push(id);
    },
    step(dt, intent = {}) {
      if (state.paused || state.status !== "playing") return structuredClone(state);
      if (intent.jump && !jumpHeld) jumpBuffer = 0.12;
      jumpHeld = !!intent.jump;
      delta = Math.max(0, Math.min(dt, 0.05));
      input = normalizeInputIntent(intent);
      engine.n.input.update({ intent: input });
      engine.tick(delta);
      return structuredClone(state);
    },
  };
  Object.defineProperty(api,"engine",{value:engine,enumerable:false});
  engine.installKit(defineDomainServiceKit({
    id:"configured-scene-runtime-kit",domain:"configured-scene",domainPath:"n:simulation:configured-scene",parentDomainPath:"n:simulation",
    apiName:"sceneRuntime",version:"1",stability:"experimental",requires:["simulation:state"],provides:["simulation:configured-scene-runtime"],
    metadata:{optional:true,rendererAgnostic:true},createApi:()=>api
  }));
  const initialSnapshot=snapshot();
  return api;
}
export function installConfiguredSceneRuntime(engine, options) {
  return createSceneRuntime(options.data, options.geometry, options.sampleSurface, options.syncPlatforms, engine);
}

// Runtime records are derived from saved Engine Project data on every Play/export.
// Core services own world/scene state, character resolution and possession.
export function connectScene(engine, data, geometry) {
  const world = data.world ?? { id: "world", name: "My World" },
    sceneId = data.sceneId ?? "scene";
  engine.n.world.registerWorld({
    id: world.id,
    seed: 0,
    partition: createUniformGridPartition({
      cellSize: data.settings.bounds * 2,
      radius: 0,
    }),
    surface: createFlatWorldSurface(),
    providers: [],
    metadata: { name: world.name },
  });
  engine.n.scene.registerScene({
    id: sceneId,
    title: data.sceneName ?? sceneId,
    kind: "studio",
    hostBinding: "configured-scene",
    descriptors: { worldId: world.id, assemblyId: sceneId },
  });
  engine.n.scene.enterScene({ sceneId });
  if (!engine.n.character) return;
  const ids = new Set();
  for (const [id, b] of Object.entries(data.bindings)) {
    if (b.character || b.identity || b.player) ids.add(id);
    if (b.characterId) ids.add(b.characterId);
  }
  for (const id of ids) {
    if (!geometry[id]) continue;
    engine.n.creature.register({
      id: "body-" + id,
      archetype: "static-mesh",
      body: { provider: "configured-scene", descriptorId: id },
      rig: { provider: "configured-scene", descriptorId: "unrigged" },
      metadata: { sceneId, worldId: world.id },
    });
    engine.n.character.create({
      id,
      creatureId: "body-" + id,
      status: "active",
      bindings: { motionActorId: id },
      metadata: { sceneObjectId: id, sceneId, worldId: world.id },
    });
  }
  if (engine.n.player)
    for (const [id, b] of Object.entries(data.bindings))
      if (b.identity || b.player) {
        const characterId = b.characterId || id;
        engine.n.player.register({
          id: b.playerId || "player-" + id,
          characterId,
          controlStatus: b.controlEnabled === false ? "disabled" : "enabled",
          metadata: { sceneObjectId: id, sceneId, worldId: world.id },
        });
      }
}
