export const GRAPHICS_LANGUAGE_SCHEMA = "nexusengine.graphics-language/1";
export const GRAPHICS_KIT_ID = "nexus-graphics-language-kit";
export const CAPABILITIES = Object.freeze(Object.fromEntries(Object.entries({ presentation: "rgba8", backend: "nexusgl-cpu", resourceKinds: ["geometry", "material", "texture"], passKinds: ["render"], shading: ["reference", "toon", "pbr", "unlit"], alphaModes: ["opaque", "mask", "blend"], qualityModes: ["gaussian-half", "native", "guided-half"], vertexColors: false, programmableShaders: false, compute: false, xr: false, nativePlatforms: ["darwin-arm64"], maxDimension: 4096, maxPixels: 4_194_304 }).map(([k,v])=>[k,Array.isArray(v)?Object.freeze(v):v])));
export function record(input, allowed, label) {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.getPrototypeOf(input) !== Object.prototype) throw TypeError(`${label} must be a plain object`);
  for (const k of Object.keys(input)) if (!allowed.includes(k)) throw TypeError(`${label}: unsupported field ${k}`);
  return input;
}
export function finite(value, label, min = -Infinity, max = Infinity) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw TypeError(`${label} must be finite in [${min}, ${max}]`); return value;
}
export function integer(value, label, min = 0, max = Number.MAX_SAFE_INTEGER) { finite(value, label, min, max); if (!Number.isSafeInteger(value)) throw TypeError(`${label} must be an integer`); return value; }
export function text(value, label) { if (typeof value !== "string" || !value.trim()) throw TypeError(`${label} must be nonempty text`); return value; }
function array(value, label, multiple, size) {
  if (!Array.isArray(value) && (!ArrayBuffer.isView(value) || value instanceof DataView)) throw TypeError(`${label} must be numeric data`);
  const a = Array.from(value); if (a.length % multiple || (size !== undefined && a.length !== size)) throw TypeError(`${label} has invalid length`);
  a.forEach(v => finite(v, label)); return a;
}
export function normalizeResource(input) {
  if (input?.schema === 'nexusengine.render-resource/1') {
    const r = normalizeRenderResource(input);
    if (r.lifetime !== 'persistent' || r.dependencies.length || r.integrity) throw TypeError('Resolve resource lifetime, dependency and integrity requirements before submitting graphics data');
    record(r.descriptor, ['graphicsLanguage'], 'Render resource descriptor');
    input = { id:r.resourceId, kind:r.kind, revision:r.revision, data:r.descriptor.graphicsLanguage };
  }
  record(input, ["id", "kind", "data", "revision"], "resource"); const id = text(input.id, "resource.id"), kind = input.kind;
  const d = input.data; let data;
  if (kind === "geometry") {
    record(d, ["positions", "normals", "uvs", "tangents", "handedness", "indices", "color", "castsShadow", "twoSidedShadow"], "geometry");
    const positions = array(d.positions, "positions", 3); const vertices = positions.length / 3;
    const indices = d.indices === undefined ? Array.from({ length: vertices }, (_, i) => i) : array(d.indices, "indices", 3);
    if (indices.length % 3) throw TypeError("Geometry requires complete triangles");
    indices.forEach(v => integer(v, "index", 0, vertices - 1));
    data = { positions, indices, color: array(d.color ?? [255,255,255,255], "color", 4, 4), castsShadow: d.castsShadow ?? true, twoSidedShadow: d.twoSidedShadow ?? false };
    data.color.forEach(v => integer(v, "color", 0, 255));
    for (const [k, n] of [["normals",3],["uvs",2],["tangents",3],["handedness",1]]) if (d[k] !== undefined) data[k] = array(d[k], k, n, vertices * n);
    for (const k of ["castsShadow", "twoSidedShadow"]) if (typeof data[k] !== "boolean") throw TypeError(`${k} must be boolean`);
  } else if (kind === "material") {
    record(d, ["shading", "alphaMode", "tint", "roughness", "metallic", "opacity", "alphaCutoff", "normalStrength", "colorTexture", "normalTexture", "bands", "outlinePixels", "softness", "highlight", "rim", "shadowColor", "outlineColor"], "material");
    data = structuredClone(d);
    for (const [k, allowed] of [["shading", CAPABILITIES.shading],["alphaMode", CAPABILITIES.alphaModes]]) if (d[k] !== undefined && !allowed.includes(d[k])) throw TypeError(`Unsupported ${k}`);
    for (const k of ["tint", "shadowColor", "outlineColor"]) if (d[k] !== undefined) data[k] = array(d[k], k, 3, 3);
    for (const k of ["roughness", "metallic", "opacity", "alphaCutoff"]) if (d[k] !== undefined) finite(d[k], k, 0, 1);
    for (const k of ["normalStrength", "highlight", "rim"]) if (d[k] !== undefined) finite(d[k], k, 0, 1e6);
    if (d.softness !== undefined) finite(d.softness, 'softness', 0, 1);
    if (d.bands !== undefined) integer(d.bands, 'bands', 2, 16);
    if (d.outlinePixels !== undefined) integer(d.outlinePixels, 'outlinePixels', 0, 4);
    if (d.alphaMode === 'blend' && d.outlinePixels) throw TypeError('Blended surfaces do not support outlines');
    for (const k of ['tint','shadowColor','outlineColor']) if (d[k]) d[k].forEach(v=>finite(v,k,0,d.shading==='pbr'&&k==='tint'?1:1e6));
    for (const k of ["colorTexture", "normalTexture"]) if (d[k] !== undefined) text(d[k], k);
  } else if (kind === "texture") {
    record(d, ["width", "height", "rgba", "filter", "normalMap"], "texture");
    const width = integer(d.width, "texture width", 1, 4096), height = integer(d.height, "texture height", 1, 4096);
    const rgba = array(d.rgba, "rgba", 4, width * height * 4); rgba.forEach(v => integer(v, "RGBA", 0, 255));
    const filter = d.filter ?? "nearest"; if (!["nearest", "bilinear", "trilinear"].includes(filter)) throw TypeError("Unsupported texture filter");
    if (d.normalMap !== undefined && typeof d.normalMap !== "boolean") throw TypeError("normalMap must be boolean");
    data = { width, height, rgba, filter, normalMap: d.normalMap ?? false };
  } else throw TypeError(`Unsupported resource kind: ${kind}`);
  return { id, kind, data, ...(input.revision === undefined ? {} : {revision:integer(input.revision,'resource revision')}) };
}
export function normalizeResourceUpdate(input, previous) {
  const r = normalizeResource(input);
  if (!previous || previous.kind !== r.kind) throw Error(`Unknown or mismatched resource: ${r.id}`);
  const same = JSON.stringify(r.data) === JSON.stringify(previous.data);
  if (r.revision === undefined) return same ? previous : {...r,revision:(previous.revision??0)+1};
  if (r.revision < (previous.revision??0) || (!same && r.revision === (previous.revision??0))) throw Error('Resource update requires a newer revision');
  return same && r.revision === (previous.revision??0) ? previous : r;
}
export function graphicsResourceDescriptor(input) {
  const r = normalizeResource(input);
  return normalizeRenderResource({schema:'nexusengine.render-resource/1',resourceId:r.id,kind:r.kind,revision:r.revision??0,descriptor:{graphicsLanguage:r.data}});
}
export function graphicsFrameDescriptor(input, sequence = 0) {
  const f = normalizeFrame(input), {frameId,...settings} = f;
  return normalizeRenderFrame({schema:'nexusengine.render-frame/1',frameId,sequence,metadata:{graphicsLanguage:settings}});
}
export function normalizeFrame(input) {
  if (input?.schema === 'nexusengine.render-frame/1') {
    const f = normalizeRenderFrame(input);
    if (f.viewIds.length > 1) throw TypeError('The graphics baseline supports one resolved camera view');
    input = { ...f.metadata.graphicsLanguage, frameId:f.frameId };
  }
  record(input, ["frameId", "width", "height", "quality", "clear", "view", "light"], "frame");
  const width = integer(input.width, "width", 1, CAPABILITIES.maxDimension), height = integer(input.height, "height", 1, CAPABILITIES.maxDimension);
  if (width * height > CAPABILITIES.maxPixels) throw RangeError("Frame exceeds pixel budget");
  const quality = input.quality ?? "native"; if (!CAPABILITIES.qualityModes.includes(quality)) throw TypeError("Unsupported quality mode");
  const clear = array(input.clear ?? [0,0,0,255], "clear", 4, 4); clear.forEach(v => integer(v, "clear", 0, 255));
  const view = input.view ?? {}; record(view, ["projection", "camera", "shadowProjection", "lightDirection", "shadowResolution", "closedBackFaces", "exposure", "sampleScale", "shadowBias", "receiverPlaneClamp", "shadowFilterRadius"], "view");
  const light = input.light ?? {}; record(light, ["color", "intensity", "fill", "sky", "skyGradient", "specular", "specularPower"], "light");
  const v = structuredClone(view), l = structuredClone(light);
  for (const [k,n] of [["projection",16],["camera",3],["shadowProjection",16],["lightDirection",3]]) if (v[k] !== undefined) v[k] = array(v[k], k, n, n);
  if (v.shadowResolution !== undefined) integer(v.shadowResolution, 'shadowResolution', 1, 4096);
  if (v.sampleScale !== undefined) integer(v.sampleScale, 'sampleScale', 1, 2);
  if (v.shadowFilterRadius !== undefined) integer(v.shadowFilterRadius, 'shadowFilterRadius', 0, 2);
  if (v.lightDirection && Math.hypot(...v.lightDirection)<1e-12) throw TypeError('Light direction must be nonzero');
  if (v.shadowProjection && (v.shadowProjection[3]!==0||v.shadowProjection[7]!==0||v.shadowProjection[11]!==0||v.shadowProjection[15]!==1)) throw TypeError('Directional shadows require an orthographic affine projection');
  if (v.closedBackFaces !== undefined && typeof v.closedBackFaces !== "boolean") throw TypeError("closedBackFaces must be boolean");
  for (const k of ["exposure", "shadowBias", "receiverPlaneClamp"]) if (v[k] !== undefined) finite(v[k], k, 0);
  if (l.color !== undefined) l.color = array(l.color, "light color", 3, 3);
  for (const k of ["intensity", "fill", "sky", "skyGradient", "specular", "specularPower"]) if (l[k] !== undefined) finite(l[k], k, 0);
  return { frameId: text(input.frameId, "frameId"), width, height, quality, clear, view: v, light: l };
}
export function normalizeDraw(draw) {
  record(draw, ["geometryId", "materialId", "transform"], "draw");
  const transform = array(draw.transform ?? [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], "transform", 16, 16);
  if (transform[3] !== 0 || transform[7] !== 0 || transform[11] !== 0 || transform[15] !== 1) throw TypeError("Draw transform must be affine");
  const det = transform[0]*(transform[5]*transform[10]-transform[9]*transform[6])-transform[4]*(transform[1]*transform[10]-transform[9]*transform[2])+transform[8]*(transform[1]*transform[6]-transform[5]*transform[2]);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) throw TypeError("Draw transform is singular");
  return { geometryId: text(draw.geometryId, "geometryId"), materialId: draw.materialId == null ? null : text(draw.materialId, "materialId"), transform };
}
import { normalizeRenderResource } from 'nexusengine/domains/render/resource-schema';
import { normalizeRenderFrame } from 'nexusengine/domains/render/frame-schema';
