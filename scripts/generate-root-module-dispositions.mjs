import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = path.join(root, "docs", "migrations", "0.0.4-root-module-dispositions.json");
const markdownPath = path.join(root, "docs", "migrations", "0.0.4-root-module-dispositions.md");
const restorationLedgerPath = path.join(root, "docs", "migrations", "0.0.4-restored-behaviors.json");
const ownershipPath = path.join(root, "docs", "KIT-OWNERSHIP.json");
const sourceCommit = "a9adca5b3620f996f00860358c4864dd4bdfa6d9";
const allowedDispositions = new Set([
  "core-reuse",
  "core-composition",
  "core-new-atom",
  "core-restored",
  "external-kit",
  "recipe-data",
  "game-owned",
  "duplicate",
  "rejected-unproven"
]);

const records = [
  ["src/action-movement-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:interaction:input", "n:simulation:motion"], "Compose actor state, normalized input, and Motion atoms with a product movement policy.", "Character and action movement policy."],
  ["src/assistance-target-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:interaction", "n:object", "n:simulation"], "Compose actor, interaction, object registry, and simulation state with assistance-target rules.", "Assist, attach, stabilize, and complete target behavior."],
  ["src/cargo-manifest-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:object", "n:runtime:data", "n:runtime:transaction"], "Store cargo descriptors in Data and commit pickup/deposit changes through Transaction.", "Cargo pickup, condition, deposit, and quota policy."],
  ["src/character-camera-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor:character", "n:presentation:camera", "n:spatial"], "Combine character pose, Spatial math, and Camera descriptors with an external host adapter.", "Authored third-person camera behavior."],
  ["src/common-game-definitions.js", "recipe-data", "NexusEngine-Kits recipes", ["n:actor", "n:interaction", "n:simulation"], "Replace shared game-shaped ECS definitions with recipe-local descriptors over semantic Core atoms.", "Legacy shared game component, resource, and event definitions."],
  ["src/economy-kit.js", "external-kit", "NexusEngine-Kits", ["n:runtime:data", "n:runtime:transaction", "n:simulation"], "Represent balances in Data and apply policy-specific transfers through Transaction receipts.", "Balances, costs, rewards, and economy transaction policy."],
  ["src/environmental-affordance-kit.js", "external-kit", "NexusEngine-Kits", ["n:interaction", "n:object", "n:spatial"], "Attach affordance descriptors to objects and resolve product interaction policy outside Core.", "Environmental affordance activation and completion."],
  ["src/facility-operations-kit.js", "external-kit", "NexusEngine-Kits", ["n:runtime:sequence", "n:runtime:transaction", "n:simulation"], "Compose Sequence, Transaction, and Simulation atoms with facility recipes.", "Facility production and condition policy."],
  ["src/game-kit-composer.js", "duplicate", "n:composition", ["n:composition", "n:policy"], "Use the manifest-backed Composition registry, planner, validator, apply controller, and receipts.", "Legacy game composition helper superseded by Core Composition."],
  ["src/hazard-field-kit.js", "external-kit", "NexusEngine-Kits", ["n:object", "n:simulation", "n:spatial"], "Combine object descriptors, Spatial queries, and Simulation state with hazard rules.", "Spawned hazard fields and collision policy."],
  ["src/host.js", "external-kit", "NexusEngine-Editor", ["n:composition", "n:host", "n:policy"], "Implement host lifecycle and adapter mounting in the owning application against Core host capability contracts.", "Concrete host orchestration and adapter lifecycle."],
  ["src/landmark-guidance-kit.js", "external-kit", "NexusEngine-Kits", ["n:object", "n:spatial", "n:world"], "Store landmark descriptors in Object/World and apply guidance policy in an optional Kit.", "Landmark discovery, activation, and guidance."],
  ["src/lifecycle-progression-kit.js", "external-kit", "NexusEngine-Kits", ["n:runtime:sequence", "n:runtime:transaction", "n:simulation"], "Represent steps as Sequence data and commit progression through deterministic Simulation/Transaction receipts.", "Product progression stages and rewards."],
  ["src/navmesh-kit.js", "external-kit", "NexusEngine-Kits", ["n:compute", "n:spatial", "n:world"], "Build navigation mesh data through an optional Compute provider over Spatial and World descriptors.", "Navigation mesh generation and graph policy."],
  ["src/occupant-flow-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:runtime:sequence", "n:simulation"], "Compose Actor registry, Sequence, and Simulation state with occupant-flow policy.", "Spawn, need, service, and abandonment behavior."],
  ["src/pathfinding-kit.js", "external-kit", "NexusEngine-Kits", ["n:compute", "n:spatial", "n:world"], "Resolve path queries through an optional provider selected by a Kit; Core retains only neutral graph/compute contracts.", "A-star and navigation query implementation."],
  ["src/procedural-kit.js", "external-kit", "NexusEngine-Kits", ["n:compute", "n:runtime:data", "n:world"], "Use deterministic Compute providers and recipe data; keep authored generation policy in optional Kits.", "Procedural generation algorithms and product query facade."],
  ["src/procedural-navigation-extensions.js", "duplicate", "NexusEngine-Kits", ["n:composition"], "Use registry recipes to compose the independently owned optional Kits instead of a forwarding barrel.", "Forwarding barrel for unrelated procedural-navigation mechanics."],
  ["src/pursuit-pressure-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:simulation", "n:spatial"], "Combine actor distance observations with Simulation pressure channels and product pursuit thresholds.", "Pursuit pressure and caught/recovery policy."],
  ["src/renderers.js", "external-kit", "NexusEngine-Kits adapters", ["n:host", "n:presentation:output"], "Inject a renderer/output adapter into the engine host; Core never selects or constructs one.", "Concrete headless renderer implementation and renderer selector."],
  ["src/request-fulfillment-kit.js", "external-kit", "NexusEngine-Kits", ["n:interaction", "n:runtime:sequence", "n:simulation"], "Model requests as recipe data and resolve them with Sequence and Simulation atoms.", "Request creation, expiration, proximity, and fulfillment policy."],
  ["src/request-queue-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:runtime:sequence", "n:runtime:transaction"], "Store queue descriptors in Data and coordinate product-specific fulfillment through Sequence/Transaction.", "Queued service requests and cross-feature event bindings."],
  ["src/route-field-kit.js", "external-kit", "NexusEngine-Kits", ["n:object", "n:spatial", "n:world"], "Represent route markers as World/Object data and expose optional spatial route queries.", "Route marker field and nearest-marker queries."],
  ["src/scenario-driver-kit.js", "game-owned", "Experiments or game repository", ["n:composition", "n:runtime:sequence", "n:simulation"], "Express the scenario as a game-owned composition recipe and authored sequence.", "Complete scenario orchestration policy."],
  ["src/scenario-duration-kit.js", "game-owned", "Experiments or game repository", ["n:runtime:sequence", "n:simulation"], "Use generic timers and checkpoints with game-owned duration thresholds and completion rules.", "Authored scenario duration and checkpoint rules."],
  ["src/schedule-kit.js", "external-kit", "NexusEngine-Kits", ["n:runtime:sequence", "n:simulation"], "Build schedule policy over generic sequence and simulation clocks.", "Cyclic product schedule behavior."],
  ["src/shaders.js", "external-kit", "NexusEngine-Kits adapters", ["n:host", "n:presentation:graphics"], "Keep descriptors in Presentation and compile them only inside an approved renderer adapter.", "WebGL shader compilation and concrete material registry."],
  ["src/spatial-scale-kit.js", "external-kit", "NexusEngine-Kits", ["n:object", "n:spatial"], "Represent scale anchors as Object data and evaluate authored scale bands in an optional Kit.", "Authored spatial scale bands and anchor behavior."],
  ["src/terrain-kit.js", "external-kit", "NexusEngine-Kits", ["n:compute", "n:world", "n:world:scene"], "Resolve terrain generation through a trusted Compute/World provider and keep authored layer policy external.", "Terrain algorithms, layers, and query facade."],
  ["src/transfer-zone-kit.js", "external-kit", "NexusEngine-Kits", ["n:interaction", "n:object", "n:spatial"], "Attach transfer-zone descriptors to objects and resolve transfer policy in an optional Kit.", "Zone membership and transfer completion policy."],
  ["src/transport-route-kit.js", "external-kit", "NexusEngine-Kits", ["n:actor", "n:runtime:sequence", "n:world"], "Compose actor registry, World route data, and Sequence timing with transport policy.", "Transport call, travel, and arrival behavior."],
  ["src/vehicle-dynamics-kit.js", "external-kit", "NexusEngine-Kits", ["n:interaction:input", "n:simulation:motion", "n:simulation:physics"], "Use Motion and Physics providers with normalized input; retain vehicle tuning externally.", "Authored vehicle dynamics and impact policy."],
  ["src/water-surface-kit.js", "external-kit", "NexusEngine-Kits", ["n:presentation:graphics", "n:world"], "Keep neutral water surface descriptors in World/Presentation and authored evaluation policy external.", "Authored water surface state and queries."],
  ["src/world-physics-kit.js", "external-kit", "NexusEngine-Kits", ["n:simulation:motion", "n:simulation:physics", "n:world"], "Resolve a Physics provider through composition and keep world-specific collision/tuning policy external.", "Legacy world physics implementation and policy."],
  ["src/hosts/browser/", "external-kit", "NexusEngine-Editor adapters", ["n:asset", "n:host", "n:presentation"], "Install browser storage and presentation implementations as host-owned leaf adapters.", "Browser IndexedDB, presentation surface, and startup adapters."],
  ["src/renderers/three/", "external-kit", "NexusEngine-Kits adapters", ["n:host", "n:object", "n:presentation"], "Install Three.js capture/output/bounds implementations as approved leaf adapters.", "Three.js capture, presentation output, and subject-bounds adapters."],
  ["src/modules/nexus-diffusion/", "external-kit", "NexusEngine-Kits", ["n:compute", "n:compute:model", "n:runtime:data"], "Expose diffusion backends through Compute/Model providers and keep training/sampling policy in an optional package.", "Diffusion model, dataset, training, sampling, tensor, noise, and preview implementation."],
  ["src/core-domains/world/subdomains/scene/kits/scene-kit/hosts/", "external-kit", "NexusEngine-Editor adapters", ["n:host", "n:world:scene"], "Implement web, native, or headless scene loading as host-owned leaf adapters against the neutral Scene host contract.", "Concrete web navigation, native loading, and headless scene host implementations."],
  ["src/core-domains/presentation/subdomains/speech/kits/speech-kit/pocket-tts-provider.js", "external-kit", "NexusEngine-Kits adapters", ["n:asset", "n:compute:model", "n:presentation:speech"], "Install PocketTTS or another model/network implementation through the neutral Speech provider contract.", "Concrete hosted PocketTTS HTTP provider and model asset manifest."],
  ["src/core-domains/compute/subdomains/model/kits/model-kit/mock-model-adapter.js", "recipe-data", "NexusEngine tests", ["n:compute:model"], "Inject a deterministic fixture adapter through the neutral Model adapter contract when testing inference flows.", "Concrete mock inference implementation used only for tests."],
  ["bin/nexus-editor.mjs", "external-kit", "NexusEngine-Editor", ["n:composition", "n:host", "n:mcp"], "Ship the CLI from NexusEngine-Editor against committed NexusEngine contracts.", "Headless editor command-line host."],
  ["tools/headless-editor/", "external-kit", "NexusEngine-Editor", ["n:composition", "n:host", "n:mcp", "n:policy"], "Own editor routing, transports, workspaces, repository tools, and guided-development implementation in NexusEngine-Editor.", "Headless editor implementation and repository development tooling."]
].map(([sourcePath, disposition, targetOwner, requiredCoreAtoms, reconstructionRecipe, semanticBehavior]) => ({
  sourcePath,
  disposition,
  targetOwner,
  requiredCoreAtoms,
  reconstructionRecipe,
  semanticBehavior,
  stateAndLifecycle: disposition === "duplicate"
    ? "Replacement owns lifecycle through manifest-backed composition receipts."
    : "The target owner must define install, duplicate-install, snapshot, load, and reset behavior before promotion.",
  proofStatus: disposition === "duplicate" ? "replacement-proved" : "scheduled-external"
}));

