import navigation from "./subdomains/navigation/subdomain.manifest.js";
import navmesh from "./subdomains/navigation/subdomains/navmesh/subdomain.manifest.js";
import pathfinding from "./subdomains/navigation/subdomains/pathfinding/subdomain.manifest.js";
import routeField from "./subdomains/navigation/subdomains/route-field/subdomain.manifest.js";
import landmarkGuidance from "./subdomains/navigation/subdomains/landmark-guidance/subdomain.manifest.js";
import generation from "./subdomains/generation/subdomain.manifest.js";
import terrain from "./subdomains/terrain/subdomain.manifest.js";
import waterSurface from "./subdomains/water-surface/subdomain.manifest.js";
import navmeshKit from "./subdomains/navigation/subdomains/navmesh/kits/navmesh-kit/kit.manifest.js";
import pathfindingKit from "./subdomains/navigation/subdomains/pathfinding/kits/pathfinding-kit/kit.manifest.js";
import routeFieldKit from "./subdomains/navigation/subdomains/route-field/kits/route-field-kit/kit.manifest.js";
import landmarkGuidanceKit from "./subdomains/navigation/subdomains/landmark-guidance/kits/landmark-guidance-kit/kit.manifest.js";
import proceduralGenerationKit from "./subdomains/generation/kits/procedural-generation-kit/kit.manifest.js";
import terrainKit from "./subdomains/terrain/kits/terrain-kit/kit.manifest.js";
import waterSurfaceKit from "./subdomains/water-surface/kits/water-surface-kit/kit.manifest.js";

export const RESTORED_WORLD_SUBDOMAINS = Object.freeze([navigation, navmesh, pathfinding, routeField, landmarkGuidance, generation, terrain, waterSurface]);
export const RESTORED_WORLD_KITS = Object.freeze([navmeshKit, pathfindingKit, routeFieldKit, landmarkGuidanceKit, proceduralGenerationKit, terrainKit, waterSurfaceKit]);
export const RESTORED_WORLD_PUBLIC_ENTRIES = Object.freeze([{ domainPath: "n:world:navigation", subpath: "./domains/world/navigation", module: "./src/core-domains/world/subdomains/navigation/index.js" }]);
