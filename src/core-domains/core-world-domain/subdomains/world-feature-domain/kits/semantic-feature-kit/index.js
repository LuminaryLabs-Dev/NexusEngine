import { createFoundationContribution } from "../../../world-foundation-domain/contracts.js";
import { createFeatureFidelityDescriptor, normalizeBounds } from "../../contracts.js";

export const WORLD_FEATURE_KIT_METHODS = Object.freeze([
  "normalize",
  "validate",
  "calculateBounds",
  "sample",
  "compileContributions",
  "describeFidelity"
]);

const COMMON_FEATURE_FIELDS = new Set([
  "id",
  "type",
  "kind",
  "seed",
  "bounds",
  "priority",
  "dependsOn",
  "lifecycle",
  "fidelity",
  "definition",
  "data",
  "version",
  "metadata"
]);

export function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, finiteNumber(value)));
}

export function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function normalizeFeaturePoint(input = {}) {
  return Object.freeze({
    x: finiteNumber(input?.x),
    y: finiteNumber(input?.y),
    z: finiteNumber(input?.z)
  });
}

export function normalizeFeaturePath(input = [], fallback = null) {
  const path = [];
  const visit = (value) => {
    if (!Array.isArray(value)) return;
    for (const entry of value) {
      if (Array.isArray(entry)) visit(entry);
      else if (entry && typeof entry === "object" && (Number.isFinite(Number(entry.x)) || Number.isFinite(Number(entry.z)))) {
        path.push(normalizeFeaturePoint(entry));
      }
    }
  };
  visit(input);
  if (path.length > 0) return Object.freeze(path);
  return Object.freeze([normalizeFeaturePoint(fallback ?? { x: 0, z: 0 })]);
}

function flattenPoints(input, output = []) {
  if (!Array.isArray(input)) return output;
  for (const entry of input) {
    if (Array.isArray(entry)) flattenPoints(entry, output);
    else if (entry && typeof entry === "object" && (Number.isFinite(Number(entry.x)) || Number.isFinite(Number(entry.z)))) {
      output.push(normalizeFeaturePoint(entry));
    }
  }
  return output;
}

export function featurePathBounds(path = [], padding = 0) {
  const points = flattenPoints(path);
  if (points.length === 0) return normalizeBounds({ center: { x: 0, z: 0 }, radius: Math.max(0, finiteNumber(padding)) });
  const extent = Math.max(0, finiteNumber(padding));
  return Object.freeze({
    minX: Math.min(...points.map((point) => point.x)) - extent,
    minZ: Math.min(...points.map((point) => point.z)) - extent,
    maxX: Math.max(...points.map((point) => point.x)) + extent,
    maxZ: Math.max(...points.map((point) => point.z)) + extent
  });
}

export function distanceToFeaturePath(point = {}, path = []) {
  const points = flattenPoints(path);
  const px = finiteNumber(point.x);
  const pz = finiteNumber(point.z);
  if (points.length === 0) return Number.POSITIVE_INFINITY;
  if (points.length === 1) return Math.hypot(px - points[0].x, pz - points[0].z);
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const lengthSquared = abx * abx + abz * abz;
    const t = lengthSquared <= 1e-9
      ? 0
      : clamp01(((px - a.x) * abx + (pz - a.z) * abz) / lengthSquared);
    best = Math.min(best, Math.hypot(px - (a.x + abx * t), pz - (a.z + abz * t)));
  }
  return best;
}