const removedExports = [
  {
    sourcePath: "src/core-domains/compute/subdomains/model/kits/model-kit/index.js",
    exportNames: ["createMockModelAdapter"],
    disposition: "recipe-data",
    targetOwner: "NexusEngine tests",
    replacement: "Inject createModelAdapterBoundary({ infer }) into createModelKit({ adapters })."
  },
  {
    sourcePath: "src/core-domains/presentation/subdomains/sky/kits/sky-kit/index.js",
    exportNames: ["CORE_SKYBOX_PRESETS"],
    disposition: "recipe-data",
    targetOwner: "NexusEngine-Kits recipes or game repositories",
    replacement: "Pass caller-owned preset data to createSkyDescriptorKit({ presets }) or registerPreset()."
  },
  {
    sourcePath: "src/core-domains/presentation/subdomains/speech/kits/speech-kit/index.js",
    exportNames: ["createTinyTTSAssetManifest", "createTinyTTSProvider", "registerTinyTTSAssets"],
    disposition: "external-kit",
    targetOwner: "NexusEngine-Kits adapters",
    replacement: "Install a model, network, and asset implementation through createSpeechKit().registerProvider()."
  },
  {
    sourcePath: "src/core-domains/presentation/subdomains/speech/kits/speech-kit/pocket-tts-provider.js",
    exportNames: ["createPocketTTSAssetManifest", "createPocketTTSHttpAssetProvider", "createPocketTTSProvider", "registerPocketTTSAssets"],
    disposition: "external-kit",
    targetOwner: "NexusEngine-Kits adapters",
    replacement: "Install PocketTTS through createSpeechKit().registerProvider()."
  }
].map((record) => ({ ...record, sourceCommit }));

