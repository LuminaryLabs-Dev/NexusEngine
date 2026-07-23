import { normalizeDomainPath } from "../../domain-path.js";
import { NEXUS_ENGINE_VERSION } from "../../release.js";

export const CORE_COMPOSITION_REGISTRY_SCHEMA = "nexusengine.core-composition.registry/2";
export const LEGACY_CORE_COMPOSITION_REGISTRY_SCHEMA = "nexusengine.core-composition.registry/1";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const unique = (values) => [...new Set(values)];
const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));

function stableId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  if (!/^[a-z0-9][a-z0-9:._/-]*$/i.test(id)) throw new TypeError(`${label} has an invalid id: ${id}.`);
  return id;
}

function optionalDomainPath(value, label) {
  if (value === undefined || value === null || value === "") return null;
  return normalizeDomainPath(value, label);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

export function hashRegistryValue(value) {
  const text = JSON.stringify(stableValue(value));
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function normalizeSettingsSchema(value) {
  if (value == null) return Object.freeze({ type: "object", additionalProperties: true });
  if (!isObject(value)) throw new TypeError("Registry settingsSchema must be an object.");
  const schema = clone(value);
  if (schema.type !== undefined && schema.type !== "object") {
    throw new TypeError("Registry settingsSchema root type must be object.");
  }
  schema.type = "object";
  return Object.freeze(schema);
}

export function normalizeRegistrySource(input = {}, options = {}) {
  const registryId = stableId(input.registryId ?? input.id, "Registry source");
  const packageName = String(input.package ?? input.packageName ?? "").trim();
  const version = String(input.version ?? "").trim();
  const contentHash = String(input.contentHash ?? input.hash ?? "").trim();
  if (!packageName || /\s/.test(packageName)) throw new TypeError(`Registry source ${registryId} requires a valid package name.`);
  if (!version || /\s/.test(version)) throw new TypeError(`Registry source ${registryId} requires a valid version.`);
  if (!contentHash || /\s/.test(contentHash) || contentHash.length > 256) throw new TypeError(`Registry source ${registryId} requires a valid contentHash.`);
  const source = {
    registryId,
    package: packageName,
    version,
    contentHash,
    trusted: options.allowTrusted === true && input.trusted === true,
    metadata: Object.freeze(clone(input.metadata ?? {}))
  };
  return Object.freeze(source);
}

export function normalizeKitRegistryRecord(input = {}, options = {}) {
  const id = stableId(input.id, "Kit registry record");
  const domain = String(input.domain ?? id.replace(/-(domain-)?kit$/, "")).trim() || id;
  const domainPath = normalizeDomainPath(input.domainPath ?? `n:${domain}`, "kit.domainPath");
  const parentDomainPath = optionalDomainPath(input.parentDomainPath, "kit.parentDomainPath");
  if (parentDomainPath && !domainPath.startsWith(`${parentDomainPath}:`)) {
    throw new TypeError(`Kit ${id} domainPath ${domainPath} must be nested under ${parentDomainPath}.`);
  }
  const sourceInput = input.source ?? {};
  const source = Object.freeze({
    registryId: stableId(sourceInput.registryId ?? input.sourceRegistryId ?? options.defaultSourceId ?? "project-local", "Kit source registry"),
    exportName: sourceInput.exportName == null ? null : String(sourceInput.exportName),
    module: sourceInput.module == null ? null : String(sourceInput.module),
    trusted: options.allowTrustedSource === true && sourceInput.trusted === true
  });
  return Object.freeze({
    id,
    version: String(input.version ?? "0.0.0"),
    status: String(input.status ?? input.stability ?? "experimental"),
    kind: String(input.kind ?? input.type ?? "domain-service-kit"),
    domain,
    domainPath,
    parentDomainPath,
    apiName: input.apiName == null ? null : String(input.apiName),
    apiVisibility: String(input.apiVisibility ?? input.visibility ?? "public"),
    requires: Object.freeze(unique(asList(input.requires).map(String)).sort()),
    provides: Object.freeze(unique(asList(input.provides).map(String)).sort()),
    composes: Object.freeze(unique(asList(input.composes ?? input.children).map(String)).sort()),
    defaults: Object.freeze(clone(input.defaults ?? input.config ?? {})),
    settingsSchema: normalizeSettingsSchema(input.settingsSchema),
    preview: input.preview == null ? null : Object.freeze(clone(input.preview)),
    source,
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeDomainRegistryRecord(input = {}) {
  const id = stableId(input.id, "Domain registry record");
  const domainPath = normalizeDomainPath(input.domainPath ?? `n:${id}`, "domain.domainPath");
  const parentDomainPath = optionalDomainPath(input.parentDomainPath, "domain.parentDomainPath");
  if (parentDomainPath && !domainPath.startsWith(`${parentDomainPath}:`)) {
    throw new TypeError(`Domain ${id} path ${domainPath} must be nested under ${parentDomainPath}.`);
  }
  return Object.freeze({
    id,
    domainPath,
    parentDomainPath,
    label: String(input.label ?? id),
    status: String(input.status ?? input.stability ?? "stable-candidate"),
    ownedMeaning: Object.freeze(unique(asList(input.ownedMeaning ?? input.owns).map(String))),
    forbiddenResponsibilities: Object.freeze(unique(asList(input.forbiddenResponsibilities ?? input.doesNotOwn).map(String))),
    settingsSchema: normalizeSettingsSchema(input.settingsSchema),
    sourceRegistryId: stableId(input.sourceRegistryId ?? input.source?.registryId ?? "project-local", "Domain source registry"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeBundleRegistryRecord(input = {}) {
  const id = stableId(input.id, "Bundle registry record");
  return Object.freeze({
    id,
    label: String(input.label ?? id),
    domains: Object.freeze(unique(asList(input.domains).map(String)).sort()),
    kits: Object.freeze(unique(asList(input.kits).map(String)).sort()),
    sourceRegistryId: stableId(input.sourceRegistryId ?? input.source?.registryId ?? "project-local", "Bundle source registry"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function migrateRegistryV1(snapshot = {}) {
  if (snapshot.schema !== LEGACY_CORE_COMPOSITION_REGISTRY_SCHEMA) return snapshot;
  const sourceId = "legacy-registry-v1";
  const legacyBody = { kits: asList(snapshot.kits), domains: asList(snapshot.domains), bundles: asList(snapshot.bundles) };
  const domains = legacyBody.domains.map((domain) => ({
    ...domain,
    sourceRegistryId: sourceId,
    ownedMeaning: domain.ownedMeaning ?? domain.owns ?? [],
    forbiddenResponsibilities: domain.forbiddenResponsibilities ?? domain.doesNotOwn ?? []
  }));
  return {
    schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
    revision: Number(snapshot.revision ?? 0),
    registryId: snapshot.registryId ?? sourceId,
    sources: [{ registryId: sourceId, package: "legacy-registry", version: "1", contentHash: hashRegistryValue(legacyBody), trusted: false }],
    domains,
    kits: legacyBody.kits.map((kit) => ({ ...kit, source: { ...(kit.source ?? {}), registryId: sourceId, trusted: false } })),
    bundles: legacyBody.bundles.map((bundle) => ({ ...bundle, sourceRegistryId: sourceId }))
  };
}

export function normalizeRegistrySnapshot(value = {}, options = {}) {
  const migrated = migrateRegistryV1(value);
  if (migrated.schema !== CORE_COMPOSITION_REGISTRY_SCHEMA) {
    throw new TypeError("Unsupported Core Composition registry snapshot.");
  }
  const sourceInputs = asList(migrated.sources);
  if (!sourceInputs.length) throw new TypeError("Registry snapshot requires at least one source.");
  const sources = sourceInputs.map((source) => normalizeRegistrySource(source, { allowTrusted: options.allowTrustedSources === true }));
  const sourceIds = new Set(sources.map((source) => source.registryId));
  if (sourceIds.size !== sources.length) throw new TypeError("Registry snapshot has duplicate source ids.");
  const defaultSourceId = sources[0].registryId;
  const domains = asList(migrated.domains).map((record) => normalizeDomainRegistryRecord({ ...record, sourceRegistryId: record.sourceRegistryId ?? defaultSourceId }));
  const kits = asList(migrated.kits).map((record) => normalizeKitRegistryRecord(record, {
    defaultSourceId,
    allowTrustedSource: options.allowTrustedSources === true
  }));
  const bundles = asList(migrated.bundles).map((record) => normalizeBundleRegistryRecord({ ...record, sourceRegistryId: record.sourceRegistryId ?? defaultSourceId }));
  for (const record of [...domains, ...bundles]) {
    if (!sourceIds.has(record.sourceRegistryId)) throw new TypeError(`Registry record ${record.id} references unknown source ${record.sourceRegistryId}.`);
  }
  for (const record of kits) {
    if (!sourceIds.has(record.source.registryId)) throw new TypeError(`Registry kit ${record.id} references unknown source ${record.source.registryId}.`);
    const source = sources.find((entry) => entry.registryId === record.source.registryId);
    if (!source.trusted && record.source.trusted) throw new TypeError(`Registry kit ${record.id} cannot elevate an untrusted source.`);
  }
  const identities = new Set();
  for (const record of [...domains, ...kits, ...bundles]) {
    if (identities.has(record.id)) throw new TypeError(`Registry identity collision: ${record.id}.`);
    identities.add(record.id);
  }
  const domainPaths = new Set();
  for (const domain of domains) {
    if (domainPaths.has(domain.domainPath)) throw new TypeError(`Registry domain path collision: ${domain.domainPath}.`);
    domainPaths.add(domain.domainPath);
  }
  for (const domain of domains) {
    if (domain.parentDomainPath && !domainPaths.has(domain.parentDomainPath) && options.allowExternalParents !== true) {
      throw new TypeError(`Registry domain ${domain.id} has missing parent ${domain.parentDomainPath}.`);
    }
  }
  if (options.allowExternalReferences !== true) {
    const domainIds = new Set(domains.map((record) => record.id));
    const kitIds = new Set(kits.map((record) => record.id));
    for (const bundle of bundles) {
      for (const domainId of bundle.domains) if (!domainIds.has(domainId)) throw new TypeError(`Registry bundle ${bundle.id} references unknown domain ${domainId}.`);
      for (const kitId of bundle.kits) if (!kitIds.has(kitId)) throw new TypeError(`Registry bundle ${bundle.id} references unknown kit ${kitId}.`);
    }
  }
  const body = {
    schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
    revision: Math.max(0, Number(migrated.revision ?? 0)),
    registryId: stableId(migrated.registryId ?? defaultSourceId, "Registry snapshot"),
    sources: sources.sort((a, b) => a.registryId.localeCompare(b.registryId)),
    domains: domains.sort((a, b) => a.id.localeCompare(b.id)),
    kits: kits.sort((a, b) => a.id.localeCompare(b.id)),
    bundles: bundles.sort((a, b) => a.id.localeCompare(b.id))
  };
  return Object.freeze({ ...clone(body), contentHash: hashRegistryValue(body) });
}

const CORE_FORBIDDEN = Object.freeze(["browser lifecycle", "DOM ownership", "renderer implementation", "GPU device ownership", "host process ownership"]);
const CORE_KITS = Object.freeze([
  ["n-core-agent-kit", "core-agent", "n:core-agent", null, "createCoreAgentKit"],
  ["n-core-animation-kit", "core-animation", "n:core-animation", null, "createCoreAnimationKit"],
  ["n-core-assets-kit", "core-assets", "n:core-assets", null, "createCoreAssetsKit"],
  ["n-core-audio-kit", "core-audio", "n:core-audio", null, "createCoreAudioKit"],
  ["core-camera-framing-kit", "presentation-camera-framing", "n:presentation:camera-framing", "n:presentation", "createCoreCameraFramingKit"],
  ["n-core-camera-kit", "core-camera", "n:core-camera", null, "createCoreCameraKit"],
  ["core-capture-domain", "capture", "n:capture", null, "createCoreCaptureKit"],
  ["n-core-character-kit", "core-character", "n:core-character", null, "createCoreCharacterKit", ["n:core-creature"]],
  ["n-core-composition-kit", "core-composition", "n:core-composition", null, "createCoreCompositionKit"],
  ["core-compute-domain", "compute", "n:compute", null, "createCoreComputeKit"],
  ["n-core-creature-kit", "core-creature", "n:core-creature", null, "createCoreCreatureKit"],
  ["n-core-data-kit", "core-data", "n:core-data", null, "createCoreDataKit"],
  ["n-core-debug-kit", "core-debug", "n:core-debug", null, "createCoreDebugKit"],
  ["n-core-diagnostics-kit", "core-diagnostics", "n:core-diagnostics", null, "createCoreDiagnosticsKit"],
  ["n-core-graphics-kit", "core-graphics", "n:core-graphics", null, "createCoreGraphicsKit"],
  ["n-core-graphics-reflection-kit", "core-graphics-reflection", "n:graphics:reflection", "n:graphics", "createCoreReflectionKit", ["n:core-graphics"], ["n:graphics:reflection"]],
  ["n-core-headless-editor-kit", "core-headless-editor", "n:core-headless-editor", null, "createCoreHeadlessEditorKit"],
  ["n-core-input-kit", "core-input", "n:core-input", null, "createCoreInputKit"],
  ["n-core-interaction-kit", "core-interaction", "n:core-interaction", null, "createCoreInteractionKit"],
  ["n-core-mlnn-kit", "core-mlnn", "n:core-mlnn", null, "createCoreMLNNKit"],
  ["n-core-motion-kit", "core-motion", "n:core-motion", null, "createCoreMotionKit"],
  ["n-core-network-kit", "core-network", "n:core-network", null, "createCoreNetworkKit"],
  ["core-object-fidelity-domain", "object-fidelity", "n:object:fidelity", "n:object", "createCoreObjectFidelityKit", ["object:descriptor-contract"]],
  ["n-core-object-kit", "core-object", "n:object", null, "createCoreObjectKit", [], ["n:core-object", "object:descriptor-contract"]],
  ["core-object-shape-domain", "object-shape", "n:object:shape", "n:object", "createCoreObjectShapeKit", ["object:descriptor-contract"]],
  ["n-core-persistence-kit", "core-persistence", "n:core-persistence", null, "createCorePersistenceKit"],
  ["n-core-physics-kit", "core-physics", "n:core-physics", null, "createCorePhysicsKit"],
  ["n-core-platform-kit", "core-platform", "n:core-platform", null, "createCorePlatformKit"],
  ["n-core-player-kit", "core-player", "n:core-player", null, "createCorePlayerKit", ["n:core-character"]],
  ["n-core-policy-kit", "core-policy", "n:core-policy", null, "createCorePolicyKit"],
  ["core-presentation-domain", "presentation", "n:presentation", null, "createCorePresentationKit"],
  ["core-presentation-output-kit", "presentation-output", "n:presentation:output", "n:presentation", "createCorePresentationOutputKit"],
  ["n-core-scene-kit", "core-scene", "n:core-scene", null, "createCoreSceneKit"],
  ["n-core-simulation-kit", "core-simulation", "n:core-simulation", null, "createCoreSimulationKit"],
  ["n-core-skybox-kit", "core-skybox", "n:core-skybox", null, "createCoreSkyboxKit"],
  ["n-core-spatial-kit", "core-spatial", "n:core-spatial", null, "createCoreSpatialKit"],
  ["core-speech-domain", "speech", "n:speech", null, "createCoreSpeechKit"],
  ["core-startup-domain", "core-startup", "n:core-startup", null, "createCoreStartupKit"],
  ["n-core-transaction-ledger-kit", "core-transaction-ledger", "n:core-transaction-ledger", null, "createCoreTransactionLedgerKit"],
  ["n-core-ui-kit", "core-ui", "n:core-ui", null, "createCoreUIKit"],
  ["core-ui-scale-kit", "presentation-ui-scale", "n:presentation:ui-scale", "n:presentation", "createCoreUIScaleKit"],
  ["n-core-utility-kit", "core-utility", "n:core-utility", null, "createCoreUtilityKit"],
  ["n-core-vegetation-kit", "core-vegetation", "n:object:vegetation", "n:object", "createCoreVegetationKit", ["n:object"]],
  ["realtime-core-kit", "realtime", "n:realtime", null, "createRealtimeCoreKit"],
  ["sequence-core-kit", "sequence", "n:sequence", null, "createSequenceCoreKit", ["n:realtime"]]
]);

function labelFromPath(path) {
  return path.split(":").slice(1).map((part) => part.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")).join(" / ");
}

function moduleSlugFromExport(exportName) {
  return exportName
    .replace(/^create/, "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

const CORE_MODULE_OVERRIDES = Object.freeze({
  createCoreReflectionKit: "src/core-kits/core-graphics-kit/reflection-kit/index.js"
});

function createCoreCatalogBody() {
  const sourceId = "nexusengine-core";
  const kits = CORE_KITS.map(([id, domain, domainPath, parentDomainPath, exportName, requires = [], extraProvides = []]) => ({
    id,
    version: NEXUS_ENGINE_VERSION,
    status: id === "n-core-vegetation-kit" ? "experimental" : "stable-candidate",
    kind: "domain-service-kit",
    domain,
    domainPath,
    parentDomainPath,
    apiVisibility: "public",
    requires,
    provides: unique([domainPath, ...extraProvides]),
    defaults: {},
    settingsSchema: { type: "object", additionalProperties: true },
    preview: { command: null, fallbackTick: 1 / 60, editorSafe: true },
    source: {
      registryId: sourceId,
      exportName,
      module: CORE_MODULE_OVERRIDES[exportName] ?? `src/core-kits/${moduleSlugFromExport(exportName)}/index.js`,
      trusted: true
    }
  }));
  const pathParents = new Map([["n:object", null], ["n:graphics", null]]);
  for (const kit of kits) pathParents.set(kit.domainPath, kit.parentDomainPath);
  const domains = [...pathParents.entries()].map(([domainPath, parentDomainPath]) => ({
    id: `domain-${domainPath.slice(2).replaceAll(":", "-")}`,
    domainPath,
    parentDomainPath,
    label: labelFromPath(domainPath),
    status: "stable-candidate",
    ownedMeaning: [`Meaning, state, rules, and services bounded by ${domainPath}.`],
    forbiddenResponsibilities: CORE_FORBIDDEN,
    settingsSchema: { type: "object", additionalProperties: true },
    sourceRegistryId: sourceId,
    metadata: { core: true }
  }));
  const content = { domains, kits, bundles: [] };
  return {
    schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
    revision: 1,
    registryId: sourceId,
    sources: [{
      registryId: sourceId,
      package: "nexusengine",
      version: NEXUS_ENGINE_VERSION,
      contentHash: hashRegistryValue(content),
      trusted: true,
      metadata: { authority: "core", executableExports: "already-loaded-module-only" }
    }],
    ...content
  };
}

export function createCoreRegistrySnapshot() {
  return normalizeRegistrySnapshot(createCoreCatalogBody(), { allowTrustedSources: true });
}

export function mergeRegistrySnapshots(core, imports = []) {
  const normalizedCore = normalizeRegistrySnapshot(core, { allowTrustedSources: true });
  const merged = {
    schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
    revision: normalizedCore.revision,
    registryId: normalizedCore.registryId,
    sources: clone(normalizedCore.sources),
    domains: clone(normalizedCore.domains),
    kits: clone(normalizedCore.kits),
    bundles: clone(normalizedCore.bundles)
  };
  const identityOwners = new Map([...merged.domains, ...merged.kits, ...merged.bundles].map((record) => [record.id, "core"]));
  const domainPathOwners = new Map(merged.domains.map((record) => [record.domainPath, "core"]));
  for (const input of asList(imports)) {
    const imported = normalizeRegistrySnapshot(input, { allowTrustedSources: false, allowExternalParents: true, allowExternalReferences: true });
    for (const source of imported.sources) {
      if (merged.sources.some((entry) => entry.registryId === source.registryId)) throw new TypeError(`Imported registry source collision: ${source.registryId}.`);
      merged.sources.push({ ...source, trusted: false });
    }
    for (const domain of imported.domains) {
      if (identityOwners.has(domain.id)) throw new TypeError(`Imported registry cannot replace ${identityOwners.get(domain.id)} record ${domain.id}.`);
      if (domainPathOwners.has(domain.domainPath)) throw new TypeError(`Imported registry cannot replace ${domainPathOwners.get(domain.domainPath)} domain path ${domain.domainPath}.`);
      identityOwners.set(domain.id, imported.registryId);
      domainPathOwners.set(domain.domainPath, imported.registryId);
      merged.domains.push(domain);
    }
    for (const record of [...imported.kits, ...imported.bundles]) {
      if (identityOwners.has(record.id)) throw new TypeError(`Imported registry cannot replace ${identityOwners.get(record.id)} record ${record.id}.`);
      identityOwners.set(record.id, imported.registryId);
      ("domainPath" in record ? merged.kits : merged.bundles).push(record);
    }
    merged.revision += 1;
  }
  return normalizeRegistrySnapshot(merged, { allowTrustedSources: true });
}
