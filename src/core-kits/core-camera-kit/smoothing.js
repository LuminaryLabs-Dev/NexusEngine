const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function stableId(value, fallback, label) {
  const id = String(value ?? fallback ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function vector3(value, fallback = [0, 0, 0]) {
  const source = Array.isArray(value) ? value : [value?.x, value?.y, value?.z];
  return [0, 1, 2].map((index) => finite(source[index], fallback[index] ?? 0));
}

function quaternion(value, fallback = [0, 0, 0, 1]) {
  const source = Array.isArray(value) ? value : [value?.x, value?.y, value?.z, value?.w];
  const output = [0, 1, 2, 3].map((index) => finite(source[index], fallback[index] ?? 0));
  const length = Math.hypot(...output) || 1;
  return output.map((component) => component / length);
}

function normalize3(value, fallback = [0, 1, 0]) {
  const length = Math.hypot(...value);
  return length < 1e-8 ? [...fallback] : value.map((component) => component / length);
}

function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function lookQuaternion(eye, target, upInput = [0, 1, 0]) {
  const z = normalize3([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]], [0, 0, 1]);
  let x = cross3(vector3(upInput, [0, 1, 0]), z);
  if (Math.hypot(...x) < 1e-8) x = cross3(Math.abs(z[1]) > 0.999 ? [0, 0, 1] : [0, 1, 0], z);
  x = normalize3(x, [1, 0, 0]);
  const y = cross3(z, x);
  const [m11, m12, m13] = [x[0], y[0], z[0]];
  const [m21, m22, m23] = [x[1], y[1], z[1]];
  const [m31, m32, m33] = [x[2], y[2], z[2]];
  const trace = m11 + m22 + m33;
  const output = [0, 0, 0, 1];
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    output[3] = 0.25 / s; output[0] = (m32 - m23) * s; output[1] = (m13 - m31) * s; output[2] = (m21 - m12) * s;
  } else if (m11 > m22 && m11 > m33) {
    const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
    output[3] = (m32 - m23) / s; output[0] = 0.25 * s; output[1] = (m12 + m21) / s; output[2] = (m13 + m31) / s;
  } else if (m22 > m33) {
    const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
    output[3] = (m13 - m31) / s; output[0] = (m12 + m21) / s; output[1] = 0.25 * s; output[2] = (m23 + m32) / s;
  } else {
    const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
    output[3] = (m21 - m12) / s; output[0] = (m13 + m31) / s; output[1] = (m23 + m32) / s; output[2] = 0.25 * s;
  }
  return quaternion(output);
}

function slerp(currentInput, targetInput, amount) {
  const current = quaternion(currentInput);
  const target = quaternion(targetInput);
  let cosine = current.reduce((sum, value, index) => sum + value * target[index], 0);
  if (cosine < 0) { cosine = -cosine; for (let index = 0; index < 4; index += 1) target[index] *= -1; }
  const t = clamp(amount, 0, 1);
  if (1 - cosine < 1e-6) return quaternion(current.map((value, index) => value + (target[index] - value) * t));
  const angle = Math.acos(clamp(cosine, -1, 1));
  const sine = Math.sin(angle);
  const a = Math.sin((1 - t) * angle) / sine;
  const b = Math.sin(t * angle) / sine;
  return quaternion(current.map((value, index) => value * a + target[index] * b));
}

function smoothVector(current, target, sharpness, delta) {
  const amount = 1 - Math.exp(-Math.max(0, sharpness) * Math.max(0, delta));
  return current.map((value, index) => value + (target[index] - value) * amount);
}

function normalizeController(input = {}, fallbackId = null) {
  const id = stableId(input.id, fallbackId, "Camera smoothing controller");
  const position = vector3(input.position);
  const lookPoint = vector3(input.lookPoint, [0, 0, 1]);
  const targetPosition = vector3(input.targetPosition ?? position);
  const targetLookPoint = vector3(input.targetLookPoint ?? lookPoint, [0, 0, 1]);
  return {
    id,
    initialized: Boolean(input.initialized),
    revision: Math.max(0, Math.floor(finite(input.revision, 0))),
    mode: String(input.mode ?? "follow"),
    position,
    lookPoint,
    quaternion: quaternion(input.quaternion ?? lookQuaternion(position, lookPoint)),
    targetPosition,
    targetLookPoint,
    targetQuaternion: quaternion(input.targetQuaternion ?? lookQuaternion(targetPosition, targetLookPoint)),
    fov: finite(input.fov, 60),
    targetFov: finite(input.targetFov ?? input.fov, 60),
    shake: clone(input.shake ?? null),
    config: {
      positionSharpness: Math.max(0.0001, finite(input.positionSharpness ?? input.positionSmoothSharpness, 8)),
      lookSharpness: Math.max(0.0001, finite(input.lookSharpness ?? input.lookSmoothSharpness, 11)),
      rotationSharpness: Math.max(0.0001, finite(input.rotationSharpness, 12)),
      fovSharpness: Math.max(0.0001, finite(input.fovSharpness, 9)),
      maximumDelta: Math.max(0.0001, finite(input.maximumDelta, 1 / 30)),
      teleportThreshold: Math.max(0, finite(input.teleportThreshold, 30)),
      up: vector3(input.up, [0, 1, 0])
    }
  };
}