export function pointInFeatureArea(point = {}, area = []) {
  const polygon = flattenPoints(area);
  if (polygon.length < 3) return false;
  const x = finiteNumber(point.x);
  const z = finiteNumber(point.z);
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const a = polygon[current];
    const b = polygon[previous];
    const denominator = b.z - a.z;
    const safeDenominator = Math.abs(denominator) < 1e-9 ? (denominator < 0 ? -1e-9 : 1e-9) : denominator;
    const intersects = ((a.z > z) !== (b.z > z))
      && x < ((b.x - a.x) * (z - a.z)) / safeDenominator + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function distanceToFeatureArea(point = {}, area = []) {
  const polygon = flattenPoints(area);
  if (polygon.length === 0) return Number.POSITIVE_INFINITY;
  if (pointInFeatureArea(point, polygon)) return 0;
  return distanceToFeaturePath(point, [...polygon, polygon[0]]);
}

function definitionSource(input = {}, defaults = {}) {
  const source = input.definition ?? input.data;
  if (source && typeof source === "object" && !Array.isArray(source)) {
    return { ...structuredClone(defaults), ...structuredClone(source) };
  }
  const inline = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (!COMMON_FEATURE_FIELDS.has(key)) inline[key] = structuredClone(value);
  }
  return { ...structuredClone(defaults), ...inline };
}

function extentFromDefinition(definition = {}, extentKeys = []) {
  for (const key of extentKeys) {
    const value = finiteNumber(definition?.[key], Number.NaN);
    if (Number.isFinite(value)) return Math.max(0, value);
  }
  const width = finiteNumber(definition.width, Number.NaN);
  if (Number.isFinite(width)) return Math.max(0, width * 0.5);
  for (const key of ["radius", "extent", "range", "influenceRadius", "protectionRadius", "edgeWidth", "span"]) {
    const value = finiteNumber(definition?.[key], Number.NaN);
    if (Number.isFinite(value)) return Math.max(0, value);
  }
  return 0;
}

function firstGeometry(input = {}, definition = {}) {
  const explicitBounds = input.bounds ?? definition.bounds;
  if (explicitBounds && typeof explicitBounds === "object" && !Array.isArray(explicitBounds)) {
    return { kind: "bounds", value: explicitBounds };
  }
  for (const key of ["area", "boundary", "shape", "basin", "footprint", "shoreline"]) {
    if (Array.isArray(definition[key]) && flattenPoints(definition[key]).length > 0) return { kind: "area", value: definition[key] };
  }
  for (const key of ["path", "network", "branches", "centerline", "axis"]) {
    if (Array.isArray(definition[key]) && flattenPoints(definition[key]).length > 0) return { kind: "path", value: definition[key] };
  }
  for (const key of ["center", "point", "position", "portal", "mouth", "edge", "crossing", "source", "outlet"]) {
    if (definition[key] && typeof definition[key] === "object") return { kind: "center", value: definition[key] };
  }
  return { kind: "center", value: { x: 0, z: 0 } };
}

export function calculateSemanticFeatureBounds(input = {}, options = {}) {
  const definition = input.definition ?? input.data ?? input;
  const geometry = options.geometry && options.geometry !== "auto"
    ? { kind: options.geometry, value: definition[options.geometry] ?? definition }
    : firstGeometry(input, definition);
  const inferredExtent = extentFromDefinition(definition, options.extentKeys ?? []);
  const extent = geometry.kind === "area"
    ? Math.max(0, finiteNumber(definition.edgeWidth, inferredExtent))
    : inferredExtent;
  if (geometry.kind === "bounds") return normalizeBounds(geometry.value);
  if (geometry.kind === "area" || geometry.kind === "path") return featurePathBounds(geometry.value, extent);
  return normalizeBounds({ center: geometry.value, radius: extent });
}