async function optionalJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function applies(recordPath, sourcePath) {
  return sourcePath.endsWith("/") ? recordPath.startsWith(sourcePath) : recordPath === sourcePath;
}

const ownership = await optionalJson(ownershipPath, { records: [] });
const previous = await optionalJson(jsonPath, { records: [] });
const restoration = await optionalJson(restorationLedgerPath, { records: [] });
const restorationBySource = new Map(restoration.records.map((record) => [record.sourcePath, record]));
const exportIndex = new Map([
  ...previous.records.map((record) => [record.sourcePath, record.publicExports ?? []]),
  ...ownership.records.map((record) => [record.path, record.publicExports ?? []])
]);

const expanded = [];
for (const spec of records) {
  const matching = ownership.records
    .map((record) => record.path)
    .filter((recordPath) => applies(recordPath, spec.sourcePath));
  const previousMatching = previous.records
    .map((record) => record.sourcePath)
    .filter((recordPath) => applies(recordPath, spec.sourcePath));
  const sourcePaths = [...new Set([...matching, ...previousMatching])];
  if (sourcePaths.length === 0 || !spec.sourcePath.endsWith("/")) sourcePaths.push(spec.sourcePath);

  for (const sourcePath of [...new Set(sourcePaths)].sort()) {
    const restored = restorationBySource.get(sourcePath);
    const effective = restored ? {
      ...spec,
      disposition: "core-restored",
      targetOwner: `NexusEngine manifests: ${restored.newAtoms.map((atom) => atom.domainPath).join(", ")}`,
      requiredCoreAtoms: restored.newAtoms.map((atom) => atom.kitId),
      reconstructionRecipe: restored.newApiExample,
      semanticBehavior: `Restored by ${restored.newAtoms.map((atom) => atom.kitId).join(", ")}.`,
      stateAndLifecycle: "Manifest-owned JSON-portable state with validated snapshot/load/reset and exact-once operation receipts.",
      proofStatus: restored.status,
      restoration: {
        sourceSha256: restored.sourceSha256,
        lineage: restored.lineage,
        newAtoms: restored.newAtoms,
        requiredAdapters: restored.requiredAdapters,
        proofReferences: restored.proofReferences
      }
    } : spec;
    expanded.push({
      ...effective,
      sourcePath,
      sourceCommit,
      publicExports: [...(restored
        ? [restored.old.factories, restored.old.helpers, restored.old.resources, restored.old.events].flat()
        : (exportIndex.get(sourcePath) ?? []))].sort()
    });
  }
}

