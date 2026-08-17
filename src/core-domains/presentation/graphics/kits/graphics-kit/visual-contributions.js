const BACKEND_KEYS = new Set([
  'webgpu', 'wgsl', 'gpudevice', 'gpuadapter', 'gpubuffer', 'gputexture',
  'bindgroup', 'bindgrouplayout', 'shader', 'shadermodule', 'pipeline',
  'commandencoder', 'renderpassencoder', 'computepassencoder'
]);

function assertId(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} must be a non-empty string.`);
  return value.trim();
}

function clonePortable(value, path = 'value') {
  if (value == null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must contain only finite numbers.`);
    return value;
  }
  if (Array.isArray(value)) return value.map((entry, index) => clonePortable(entry, `${path}[${index}]`));
  if (typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError(`${path} must contain only portable plain-object data.`);
  }
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (BACKEND_KEYS.has(key.toLowerCase())) throw new TypeError(`${path}.${key} leaks backend execution state into a portable VisualContribution.`);
    if (entry === undefined || typeof entry === 'function' || typeof entry === 'symbol' || typeof entry === 'bigint') {
      throw new TypeError(`${path}.${key} is not portable descriptor data.`);
    }
    out[key] = clonePortable(entry, `${path}.${key}`);
  }
  return out;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) deepFreeze(entry);
  return Object.freeze(value);
}

export function defineVisualContribution(input = {}) {
  const semanticId = assertId(input.semanticId, 'semanticId');
  const sourceDomain = assertId(input.sourceDomain ?? 'n:presentation:graphics', 'sourceDomain');
  const contribution = {
    semanticId,
    sourceDomain,
    bounds: clonePortable(input.bounds ?? null, 'bounds'),
    geometry: clonePortable(input.geometry ?? null, 'geometry'),
    material: clonePortable(input.material ?? null, 'material'),
    transforms: clonePortable(input.transforms ?? null, 'transforms'),
    generation: clonePortable(input.generation ?? null, 'generation'),
    lodPolicy: clonePortable(input.lodPolicy ?? null, 'lodPolicy'),
    visibilityPolicy: clonePortable(input.visibilityPolicy ?? null, 'visibilityPolicy'),
    resourceRequirements: clonePortable(input.resourceRequirements ?? [], 'resourceRequirements'),
    metadata: clonePortable(input.metadata ?? {}, 'metadata')
  };
  return deepFreeze(contribution);
}

export function validateVisualContribution(value) {
  defineVisualContribution(value);
  return true;
}

export function composeVisualContributions(...sources) {
  const contributions = sources.flat(Infinity).filter((entry) => entry != null).map(defineVisualContribution);
  const seen = new Set();
  for (const contribution of contributions) {
    if (seen.has(contribution.semanticId)) throw new Error(`Duplicate VisualContribution semanticId: ${contribution.semanticId}`);
    seen.add(contribution.semanticId);
  }
  return Object.freeze(contributions.sort((a, b) => a.semanticId.localeCompare(b.semanticId)));
}
