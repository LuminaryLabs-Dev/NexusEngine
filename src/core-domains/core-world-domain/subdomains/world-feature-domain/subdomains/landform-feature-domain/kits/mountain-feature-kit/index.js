import { createFoundationContribution } from "../../../../../world-foundation-domain/contracts.js";
import { createFeatureFidelityDescriptor } from "../../../../contracts.js";
import { distanceToLandformPath, landformPathBounds, normalizeLandformPath, smoothstep01 } from "../../contracts.js";

export const MOUNTAIN_FEATURE_TYPE = "mountain";
export const MOUNTAIN_FEATURE_VERSION = "0.1.0";

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function createMountainDefinition(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new TypeError("Mountain feature requires a stable id.");
  const source = input.definition ?? input;
  const path = normalizeLandformPath(source.path, source.center ?? source.position);
  const width = Math.max(1, finite(source.width ?? source.radius * 2, 1000));
  const height = Math.max(0, finite(source.height, 100));
  const sharpness = Math.max(0.25, finite(source.sharpness, 2.5));
  const definition = Object.freeze({
    path,
    width,
    height,
    sharpness,
    variation: Math.max(0, Math.min(0.45, finite(source.variation, 0))),
    materialZones: Object.freeze([...(source.materialZones ?? [])]),
    cliffThreshold: Math.max(0, finite(source.cliffThreshold, 0.72))
  });
  return Object.freeze({
    ...input,
    id,
    type: MOUNTAIN_FEATURE_TYPE,
    seed: String(input.seed ?? id),
    bounds: landformPathBounds(path, width * 0.5),
    priority: finite(input.priority, 0),
    dependsOn: Object.freeze([...(input.dependsOn ?? [])].map(String)),
    fidelity: createFeatureFidelityDescriptor(input.fidelity),
    definition
  });
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value ?? "")) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function sampleMountainElevation(definitionInput, point = {}) {
  const wrapper = definitionInput?.type === MOUNTAIN_FEATURE_TYPE && definitionInput.definition
    ? definitionInput
    : createMountainDefinition({ id: definitionInput?.id ?? "mountain-sample", definition: definitionInput });
  const definition = wrapper.definition;
  const distance = distanceToLandformPath(point, definition.path);
  const normalized = Math.max(0, Math.min(1, distance / Math.max(1, definition.width * 0.5)));
  const influence = Math.pow(1 - smoothstep01(normalized), definition.sharpness);
  const variation = definition.variation > 0
    ? 1 - definition.variation * 0.5 + Math.sin((finite(point.x) + finite(point.z)) * 0.0017 + hashText(wrapper.seed) * 1e-5) * definition.variation * 0.5
    : 1;
  return definition.height * influence * variation;
}

export function createMountainFeatureKit(config = {}) {
  return Object.freeze({
    type: MOUNTAIN_FEATURE_TYPE,
    version: MOUNTAIN_FEATURE_VERSION,
    implemented: true,
    services: Object.freeze(["normalize", "compile", "sample", "fidelity"]),
    descriptor: Object.freeze({ type: MOUNTAIN_FEATURE_TYPE, version: MOUNTAIN_FEATURE_VERSION, implemented: true }),
    normalize(input) {
      return createMountainDefinition({ ...config.defaults, ...input, definition: { ...(config.defaults?.definition ?? {}), ...(input.definition ?? input) } });
    },
    sample(definition, point) {
      return sampleMountainElevation(definition, point);
    },
    compile(feature, context = {}) {
      const normalized = createMountainDefinition(feature);
      const cellId = String(context.cell?.id ?? context.cellId ?? "global");
      return createFoundationContribution({
        id: `${cellId}:${normalized.id}:mountain`,
        featureId: normalized.id,
        cellId,
        priority: normalized.priority,
        dependsOn: normalized.dependsOn,
        bounds: normalized.bounds,
        blendMode: "add",
        channels: {
          elevation: {
            kind: "world-feature-field",
            featureType: MOUNTAIN_FEATURE_TYPE,
            definition: normalized
          },
          material: {
            kind: "mountain-material-zones",
            featureId: normalized.id,
            zones: normalized.definition.materialZones
          },
          collision: {
            kind: "foundation-heightfield",
            featureId: normalized.id
          }
        },
        metadata: {
          fidelity: normalized.fidelity,
          cliffThreshold: normalized.definition.cliffThreshold
        }
      });
    }
  });
}

export default createMountainFeatureKit;
