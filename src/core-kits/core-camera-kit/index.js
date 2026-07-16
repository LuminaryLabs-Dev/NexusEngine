import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createCameraSmoothingService } from "./smoothing.js";

export * from "./smoothing.js";

const smoothingByWorld = new WeakMap();

export function createCoreCameraKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;

  function smoothingSystem(world) {
    const smoothing = smoothingByWorld.get(world);
    if (!smoothing) return;
    smoothing.update(Math.max(0, Number(world.__nexusClock?.delta ?? 0)));
  }

  return createCoreCapabilityKit({
    ...config,
    domain: "core-camera",
    apiName: config.apiName ?? "coreCamera",
    purpose: "Camera targets, follow modes, smoothing, shake, FOV policy, camera volumes, occlusion policy, and XR/head boundaries.",
    owns: ["camera targets", "follow modes", "camera smoothing state", "shake descriptors", "FOV policy", "camera volumes", "occlusion policy", ...(config.owns ?? [])],
    doesNotOwn: ["renderer camera object", "raw XR session", ...(config.doesNotOwn ?? [])],
    services: [...(config.services ?? []), "smoothing"],
    systems: [
      ...(config.systems ?? []),
      { phase: config.smoothingPhase ?? "resolve", name: "coreCameraSmoothingSystem", system: smoothingSystem }
    ],
    createApi(context) {
      const smoothing = createCameraSmoothingService(config.smoothing ?? {});
      smoothingByWorld.set(context.world, smoothing);
      const customApi = customCreateApi?.(context) ?? {};
      return {
        ...customApi,
        smoothing,
        getSnapshot() {
          const base = context.baseApi.getSnapshot();
          return { ...base, services: { ...(base.services ?? {}), smoothing: smoothing.getSnapshot() } };
        },
        loadSnapshot(snapshot = {}) {
          const base = context.baseApi.loadSnapshot(snapshot);
          if (snapshot.services?.smoothing) smoothing.loadSnapshot(snapshot.services.smoothing);
          return { ...base, services: { ...(base.services ?? {}), smoothing: smoothing.getSnapshot() } };
        },
        reset(payload = {}) {
          const base = context.baseApi.reset(payload);
          smoothing.reset(payload.smoothing ?? {});
          return { ...base, services: { ...(base.services ?? {}), smoothing: smoothing.getSnapshot() } };
        }
      };
    },
    install(context) { customInstall?.(context); },
    metadata: { ...(config.metadata ?? {}), piecesFirst: true, promotedServices: ["camera-smoothing"] }
  });
}