function descriptor(controller) {
  return Object.freeze({
    kind: "camera-pose",
    controllerId: controller.id,
    revision: controller.revision,
    mode: controller.mode,
    position: Object.freeze([...controller.position]),
    lookPoint: Object.freeze([...controller.lookPoint]),
    quaternion: Object.freeze([...controller.quaternion]),
    fov: controller.fov,
    shake: clone(controller.shake)
  });
}

export function createCameraSmoothingService(config = {}) {
  const initialControllers = Array.isArray(config.controllers) ? config.controllers : [];
  let controllers = new Map();

  function createController(options = {}) {
    const next = normalizeController(options);
    const existing = controllers.get(next.id);
    if (existing && options.replace !== true) return descriptor(existing);
    controllers.set(next.id, next);
    return descriptor(next);
  }

  function requireController(id) {
    const controller = controllers.get(stableId(id, null, "Camera smoothing controller"));
    if (!controller) throw new RangeError(`Unknown camera smoothing controller: ${id}.`);
    return controller;
  }

  function setTarget(id, target = {}) {
    const controller = requireController(id);
    controller.targetPosition = vector3(target.position ?? controller.targetPosition);
    controller.targetLookPoint = vector3(target.lookPoint ?? controller.targetLookPoint);
    controller.targetQuaternion = quaternion(target.quaternion ?? lookQuaternion(controller.targetPosition, controller.targetLookPoint, controller.config.up));
    controller.targetFov = finite(target.fov, controller.targetFov);
    controller.mode = String(target.mode ?? controller.mode);
    controller.shake = clone(target.shake ?? controller.shake);
    return descriptor(controller);
  }

  function snap(id, target = null) {
    const controller = requireController(id);
    if (target) setTarget(id, target);
    controller.position = [...controller.targetPosition];
    controller.lookPoint = [...controller.targetLookPoint];
    controller.quaternion = [...controller.targetQuaternion];
    controller.fov = controller.targetFov;
    controller.initialized = true;
    controller.revision += 1;
    return descriptor(controller);
  }

  function updateController(controller, deltaSeconds) {
    const dt = Math.min(Math.max(0, finite(deltaSeconds, 0)), controller.config.maximumDelta);
    const distance = Math.hypot(...controller.position.map((value, index) => value - controller.targetPosition[index]));
    if (!controller.initialized || distance > controller.config.teleportThreshold) return snap(controller.id);
    controller.position = smoothVector(controller.position, controller.targetPosition, controller.config.positionSharpness, dt);
    controller.lookPoint = smoothVector(controller.lookPoint, controller.targetLookPoint, controller.config.lookSharpness, dt);
    const rotationAmount = 1 - Math.exp(-controller.config.rotationSharpness * dt);
    controller.quaternion = slerp(controller.quaternion, controller.targetQuaternion, rotationAmount);
    controller.fov += (controller.targetFov - controller.fov) * (1 - Math.exp(-controller.config.fovSharpness * dt));
    controller.revision += 1;
    return descriptor(controller);
  }

  function update(idOrDelta, maybeDelta) {
    if (typeof idOrDelta === "string") return updateController(requireController(idOrDelta), maybeDelta);
    const delta = idOrDelta;
    return [...controllers.values()].sort((a, b) => a.id.localeCompare(b.id)).map((controller) => updateController(controller, delta));
  }

  function getSnapshot() {
    return {
      schema: "nexusengine.core-camera.smoothing/1",
      controllers: [...controllers.values()].sort((a, b) => a.id.localeCompare(b.id)).map(clone)
    };
  }

  function loadSnapshot(snapshot = {}) {
    if (snapshot.schema !== "nexusengine.core-camera.smoothing/1") throw new TypeError("Unsupported Core Camera smoothing snapshot.");
    controllers = new Map();
    for (const controller of snapshot.controllers ?? []) {
      const normalized = normalizeController(controller);
      controllers.set(normalized.id, normalized);
    }
    return getSnapshot();
  }

  function reset(payload = {}) {
    controllers = new Map();
    for (const controller of payload.controllers ?? initialControllers) createController(controller);
    return getSnapshot();
  }

  reset();
  return Object.freeze({
    createController,
    removeController(id) { return controllers.delete(String(id)); },
    hasController(id) { return controllers.has(String(id)); },
    listControllers() { return [...controllers.values()].sort((a, b) => a.id.localeCompare(b.id)).map(descriptor); },
    setTarget,
    snap,
    update,
    getDescriptor(id) { return descriptor(requireController(id)); },
    getState: getSnapshot,
    getSnapshot,
    snapshot: getSnapshot,
    loadSnapshot,
    reset
  });
}
