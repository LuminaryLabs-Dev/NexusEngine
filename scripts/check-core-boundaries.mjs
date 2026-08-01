import assert from "node:assert/strict";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "src");

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

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
const activeSourceFiles = (await filesUnder(sourceRoot))
  .filter((filePath) => /\.(?:m?js|json|md)$/i.test(filePath));
const forbiddenTestImports = [];
const privateSiblingImports = [];
const concretePlatformOwnership = [];
const legacyIdentifiers = [];

assert.equal(
  await exists(path.join(sourceRoot, "core-kits")),
  false,
  "The retired src/core-kits/ architecture still exists."
);

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

    if (!match[1].startsWith(".")) continue;
    const target = path.resolve(path.dirname(filePath), match[1]);
    const sourceParts = path.relative(sourceRoot, filePath).split(path.sep);
    const targetParts = path.relative(sourceRoot, target).split(path.sep);
    const sourceDomain = sourceParts[0] === "core-domains" ? sourceParts[1] : null;
    const targetDomain = targetParts[0] === "core-domains" ? targetParts[1] : null;
    const targetIsPrivate = targetParts.some((part) => [
      "adapters",
      "contracts",
      "kits",
      "providers",
      "state",
      "subdomains"
    ].includes(part));
    const sourceIsTest = sourceParts.includes("tests");
    if (sourceDomain && targetDomain && sourceDomain !== targetDomain && targetIsPrivate && !sourceIsTest) {
      privateSiblingImports.push(
        `${path.relative(root, filePath)} -> ${match[1]}`
      );
    }
  }

  const executablePlatformPatterns = [
    /\bfrom\s+["']three(?:\/[^"']*)?["']/,
    /\bfrom\s+["'](?:canvas|playwright|puppeteer)["']/,
    /\bglobalThis\.(?:window|document|navigator|indexedDB|localStorage)\b/,
    /\bdocument\.(?:createElement|querySelector|getElementById)\b/,
    /\bnavigator\.(?:gpu|mediaDevices|serviceWorker)\b/,
    /\bnew\s+(?:AudioContext|OfflineAudioContext)\b/,
    /\bgetContext\(["'](?:webgl2?|webgpu|2d)["']\)/
  ];
  if (executablePlatformPatterns.some((pattern) => pattern.test(source))) {
    concretePlatformOwnership.push(path.relative(root, filePath));
  }
}

for (const filePath of activeSourceFiles) {
  const source = await readFile(filePath, "utf8");
  if (/["'`]n:core-[a-z0-9-]+/i.test(source) || /\bcreateCore[A-Z][A-Za-z0-9]*\b/.test(source)) {
    legacyIdentifiers.push(path.relative(root, filePath));
  }
}

assert.deepEqual(
  forbiddenTestImports,
  [],
  `Production source imports test code:\n${forbiddenTestImports.join("\n")}`
);

assert.deepEqual(
  privateSiblingImports,
  [],
  `Core production modules import private sibling-Domain files:\n${privateSiblingImports.join("\n")}`
);

assert.deepEqual(
  concretePlatformOwnership,
  [],
  `Core production modules own concrete renderer or platform behavior:\n${concretePlatformOwnership.join("\n")}`
);

assert.deepEqual(
  legacyIdentifiers,
  [],
  `Active Core source retains retired names:\n${legacyIdentifiers.join("\n")}`
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

const generatedExports = JSON.parse(
  await readFile(path.join(root, "docs", "generated", "PACKAGE-EXPORTS.json"), "utf8")
).exports;
const packageExports = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8")
).exports;
assert.deepEqual(
  packageExports,
  generatedExports,
  "package.json exports drifted from the manifest-generated package export map."
);

const ownership = JSON.parse(
  await readFile(path.join(root, "docs", "KIT-OWNERSHIP.json"), "utf8")
);
assert.equal(ownership.counts?.unreviewedModules, 0, "Core ownership has unreviewed modules.");
assert.equal(ownership.counts?.violations, 0, "Core ownership has violations.");
assert.deepEqual(ownership.violations ?? [], [], "Core ownership ledger contains violations.");

console.log(
  `Core boundaries ok: ${productionFiles.length} production modules, no transitional tree, private sibling imports, platform implementations, ownership drift, retired names, migrated files, or stale examples.`
);
