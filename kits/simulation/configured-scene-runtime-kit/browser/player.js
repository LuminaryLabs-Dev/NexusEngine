import * as THREE from "three";
import { createView } from "./view.js";
import { createTerrainSampler } from "./terrain.js";
import { mountFeedback } from "./feedback.js";
import { createSceneRuntime } from "../runtime.js";
export function mountGame(container, data, onChange = () => {}) {
  let game;
  const view = createView(container, (id) => game?.hit(id));
  view.load(data.packet);
  view.play(true);
  const geometry = {};
  for (const o of view.objects) {
    o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(o),
      center = box.getCenter(new THREE.Vector3()),
      size = box.getSize(new THREE.Vector3());
    geometry[o.userData.id] = {
      radius: Math.max(size.x, size.z) / 2,
      collisionPosition: center.toArray(),
      position: [
        o.matrix.elements[12],
        o.matrix.elements[13],
        o.matrix.elements[14],
      ],
      halfExtents: [
        Math.max(0.1, size.x / 2),
        Math.max(0.1, size.y / 2),
        Math.max(0.1, size.z / 2),
      ],
    };
  }
  try {
    game = createSceneRuntime(
      data,
      geometry,
      createTerrainSampler(view.objects, data.bindings),
      (positions) => {
        for (const [id, position] of Object.entries(positions)) {
          const mesh = view.objects.find(o => o.userData.id === id);
          mesh.position.fromArray(position); mesh.updateMatrix(); mesh.updateMatrixWorld(true);
        }
      },
    );
  } catch (e) {
    view.dispose();
    throw e;
  }
  view.environment(data.settings.ocean);
  const cam = game.camera();
  view.camera.position.fromArray(cam.position);
  view.camera.quaternion.fromArray(cam.quaternion);
  view.camera.fov = cam.fov;
  view.camera.updateProjectionMatrix();
  let jumpQueued = false;
  const keys = new Set(),
    buttons = new Set(),
    touch = document.createElement("div");
  touch.className = "game-controls";
  touch.setAttribute("aria-label", "Game movement controls");
  for (const [label, key] of [
    ["←", "ArrowLeft"],
    ["↑", "ArrowUp"],
    ["↓", "ArrowDown"],
    ["→", "ArrowRight"],
    ...(data.settings.jumping ? [["Jump", "Space"]] : []),
  ]) {
    const b = document.createElement("button");
    b.textContent = label;
    b.setAttribute("aria-label", `Move ${key.slice(5).toLowerCase()}`);
    b.onpointerdown = (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      buttons.add(key);
      if (key === "Space") jumpQueued = true;
    };
    b.onpointerup = b.onpointercancel = () => buttons.delete(key);
    touch.append(b);
  }
  if (game.playerId) container.append(touch);
  const down = (e) => {
      if (e.code === "Escape" && !e.repeat) { e.preventDefault(); game.pause(); }
      if (e.code === "KeyR" && !e.repeat) { document.querySelector("#restart-play, #restart")?.click(); return; }
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "Space",
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.add(e.code);
        if(e.code === "Space" && !e.repeat) jumpQueued = true;
      }
    },
    up = (e) => keys.delete(e.code),
    blur = () => {
      keys.clear();
      buttons.clear();
      jumpQueued = false;
    };
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);
  const body = view.objects.find((o) => o.userData.id === game.playerId);
  if (data.settings.rolling && body) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(
        (geometry[game.playerId].radius / body.scale.x) * 1.006,
        0.012,
        8,
        48,
      ),
      new THREE.MeshStandardMaterial({ color: 0xb4eaff, roughness: 0.45 }),
    );
    body.add(band);
  }
  const forward = new THREE.Vector3(
    ...(geometry[game.playerId]?.position ?? [0, 0, 0]),
  ).sub(new THREE.Vector3(...cam.position));
  forward.y = 0;
  if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(
    forward,
    new THREE.Vector3(0, 1, 0),
  );
  let lastPosition = game.state.position
    ? new THREE.Vector3(...game.state.position)
    : null;
  const feedback = mountFeedback(container, view, game);
  let previous = performance.now(),
    frame,
    disposed = false;
  function update(now) {
    if (disposed) return;
    const held = (k) => keys.has(k) || buttons.has(k);
    const dt = (now - previous) / 1000,
      horizontal =
        Number(held("KeyD") || held("ArrowRight")) -
        Number(held("KeyA") || held("ArrowLeft")),
      vertical =
        Number(held("KeyS") || held("ArrowDown")) -
        Number(held("KeyW") || held("ArrowUp"));
    const state = game.step(
      dt,
      data.settings.rolling
        ? {
            jump: data.settings.jumping && (jumpQueued || held("Space")),
            x: right.x * horizontal - forward.x * vertical,
            y: right.z * horizontal - forward.z * vertical,
          }
        : { x: horizontal, y: vertical },
    );
    jumpQueued = false;
    previous = now;
    for (const o of view.objects) {
      if (state.collected.includes(o.userData.id)) o.visible = false;
      if (o.userData.id === game.playerId && state.position) {
        const next = new THREE.Vector3(...state.position);
        if (data.settings.rolling && lastPosition) {
          const d = next.clone().sub(lastPosition),
            distance = Math.hypot(d.x, d.z);
          if (distance > 1e-7 && distance < 1) {
            const axis = new THREE.Vector3(d.z, 0, -d.x).normalize();
            o.quaternion.premultiply(
              new THREE.Quaternion().setFromAxisAngle(
                axis,
                distance / geometry[game.playerId].radius,
              ),
            );
          }
        }
        o.position.copy(next);
        lastPosition = next;
        o.updateMatrix();
      }
    }
    if (
      data.settings.rolling &&
      data.settings.followCamera !== false &&
      state.position
    ) {
      const p = new THREE.Vector3(...state.position),
        offset = cam.position.map(
          (v, i) => v - geometry[game.playerId].position[i],
        );
      view.camera.position.lerp(
        p.clone().add(new THREE.Vector3(...offset)),
        1 - Math.exp(-8 * Math.min(dt || 0.016, 0.05)),
      );
      view.camera.lookAt(p.clone().add(new THREE.Vector3(0, 0.35, -2)));
    }
    feedback.update(state, Math.min(dt || 0.016, 0.05));
    onChange(state);
    frame = requestAnimationFrame(update);
  }
  update(previous);
  return {
    game,
    view,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      touch.remove();
      feedback.dispose();
      view.dispose();
    },
  };
}
export function gameMessage(s) {
  return s.paused ? "Paused · Escape to resume" : s.status === "won"
    ? `Objective complete · Score ${s.score}`
    : s.status === "lost"
      ? "Time is up · Restart to retry"
      : `Score ${s.score} · ${s.secondsLeft}s`;
}
export function boot(data) {
  document.title = data.title;
  const area = document.querySelector("#game"),
    hud = document.querySelector("#hud");
  let player;
  const start = () => {
    player?.dispose();
    player = mountGame(area, data, (s) => (hud.textContent = gameMessage(s) + "\nWASD move · Space jump · R restart · Escape pause"));
  };
  document.querySelector("#restart").onclick = start;
  start();
}

export { createTerrainSampler } from "./terrain.js";
export { mountFeedback } from "./feedback.js";
