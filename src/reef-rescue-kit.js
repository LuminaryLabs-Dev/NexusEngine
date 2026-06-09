import { createFishingKit } from "./fishing-kit.js";
import { terrainLayers } from "./terrain-kit.js";

export function createReefRescueKit(options = {}) {
  const defaultContent = {
    objective: { label: "Rescue 4 reef fish", target: 4 },
    species: [
      { id: "reef-gleam", label: "Reef Gleam", rarity: 1, fight: 0.65, stamina: 4.0, score: 90 },
      { id: "kelp-hopper", label: "Kelp Hopper", rarity: 1.3, fight: 0.82, stamina: 5.3, score: 130 },
      { id: "coral-sprinter", label: "Coral Sprinter", rarity: 2.1, fight: 1.1, stamina: 6.8, score: 240 }
    ],
    lures: [
      { id: "reef-spinner", label: "Reef Spinner", depth: 0.28, attraction: 1.12 },
      { id: "bubble-fly", label: "Bubble Fly", depth: 0.18, attraction: 1.04 },
      { id: "wave-crank", label: "Wave Crank", depth: 0.6, attraction: 1.28 }
    ],
    waterZones: [
      { id: "kelp-bed", kind: "kelp", position: { x: -10, y: 5 }, radius: 6, current: { x: 0.04, y: -0.03 } },
      { id: "coral-garden", kind: "coral", position: { x: 9, y: 1 }, radius: 5, current: { x: -0.03, y: 0.02 } },
      { id: "reef-crest", kind: "reef", position: { x: -4, y: -2 }, radius: 5, current: { x: 0.01, y: 0.03 } },
      { id: "sun-shelf", kind: "shelf", position: { x: 0, y: -7 }, radius: 4, current: { x: 0.02, y: 0.04 } }
    ]
  };

  const defaultTerrain = {
    preset: "cozy-beach",
    materialColors: {
      sand: "#e4c18b",
      "wet-sand": "#ad8b5c",
      rock: "#7d7f70",
      seabed: "#3b9b89",
      coral: "#e98c8c",
      kelp: "#4c7f5e",
      reef: "#8ca074"
    },
    layers: [
      terrainLayers.baseNoise({ id: "reef-bed", amplitude: 2.4, frequency: 0.032, seed: "reef-rescue" }),
      terrainLayers.carve({ id: "shoreline", shape: "spline", depth: 2.0, falloff: 7 }),
      terrainLayers.erosion({ id: "reef-soften", iterations: 12, strength: 0.24, preserveRidges: true }),
      terrainLayers.waterInfluence({ id: "wet-edge", waterLevel: 0, falloff: 7 }),
      terrainLayers.materials({
        id: "reef-materials",
        rules: [
          { material: "rock", aboveSlope: 0.72 },
          { material: "seabed", belowWater: true },
          { material: "wet-sand", nearWater: true },
          { material: "sand", belowSlope: 0.7 }
        ]
      })
    ]
  };

  const defaultWater = {
    transparent: true,
    clarity: 0.88,
    opacity: 0.38,
    depthTint: "#156d7e",
    shallowTint: "#82e1cf",
    rippleStrength: 0.28,
    foam: 0.48,
    turbidity: 0.16
  };

  const defaultSky = {
    timeOfDay: 0.42,
    horizon: "#f4d0a2",
    zenith: "#76b1e0",
    sunColor: "#fff8e9",
    cloudDensity: 0.42,
    wind: { x: 0.03, y: 0.006 }
  };

  return createFishingKit({
    ...options,
    gameId: "reef-rescue",
    title: "Reef Rescue",
    sceneMode: "beach-side",
    terrain: options.terrain ?? defaultTerrain,
    content: {
      ...defaultContent,
      ...(options.content ?? {})
    },
    water: {
      ...defaultWater,
      ...(options.water ?? {})
    },
    sky: {
      ...defaultSky,
      ...(options.sky ?? {})
    }
  });
}