export function sampleSemanticFeatureInfluence(definition = {}, point = {}, options = {}) {
  const geometry = options.geometry && options.geometry !== "auto"
    ? { kind: options.geometry, value: definition[options.geometry] ?? definition }
    : firstGeometry({}, definition);
  const inferredExtent = extentFromDefinition(definition, options.extentKeys ?? []);
  const extent = Math.max(1e-6, geometry.kind === "area"
    ? finiteNumber(definition.edgeWidth, inferredExtent)
    : inferredExtent);
  const sharpness = Math.max(0.05, finiteNumber(definition.sharpness ?? options.sharpness, 1));
  let normalizedDistance = 0;
  if (geometry.kind === "bounds") {
    const bounds = normalizeBounds(geometry.value);
    const inside = finiteNumber(point.x) >= bounds.minX && finiteNumber(point.x) <= bounds.maxX
      && finiteNumber(point.z) >= bounds.minZ && finiteNumber(point.z) <= bounds.maxZ;
    return inside ? 1 : 0;
  }
  if (geometry.kind === "area") {
    const distance = distanceToFeatureArea(point, geometry.value);
    if (distance === 0) return 1;
    normalizedDistance = distance / extent;
  } else if (geometry.kind === "path") {
    normalizedDistance = distanceToFeaturePath(point, geometry.value) / extent;
  } else {
    const center = normalizeFeaturePoint(geometry.value);
    normalizedDistance = Math.hypot(finiteNumber(point.x) - center.x, finiteNumber(point.z) - center.z) / extent;
  }
  if (normalizedDistance >= 1) return 0;
  return Math.pow(1 - smoothstep01(normalizedDistance), sharpness);
}

function normalizeValidationResult(result) {
  if (result === undefined || result === null || result === true) return { valid: true, issues: [] };
  if (result === false) return { valid: false, issues: ["invalid-definition"] };
  if (Array.isArray(result)) return { valid: result.length === 0, issues: result.map(String) };
  const issues = [...(result.issues ?? [])].map(String);
  return { valid: result.valid !== false && issues.length === 0, issues };
}

export function validateWorldFeatureKitContract(handler = {}) {
  const issues = WORLD_FEATURE_KIT_METHODS
    .filter((method) => typeof handler?.[method] !== "function")
    .map((method) => `missing-${method}`);
  return { valid: issues.length === 0, issues };
}

export function normalizeWorldFeatureKitHandler(type, handler = {}) {
  const id = String(type ?? handler.type ?? "").trim();
  if (!id) throw new TypeError("World feature kit requires a stable type.");
  const normalized = {
    ...handler,
    type: id,
    normalize: typeof handler.normalize === "function"
      ? handler.normalize.bind(handler)
      : (input = {}) => ({ ...input, type: id, bounds: calculateSemanticFeatureBounds(input) }),
    validate: typeof handler.validate === "function"
      ? handler.validate.bind(handler)
      : () => ({ valid: true, issues: [] }),
    calculateBounds: typeof handler.calculateBounds === "function"
      ? handler.calculateBounds.bind(handler)
      : (input = {}) => calculateSemanticFeatureBounds(input),
    sample: typeof handler.sample === "function" ? handler.sample.bind(handler) : () => 0,
    compileContributions: typeof handler.compileContributions === "function"
      ? handler.compileContributions.bind(handler)
      : typeof handler.compile === "function"
        ? handler.compile.bind(handler)
        : () => [],
    services: WORLD_FEATURE_KIT_METHODS,
    describeFidelity: typeof handler.describeFidelity === "function"
      ? handler.describeFidelity.bind(handler)
      : (input = {}) => createFeatureFidelityDescriptor(input.fidelity ?? input)
  };
  const validation = validateWorldFeatureKitContract(normalized);
  if (!validation.valid) throw new TypeError(`World feature kit ${id} is invalid: ${validation.issues.join(", ")}`);
  return Object.freeze(normalized);
}

