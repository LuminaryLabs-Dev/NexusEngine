import { access, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));

function packageTargets(value, prefix = null, output = []) {
  if (typeof value === "string") {
    if (value.startsWith("./") && !value.includes("*")) output.push({ entrypoint: prefix, target: value });
    return output;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, entry] of Object.entries(value)) packageTargets(entry, prefix ?? key, output);
  }
  return output;
}

async function existingFile(candidates) {
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

async function resolveRelative(importerPath, specifier) {
  const unresolved = fileURLToPath(new URL(specifier, pathToFileURL(importerPath)));
  return existingFile([
    unresolved,
    `${unresolved}.js`,
    `${unresolved}.mjs`,
    path.join(unresolved, "index.js"),
    path.join(unresolved, "index.mjs")
  ]);
}

function relativeSpecifiers(source) {
  const result = new Set();
  for (const pattern of [
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s+[^;]*?\s+from\s*["']([^"']+)["']/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s+from\s*["']([^"']+)["']/g
  ]) {
    for (const match of source.matchAll(pattern)) {
      if (match[1].startsWith("./") || match[1].startsWith("../")) result.add(match[1]);
    }
  }
  return [...result];
}

function directExports(source) {
  const names = new Set();
  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/).at(-1);
      if (name) names.add(name);
    }
  }
  if (/\bexport\s+\*\s+from\b/.test(source)) names.add("*");
  return [...names].sort();
}

function ownerFor(modulePath) {
  const parts = modulePath.split("/");
  if (parts[1] === "core-kits") return parts[2] ?? "core-kits";
  if (parts[1] === "core-domains") return parts[2] ?? "core-domains";
  if (parts[1] === "foundation") return "foundation";
  if (parts[1] === "modules") return parts[2] ?? "modules";
  if (parts[1] === "hosts") return `${parts[1]}/${parts[2]}`;
  if (parts[1] === "renderers") return `${parts[1]}/${parts[2]}`;
  return path.basename(modulePath).replace(/\.(?:m?js)$/, "");
}

function proofFor(modulePath) {
  if (modulePath.startsWith("src/core-kits/")) return "tests/core-kits plus npm test";
  if (modulePath.startsWith("src/core-domains/")) return "tests/core-domains plus npm test";
  if (modulePath.startsWith("src/modules/nexus-diffusion/")) return "tests/modules/nexus-diffusion-domain-smoke.mjs";
  if (modulePath.startsWith("src/renderers/three/")) return "tests/renderers/three-object-capture-provider-smoke.mjs";
  if (modulePath.startsWith("src/hosts/browser/")) return "Headless Editor browser-startup fixture";
  if (/src\/(?:terrain|procedural|navmesh|pathfinding|world-physics|water-surface|vehicle-dynamics|route-field|action-movement|character-camera|schedule|economy|lifecycle-progression|facility-operations|occupant-flow|transport-route|request-queue|telemetry|timing-window|resource-pressure|hazard-field|cargo-manifest|assistance-target|environmental-affordance|request-fulfillment|scenario-duration|spatial-scale|landmark-guidance|pursuit-pressure|scenario-driver|transfer-zone|input-intent)-kit\.js/.test(modulePath)) {
    return "tests/procedural-navigation-smoke.mjs";
  }
  return "tests/release-0.0.3-run-all.mjs plus public-entrypoint reachability";
}

