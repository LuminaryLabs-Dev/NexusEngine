import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const text = (value, fallback, label) => {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
};
const clamp01 = (value, fallback = 0) => Math.max(0, Math.min(1, finite(value, fallback)));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function vector(value, length, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== length) throw new TypeError(`${label} must contain ${length} values.`);
  return source.map((entry, index) => finite(entry, fallback[index] ?? 0));
}

function uniqueTextList(value, fallback = []) {
  const source = value == null ? fallback : Array.isArray(value) ? value : [value];
  return [...new Set(source.map(String))].sort();
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function unit(seed, salt = "") {
  let value = hashText(`${seed}:${salt}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
}

function between(seed, salt, minimum, maximum) {
  return minimum + unit(seed, salt) * (maximum - minimum);
}

function subtract(left, right) {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function multiply(value, scalar) {
  return [value[0] * scalar, value[1] * scalar, value[2] * scalar];
}

function length(value) {
  return Math.hypot(value[0], value[1], value[2]);
}

function normalize(value, fallback = [0, 1, 0]) {
  const magnitude = length(value);
  return magnitude > 1e-8 ? multiply(value, 1 / magnitude) : [...fallback];
}

function lerp(left, right, amount) {
  return [
    left[0] + (right[0] - left[0]) * amount,
    left[1] + (right[1] - left[1]) * amount,
    left[2] + (right[2] - left[2]) * amount
  ];
}

function pointAlong(start, end, amount) {
  return lerp(start, end, amount);
}

function profileKind(shape) {
  const token = String(shape ?? "").toLowerCase();
  if (/palm|cycad|fern/.test(token)) return "radial-frond";
  if (/spire|araucaria|conifer|needle/.test(token)) return "conical-whorl";
  if (/column|horsetail/.test(token)) return "columnar";
  if (/umbrella|ginkgo|broad/.test(token)) return "umbrella";
  if (/ghostwood|fork|sparse|dead/.test(token)) return "sparse-fork";
  return "ovoid";
}

function crownEnvelope(kind, normalizedHeight) {
  const t = clamp(normalizedHeight, 0, 1);
  if (kind === "radial-frond") return Math.pow(Math.sin(Math.PI * clamp(t, 0.02, 0.98)), 0.45);
  if (kind === "conical-whorl") return clamp(1.08 - t * 0.88, 0.12, 1);
  if (kind === "columnar") return 0.56 + Math.sin(t * Math.PI) * 0.18;
  if (kind === "umbrella") return clamp(0.24 + Math.pow(t, 0.65) * 0.92, 0.24, 1.08);
  if (kind === "sparse-fork") return 0.42 + Math.sin(t * Math.PI) * 0.38;
  return Math.pow(Math.sin(Math.PI * clamp(t, 0.04, 0.96)), 0.7);
}

function firstFamilyId(foliage, predicate = null) {
  const families = foliage?.cardFamilies ?? [];
  if (predicate) {
    const match = families.find((family) => predicate(String(family.kind ?? family.id).toLowerCase()));
    if (match) return String(match.id);
  }
  return String(foliage?.card?.familyId ?? families[0]?.id ?? `${foliage?.id ?? "foliage"}:primary-card`);
}

function clusterScale(foliage, familyId, crownRadius, crownHeight, seed, mode) {
  const family = foliage?.cardFamilies?.find((entry) => String(entry.id) === String(familyId));
  const min = family?.size?.minimum ?? [crownRadius * 0.12, crownHeight * 0.12];
  const max = family?.size?.maximum ?? [crownRadius * 0.32, crownHeight * 0.3];
  const radial = mode === "radial-frond";
  const width = radial
    ? clamp(between(seed, "width", crownRadius * 0.28, crownRadius * 0.62), min[0], Math.max(min[0], max[0]))
    : clamp(between(seed, "width", crownRadius * 0.18, crownRadius * 0.34), min[0], Math.max(min[0], max[0]));
  const height = radial
    ? clamp(between(seed, "height", crownHeight * 0.14, crownHeight * 0.3), min[1], Math.max(min[1], max[1]))
    : clamp(between(seed, "height", crownHeight * 0.16, crownHeight * 0.32), min[1], Math.max(min[1], max[1]));
  return [Math.max(0.05, width), Math.max(0.05, height), 1];
}

export const NEXUS_TREE_STRUCTURE_SCHEMA = "nexus-tree-structure/2";
export const NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA = "nexus-tree-canopy-composition/1";
export const NEXUS_TREE_GROWTH_PLAN_SCHEMA = "nexus-tree-growth-plan/1";
export const NEXUS_TREE_GROWTH_COMPUTE_SCHEMA = "nexus-tree-growth-compute/1";

export function createTreeCanopyComposition(input = {}, defaults = {}) {
  const averageHeight = Math.max(0.01, finite(defaults.averageHeight, 10));
  const averageWidth = Math.max(0.01, finite(defaults.averageWidth, averageHeight * 0.4));
  const descriptor = {
    schema: NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA,
    id: text(input.id, `${defaults.id ?? "tree"}:canopy`, "Tree canopy composition id"),
    kind: text(input.kind, "cluster", "Tree canopy kind"),
    height: Math.max(0.01, finite(input.height, averageHeight * 0.32)),
    radius: Math.max(0.01, finite(input.radius, averageWidth * 0.5)),
    foliageIds: uniqueTextList(input.foliageIds ?? input.foliageId, []),
    anchors: (input.anchors ?? []).map((anchor, index) => ({
      id: text(anchor.id, `anchor-${index}`, "Tree canopy anchor id"),
      position: vector(anchor.position, 3, [0, averageHeight * 0.75, 0], "Tree canopy anchor position"),
      rotation: vector(anchor.rotation, 3, [0, 0, 0], "Tree canopy anchor rotation"),
      scale: vector(anchor.scale, 3, [1, 1, 1], "Tree canopy anchor scale"),
      foliageId: anchor.foliageId == null ? null : String(anchor.foliageId),
      mode: text(anchor.mode, "branch-cluster", "Tree canopy anchor mode"),
      metadata: clone(anchor.metadata ?? {})
    })),
    clusterCount: Math.max(0, Math.floor(finite(input.clusterCount, 12))),
    layerCount: Math.max(1, Math.floor(finite(input.layerCount, 3))),
    edgeIrregularity: clamp01(input.edgeIrregularity, 0.38),
    hangingFoliage: clamp01(input.hangingFoliage, 0.08),
    deadwood: clamp01(input.deadwood, 0.04),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createTreeStructureDescriptor(input = {}) {
  const averageHeight = Math.max(0.01, finite(input.averageHeight, 10));
  const averageWidth = Math.max(0.01, finite(input.averageWidth, averageHeight * 0.4));
  const id = text(input.id, null, "Tree structure id");
  const canopy = createTreeCanopyComposition(input.canopy ?? {}, { id, averageHeight, averageWidth });
  const descriptor = {
    schema: NEXUS_TREE_STRUCTURE_SCHEMA,
    id,
    speciesId: text(input.speciesId, null, "Tree speciesId"),
    shape: text(input.shape, "broad-canopy", "Tree shape"),
    averageHeight,
    averageWidth,
    roots: clone(input.roots ?? { kind: "root-flare", depth: averageHeight * 0.08, spread: averageWidth * 0.35 }),
    trunk: clone(input.trunk ?? { radius: averageWidth * 0.08, taper: 0.68, radialSegments: 10, heightSegments: 3 }),
    branches: clone(input.branches ?? { kind: "distributed", levels: 3, forkProbability: 0.35, primaryCount: 4, secondaryCount: 8 }),
    canopy,
    foliage: {
      ids: uniqueTextList(input.foliage?.ids ?? canopy.foliageIds, canopy.foliageIds),
      compositionId: text(input.foliage?.compositionId, canopy.id, "Tree foliage compositionId"),
      nearDensity: Math.max(0, finite(input.foliage?.nearDensity, 1)),
      mediumDensity: Math.max(0, finite(input.foliage?.mediumDensity, 0.52)),
      windScale: Math.max(0, finite(input.foliage?.windScale, 1)),
      metadata: clone(input.foliage?.metadata ?? {})
    },
    growthStages: clone(input.growthStages ?? { seedling: 0.2, juvenile: 0.55, mature: 1, old: 1.05 }),
    states: clone(input.states ?? ["standing", "damaged", "dead", "fallen"]),
    breakage: clone(input.breakage ?? { trunk: [0.18, 0.45, 0.72], branches: true }),
    collision: clone(input.collision ?? { kind: "trunk", radiusScale: 1, heightScale: 1 }),
    fidelity: clone(input.fidelity ?? {}),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

function segment(input = {}) {
  const start = vector(input.start, 3, [0, 0, 0], "Tree growth segment start");
  const end = vector(input.end, 3, [0, 1, 0], "Tree growth segment end");
  const direction = subtract(end, start);
  return {
    id: text(input.id, null, "Tree growth segment id"),
    parentId: input.parentId == null ? null : String(input.parentId),
    role: text(input.role, "branch", "Tree growth segment role"),
    order: Math.max(0, Math.floor(finite(input.order, 0))),
    start,
    end,
    tangent: normalize(direction),
    length: length(direction),
    radiusStart: Math.max(0.0001, finite(input.radiusStart, 0.1)),
    radiusEnd: Math.max(0.0001, finite(input.radiusEnd, 0.05)),
    lightExposure: clamp01(input.lightExposure, 0.5),
    terminal: Boolean(input.terminal),
    metadata: clone(input.metadata ?? {})
  };
}

function cluster(input = {}) {
  return {
    id: text(input.id, null, "Tree foliage cluster id"),
    familyId: text(input.familyId, null, "Tree foliage cluster familyId"),
    anchorSegmentId: input.anchorSegmentId == null ? null : String(input.anchorSegmentId),
    mode: text(input.mode, "terminal-cluster", "Tree foliage cluster mode"),
    position: vector(input.position, 3, [0, 1, 0], "Tree foliage cluster position"),
    rotation: vector(input.rotation, 3, [0, 0, 0], "Tree foliage cluster rotation"),
    scale: vector(input.scale, 3, [1, 1, 1], "Tree foliage cluster scale"),
    tangent: normalize(vector(input.tangent, 3, [0, 1, 0], "Tree foliage cluster tangent")),
    cardCount: Math.max(1, Math.floor(finite(input.cardCount, 2))),
    lightExposure: clamp01(input.lightExposure, 0.5),
    shade: clamp01(input.shade, 0.5),
    windScale: Math.max(0, finite(input.windScale, 1)),
    layer: Math.max(0, Math.floor(finite(input.layer, 0))),
    seed: finite(input.seed, 0),
    metadata: clone(input.metadata ?? {})
  };
}

export function createNaturalTreeGrowthPlan(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  const foliage = options.foliage ?? null;
  const quality = options.quality === "medium" ? "medium" : "near";
  const seed = String(options.seed ?? `${tree.speciesId}:${tree.id}:${quality}`);
  const kind = profileKind(tree.shape);
  const height = Math.max(0.1, finite(options.height, tree.averageHeight));
  const crownRadius = Math.max(0.1, finite(options.crownRadius, tree.canopy.radius || tree.averageWidth * 0.5));
  const crownHeight = Math.max(0.1, finite(options.crownHeight, tree.canopy.height || height * 0.32));
  const trunkRadius = Math.max(0.02, finite(tree.trunk?.radius, tree.averageWidth * 0.08));
  const trunkTaper = clamp(finite(tree.trunk?.taper, 0.68), 0.15, 0.98);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const density = quality === "near" ? tree.foliage.nearDensity : tree.foliage.mediumDensity;
  const primaryFamilyId = firstFamilyId(foliage);
  const vineFamilyId = firstFamilyId(foliage, (token) => /vine|hanging/.test(token));
  const algorithm = {
    kind,
    phyllotaxisRadians: kind === "conical-whorl" ? Math.PI * 0.5 : goldenAngle,
    apicalDominance: kind === "conical-whorl" ? 0.88 : kind === "umbrella" ? 0.42 : kind === "sparse-fork" ? 0.34 : 0.62,
    gravitropism: kind === "radial-frond" ? 0.5 : kind === "umbrella" ? 0.32 : 0.18,
    phototropism: kind === "sparse-fork" ? 0.72 : 0.55,
    branchTaper: 0.58,
    crownEnvelope: kind,
    quality
  };

  const roots = [];
  const woodSegments = [];
  const terminalTips = [];
  const rootCount = kind === "radial-frond" ? 5 : 6;
  const rootSpread = Math.max(trunkRadius * 2.4, finite(tree.roots?.spread, tree.averageWidth * 0.35));
  for (let index = 0; index < rootCount; index += 1) {
    const angle = index / rootCount * Math.PI * 2 + between(seed, `root-angle:${index}`, -0.16, 0.16);
    const lengthScale = between(seed, `root-length:${index}`, 0.62, 1.08);
    roots.push(segment({
      id: `${tree.id}:root:${index}`,
      role: "root",
      order: 0,
      start: [0, trunkRadius * 0.12, 0],
      end: [Math.sin(angle) * rootSpread * lengthScale, -Math.max(0.02, finite(tree.roots?.depth, height * 0.08)) * 0.12, Math.cos(angle) * rootSpread * lengthScale],
      radiusStart: trunkRadius * 0.52,
      radiusEnd: trunkRadius * 0.09,
      lightExposure: 0,
      terminal: true
    }));
  }

  const trunkSegmentCount = kind === "radial-frond" ? 5 : kind === "sparse-fork" ? 4 : 3;
  let trunkStart = [0, 0, 0];
  let parentTrunkId = null;
  for (let index = 0; index < trunkSegmentCount; index += 1) {
    const t0 = index / trunkSegmentCount;
    const t1 = (index + 1) / trunkSegmentCount;
    const curveStrength = kind === "radial-frond" ? 0.035 : kind === "sparse-fork" ? 0.025 : 0.012;
    const end = [
      Math.sin(t1 * Math.PI * 0.72 + between(seed, "trunk-phase", -0.2, 0.2)) * height * curveStrength,
      height * t1,
      Math.sin(t1 * Math.PI * 0.54 + between(seed, "trunk-z-phase", -0.3, 0.3)) * height * curveStrength * 0.7
    ];
    const id = `${tree.id}:trunk:${index}`;
    woodSegments.push(segment({
      id,
      parentId: parentTrunkId,
      role: "trunk",
      order: 0,
      start: trunkStart,
      end,
      radiusStart: trunkRadius * (1 - t0 * (1 - trunkTaper)),
      radiusEnd: trunkRadius * (1 - t1 * (1 - trunkTaper)),
      lightExposure: t1 * 0.35,
      terminal: index === trunkSegmentCount - 1
    }));
    trunkStart = end;
    parentTrunkId = id;
  }

  const requestedPrimary = Math.max(0, Math.floor(finite(tree.branches?.primaryCount, 4)));
  const requestedSecondary = Math.max(0, Math.floor(finite(tree.branches?.secondaryCount, 8)));
  const primaryCount = kind === "radial-frond" ? 0 : clamp(requestedPrimary, kind === "sparse-fork" ? 2 : 3, 12);
  const secondaryPerPrimary = primaryCount > 0 ? clamp(Math.round(requestedSecondary / primaryCount), 0, 4) : 0;
  const branchStartBase = kind === "conical-whorl" ? 0.36 : kind === "umbrella" ? 0.5 : kind === "sparse-fork" ? 0.46 : 0.42;

  for (let primary = 0; primary < primaryCount; primary += 1) {
    const normalizedIndex = primaryCount === 1 ? 0.5 : primary / (primaryCount - 1);
    const startT = clamp(branchStartBase + normalizedIndex * (kind === "conical-whorl" ? 0.5 : 0.24), 0.2, 0.9);
    const start = [0, height * startT, 0];
    const angle = primary * algorithm.phyllotaxisRadians + between(seed, `primary-angle:${primary}`, -0.28, 0.28);
    const envelope = crownEnvelope(kind, (startT - branchStartBase) / Math.max(0.01, 1 - branchStartBase));
    const apicalScale = 1 - algorithm.apicalDominance * Math.max(0, startT - branchStartBase);
    const branchLength = crownRadius * envelope * apicalScale * between(seed, `primary-length:${primary}`, 0.72, 1.08);
    const rise = crownHeight * (algorithm.gravitropism * 0.22 + between(seed, `primary-rise:${primary}`, 0.02, 0.2));
    const mid = [
      Math.sin(angle) * branchLength * 0.5,
      start[1] + rise * 0.36 + branchLength * 0.04,
      Math.cos(angle) * branchLength * 0.5
    ];
    const end = [
      Math.sin(angle) * branchLength,
      start[1] + rise,
      Math.cos(angle) * branchLength
    ];
    const baseRadius = trunkRadius * clamp(0.34 - startT * 0.14, 0.12, 0.3);
    const firstId = `${tree.id}:primary:${primary}:0`;
    const secondId = `${tree.id}:primary:${primary}:1`;
    woodSegments.push(segment({ id: firstId, parentId: parentTrunkId, role: "primary-branch", order: 1, start, end: mid, radiusStart: baseRadius, radiusEnd: baseRadius * 0.72, lightExposure: clamp01(startT, 0.5) }));
    woodSegments.push(segment({ id: secondId, parentId: firstId, role: "primary-branch", order: 1, start: mid, end, radiusStart: baseRadius * 0.72, radiusEnd: baseRadius * 0.36, lightExposure: clamp01(startT + 0.18, 0.7), terminal: secondaryPerPrimary === 0 }));
    if (secondaryPerPrimary === 0) terminalTips.push({ segmentId: secondId, position: end, tangent: normalize(subtract(end, mid)), layer: primary });

    for (let secondary = 0; secondary < secondaryPerPrimary; secondary += 1) {
      const attachT = 0.48 + secondary / Math.max(1, secondaryPerPrimary) * 0.34;
      const secondaryStart = pointAlong(mid, end, attachT);
      const side = secondary % 2 === 0 ? -1 : 1;
      const divergence = side * (0.58 + secondary * 0.18) + between(seed, `secondary-jitter:${primary}:${secondary}`, -0.16, 0.16);
      const secondaryAngle = angle + divergence;
      const secondaryLength = branchLength * between(seed, `secondary-length:${primary}:${secondary}`, 0.26, 0.46);
      const secondaryRise = secondaryLength * (0.12 + algorithm.phototropism * 0.12 + between(seed, `secondary-rise:${primary}:${secondary}`, 0, 0.12));
      const secondaryMid = [secondaryStart[0] + Math.sin(secondaryAngle) * secondaryLength * 0.5, secondaryStart[1] + secondaryRise * 0.42, secondaryStart[2] + Math.cos(secondaryAngle) * secondaryLength * 0.5];
      const secondaryEnd = [secondaryStart[0] + Math.sin(secondaryAngle) * secondaryLength, secondaryStart[1] + secondaryRise, secondaryStart[2] + Math.cos(secondaryAngle) * secondaryLength];
      const secondaryRadius = baseRadius * 0.42;
      const secondaryFirstId = `${tree.id}:secondary:${primary}:${secondary}:0`;
      const secondarySecondId = `${tree.id}:secondary:${primary}:${secondary}:1`;
      woodSegments.push(segment({ id: secondaryFirstId, parentId: secondId, role: "secondary-branch", order: 2, start: secondaryStart, end: secondaryMid, radiusStart: secondaryRadius, radiusEnd: secondaryRadius * 0.68, lightExposure: 0.7 }));
      woodSegments.push(segment({ id: secondarySecondId, parentId: secondaryFirstId, role: "secondary-branch", order: 2, start: secondaryMid, end: secondaryEnd, radiusStart: secondaryRadius * 0.68, radiusEnd: secondaryRadius * 0.32, lightExposure: 0.88, terminal: true }));
      terminalTips.push({ segmentId: secondarySecondId, position: secondaryEnd, tangent: normalize(subtract(secondaryEnd, secondaryMid)), layer: primary });
    }
  }

  const foliageClusters = [];
  const desiredClusters = Math.max(kind === "radial-frond" ? 10 : 14, Math.floor(tree.canopy.clusterCount * density), Math.floor(terminalTips.length * (quality === "near" ? 1.6 : 0.9)));

  if (kind === "radial-frond") {
    const radialCount = Math.max(desiredClusters, Math.floor(12 * density));
    const topY = height * 0.88;
    for (let index = 0; index < radialCount; index += 1) {
      const angle = index / radialCount * Math.PI * 2 + between(seed, `frond-angle:${index}`, -0.12, 0.12);
      const droop = between(seed, `frond-droop:${index}`, -0.58, -0.2);
      const radial = crownRadius * between(seed, `frond-radius:${index}`, 0.18, 0.42);
      const position = [Math.sin(angle) * radial, topY + between(seed, `frond-y:${index}`, -crownHeight * 0.08, crownHeight * 0.1), Math.cos(angle) * radial];
      foliageClusters.push(cluster({ id: `${tree.id}:foliage:${quality}:${index}`, familyId: primaryFamilyId, anchorSegmentId: parentTrunkId, mode: "radial-frond", position, rotation: [droop, angle, between(seed, `frond-roll:${index}`, -0.18, 0.18)], scale: clusterScale(foliage, primaryFamilyId, crownRadius, crownHeight, `${seed}:frond:${index}`, "radial-frond"), tangent: [Math.sin(angle), -0.18, Math.cos(angle)], cardCount: 1, lightExposure: 0.78 + unit(seed, `frond-light:${index}`) * 0.22, shade: 0.08, windScale: tree.foliage.windScale * 1.15, layer: 0, seed: unit(seed, `frond-seed:${index}`) }));
    }
  } else {
    for (let index = 0; index < desiredClusters; index += 1) {
      const tip = terminalTips[index % Math.max(1, terminalTips.length)];
      const normalizedIndex = desiredClusters === 1 ? 0.5 : index / (desiredClusters - 1);
      const angle = index * goldenAngle + between(seed, `cluster-angle:${index}`, -0.22, 0.22);
      const normalizedHeight = 0.2 + normalizedIndex * 0.76;
      const envelope = crownEnvelope(kind, normalizedHeight);
      const radius = crownRadius * envelope * between(seed, `cluster-radius:${index}`, 0.46, 0.98);
      const generatedPosition = [Math.sin(angle) * radius, height - crownHeight + crownHeight * normalizedHeight + between(seed, `cluster-y:${index}`, -crownHeight * 0.08, crownHeight * 0.08), Math.cos(angle) * radius];
      const tipWeight = tip ? (index < terminalTips.length ? 0.88 : 0.55) : 0;
      const position = tip ? lerp(generatedPosition, tip.position, tipWeight) : generatedPosition;
      const radialExposure = clamp(Math.hypot(position[0], position[2]) / Math.max(0.01, crownRadius), 0, 1);
      const heightExposure = clamp((position[1] - (height - crownHeight)) / crownHeight, 0, 1);
      const lightExposure = clamp(0.18 + radialExposure * 0.5 + heightExposure * 0.32, 0, 1);
      const mode = kind === "conical-whorl" ? "crown-tier" : tip ? "terminal-cluster" : "canopy-shell";
      foliageClusters.push(cluster({ id: `${tree.id}:foliage:${quality}:${index}`, familyId: primaryFamilyId, anchorSegmentId: tip?.segmentId ?? null, mode, position, rotation: [between(seed, `cluster-pitch:${index}`, -0.28, 0.28), angle + Math.PI * 0.5, between(seed, `cluster-roll:${index}`, -0.32, 0.32)], scale: clusterScale(foliage, primaryFamilyId, crownRadius, crownHeight, `${seed}:cluster:${index}`, mode), tangent: tip?.tangent ?? normalize([position[0], 0.2, position[2]]), cardCount: kind === "conical-whorl" ? 2 : quality === "near" ? 3 : 2, lightExposure, shade: 1 - lightExposure, windScale: tree.foliage.windScale, layer: Math.floor(normalizedHeight * tree.canopy.layerCount), seed: unit(seed, `cluster-seed:${index}`) }));
    }
  }

  const hangingCount = Math.floor(desiredClusters * tree.canopy.hangingFoliage);
  if (hangingCount > 0 && vineFamilyId !== primaryFamilyId) {
    for (let index = 0; index < hangingCount; index += 1) {
      const angle = index / hangingCount * Math.PI * 2 + between(seed, `hanging-angle:${index}`, -0.3, 0.3);
      foliageClusters.push(cluster({ id: `${tree.id}:hanging:${quality}:${index}`, familyId: vineFamilyId, mode: "hanging-edge", position: [Math.sin(angle) * crownRadius * 0.82, height - crownHeight * 0.46, Math.cos(angle) * crownRadius * 0.82], rotation: [0, angle, between(seed, `hanging-roll:${index}`, -0.12, 0.12)], scale: clusterScale(foliage, vineFamilyId, crownRadius * 0.5, crownHeight * 1.5, `${seed}:hanging:${index}`, "hanging-edge"), tangent: [0, -1, 0], cardCount: 1, lightExposure: 0.55, shade: 0.45, windScale: tree.foliage.windScale * 1.2, layer: tree.canopy.layerCount, seed: unit(seed, `hanging-seed:${index}`) }));
    }
  }

  const allSegments = [...roots, ...woodSegments];
  const totalChildArea = woodSegments.filter((entry) => entry.order > 0).reduce((sum, entry) => sum + Math.PI * entry.radiusStart * entry.radiusStart, 0);
  const trunkArea = Math.PI * trunkRadius * trunkRadius;
  const estimatedCardArea = foliageClusters.reduce((sum, entry) => sum + entry.scale[0] * entry.scale[1] * entry.cardCount, 0);
  const crownProjectedArea = Math.PI * crownRadius * Math.max(crownRadius, crownHeight * 0.5);
  const plan = {
    schema: NEXUS_TREE_GROWTH_PLAN_SCHEMA,
    id: text(options.id, `${tree.id}:growth:${quality}:${hashText(seed).toString(16)}`, "Tree growth plan id"),
    treeId: tree.id,
    speciesId: tree.speciesId,
    seed,
    quality,
    algorithm,
    bounds: { min: [-crownRadius, -Math.max(0.01, finite(tree.roots?.depth, height * 0.08)), -crownRadius], max: [crownRadius, height + crownHeight * 0.12, crownRadius] },
    roots,
    woodSegments,
    foliageClusters,
    metrics: {
      rootCount: roots.length,
      trunkSegmentCount: woodSegments.filter((entry) => entry.role === "trunk").length,
      primarySegmentCount: woodSegments.filter((entry) => entry.order === 1).length,
      secondarySegmentCount: woodSegments.filter((entry) => entry.order === 2).length,
      branchCount: woodSegments.filter((entry) => entry.order > 0).length,
      terminalCount: terminalTips.length,
      clusterCount: foliageClusters.length,
      estimatedCardCount: foliageClusters.reduce((sum, entry) => sum + entry.cardCount, 0),
      crownCoverage: crownProjectedArea > 0 ? estimatedCardArea / crownProjectedArea : 0,
      branchAreaRatio: trunkArea > 0 ? totalChildArea / trunkArea : 0,
      maximumSegmentLength: allSegments.reduce((maximum, entry) => Math.max(maximum, entry.length), 0)
    },
    metadata: clone(options.metadata ?? {})
  };
  const validation = validateTreeGrowthPlan(plan, { minimumClusters: kind === "radial-frond" ? 8 : 12 });
  if (!validation.valid && options.allowInvalid !== true) throw new TypeError(`Natural tree growth plan ${plan.id} is invalid: ${validation.errors.join("; ")}`);
  structuredClone(plan);
  return Object.freeze(plan);
}

export function validateTreeGrowthPlan(value = {}, options = {}) {
  const errors = [];
  const warnings = [];
  if (value.schema !== NEXUS_TREE_GROWTH_PLAN_SCHEMA) errors.push(`Tree growth plan schema must be ${NEXUS_TREE_GROWTH_PLAN_SCHEMA}.`);
  const segments = [...(value.roots ?? []), ...(value.woodSegments ?? [])];
  const byId = new Map();
  for (const entry of segments) {
    if (!entry?.id) errors.push("Tree growth segment requires id.");
    else if (byId.has(entry.id)) errors.push(`Duplicate tree growth segment id: ${entry.id}.`);
    else byId.set(entry.id, entry);
    if (!Array.isArray(entry?.start) || entry.start.length !== 3 || !entry.start.every(Number.isFinite)) errors.push(`Tree growth segment ${entry?.id ?? "unknown"} has invalid start.`);
    if (!Array.isArray(entry?.end) || entry.end.length !== 3 || !entry.end.every(Number.isFinite)) errors.push(`Tree growth segment ${entry?.id ?? "unknown"} has invalid end.`);
    if (!(Number(entry?.radiusStart) > 0) || !(Number(entry?.radiusEnd) > 0)) errors.push(`Tree growth segment ${entry?.id ?? "unknown"} has non-positive radius.`);
    if (Number(entry?.radiusEnd) > Number(entry?.radiusStart) * 1.001) errors.push(`Tree growth segment ${entry?.id ?? "unknown"} widens toward its tip.`);
    if (!(Number(entry?.length) > 0)) errors.push(`Tree growth segment ${entry?.id ?? "unknown"} has zero length.`);
  }
  for (const entry of segments) if (entry.parentId && !byId.has(entry.parentId)) errors.push(`Tree growth segment ${entry.id} references missing parent ${entry.parentId}.`);
  const clusters = value.foliageClusters ?? [];
  const minimumClusters = Math.max(0, Math.floor(finite(options.minimumClusters, value.quality === "medium" ? 6 : 10)));
  if (clusters.length < minimumClusters) errors.push(`Tree growth plan requires at least ${minimumClusters} foliage clusters; received ${clusters.length}.`);
  for (const entry of clusters) {
    if (!entry?.id || !entry?.familyId) errors.push("Tree foliage cluster requires id and familyId.");
    if (!Array.isArray(entry?.position) || entry.position.length !== 3 || !entry.position.every(Number.isFinite)) errors.push(`Tree foliage cluster ${entry?.id ?? "unknown"} has invalid position.`);
    if (!Array.isArray(entry?.scale) || entry.scale.length !== 3 || !entry.scale.every((item) => Number.isFinite(item) && item > 0)) errors.push(`Tree foliage cluster ${entry?.id ?? "unknown"} has invalid scale.`);
    if (!(Number(entry?.cardCount) >= 1)) errors.push(`Tree foliage cluster ${entry?.id ?? "unknown"} requires at least one card.`);
  }
  const coverage = Number(value.metrics?.crownCoverage ?? 0);
  if (coverage < 0.28) errors.push(`Tree crown coverage ${coverage.toFixed(3)} is too sparse.`);
  if (coverage > 8) warnings.push(`Tree crown coverage ${coverage.toFixed(3)} may cause excessive overdraw.`);
  const branchAreaRatio = Number(value.metrics?.branchAreaRatio ?? 0);
  if (branchAreaRatio > 7) warnings.push(`Tree branch area ratio ${branchAreaRatio.toFixed(3)} is unusually high.`);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze(warnings), metrics: clone(value.metrics ?? {}) });
}

export function createTreeGrowthComputeDescriptors(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  const id = text(options.id, `${tree.id}:growth-compute`, "Tree growth compute id");
  const maximumSegments = Math.max(32, Math.floor(finite(options.maximumSegments, 256)));
  const maximumClusters = Math.max(16, Math.floor(finite(options.maximumClusters, Math.max(64, tree.canopy.clusterCount * 3))));
  const descriptors = {
    schema: NEXUS_TREE_GROWTH_COMPUTE_SCHEMA,
    id,
    buffers: [
      { id: `${id}:tree-input`, byteLength: 0, stride: 0, elementCount: 1, usage: ["storage", "copy-dst"], initialData: tree, metadata: { role: "tree-input" } },
      { id: `${id}:segments`, byteLength: maximumSegments * 80, stride: 80, elementCount: maximumSegments, usage: ["storage", "copy-src"], metadata: { role: "tree-segments" } },
      { id: `${id}:foliage`, byteLength: maximumClusters * 96, stride: 96, elementCount: maximumClusters, usage: ["storage", "copy-src"], metadata: { role: "foliage-clusters" } },
      { id: `${id}:shading`, byteLength: maximumClusters * 32, stride: 32, elementCount: maximumClusters, usage: ["storage", "vertex", "copy-src"], metadata: { role: "foliage-shading" } }
    ],
    kernels: [
      { id: `${id}:grow-skeleton`, entryPoint: "growTreeSkeleton", language: "provider", workgroupSize: { x: 64, y: 1, z: 1 }, metadata: { algorithm: "phyllotaxis-apical-tropism" } },
      { id: `${id}:place-foliage`, entryPoint: "placeFoliageClusters", language: "provider", workgroupSize: { x: 64, y: 1, z: 1 }, metadata: { algorithm: "terminal-light-exposure" } },
      { id: `${id}:shade-foliage`, entryPoint: "packFoliageShading", language: "provider", workgroupSize: { x: 64, y: 1, z: 1 }, metadata: { algorithm: "light-exposure-thickness-wind" } }
    ],
    graph: {
      id,
      nodes: [
        { id: "grow-skeleton", kernelId: `${id}:grow-skeleton`, reads: [`${id}:tree-input`], writes: [`${id}:segments`], dispatch: { x: Math.ceil(maximumSegments / 64), y: 1, z: 1 } },
        { id: "place-foliage", kernelId: `${id}:place-foliage`, dependsOn: ["grow-skeleton"], reads: [`${id}:tree-input`, `${id}:segments`], writes: [`${id}:foliage`], dispatch: { x: Math.ceil(maximumClusters / 64), y: 1, z: 1 } },
        { id: "shade-foliage", kernelId: `${id}:shade-foliage`, dependsOn: ["place-foliage"], reads: [`${id}:foliage`], writes: [`${id}:shading`], dispatch: { x: Math.ceil(maximumClusters / 64), y: 1, z: 1 } }
      ],
      metadata: { purpose: "Produce deterministic natural tree skeleton, foliage-card placement, and GPU-ready high-fidelity shading attributes.", treeId: tree.id, speciesId: tree.speciesId, algorithm: "phyllotaxis-apical-tropism", outputSchema: NEXUS_TREE_GROWTH_PLAN_SCHEMA }
    }
  };
  structuredClone(descriptors);
  return Object.freeze(descriptors);
}

export function createTreeShapeRecipe(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  return {
    schema: "nexus-tree-shape-recipe/2",
    id: options.id ?? `${tree.id}:shape-recipe`,
    speciesId: tree.speciesId,
    source: { roots: tree.roots, trunk: tree.trunk, branches: tree.branches, canopy: tree.canopy, foliage: tree.foliage, regions: ["roots", "trunk", "branches", "foliage"] },
    targets: [
      { id: "near", mode: "source", ratio: 1, preserve: ["silhouette", "regions", "ground-anchor", "foliage-cards"] },
      { id: "medium", mode: "simplify", ratio: options.mediumRatio ?? 0.34, preserve: ["silhouette", "regions", "ground-anchor", "foliage-cards"] }
    ],
    metadata: clone(options.metadata ?? {})
  };
}

export function createTreeFidelityProfile(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  return {
    id: options.id ?? `${tree.id}:fidelity`,
    version: options.version ?? 1,
    identity: { preserveSilhouette: true, preserveGrounding: true, preserveMajorStructure: true, preserveMaterialResponse: true },
    forms: [
      { id: "near", fidelity: "near-mesh", builderId: options.shapeBuilderId ?? "object-shape-form", required: true, order: 0, minimumProjectedSize: options.nearPixels ?? 360, metadata: { foliageDensity: options.nearFoliageDensity ?? tree.foliage.nearDensity } },
      { id: "medium", fidelity: "medium-mesh", builderId: options.shapeBuilderId ?? "object-shape-form", required: true, order: 1, minimumProjectedSize: options.mediumPixels ?? 150, maximumProjectedSize: options.mediumMaximumPixels ?? 390, metadata: { foliageDensity: options.mediumFoliageDensity ?? tree.foliage.mediumDensity } },
      { id: "far", fidelity: "multi-angle-impostor", builderId: "captured-form", required: true, order: 2, minimumProjectedSize: options.farPixels ?? 18, maximumProjectedSize: options.farMaximumPixels ?? 170, capture: createTreeCaptureRequest(tree, "far", options) },
      { id: "horizon", fidelity: "horizon-impostor", builderId: "captured-form", required: true, order: 3, minimumProjectedSize: 0, maximumProjectedSize: options.horizonPixels ?? 24, capture: createTreeCaptureRequest(tree, "horizon", options) }
    ],
    change: { mode: "dither-crossfade", duration: options.transitionDuration ?? 0.35, hysteresis: options.hysteresis ?? 0.16, stableFrames: options.stableFrames ?? 2 },
    metadata: { speciesId: tree.speciesId, foliageIds: tree.foliage.ids, canopyCompositionId: tree.canopy.id, ...(clone(options.metadata ?? {})) }
  };
}

export function createTreeCaptureRequest(treeInput, kind = "far", options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  const horizon = kind === "horizon";
  return {
    providerId: options.captureProviderId ?? null,
    viewSet: { pattern: "around-subject", azimuthCount: horizon ? 1 : (options.azimuthCount ?? 8), elevations: horizon ? [options.horizonElevation ?? 6] : (options.elevations ?? [0, 12]) },
    framing: { boundsSource: "core-object", preserveGrounding: true, padding: options.capturePadding ?? 0.05 },
    observations: options.observations ?? ["color", "opacity"],
    output: { kind: "atlas", frameSize: horizon ? (options.horizonFrameSize ?? 128) : (options.frameSize ?? 256) },
    metadata: { treeId: tree.id, speciesId: tree.speciesId, foliageIds: tree.foliage.ids, canopyCompositionId: tree.canopy.id, form: kind }
  };
}

export function createTreeDomainKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-vegetation-tree-domain-kit",
    domain: "core-vegetation-tree",
    domainPath: config.domainPath ?? "n:object:vegetation:tree",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationTree",
    version: config.version ?? "0.3.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object:vegetation"],
    provides: [...(config.provides ?? []), "vegetation:tree-structure", "vegetation:tree-canopy", "vegetation:tree-growth", "vegetation:tree-growth-compute", "vegetation:tree-fidelity"],
    purpose: "Tree roots, trunks, natural phyllotactic branch growth, canopy composition, foliage references, compute plans, growth, damage, collision intent, and default Shape/Fidelity/Capture recipes.",
    initialState: { trees: {} },
    services: ["tree-registry", "canopy-composition", "natural-growth", "growth-validation", "growth-compute", "shape-recipes", "fidelity-profiles", "capture-requests"],
    createApi({ baseApi }) {
      const records = () => baseApi.getState()?.trees ?? {};
      return {
        register(input) { const descriptor = createTreeStructureDescriptor(input); baseApi.update({ trees: { ...records(), [descriptor.id]: descriptor } }, "descriptorChanged"); return clone(descriptor); },
        get: (id) => clone(records()[String(id)] ?? null),
        list: () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone),
        createCanopyComposition: createTreeCanopyComposition,
        createGrowthPlan: createNaturalTreeGrowthPlan,
        validateGrowthPlan: validateTreeGrowthPlan,
        createGrowthComputeDescriptors: createTreeGrowthComputeDescriptors,
        createShapeRecipe: createTreeShapeRecipe,
        createFidelityProfile: createTreeFidelityProfile,
        createCaptureRequest: createTreeCaptureRequest,
        validate(value) { try { createTreeStructureDescriptor(value); return { valid: true, errors: [] }; } catch (error) { return { valid: false, errors: [error instanceof Error ? error.message : String(error)] }; } }
      };
    },
    metadata: {
      rendererAgnostic: true,
      deterministic: true,
      computeReady: true,
      naturalGrowthAlgorithm: "phyllotaxis-apical-tropism",
      contractSchema: NEXUS_TREE_STRUCTURE_SCHEMA,
      contractSchemas: [NEXUS_TREE_STRUCTURE_SCHEMA, NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA, NEXUS_TREE_GROWTH_PLAN_SCHEMA, NEXUS_TREE_GROWTH_COMPUTE_SCHEMA]
    }
  });
}

export default createTreeDomainKit;