export function createSemanticWorldFeatureKit(spec = {}) {
  const type = String(spec.type ?? "").trim();
  const family = String(spec.family ?? "semantic").trim();
  if (!type) throw new TypeError("Semantic world feature kit requires a type.");
  const version = String(spec.version ?? "0.1.0");
  const fidelityDefaults = createFeatureFidelityDescriptor(spec.fidelity ?? {});
  const geometryOptions = {
    geometry: spec.geometry ?? "auto",
    extentKeys: [...(spec.extentKeys ?? [])],
    sharpness: spec.sharpness
  };

  function describeFidelity(input = {}) {
    return createFeatureFidelityDescriptor({ ...fidelityDefaults, ...(input.fidelity ?? input) });
  }

  function calculateBounds(input = {}) {
    const source = definitionSource(input, spec.defaults ?? {});
    const definition = typeof spec.normalizeDefinition === "function"
      ? spec.normalizeDefinition(source, input)
      : source;
    return calculateSemanticFeatureBounds({ ...input, definition }, geometryOptions);
  }

  function normalize(input = {}) {
    const id = String(input.id ?? "").trim();
    if (!id) throw new TypeError(`${type} feature requires a stable id.`);
    const source = definitionSource(input, spec.defaults ?? {});
    const definition = typeof spec.normalizeDefinition === "function"
      ? spec.normalizeDefinition(source, input)
      : source;
    const bounds = calculateSemanticFeatureBounds({ ...input, definition }, geometryOptions);
    return Object.freeze({
      ...input,
      id,
      type,
      seed: String(input.seed ?? id),
      bounds,
      priority: finiteNumber(input.priority, 0),
      dependsOn: Object.freeze([...(input.dependsOn ?? [])].map(String).sort()),
      lifecycle: String(input.lifecycle ?? "registered"),
      fidelity: describeFidelity(input.fidelity ?? {}),
      definition: Object.freeze(structuredClone(definition)),
      version: Math.max(1, Math.floor(finiteNumber(input.version, 1))),
      metadata: Object.freeze({ family, ...(structuredClone(input.metadata ?? {})) })
    });
  }

  function validate(input = {}) {
    const issues = [];
    let normalized = null;
    try {
      normalized = normalize(input);
    } catch (error) {
      issues.push(String(error?.message ?? error));
    }
    if (normalized && typeof spec.validateDefinition === "function") {
      const result = normalizeValidationResult(spec.validateDefinition(normalized.definition, normalized));
      issues.push(...result.issues);
    }
    return { valid: issues.length === 0, issues, feature: normalized };
  }

  function sample(definitionInput = {}, point = {}, context = {}) {
    const feature = definitionInput?.type === type && definitionInput.definition
      ? definitionInput
      : normalize({ id: definitionInput?.id ?? `${type}-sample`, definition: definitionInput });
    if (typeof spec.sample === "function") return finiteNumber(spec.sample(feature, point, context), 0);
    const influence = sampleSemanticFeatureInfluence(feature.definition, point, geometryOptions);
    const value = typeof spec.sampleValue === "function"
      ? spec.sampleValue(feature.definition, feature, context)
      : finiteNumber(feature.definition.value ?? feature.definition.intensity ?? feature.definition.density, 1);
    return influence * finiteNumber(value, 1);
  }

  function compileContributions(featureInput = {}, context = {}) {
    const feature = featureInput?.type === type && featureInput.definition ? featureInput : normalize(featureInput);
    const cellId = String(context.cell?.id ?? context.cellId ?? "global");
    const channels = typeof spec.channels === "function"
      ? spec.channels(feature, context)
      : {
          [family]: {
            kind: `world-feature-${family}`,
            featureType: type,
            definition: feature
          }
        };
    const contribution = createFoundationContribution({
      id: `${cellId}:${feature.id}:${type}`,
      featureId: feature.id,
      cellId,
      priority: feature.priority,
      dependsOn: feature.dependsOn,
      bounds: feature.bounds,
      blendMode: spec.blendMode ?? "overlay",
      channels,
      version: feature.version,
      metadata: {
        family,
        featureType: type,
        fidelity: feature.fidelity,
        ...(typeof spec.metadata === "function" ? spec.metadata(feature, context) : structuredClone(spec.metadata ?? {}))
      }
    });
    return contribution;
  }

  const kit = {
    type,
    family,
    version,
    implemented: spec.implemented !== false,
    services: WORLD_FEATURE_KIT_METHODS,
    descriptor: Object.freeze({ type, family, version, implemented: spec.implemented !== false }),
    normalize,
    validate,
    calculateBounds,
    sample,
    compileContributions,
    describeFidelity
  };
  if (spec.compatibilityCompile !== false) kit.compile = compileContributions;
  return Object.freeze(kit);
}
