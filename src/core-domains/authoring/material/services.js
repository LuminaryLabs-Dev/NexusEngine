import { registerDocumentService, reference } from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";
export function normalizeAuthoringMaterial(c) {
  c = canonical(c);
  requireFields(
    c,
    [
      "baseColor",
      "metallic",
      "roughness",
      "emissive",
      "normalScale",
      "occlusionStrength",
      "alphaMode",
      "alphaCutoff",
      "doubleSided",
      "textures",
      "graph",
    ],
    "material",
  );
  c.baseColor = vector(c.baseColor ?? [1, 1, 1, 1], 4, "baseColor");
  c.baseColor.forEach((n) => requireNumber(n, "base color", 0, 1));
  c.emissive = vector(c.emissive ?? [0, 0, 0]);
  c.emissive.forEach((n) => requireNumber(n, "emissive", 0, 1));
  for (const [name, fallback] of Object.entries({
    metallic: 0,
    roughness: 0.5,
    normalScale: 1,
    occlusionStrength: 1,
    alphaCutoff: 0.5,
  }))
    c[name] = requireNumber(
      c[name] ?? fallback,
      name,
      0,
      name === "normalScale" ? 10 : 1,
    );
  c.alphaMode ??= "OPAQUE";
  if (!["OPAQUE", "MASK", "BLEND"].includes(c.alphaMode))
    throw error("AUTHORING_INVALID_MATERIAL", "Unknown alpha mode.");
  c.doubleSided ??= false;
  if (typeof c.doubleSided !== "boolean")
    throw error("AUTHORING_INVALID_MATERIAL", "doubleSided must be boolean.");
  c.textures ??= {};
  requireFields(
    c.textures,
    ["baseColor", "metallicRoughness", "normal", "occlusion", "emissive"],
    "texture bindings",
  );
  for (const binding of Object.values(c.textures)) {
    requireFields(
      binding,
      ["imageId", "uvSet", "wrapS", "wrapT", "magFilter", "minFilter"],
      "texture binding",
    );
    requireText(binding.imageId, "image ID");
    binding.uvSet = requireInteger(binding.uvSet ?? 0, "UV set", 0, 0);
    for (const key of ["wrapS", "wrapT"]) {
      binding[key] ??= "REPEAT";
      if (
        !["REPEAT", "CLAMP_TO_EDGE", "MIRRORED_REPEAT"].includes(binding[key])
      )
        throw error("AUTHORING_INVALID_MATERIAL", "Unknown wrapping.");
    }
    for (const key of ["magFilter", "minFilter"]) {
      binding[key] ??= "LINEAR";
      if (!["LINEAR", "NEAREST"].includes(binding[key]))
        throw error("AUTHORING_INVALID_MATERIAL", "Unsupported filter.");
    }
  }
  c.graph ??= null;
  if (c.graph !== null) c.graph = normalizeAuthoringMaterialGraph(c.graph);
  return c;
}
export function normalizeAuthoringMaterialGraph(g) {
  g = canonical(g);
  requireFields(g, ["nodes", "output"], "material graph");
  if (!Array.isArray(g.nodes) || g.nodes.length > 256)
    throw error(
      "AUTHORING_INVALID_MATERIAL_GRAPH",
      "Graph needs at most 256 nodes.",
    );
  const nodes = new Map();
  for (const node of g.nodes) {
    requireText(node.id, "node ID");
    if (nodes.has(node.id))
      throw error("AUTHORING_INVALID_MATERIAL_GRAPH", "Duplicate node.");
    nodes.set(node.id, node);
    switch (node.type) {
      case "constant":
        requireFields(node, ["id", "type", "value"], "constant");
        vector(node.value, 4);
        break;
      case "checker":
      case "noise":
        requireFields(
          node,
          ["id", "type", "scale", "seed", "a", "b"],
          "pattern",
        );
        requireNumber(node.scale, "pattern scale", 0.001, 10000);
        requireInteger(node.seed ?? 0, "seed", 0, 4294967295);
        vector(node.a, 4);
        vector(node.b, 4);
        break;
      case "multiply":
      case "mix":
        requireFields(node, ["id", "type", "a", "b", "factor"], "combine");
        requireText(node.a, "input A");
        requireText(node.b, "input B");
        if (node.type === "mix") requireNumber(node.factor, "mix factor", 0, 1);
        break;
      default:
        throw error(
          "AUTHORING_UNSUPPORTED_MATERIAL_NODE",
          `Unsupported node ${node.type}.`,
        );
    }
  }
  const active = new Set(),
    done = new Set();
  const visit = (id) => {
    if (!nodes.has(id))
      throw error("AUTHORING_INVALID_MATERIAL_GRAPH", `Missing node ${id}.`);
    if (active.has(id))
      throw error("AUTHORING_INVALID_MATERIAL_GRAPH", "Graph cycle.");
    if (done.has(id)) return;
    active.add(id);
    const n = nodes.get(id);
    if (["mix", "multiply"].includes(n.type)) {
      visit(n.a);
      visit(n.b);
    }
    active.delete(id);
    done.add(id);
  };
  visit(g.output);
  for (const id of nodes.keys()) visit(id);
  return g;
}
function noise(x, y, seed) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
export function compileAuthoringMaterialGraph(graph) {
  const g = normalizeAuthoringMaterialGraph(structuredClone(graph)),
    nodes = new Map(g.nodes.map((n) => [n.id, n]));
  return (u, v) => {
    const memo = new Map();
    const run = (id) => {
      if (memo.has(id)) return memo.get(id);
      const n = nodes.get(id);
      let value;
      if (n.type === "constant") value = n.value;
      else if (n.type === "mix" || n.type === "multiply") {
        const a = run(n.a),
          b = run(n.b);
        value = a.map((x, i) =>
          n.type === "multiply"
            ? x * b[i]
            : x * (1 - n.factor) + b[i] * n.factor,
        );
      } else {
        const x = u * n.scale,
          y = v * n.scale;
        let t;
        if (n.type === "checker")
          t = (((Math.floor(x) + Math.floor(y)) % 2) + 2) % 2;
        else {
          const ix = Math.floor(x),
            iy = Math.floor(y),
            fx = x - ix,
            fy = y - iy,
            sx = fx * fx * (3 - 2 * fx),
            sy = fy * fy * (3 - 2 * fy);
          t =
            (noise(ix, iy, n.seed ?? 0) * (1 - sx) +
              noise(ix + 1, iy, n.seed ?? 0) * sx) *
              (1 - sy) +
            (noise(ix, iy + 1, n.seed ?? 0) * (1 - sx) +
              noise(ix + 1, iy + 1, n.seed ?? 0) * sx) *
              sy;
        }
        value = n.a.map((x, i) => x * (1 - t) + n.b[i] * t);
      }
      memo.set(id, value);
      return value;
    };
    return run(g.output);
  };
}
export function evaluateAuthoringMaterialGraph(graph, u, v) {
  return compileAuthoringMaterialGraph(graph)(u, v);
}
export function installAuthoringMaterialServices(project) {
  registerDocumentService(project, {
    kind: "material",
    normalize: normalizeAuthoringMaterial,
    dependencies: (c) =>
      Object.values(c.textures).map((b) => reference(b.imageId, "image")),
    profile: "metallic-roughness-pbr-constant-checker-value-noise-mix/1",
  });
  return {
    normalize: normalizeAuthoringMaterial,
    normalizeGraph: normalizeAuthoringMaterialGraph,
    compileGraph: compileAuthoringMaterialGraph,
    evaluateGraph: evaluateAuthoringMaterialGraph,
  };
}
