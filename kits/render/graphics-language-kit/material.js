import { createMaterialDescriptor } from 'nexusengine/domains/material';
import { normalizeResource, record } from './contracts.js';

const linear = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
function color(value) {
  if (value == null) return [1, 1, 1];
  if (Array.isArray(value) && value.length === 3) return value;
  if (typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)) value = Number.parseInt(value.slice(1), 16);
  if (Number.isInteger(value) && value >= 0 && value <= 0xffffff) {
    return [16, 8, 0].map(shift => linear((value >> shift & 255) / 255));
  }
  throw TypeError('Material color requires linear RGB or an sRGB #rrggbb/0xrrggbb value');
}

// The Material domain remains the semantic owner. This adapter only translates a
// portable appearance into the explicitly supported execution subset.
export function materialResource(descriptor, options = {}) {
  record(options, ['alphaMode', 'alphaCutoff', 'shading', 'textureIds'], 'material translation');
  if (!descriptor || typeof descriptor !== 'object') throw TypeError('Material descriptor required');
  for (const field of ['shader', 'shaderId', 'program', 'vertexShader', 'fragmentShader']) {
    if (descriptor[field] != null) throw Error('Renderer-specific shaders require a compatible provider or an explicitly selected replacement material');
  }
  const m = createMaterialDescriptor(descriptor);
  const shading = options.shading ?? { standard: 'pbr', basic: 'unlit', unlit: 'unlit', toon: 'toon', reference: 'reference' }[m.kind];
  if (!shading) throw Error(`Unsupported Material kind: ${m.kind}`);
  if (m.clearcoat || m.clearcoatRoughness || m.transmission || m.ior != null || m.thickness != null || m.reflectionId ||
      m.environmentIntensity !== 1 || !m.depthTest || m.premultipliedAlpha || !['none', 'normal'].includes(m.blendMode)) {
    throw Error('Material requests features outside the shared rendering baseline');
  }
  if (m.uv.set !== 0 || m.uv.scale.some(v => v !== 1) || m.uv.offset.some(v => v !== 0) || m.uv.rotation !== 0 ||
      m.uv.wrapU !== 'repeat' || m.uv.wrapV !== 'repeat' || m.normalScale[0] !== m.normalScale[1]) {
    throw Error('Unsupported material UV or normal-scale configuration');
  }
  const data = { shading, tint: color(m.color), roughness: m.roughness ?? 0.5, metallic: m.metalness ?? 0,
    opacity: m.opacity, alphaMode: options.alphaMode ?? (m.transparent ? 'blend' : 'opaque'), normalStrength: m.normalScale[0] };
  if (options.alphaCutoff !== undefined) data.alphaCutoff = options.alphaCutoff;
  for (const [slot, ref] of Object.entries(m.textures)) {
    if (!ref) continue;
    if (!['baseColor', 'normal'].includes(slot) || ref.uvSet !== 0 || ref.channel !== 'rgba' || Object.keys(ref.sampler).length ||
        (slot === 'baseColor' ? ![null, 'srgb'].includes(ref.colorSpace) : ![null, 'linear'].includes(ref.colorSpace))) {
      throw Error(`Unsupported texture binding: ${slot}`);
    }
    data[slot === 'baseColor' ? 'colorTexture' : 'normalTexture'] = options.textureIds?.[ref.assetId] ?? ref.assetId;
  }
  return normalizeResource({ id: m.id, kind: 'material', data });
}
