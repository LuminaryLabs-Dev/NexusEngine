import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "src");

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(entryPath));
    else output.push(entryPath);
  }
  return output;
}

const productionFiles = (await filesUnder(sourceRoot))
  .filter((filePath) => /\.(?:m?js)$/i.test(filePath));
const forbiddenTestImports = [];

for (const filePath of productionFiles) {
  const source = await readFile(filePath, "utf8");
  for (const match of source.matchAll(
    /\b(?:import|export)\s+(?:[^"'`;]*?\s+from\s*)?["']([^"']+)["']/g
  )) {
    if (/(?:^|\/)tests?(?:\/|$)|(?:^|\/)fixtures(?:\/|$)/i.test(match[1])) {
      forbiddenTestImports.push(
        `${path.relative(root, filePath)} -> ${match[1]}`
      );
    }
  }
}

assert.deepEqual(
  forbiddenTestImports,
  [],
  `Production source imports test code:\n${forbiddenTestImports.join("\n")}`
);

const migratedFiles = [
  "ar-device.js",
  "ar-experience-kit.js",
  "ar-kit.js",
  "ar-launcher.js",
  "ar-renderer.js",
  "ar-session.js",
  "camera-occlusion-kit.js",
  "character-ragdoll-kit.js",
  "collectible-kit.js",
  "companion-command-kit.js",
  "corruption-world-kit.js",
  "fishing-kit.js",
  "forest-placement-kit.js",
  "greybox-building-kit.js",
  "interaction-kit.js",
  "interaction-target-kit.js",
  "light-combat-kit.js",
  "lock-and-socket-kit.js",
  "micro-platformer-kit.js",
  "moving-target-kit.js",
  "objective-flow-kit.js",
  "realism-kit.js",
  "reef-rescue-kit.js",
  "render-descriptor-kit.js",
  "reveal-light-kit.js",
  "shrine-puzzle-kit.js",
  "sorting-kit.js",
  "spatial-room-kit.js",
  "surface-placement-kit.js",
  "symbol-alignment-kit.js",
  "tree-runner-kit.js"
];
const migratedPublicSymbols = [
  "createFishingKit",
  "createReefRescueKit",
  "createRealismKit",
  "createARKit",
  "createARExperienceKit",
  "createARLaunchRuntime",
  "createInteractionKit",
  "createCharacterInteractionKit",
  "createLightCombatKit",
  "createCompanionCommandKit",
  "createCameraOcclusionKit",
  "createCharacterRagdollKit",
  "createForestPlacementKit",
  "createObjectiveFlowKit",
  "createSpatialRoomKit",
  "createGreyboxBuildingKit",
  "createSurfacePlacementKit",
  "createInteractionTargetKit",
  "createCollectibleKit",
  "createSymbolAlignmentKit",
  "createSortingKit",
  "createRevealLightKit",
  "createMovingTargetKit",
  "createLockAndSocketKit",
  "createRenderDescriptorKit",
  "createShrinePuzzleKit",
  "createCorruptionWorldKit",
  "createTreeRunnerKit",
  "createMicroPlatformerKit"
];
const retainedMigratedFiles = [];

for (const fileName of migratedFiles) {
  try {
    await access(path.join(sourceRoot, fileName));
    retainedMigratedFiles.push(fileName);
  } catch {}
}

assert.deepEqual(
  retainedMigratedFiles,
  [],
  `Migrated production files remain in Core:\n${retainedMigratedFiles.join("\n")}`
);

const exampleRoot = path.join(root, "examples");
const activeExampleFiles = (await filesUnder(exampleRoot))
  .filter((filePath) => /\.(?:m?js)$/i.test(filePath));
const migratedExampleReferences = [];

for (const filePath of activeExampleFiles) {
  const source = await readFile(filePath, "utf8");
  for (const symbol of migratedPublicSymbols) {
    if (new RegExp(`\\b${symbol}\\b`).test(source)) {
      migratedExampleReferences.push(`${path.relative(root, filePath)} -> ${symbol}`);
    }
  }
}

assert.deepEqual(
  migratedExampleReferences,
  [],
  `Active Core examples reference migrated APIs:\n${migratedExampleReferences.join("\n")}`
);

console.log(
  `Core boundaries ok: ${productionFiles.length} production modules, no test imports, migrated files, or stale examples.`
);
