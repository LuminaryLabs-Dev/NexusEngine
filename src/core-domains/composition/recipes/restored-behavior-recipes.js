export const CORE_COMPOSITION_RECIPES = Object.freeze([
  {
    id: "procedural-navigation",
    label: "Procedural Navigation",
    domains: [],
    kits: ["procedural-generation-kit", "navmesh-kit", "pathfinding-kit", "route-field-kit", "landmark-guidance-kit"],
    settings: {},
    metadata: { core: true, purpose: "Generate neutral walkability, build a NavMesh, solve paths, and expose route and landmark guidance." }
  },
  {
    id: "terrain-character-traversal",
    label: "Terrain Character Traversal",
    domains: [],
    kits: ["terrain-kit", "action-locomotion-kit", "world-contact-kit", "soft-respawn-kit", "third-person-camera-kit", "locomotion-contact-response-adapter-kit", "camera-world-occlusion-adapter-kit"],
    settings: {},
    metadata: { core: true, purpose: "Compose renderer-neutral terrain sampling, character locomotion, contact correction, recovery, and camera constraints." }
  },
  {
    id: "management-operations",
    label: "Management Operations",
    domains: [],
    kits: ["economy-account-kit", "cargo-manifest-kit", "facility-operations-kit", "occupant-flow-kit", "transport-route-kit", "schedule-kit", "lifecycle-progression-kit", "request-queue-kit", "request-fulfillment-kit", "lifecycle-economy-adapter-kit", "lifecycle-facility-adapter-kit", "facility-economy-adapter-kit", "occupant-request-adapter-kit", "transport-request-adapter-kit", "request-economy-adapter-kit"],
    settings: {},
    metadata: { core: true, purpose: "Compose optional exact-once economic, facility, occupant, transport, request, schedule, and lifecycle operations." }
  },
  {
    id: "vehicle-rescue-logistics",
    label: "Vehicle Rescue Logistics",
    domains: [],
    kits: ["vehicle-dynamics-kit", "water-surface-kit", "vehicle-water-response-adapter-kit", "cargo-manifest-kit", "assistance-target-kit", "transfer-zone-kit", "transport-route-kit", "request-queue-kit", "request-fulfillment-kit", "economy-account-kit", "transport-request-adapter-kit", "request-economy-adapter-kit"],
    settings: {},
    metadata: { core: true, purpose: "Compose neutral vehicle, water, cargo, assistance, transfer, transport, request, and reward primitives." }
  },
  {
    id: "spatial-guidance",
    label: "Spatial Guidance",
    domains: [],
    kits: ["spatial-scale-kit", "route-field-kit", "landmark-guidance-kit", "assistance-target-kit"],
    settings: {},
    metadata: { core: true, purpose: "Compose scale bands, route markers, landmarks, and assistance selection without authored objectives." }
  },
  {
    id: "hazard-pursuit",
    label: "Hazard Pursuit",
    domains: [],
    kits: ["hazard-field-kit", "pursuit-pressure-kit", "soft-respawn-kit", "assistance-target-kit"],
    settings: {},
    metadata: { core: true, purpose: "Compose neutral hazard collision, pursuit pressure, recovery, and assistance primitives." }
  }
]);

export default CORE_COMPOSITION_RECIPES;