const directEntries = packageTargets(packageJson.exports);
directEntries.push({ entrypoint: ".", target: packageJson.main });
const directByTarget = new Map();
for (const entry of directEntries) {
  const key = path.normalize(entry.target.replace(/^\.\//, ""));
  if (!directByTarget.has(key)) directByTarget.set(key, new Set());
  directByTarget.get(key).add(entry.entrypoint);
}

const queue = [];
for (const { target } of directEntries) {
  const resolved = await existingFile([
    path.resolve(root, target),
    path.resolve(root, `${target}.js`),
    path.resolve(root, target, "index.js")
  ]);
  if (resolved) queue.push(resolved);
}

const visited = new Map();
while (queue.length) {
  const modulePath = path.normalize(queue.shift());
  if (visited.has(modulePath) || !/\.(?:m?js)$/i.test(modulePath)) continue;
  const source = await readFile(modulePath, "utf8");
  visited.set(modulePath, source);
  for (const specifier of relativeSpecifiers(source)) {
    const target = await resolveRelative(modulePath, specifier);
    if (target) queue.push(target);
  }
}

const coreRecords = [...visited.entries()].map(([absolutePath, source]) => {
  const modulePath = path.relative(root, absolutePath);
  const directEntrypoints = [...(directByTarget.get(path.normalize(modulePath)) ?? [])].sort();
  return {
    path: modulePath,
    publicExports: directExports(source),
    responsibility: ownerFor(modulePath).replaceAll("-", " "),
    owner: ownerFor(modulePath),
    atomic: true,
    idempotent: true,
    fullyReusable: true,
    productOrGenreSpecific: false,
    currentConsumers: directEntrypoints.length ? directEntrypoints : ["reachable public Core composition"],
    destination: "NexusEngine Core",
    proof: proofFor(modulePath),
    status: "current"
  };
});

const migrated = [
  ["src/fishing-kit.js", "createFishingKit", "aquatic fishing behavior", "NexusEngine-Kits: fishing-kit"],
  ["src/realism-kit.js", "createRealismKit", "fishing and coastal realism", "NexusEngine-Kits: fishing-kit"],
  ["src/renderers.js#legacy", "createCanvas2DRenderer, createCustomWebGLRenderer, createThreeRenderer", "fishing renderers", "NexusEngine-Kits: fishing-kit"],
  ["src/reef-rescue-kit.js", "createReefRescueKit", "complete Reef Rescue game preset", "NexusEngine-ReefRescue"],
  ["src/ar-kit.js", "createARKit", "AR runtime behavior", "NexusEngine-Kits: ar-kit"],
  ["src/ar-experience-kit.js", "createARExperienceKit", "AR experience flow", "NexusEngine-Kits: ar-experience-kit"],
  ["src/interaction-kit.js", "createInteractionKit", "optional character interaction", "NexusEngine-Kits: interaction-kit"],
  ["src/light-combat-kit.js", "createLightCombatKit", "genre combat behavior", "NexusEngine-Kits: light-combat-kit"],
  ["src/companion-command-kit.js", "createCompanionCommandKit", "companion commands", "NexusEngine-Kits: companion-command-kit"],
  ["src/camera-occlusion-kit.js", "createCameraOcclusionKit", "camera collision policy", "NexusEngine-Kits: camera-collision-kit"],
  ["src/character-ragdoll-kit.js", "createCharacterRagdollKit", "character ragdoll behavior", "NexusEngine-Kits: character-ragdoll-kit"],
  ["src/forest-placement-kit.js", "createForestPlacementKit", "forest placement policy", "NexusEngine-Kits: forest-placement-kit"],
  ["src/objective-flow-kit.js", "createObjectiveFlowKit", "optional objective runtime", "NexusEngine-Kits: objective-kit"],
  ["src/spatial-room-kit.js", "createSpatialRoomKit", "room dataset behavior", "NexusEngine-Kits: spatial-room-kit"],
  ["src/greybox-building-kit.js", "createGreyboxBuildingKit", "greybox building behavior", "NexusEngine-Kits: greybox-building-kit"],
  ["src/surface-placement-kit.js", "createSurfacePlacementKit", "AR surface placement", "NexusEngine-Kits: surface-placement-kit"],
  ["src/interaction-target-kit.js", "createInteractionTargetKit", "optional interaction target runtime", "NexusEngine-Kits: interaction-target-kit"],
  ["src/collectible-kit.js", "createCollectibleKit", "collectible gameplay", "NexusEngine-Kits: collectible-kit"],
  ["src/symbol-alignment-kit.js", "createSymbolAlignmentKit", "symbol puzzle mechanic", "NexusEngine-Kits: symbol-alignment-kit"],
  ["src/sorting-kit.js", "createSortingKit", "sorting puzzle mechanic", "NexusEngine-Kits: sorting-kit"],
  ["src/reveal-light-kit.js", "createRevealLightKit", "reveal-light mechanic", "NexusEngine-Kits: reveal-light-kit"],
  ["src/moving-target-kit.js", "createMovingTargetKit", "moving-target mechanic", "NexusEngine-Kits: moving-target-kit"],
  ["src/lock-and-socket-kit.js", "createLockAndSocketKit", "lock-and-socket mechanic", "NexusEngine-Kits: lock-and-socket-kit"],
  ["src/render-descriptor-kit.js", "createRenderDescriptorKit", "optional runtime descriptor registry", "NexusEngine-Kits: render-descriptor-kit"],
  ["src/shrine-puzzle-kit.js", "createShrinePuzzleKit", "complete Shrine Puzzle preset", "NexusEngine-LegacyGamePresets"],
  ["src/corruption-world-kit.js", "createCorruptionWorldKit", "complete Corruption World preset", "NexusEngine-LegacyGamePresets"],
  ["src/tree-runner-kit.js", "createTreeRunnerKit", "complete Tree Runner preset", "NexusEngine-LegacyGamePresets"],
  ["src/micro-platformer-kit.js", "createMicroPlatformerKit", "complete Micro Platformer preset", "NexusEngine-LegacyGamePresets"]
].map(([modulePath, exports, responsibility, destination]) => ({
  path: modulePath,
  publicExports: exports.split(", "),
  responsibility,
  owner: destination,
  atomic: destination.includes("GamePresets") || destination.includes("ReefRescue") ? false : true,
  idempotent: true,
  fullyReusable: destination.includes("NexusEngine-Kits"),
  productOrGenreSpecific: true,
  currentConsumers: [destination],
  destination,
  proof: destination.includes("NexusEngine-Kits")
    ? "trusted registry manifest and external package smoke"
    : "dedicated repository smoke",
  status: "migrated"
}));

const ledger = {
  schema: "nexusengine.kit-ownership-ledger/1",
  generatedFrom: ["package.json", "src/index.js", "public relative module graph"],
  coreRule: "atomic, idempotent, fully reusable, product-agnostic, composable, and proven",
  counts: {
    currentCoreModules: coreRecords.length,
    migratedProductionOwners: migrated.length
  },
  records: [...coreRecords, ...migrated].sort((left, right) => left.path.localeCompare(right.path))
};

await access(path.join(root, "docs"));
await writeFile(path.join(root, "docs", "KIT-OWNERSHIP.json"), `${JSON.stringify(ledger, null, 2)}\n`);
console.log("kit ownership ledger generated", ledger.counts);
