import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "docs", "protokit-extraction");
const sourceOutput = path.join(outputRoot, "source.json");
const inventoryOutput = path.join(outputRoot, "inventory.json");
const dispositionOutput = path.join(outputRoot, "dispositions.json");
const gapOutput = path.join(outputRoot, "core-gap-set.json");
const markdownOutput = path.join(outputRoot, "README.md");
const EXPECTED_FOLDER_COUNT = 530;
const ALLOWED_DISPOSITIONS = Object.freeze([
  "core-reuse",
  "core-composition",
  "core-new-atom",
  "external-kit",
  "recipe-data",
  "game-owned",
  "duplicate",
  "rejected-unproven"
]);

const args = process.argv.slice(2);
const check = args.includes("--check");
const sourceIndex = args.indexOf("--source");
const sourceArgument = sourceIndex >= 0 ? args[sourceIndex + 1] : process.env.NEXUSENGINE_PROTOKITS_SOURCE;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function posix(value) {
  return value.split(path.sep).join("/");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function stableJson(value) {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

async function walk(directory, output = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(target, output);
    else output.push(target);
  }
  return output;
}

function git(source, ...arguments_) {
  return execFileSync("git", ["-C", source, ...arguments_], { encoding: "utf8" }).trim();
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function addExport(records, seen, sourcePath, name, kind, index, source, extra = {}) {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return;
  const identity = `${sourcePath}\0${kind}\0${normalizedName}\0${extra.from ?? ""}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  records.push({
    sourcePath,
    exportName: normalizedName,
    exportKind: kind,
    line: lineAt(source, index),
    ...extra
  });
}

function extractExports(source, sourcePath) {
  const records = [];
  const seen = new Set();
  const declarations = /\bexport\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of source.matchAll(declarations)) {
    addExport(records, seen, sourcePath, match[1], "declaration", match.index, source);
  }
  const variables = /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of source.matchAll(variables)) {
    addExport(records, seen, sourcePath, match[1], "declaration", match.index, source);
  }
  const named = /\bexport\s*\{([\s\S]*?)\}\s*(?:from\s*["']([^"']+)["'])?\s*;?/g;
  for (const match of source.matchAll(named)) {
    for (const part of match[1].split(",")) {
      const cleaned = part.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/g, "").trim();
      if (!cleaned) continue;
      const pieces = cleaned.split(/\s+as\s+/i);
      addExport(records, seen, sourcePath, pieces.at(-1).trim(), "named-reexport", match.index, source, {
        localName: pieces[0].trim(),
        from: match[2] ?? null
      });
    }
  }
  const namespace = /\bexport\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(namespace)) {
    addExport(records, seen, sourcePath, match[1], "namespace-reexport", match.index, source, { from: match[2] });
  }
  const wildcard = /\bexport\s+\*\s+from\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(wildcard)) {
    addExport(records, seen, sourcePath, `*:${match[1]}`, "wildcard-reexport", match.index, source, { from: match[1] });
  }
  const defaults = /\bexport\s+default\b/g;
  for (const match of source.matchAll(defaults)) {
    addExport(records, seen, sourcePath, "default", "default", match.index, source);
  }
  return records.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)
    || left.line - right.line
    || left.exportName.localeCompare(right.exportName));
}

function quotedValues(source) {
  return [...source.matchAll(/["']([^"'\n]+)["']/g)].map((match) => match[1]);
}

function collectArraySignals(source, field) {
  const output = [];
  const pattern = new RegExp(`\\b${field}\\s*:\\s*\\[([^\\]]*)\\]`, "g");
  for (const match of source.matchAll(pattern)) output.push(...quotedValues(match[1]));
  return [...new Set(output)].sort();
}

function collectCallSignals(source, functionName) {
  const pattern = new RegExp(`\\b${functionName}\\s*\\(\\s*["']([^"']+)["']`, "g");
  return [...new Set([...source.matchAll(pattern)].map((match) => match[1]))].sort();
}

function normalizeSemanticSource(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const coreReuseRules = [
  [/\b(?:generic-)?seed-kit\b|deterministic-random|random-stream/, "runtime-data-kit", "n:runtime:data"],
  [/completion-ledger|idempotency-ledger|state-digest/, "runtime-data-kit", "n:runtime:data"],
  [/action-window|timing-window|generic-resource-loop|pressure-loop|timer-domain/, "simulation-state-kit", "n:simulation"],
  [/asset-descriptor|asset-load-queue|asset-pack-manifest/, "asset-registry-kit", "n:asset"],
  [/persistence-(?:dsk|domain|kit)|snapshot-domain|save-load/, "persistence-contract-kit", "n:runtime:persistence"],
  [/input-action|action-input|input-intent/, "input-contract-kit", "n:interaction:input"],
  [/condition-gate|policy-validation/, "policy-kit", "n:policy"],
  [/scene-graph-domain|spatial-scene-graph|transform-domain-service|generic-anchor-descriptor/, "spatial-contract-kit", "n:spatial"],
  [/physics-body-lite|physics-body-weight-source/, "physics-contract-kit", "n:simulation:physics"],
  [/render-descriptor-domain|presentation-output/, "presentation-output-kit", "n:presentation:output"],
  [/camera-mode-domain|camera-framing/, "camera-descriptor-kit", "n:presentation:camera"],
  [/domain-manifest-registry/, "composition-registry-kit", "n:composition"]
];

const compositionPattern = /(?:^|-)kit-registry-domain|capability-graph-domain|composition-planning-domain|domain-boundary|domain-taxonomy|domain-inventory|domain-foundation|protokit-core/;
const completeGamePattern = /(?:^|-)game(?:-|$)|gameplay|^2d-platformer-domain$|^arcade-race-core$|^zombie-orchard$|^blackwake-|^vr-platformer-kit-suite$/;
const recipePattern = /preset|palette|recipe|content-(?:palette|preset)|pack-library|catalog|bundle$|project-kits$|domain-kits$|kit-suite$/;
const adapterPattern = /adapter|bridge|renderer|render-kit|webgl|webgpu|three-|canvas-|webxr|openxr|rapier|onnx|provider|shader|sdk|http|network-transport|platform/;

function coreMapping(text) {
  for (const [pattern, kitId, domainPath] of coreReuseRules) {
    if (pattern.test(text)) return { kitId, domainPath };
  }
  return null;
}

function requiredAtoms(text) {
  const rules = [
    [/object|prop|mesh|shape|vegetation|tree|foliage/, "n:object"],
    [/place|spatial|transform|anchor|zone|grid|route|terrain|world/, "n:spatial"],
    [/world|terrain|biome|weather|atmosphere|zone/, "n:world"],
    [/physics|collision|contact|ragdoll|projectile/, "n:simulation:physics"],
    [/motion|movement|locomotion|flight|vehicle/, "n:simulation:motion"],
    [/simulation|resource|pressure|timer|window|health|damage/, "n:simulation"],
    [/actor|avatar|character|creature|player|npc|enemy/, "n:actor"],
    [/agent|director|policy|decision/, "n:agent"],
    [/interaction|affordance|trigger|selection|grab|hold/, "n:interaction"],
    [/input|gesture|command/, "n:interaction:input"],
    [/render|visual|graphic|material|shader|decal|particle|fog/, "n:presentation:graphics"],
    [/camera/, "n:presentation:camera"],
    [/audio|speech|chat|dialogue/, "n:presentation:audio"],
    [/ui|widget|overlay/, "n:presentation:ui"],
    [/asset|pack|load|content/, "n:asset"],
    [/compute|gpu|model|onnx|inference/, "n:compute"],
    [/network|multiplayer|sync/, "n:network"],
    [/persist|save|snapshot/, "n:runtime:persistence"],
    [/sequence|mission|quest|progress/, "n:runtime:sequence"],
    [/registry|composition|manifest|bundle/, "n:composition"]
  ];
  const values = rules.filter(([pattern]) => pattern.test(text)).map(([, domainPath]) => domainPath);
  return [...new Set(values.length ? values : ["n:runtime", "n:composition"])].sort();
}

function classify(folderId, exportName, hasExecutableSurface) {
  const text = `${folderId} ${exportName ?? ""}`.toLowerCase();
  const mapping = coreMapping(text);
  if (mapping) {
    return {
      disposition: "core-reuse",
      targetOwner: `NexusEngine ${mapping.kitId}`,
      targetDomainPath: mapping.domainPath,
      proofStatus: "mapped-existing-core"
    };
  }
  if (compositionPattern.test(text)) {
    return {
      disposition: "core-composition",
      targetOwner: "NexusEngine composition-registry-kit",
      targetDomainPath: "n:composition",
      proofStatus: "mapped-existing-core"
    };
  }
  if (completeGamePattern.test(folderId)) {
    return {
      disposition: "game-owned",
      targetOwner: "NexusEngine-Experiments or a dedicated game repository",
      targetDomainPath: null,
      proofStatus: "scheduled-game-owner"
    };
  }
  if (recipePattern.test(text)) {
    return {
      disposition: "recipe-data",
      targetOwner: "NexusEngine-Kits recipes or a game repository",
      targetDomainPath: null,
      proofStatus: "scheduled-recipe-owner"
    };
  }
  if (adapterPattern.test(text)) {
    return {
      disposition: "external-kit",
      targetOwner: "NexusEngine-Kits provider or adapter registry",
      targetDomainPath: null,
      proofStatus: "scheduled-external-owner"
    };
  }
  if (!hasExecutableSurface) {
    return {
      disposition: "rejected-unproven",
      targetOwner: "ProtoKits historical archive",
      targetDomainPath: null,
      proofStatus: "no-executable-surface"
    };
  }
  return {
    disposition: "external-kit",
    targetOwner: "NexusEngine-Kits",
    targetDomainPath: null,
    proofStatus: "scheduled-external-owner"
  };
}

function recipeFor(disposition, atoms, targetOwner) {
  const atomText = atoms.length ? atoms.join(" + ") : "manifest-backed Core atoms";
  if (disposition === "core-reuse") return `Use the existing ${targetOwner} atom; preserve only source-specific data as recipe input.`;
  if (disposition === "core-composition") return "Use the manifest-backed Composition registry, planner, validator, and apply receipts.";
  if (disposition === "external-kit") return `Implement the optional policy or provider in ${targetOwner} over ${atomText}.`;
  if (disposition === "recipe-data") return `Represent the behavior as immutable recipe data over ${atomText}.`;
  if (disposition === "game-owned") return `Compose ${atomText} in the owning game; do not publish the authored behavior from Core.`;
  if (disposition === "duplicate") return `Use the canonical source item owned by ${targetOwner}.`;
  if (disposition === "core-new-atom") return `Implement and prove the frozen atom under ${atoms[0] ?? "its semantic Domain"}.`;
  return "Preserve Git lineage only until executable behavior and two distinct consumers are proven.";
}

function summarizeFolderDisposition(items) {
  const rank = ["core-new-atom", "core-composition", "core-reuse", "external-kit", "recipe-data", "game-owned", "duplicate", "rejected-unproven"];
  return rank.find((name) => items.some((item) => item.disposition === name)) ?? "rejected-unproven";
}

async function buildExtraction(sourceRoot) {
  const canonicalSource = await realpath(sourceRoot);
  const protokitsRoot = path.join(canonicalSource, "protokits");
  await access(protokitsRoot);
  const sourceCommit = git(canonicalSource, "rev-parse", "HEAD");
  const remote = git(canonicalSource, "config", "--get", "remote.origin.url");
  const dirtyPaths = git(canonicalSource, "status", "--short").split("\n").filter(Boolean);
  const folderEntries = (await readdir(protokitsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.equal(folderEntries.length, EXPECTED_FOLDER_COUNT, `Frozen ProtoKit folder count changed: ${folderEntries.length}`);

  const packageJson = JSON.parse(await readFile(path.join(canonicalSource, "package.json"), "utf8"));
  const packageSurfaces = new Map();
  for (const [subpath, target] of Object.entries(packageJson.exports ?? {})) {
    if (typeof target !== "string" || target.includes("*")) continue;
    const match = target.replace(/^\.\//, "").match(/^protokits\/([^/]+)\/(.+)$/);
    if (!match) continue;
    const records = packageSurfaces.get(match[1]) ?? [];
    records.push({ subpath, target: target.replace(/^\.\//, "") });
    packageSurfaces.set(match[1], records);
  }

  const allSourceFiles = (await walk(canonicalSource)).filter((filePath) => !filePath.includes(`${path.sep}.git${path.sep}`));
  const consumerIndex = new Map(folderEntries.map((id) => [id, new Set()]));
  for (const filePath of allSourceFiles) {
    if (!/\.(?:m?js|json|md)$/i.test(filePath)) continue;
    const source = await readFile(filePath, "utf8");
    for (const folderId of folderEntries) {
      if (source.includes(`protokits/${folderId}`) && !filePath.startsWith(path.join(protokitsRoot, folderId))) {
        consumerIndex.get(folderId).add(posix(path.relative(canonicalSource, filePath)));
      }
    }
  }

  const folders = [];
  const sourceItems = [];
  const sourceHashes = [];
  for (const folderId of folderEntries) {
    const folderRoot = path.join(protokitsRoot, folderId);
    const files = (await walk(folderRoot)).sort();
    const relativeFiles = files.map((filePath) => posix(path.relative(canonicalSource, filePath)));
    const javascriptFiles = files.filter((filePath) => /\.(?:m?js)$/i.test(filePath));
    const readmes = relativeFiles.filter((filePath) => /(?:^|\/)readme\.md$/i.test(filePath));
    const tests = relativeFiles.filter((filePath) => /(?:^|\/)(?:tests?|fixtures)(?:\/|$)|\.(?:test|spec)\.m?js$/i.test(filePath));
    const manifests = relativeFiles.filter((filePath) => /(?:package|kit|domain|manifest)[^/]*\.json$/i.test(filePath));
    const exports = [];
    const dependencies = new Set();
    const resources = new Set();
    const events = new Set();
    const commands = new Set();
    const provides = new Set();
    const requires = new Set();
    const normalizedSources = [];
    const semanticSourceByPath = new Map();
    const folderFileHashes = [];
    let hasSnapshot = false;
    let hasReset = false;
    let hasProvider = false;
    let hasAdapter = false;
    const nondeterminismSignals = new Set();
    const presentationSignals = new Set();

    for (const filePath of files) {
      const relativePath = posix(path.relative(canonicalSource, filePath));
      const contents = await readFile(filePath);
      const fileHash = sha256(contents);
      sourceHashes.push(`${relativePath}:${fileHash}`);
      folderFileHashes.push(`${relativePath}:${fileHash}`);
      if (!/\.(?:m?js)$/i.test(filePath)) continue;
      const source = contents.toString("utf8");
      const normalizedSource = normalizeSemanticSource(source);
      normalizedSources.push(normalizedSource);
      semanticSourceByPath.set(relativePath, normalizedSource);
      exports.push(...extractExports(source, relativePath));
      for (const match of source.matchAll(/\b(?:import|export)\s+(?:[^"']*?\s+from\s*)?["']([^"']+)["']/g)) dependencies.add(match[1]);
      for (const value of collectCallSignals(source, "defineResource")) resources.add(value);
      for (const value of collectCallSignals(source, "defineEvent")) events.add(value);
      for (const value of collectArraySignals(source, "provides")) provides.add(value);
      for (const value of collectArraySignals(source, "requires")) requires.add(value);
      for (const match of source.matchAll(/\b(?:action|command|type)\s*:\s*["']([^"']+)["']/g)) commands.add(match[1]);
      hasSnapshot ||= /\b(?:getSnapshot|snapshot|loadSnapshot|restoreSnapshot)\b/.test(source);
      hasReset ||= /\breset\s*\(/.test(source);
      hasProvider ||= /\bprovider\b/i.test(source) || /provider/i.test(path.basename(filePath));
      hasAdapter ||= /\badapter\b/i.test(source) || /adapter/i.test(path.basename(filePath));
      if (/\bMath\.random\b/.test(source)) nondeterminismSignals.add("Math.random");
      if (/\b(?:Date\.now\s*\(|new\s+Date\s*\()/.test(source)) nondeterminismSignals.add("wall-clock time");
      if (/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(source)) nondeterminismSignals.add("network or external I/O");
      if (/\b(?:THREE|WebGL|WebGPU|CanvasRenderingContext|AudioContext)\b/.test(source)) presentationSignals.add("concrete presentation API");
    }

    for (const surface of packageSurfaces.get(folderId) ?? []) {
      exports.push({
        sourcePath: "package.json",
        exportName: surface.subpath,
        exportKind: "package-export",
        line: null,
        target: surface.target
      });
    }

    const folderFingerprint = sha256(normalizedSources.sort().join("\n---module---\n"));
    const uniqueExports = [...new Map(exports.map((record) => [
      `${record.sourcePath}\0${record.exportKind}\0${record.exportName}\0${record.from ?? ""}\0${record.target ?? ""}`,
      record
    ])).values()].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)
      || (left.line ?? 0) - (right.line ?? 0)
      || left.exportName.localeCompare(right.exportName));
    const hasExecutableSurface = uniqueExports.some((record) => record.exportKind !== "package-export");
    const factoryNames = [...new Set(uniqueExports
      .map((record) => record.exportName)
      .filter((name) => typeof name === "string" && /^create[A-Z0-9].*(?:Kit|Domain|Dsk|DSK)$/.test(name)))];
    const consumerKinds = [...new Set([...consumerIndex.get(folderId)].map((consumer) => {
      if (consumer === "package.json") return "package-metadata";
      if (consumer.startsWith("tests/")) return "test-suite";
      if (consumer.startsWith("apps/")) return "application";
      if (consumer.startsWith("protokits/")) return `protokit:${consumer.split("/")[1]}`;
      return consumer.split("/")[0];
    }).filter((kind) => kind === "test-suite" || kind === "application" || kind.startsWith("protokit:")))];
    const genreSpecific = /platformer|race|zombie|blackwake|rpg|survival|combat|weapon|enemy|boss|aerial|flight|meadow|orchard|island|watercraft/.test(folderId);
    const potentialUniversal = /generic|domain-kit|service-kit|dsk|foundation|core/.test(folderId);
    const coreGateEvidence = {
      potentialUniversal,
      oneIndivisibleResponsibility: factoryNames.length === 1 && !/(?:suite|batch|domain-kits|project-kits)/.test(folderId),
      factoryNames,
      deterministicOrIsolatedNondeterminism: nondeterminismSignals.size === 0,
      nondeterminismSignals: [...nondeterminismSignals].sort(),
      productNeutral: !genreSpecific && !completeGamePattern.test(folderId),
      resetAndSnapshot: hasReset && hasSnapshot,
      noPresentationImplementationOwnership: presentationSignals.size === 0 && !adapterPattern.test(folderId),
      presentationSignals: [...presentationSignals].sort(),
      distinctConsumerKinds: consumerKinds,
      twoSemanticallyDistinctConsumers: consumerKinds.length >= 2,
      testReferences: tests
    };
    const dispositionInputs = uniqueExports.length ? uniqueExports : [{
      sourcePath: `protokits/${folderId}/`,
      exportName: null,
      exportKind: "folder-no-export-surface",
      line: null
    }];
    const folderItems = dispositionInputs.map((record) => {
      const classification = classify(folderId, record.exportName, hasExecutableSurface);
      const text = `${folderId} ${record.exportName ?? ""}`.toLowerCase();
      const atoms = classification.targetDomainPath
        ? [classification.targetDomainPath]
        : requiredAtoms(text);
      const semanticFingerprint = sha256(JSON.stringify({
        exportName: record.exportName,
        normalizedSource: record.sourcePath === "package.json"
          ? record.target
          : semanticSourceByPath.get(record.sourcePath) ?? folderFingerprint,
        provides: [...provides].sort(),
        requires: [...requires].sort(),
        resources: [...resources].sort(),
        events: [...events].sort()
      }));
      return {
        id: `protokit-export:${sha256(`${folderId}:${record.sourcePath}:${record.exportKind}:${record.exportName ?? "<none>"}`).slice(0, 20)}`,
        folderId,
        sourceCommit,
        sourcePath: record.sourcePath,
        line: record.line,
        exportName: record.exportName,
        exportKind: record.exportKind,
        ...(record.from ? { reexportsFrom: record.from } : {}),
        ...(record.target ? { packageTarget: record.target } : {}),
        semanticFingerprint: `sha256:${semanticFingerprint}`,
        duplicateGroup: null,
        canonicalItemId: null,
        disposition: classification.disposition,
        targetOwner: classification.targetOwner,
        targetDomainPath: classification.targetDomainPath,
        requiredCoreAtoms: atoms,
        reconstructionRecipe: recipeFor(classification.disposition, atoms, classification.targetOwner),
        proofStatus: classification.proofStatus,
        evidence: {
          hasSnapshot,
          hasReset,
          resources: [...resources].sort(),
          events: [...events].sort(),
          commands: [...commands].sort(),
          provides: [...provides].sort(),
          requires: [...requires].sort(),
          tests
        }
      };
    });
    sourceItems.push(...folderItems);
    folders.push({
      id: folderId,
      sourceCommit,
      sourcePath: `protokits/${folderId}`,
      contentSha256: `sha256:${sha256(folderFileHashes.join("\n"))}`,
      semanticFingerprint: `sha256:${folderFingerprint}`,
      files: relativeFiles,
      readmes,
      manifests,
      tests,
      dependencies: [...dependencies].sort(),
      exportedSurfaceCount: dispositionInputs.length,
      stateAndLifecycle: { resources: [...resources].sort(), hasSnapshot, hasReset },
      commands: [...commands].sort(),
      events: [...events].sort(),
      providers: hasProvider,
      adapters: hasAdapter,
      knownConsumers: [...consumerIndex.get(folderId)].sort(),
      declaredPackageSubpaths: (packageSurfaces.get(folderId) ?? []).map(({ subpath }) => subpath).sort(),
      disposition: summarizeFolderDisposition(folderItems),
      dispositionCounts: Object.fromEntries(ALLOWED_DISPOSITIONS.map((name) => [name, folderItems.filter((item) => item.disposition === name).length])),
      targetOwners: [...new Set(folderItems.map((item) => item.targetOwner))].sort(),
      requiredCoreAtoms: [...new Set(folderItems.flatMap((item) => item.requiredCoreAtoms))].sort(),
      proofStatus: [...new Set(folderItems.map((item) => item.proofStatus))].sort(),
      coreGateEvidence
    });
  }

  for (const folder of folders) {
    const mappedToExistingCore = ["core-reuse", "core-composition"].includes(folder.disposition);
    const gate = folder.coreGateEvidence;
    const passesEveryNewAtomGate = gate.potentialUniversal
      && gate.oneIndivisibleResponsibility
      && gate.deterministicOrIsolatedNondeterminism
      && gate.productNeutral
      && gate.resetAndSnapshot
      && gate.noPresentationImplementationOwnership
      && gate.twoSemanticallyDistinctConsumers;
    if (!mappedToExistingCore && passesEveryNewAtomGate) {
      for (const item of sourceItems.filter((entry) => entry.folderId === folder.id)) {
        item.disposition = "core-new-atom";
        item.targetOwner = `NexusEngine semantic owner for ${folder.id}`;
        item.targetDomainPath = item.requiredCoreAtoms[0] ?? "n:runtime";
        item.reconstructionRecipe = recipeFor("core-new-atom", item.requiredCoreAtoms, item.targetOwner);
        item.proofStatus = "passed-automated-gates-requires-implementation-proof";
      }
    }
  }

  const byFingerprint = new Map();
  for (const item of sourceItems) {
    if (item.exportName == null || item.exportKind === "folder-no-export-surface") continue;
    const group = byFingerprint.get(item.semanticFingerprint) ?? [];
    group.push(item);
    byFingerprint.set(item.semanticFingerprint, group);
  }
  for (const group of byFingerprint.values()) {
    const distinctFolders = new Set(group.map((item) => item.folderId));
    if (distinctFolders.size < 2) continue;
    group.sort((left, right) => left.id.localeCompare(right.id));
    const canonical = group[0];
    const duplicateGroup = `duplicate:${canonical.semanticFingerprint.slice("sha256:".length, "sha256:".length + 16)}`;
    canonical.duplicateGroup = duplicateGroup;
    canonical.canonicalItemId = canonical.id;
    for (const item of group.slice(1)) {
      item.duplicateGroup = duplicateGroup;
      item.canonicalItemId = canonical.id;
      item.disposition = "duplicate";
      item.targetOwner = canonical.id;
      item.targetDomainPath = canonical.targetDomainPath;
      item.requiredCoreAtoms = [...canonical.requiredCoreAtoms];
      item.reconstructionRecipe = recipeFor("duplicate", item.requiredCoreAtoms, canonical.id);
      item.proofStatus = "exact-semantic-fingerprint-duplicate";
    }
  }

  for (const folder of folders) {
    const items = sourceItems.filter((item) => item.folderId === folder.id);
    folder.disposition = summarizeFolderDisposition(items);
    folder.dispositionCounts = Object.fromEntries(ALLOWED_DISPOSITIONS.map((name) => [name, items.filter((item) => item.disposition === name).length]));
    folder.targetOwners = [...new Set(items.map((item) => item.targetOwner))].sort();
    folder.requiredCoreAtoms = [...new Set(items.flatMap((item) => item.requiredCoreAtoms))].sort();
    folder.proofStatus = [...new Set(items.map((item) => item.proofStatus))].sort();
  }

  const snapshotSha256 = sha256(sourceHashes.sort().join("\n"));
  const sourceDocument = {
    schema: "nexusengine.protokit-frozen-source/1",
    repository: remote,
    commit: sourceCommit,
    canonicalSubdirectory: "protokits",
    readOnlyExtraction: true,
    executedSourceCode: false,
    dirtyPaths,
    folderCount: folders.length,
    fileCount: sourceHashes.length,
    snapshotSha256: `sha256:${snapshotSha256}`
  };
  const inventoryDocument = {
    schema: "nexusengine.protokit-inventory/1",
    source: sourceDocument,
    folderCount: folders.length,
    sourceItemCount: sourceItems.length,
    folders
  };
  const dispositionCounts = Object.fromEntries(ALLOWED_DISPOSITIONS.map((name) => [name, sourceItems.filter((item) => item.disposition === name).length]));
  const dispositionDocument = {
    schema: "nexusengine.protokit-disposition-ledger/1",
    sourceCommit,
    policy: "Every discovered source export or exportless folder receives exactly one fail-closed disposition. Similar names never establish duplication; duplicate requires an identical semantic fingerprint.",
    allowedDispositions: ALLOWED_DISPOSITIONS,
    folderCount: folders.length,
    sourceItemCount: sourceItems.length,
    classifiedSourceItemCount: sourceItems.filter((item) => ALLOWED_DISPOSITIONS.includes(item.disposition)).length,
    coveragePercent: sourceItems.length ? 100 : 0,
    counts: dispositionCounts,
    items: sourceItems.sort((left, right) => left.folderId.localeCompare(right.folderId)
      || left.sourcePath.localeCompare(right.sourcePath)
      || String(left.exportName).localeCompare(String(right.exportName)))
  };
  const newAtoms = sourceItems.filter((item) => item.disposition === "core-new-atom");
  const candidateReviews = folders.filter((folder) => folder.coreGateEvidence.potentialUniversal).map((folder) => {
    const mappedToExistingCore = ["core-reuse", "core-composition"].includes(folder.disposition);
    const gate = folder.coreGateEvidence;
    const blockers = [];
    if (!gate.oneIndivisibleResponsibility) blockers.push("not-one-indivisible-responsibility");
    if (!gate.deterministicOrIsolatedNondeterminism) blockers.push("nondeterminism-not-isolated");
    if (!gate.productNeutral) blockers.push("product-or-genre-specific");
    if (!gate.resetAndSnapshot) blockers.push("missing-reset-or-snapshot");
    if (!gate.noPresentationImplementationOwnership) blockers.push("owns-concrete-presentation-or-platform-behavior");
    if (!gate.twoSemanticallyDistinctConsumers) blockers.push("fewer-than-two-semantically-distinct-consumers");
    return {
      folderId: folder.id,
      disposition: folder.disposition,
      outcome: mappedToExistingCore
        ? "mapped-existing-core"
        : folder.disposition === "core-new-atom"
          ? "passed-new-atom-gate"
          : "failed-new-atom-gate",
      blockers,
      evidence: gate
    };
  });
  const gapDocument = {
    schema: "nexusengine.protokit-core-gap-set/1",
    sourceCommit,
    frozen: true,
    gate: {
      requirements: [
        "one indivisible responsibility",
        "deterministic behavior or isolated nondeterminism",
        "product neutrality",
        "reset and snapshot support",
        "no presentation implementation ownership",
        "two semantically distinct consumers"
      ],
      decision: newAtoms.length
        ? "Only the listed source items passed every Core atom gate."
        : "No historical source item proved every new-atom gate. Useful behavior maps to existing Core atoms, external Kits, recipes, games, exact duplicates, or remains rejected-unproven."
    },
    count: newAtoms.length,
    items: newAtoms,
    reviewedCandidateCount: candidateReviews.length,
    reviewedCandidates: candidateReviews
  };
  const batches = [];
  for (let index = 0; index < folders.length; index += 50) {
    const batch = folders.slice(index, index + 50);
    batches.push({ id: `batch-${String(index / 50 + 1).padStart(2, "0")}`, first: batch[0].id, last: batch.at(-1).id, folders: batch.length });
  }
  const markdown = [
    "# Frozen ProtoKit Extraction",
    "",
    `Canonical source: \`${remote}\` at \`${sourceCommit}\``,
    "",
    `Coverage: **${dispositionDocument.classifiedSourceItemCount}/${dispositionDocument.sourceItemCount} source items (100%)** across **${folders.length} ProtoKit folders**. Source code was parsed as text and never executed.`,
    "",
    "## Dispositions",
    "",
    "| Disposition | Source items |",
    "|---|---:|",
    ...ALLOWED_DISPOSITIONS.map((name) => `| ${name} | ${dispositionCounts[name]} |`),
    "",
    "## Core Gap Set",
    "",
    newAtoms.length
      ? `${newAtoms.length} source items passed every Core-new-atom gate and block 0.0.4 until implemented.`
      : "No historical source item passed every Core-new-atom gate. The frozen Core gap set is empty; unproven generic-looking behavior remains external or rejected rather than being promoted by name.",
    "",
    "## Deterministic Batches",
    "",
    "| Batch | First folder | Last folder | Folders |",
    "|---|---|---|---:|",
    ...batches.map((batch) => `| ${batch.id} | \`${batch.first}\` | \`${batch.last}\` | ${batch.folders} |`),
    "",
    "## Artifacts",
    "",
    "- `source.json`: immutable source identity and complete snapshot hash.",
    "- `inventory.json`: files, exports, state/lifecycle signals, dependencies, consumers, providers, and adapters by folder.",
    "- `dispositions.json`: canonical export-level ownership and reconstruction ledger.",
    "- `core-gap-set.json`: frozen result of the new-Core-atom gate.",
    ""
  ].join("\n");

  validateDocuments(sourceDocument, inventoryDocument, dispositionDocument, gapDocument);
  return { sourceDocument, inventoryDocument, dispositionDocument, gapDocument, markdown };
}

function validateDocuments(source, inventory, dispositions, gap) {
  assert.equal(source.folderCount, EXPECTED_FOLDER_COUNT);
  assert.equal(inventory.folderCount, EXPECTED_FOLDER_COUNT);
  assert.equal(new Set(inventory.folders.map((folder) => folder.id)).size, EXPECTED_FOLDER_COUNT);
  assert.equal(dispositions.sourceItemCount, dispositions.items.length);
  assert.equal(dispositions.classifiedSourceItemCount, dispositions.sourceItemCount);
  assert.equal(dispositions.coveragePercent, 100);
  assert.equal(new Set(dispositions.items.map((item) => item.id)).size, dispositions.items.length);
  for (const item of dispositions.items) {
    assert.ok(ALLOWED_DISPOSITIONS.includes(item.disposition), `Invalid disposition for ${item.id}`);
    assert.ok(item.targetOwner, `Missing target owner for ${item.id}`);
    assert.ok(item.reconstructionRecipe, `Missing reconstruction recipe for ${item.id}`);
    assert.ok(item.proofStatus, `Missing proof status for ${item.id}`);
    assert.ok(Array.isArray(item.requiredCoreAtoms) && item.requiredCoreAtoms.length > 0, `Missing Core atom requirements for ${item.id}`);
  }
  assert.equal(gap.count, gap.items.length);
  assert.deepEqual(gap.items.map((item) => item.id), dispositions.items.filter((item) => item.disposition === "core-new-atom").map((item) => item.id));
}

async function readGenerated() {
  const source = JSON.parse(await readFile(sourceOutput, "utf8"));
  const inventory = JSON.parse(await readFile(inventoryOutput, "utf8"));
  const dispositions = JSON.parse(await readFile(dispositionOutput, "utf8"));
  const gap = JSON.parse(await readFile(gapOutput, "utf8"));
  const markdown = await readFile(markdownOutput, "utf8");
  validateDocuments(source, inventory, dispositions, gap);
  return { sourceDocument: source, inventoryDocument: inventory, dispositionDocument: dispositions, gapDocument: gap, markdown };
}

async function writeOrCheck(documents) {
  const outputs = [
    [sourceOutput, stableJson(documents.sourceDocument)],
    [inventoryOutput, stableJson(documents.inventoryDocument)],
    [dispositionOutput, stableJson(documents.dispositionDocument)],
    [gapOutput, stableJson(documents.gapDocument)],
    [markdownOutput, documents.markdown]
  ];
  if (check) {
    for (const [target, expected] of outputs) {
      assert.equal(await readFile(target, "utf8"), expected, `ProtoKit extraction drift: ${posix(path.relative(root, target))}`);
    }
    return;
  }
  await mkdir(outputRoot, { recursive: true });
  for (const [target, contents] of outputs) await writeFile(target, contents);
}

if (!sourceArgument) {
  if (!check) throw new TypeError("ProtoKit extraction generation requires --source <frozen-worktree> or NEXUSENGINE_PROTOKITS_SOURCE.");
  const generated = await readGenerated();
  assert.equal(generated.markdown, await readFile(markdownOutput, "utf8"));
  console.log(`Checked frozen ProtoKit extraction: ${generated.inventoryDocument.folderCount} folders, ${generated.dispositionDocument.sourceItemCount} classified source items.`);
} else {
  const documents = await buildExtraction(path.resolve(sourceArgument));
  await writeOrCheck(documents);
  console.log(`${check ? "Checked" : "Generated"} frozen ProtoKit extraction: ${documents.inventoryDocument.folderCount} folders, ${documents.dispositionDocument.sourceItemCount} classified source items, ${documents.gapDocument.count} new Core atoms.`);
}