expanded.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));
assert.equal(new Set(expanded.map((record) => record.sourcePath)).size, expanded.length, "Duplicate disposition path");
for (const record of expanded) {
  assert.ok(allowedDispositions.has(record.disposition), `Invalid disposition for ${record.sourcePath}`);
  assert.ok(record.targetOwner && record.reconstructionRecipe && record.semanticBehavior, `Incomplete disposition for ${record.sourcePath}`);
}
assert.equal(expanded.filter((record) => record.disposition === "core-restored").length, restoration.counts?.historicalModules ?? 0, "Every restored behavior source must be core-restored exactly once.");

const document = {
  schema: "nexusengine.root-module-dispositions/1",
  source: { repository: "NexusEngine", commit: sourceCommit },
  policy: "Hard cutover: no runtime forwarding exports. Git history and this ledger preserve lineage.",
  counts: Object.fromEntries([...allowedDispositions].map((name) => [name, expanded.filter((record) => record.disposition === name).length])),
  removedExports,
  records: expanded
};

const markdown = [
  "# NexusEngine 0.0.4 Root Module Dispositions",
  "",
  `Source commit: \`${sourceCommit}\``,
  "",
  "This is a hard cutover. Removed modules are not forwarded. Sources marked core-restored now use manifest-owned semantic subpaths; all other rows name their external owner or replacement.",
  "",
  "## Removed Exports From Retained Modules",
  "",
  "| Source | Removed exports | Disposition | Replacement |",
  "|---|---|---|---|",
  ...removedExports.map((record) => `| \`${record.sourcePath}\` | ${record.exportNames.map((name) => `\`${name}\``).join(", ")} | ${record.disposition} | ${record.replacement} |`),
  "",
  "## Retired Source Modules",
  "",
  "| Source | Disposition | Owner | Core requirements |",
  "|---|---|---|---|",
  ...expanded.map((record) => `| \`${record.sourcePath}\` | ${record.disposition} | ${record.targetOwner} | ${record.requiredCoreAtoms.map((id) => `\`${id}\``).join(", ")} |`),
  ""
].join("\n");

if (process.argv.includes("--check")) {
  assert.deepEqual(await optionalJson(jsonPath, null), document, "Root disposition JSON is stale; run npm run migrations:generate");
  assert.equal(await readFile(markdownPath, "utf8"), markdown, "Root disposition Markdown is stale; run npm run migrations:generate");
  for (const record of document.records) {
    if (record.sourcePath.endsWith("/")) continue;
    try {
      await access(path.join(root, record.sourcePath));
      assert.fail(`Retired production source remains: ${record.sourcePath}`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  console.log(`Root module dispositions ok: ${document.records.length} retired source records.`);
} else {
  await writeFile(jsonPath, `${JSON.stringify(document, null, 2)}\n`);
  await writeFile(markdownPath, markdown);
  console.log(`Generated ${document.records.length} root module dispositions.`);
}
