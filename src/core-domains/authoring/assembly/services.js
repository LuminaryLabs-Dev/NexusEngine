import { scatterAuthoringInstances } from "./scatter.js";
import {
  registerDocumentService,
  reference,
  typedDocument,
} from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";
import {
  normalizeTransform,
  transformMatrix,
  multiplyMatrix,
  identityMatrix,
} from "../contracts/transforms.js";
export function normalizeAuthoringAssembly(c) {
  c = canonical(c);
  requireFields(
    c,
    ["nodes", "units", "variants", "cameras", "lights"],
    "assembly",
  );
  c.units ??= { metersPerUnit: 1, upAxis: "Y", handedness: "right" };
  requireFields(c.units, ["metersPerUnit", "upAxis", "handedness"], "units");
  requireNumber(c.units.metersPerUnit, "meters per unit", 1e-6, 1e6);
  if (c.units.upAxis !== "Y" || c.units.handedness !== "right")
    throw error(
      "AUTHORING_UNSUPPORTED_COORDINATES",
      "Source profile uses Y-up right-handed coordinates.",
    );
  if (!Array.isArray(c.nodes))
    throw error("AUTHORING_INVALID_ASSEMBLY", "Nodes required.");
  requireInteger(c.nodes.length, "nodes", 0, 100000);
  const byId = new Map();
  c.nodes = c.nodes.map((n) => {
    requireFields(
      n,
      [
        "id",
        "name",
        "parent",
        "transform",
        "meshId",
        "materials",
        "rigId",
        "skinId",
        "shapeId",
        "animationIds",
        "visible",
        "export",
        "collection",
      ],
      "assembly node",
    );
    requireText(n.id, "node ID");
    requireText(n.name, "node name");
    if (byId.has(n.id))
      throw error("AUTHORING_INVALID_ASSEMBLY", "Duplicate node.");
    n.parent ??= null;
    if (n.parent !== null) requireText(n.parent, "parent");
    n.transform = normalizeTransform(n.transform);
    for (const key of ["meshId", "rigId", "skinId", "shapeId"]) {
      n[key] ??= null;
      if (n[key] !== null) requireText(n[key], key);
    }
    for (const key of ["materials", "animationIds"]) {
      n[key] ??= [];
      if (!Array.isArray(n[key]))
        throw error("AUTHORING_INVALID_ASSEMBLY", "References must be arrays.");
      n[key].forEach((id) => requireText(id, key));
    }
    for (const key of ["visible", "export"]) {
      n[key] ??= true;
      if (typeof n[key] !== "boolean")
        throw error(
          "AUTHORING_INVALID_ASSEMBLY",
          "Visibility/export flags must be boolean.",
        );
    }
    n.collection ??= "default";
    requireText(n.collection, "collection");
    byId.set(n.id, n);
    return n;
  });
  const visited = new Set(),
    active = new Set();
  const visit = (id) => {
    if (!byId.has(id))
      throw error("AUTHORING_INVALID_ASSEMBLY", "Missing parent.");
    if (active.has(id))
      throw error("AUTHORING_INVALID_ASSEMBLY", "Hierarchy cycle.");
    if (visited.has(id)) return;
    active.add(id);
    const n = byId.get(id);
    if (n.parent !== null) visit(n.parent);
    active.delete(id);
    visited.add(id);
  };
  for (const n of c.nodes) visit(n.id);
  c.variants ??= [];
  if (
    !Array.isArray(c.variants) ||
    new Set(c.variants.map((v) => v.id)).size !== c.variants.length
  )
    throw error("AUTHORING_INVALID_ASSEMBLY", "Variants must have unique IDs.");
  for (const v of c.variants) {
    requireFields(v, ["id", "visibleNodes"], "variant");
    requireText(v.id, "variant ID");
    if (
      !Array.isArray(v.visibleNodes) ||
      v.visibleNodes.some((id) => !byId.has(id))
    )
      throw error("AUTHORING_INVALID_ASSEMBLY", "Variant node missing.");
  }
  c.cameras ??= [];
  c.lights ??= [];
  for (const camera of c.cameras) {
    requireFields(camera, ["id", "nodeId", "yfov", "near", "far"], "camera");
    requireText(camera.id, "camera ID");
    if (!byId.has(camera.nodeId))
      throw error("AUTHORING_INVALID_ASSEMBLY", "Camera node missing.");
    requireNumber(camera.yfov, "vertical FOV", 0.001, Math.PI - 0.001);
    requireNumber(camera.near, "near", 1e-6, 1e9);
    requireNumber(camera.far, "far", camera.near + 1e-6, 1e12);
  }
  for (const light of c.lights) {
    requireFields(
      light,
      ["id", "nodeId", "type", "color", "intensity", "range"],
      "light",
    );
    requireText(light.id, "light ID");
    if (
      !byId.has(light.nodeId) ||
      !["directional", "point", "spot"].includes(light.type)
    )
      throw error("AUTHORING_INVALID_ASSEMBLY", "Invalid light node/type.");
    vector(light.color).forEach((n) => requireNumber(n, "light color", 0, 1));
    requireNumber(light.intensity, "intensity", 0, 1e9);
    if (light.range !== undefined)
      requireNumber(light.range, "range", 1e-6, 1e9);
  }
  return c;
}
export function assemblyReferences(c) {
  return c.nodes.flatMap((n) => [
    ...(n.meshId ? [reference(n.meshId, "mesh")] : []),
    ...n.materials.map((id) => reference(id, "material")),
    ...(n.rigId ? [reference(n.rigId, "rig")] : []),
    ...(n.skinId ? [reference(n.skinId, "skin")] : []),
    ...(n.shapeId ? [reference(n.shapeId, "shape")] : []),
    ...n.animationIds.map((id) => reference(id, "animation")),
  ]);
}
export function validateAssemblyReferences(c, get) {
  for (const n of c.nodes) {
    if (n.skinId) {
      const skin = get(n.skinId).content;
      if (skin.meshId !== n.meshId || skin.rigId !== n.rigId)
        throw error(
          "AUTHORING_INVALID_ASSEMBLY",
          "Skin assignments must match mesh and rig.",
        );
    }
    if (n.shapeId && get(n.shapeId).content.meshId !== n.meshId)
      throw error(
        "AUTHORING_INVALID_ASSEMBLY",
        "Shape belongs to another mesh.",
      );
    for (const id of n.animationIds) {
      const animation = get(id).content;
      if (animation.rigId !== n.rigId || animation.shapeId !== n.shapeId)
        throw error(
          "AUTHORING_INVALID_ASSEMBLY",
          "Animation targets differ from node assignments.",
        );
    }
    if (n.meshId) {
      const material = get(n.meshId).content.attributes.find(
        (a) => a.id === "material",
      );
      if (
        material &&
        Object.values(material.values).some((v) => v[0] >= n.materials.length)
      )
        throw error(
          "AUTHORING_MATERIAL_SLOT_MISSING",
          "Mesh material slot has no assembly assignment.",
        );
    }
  }
}
export function evaluateAuthoringAssembly(input, { variantId = null } = {}) {
  const c = normalizeAuthoringAssembly(structuredClone(input)),
    byId = new Map(c.nodes.map((n) => [n.id, n])),
    matrices = Object.create(null),
    visibility = Object.create(null),
    variant =
      variantId === null ? null : c.variants.find((v) => v.id === variantId);
  if (variantId !== null && !variant)
    throw error("AUTHORING_ELEMENT_MISSING", "Variant missing.");
  const visit = (id) => {
    if (Object.hasOwn(matrices, id)) return;
    const n = byId.get(id);
    if (n.parent !== null) visit(n.parent);
    matrices[id] = multiplyMatrix(
      n.parent === null ? identityMatrix() : matrices[n.parent],
      transformMatrix(n.transform),
    );
    visibility[id] =
      n.visible &&
      n.export &&
      (n.parent === null || visibility[n.parent]) &&
      (!variant || variant.visibleNodes.includes(id) || !n.meshId);
  };
  for (const n of c.nodes) visit(n.id);
  return {
    nodes: c.nodes.map((n) => ({
      ...n,
      worldMatrix: matrices[n.id],
      included: visibility[n.id],
    })),
    units: c.units,
    cameras: c.cameras,
    lights: c.lights,
  };
}
export function installAuthoringAssemblyServices(project) {
  const register = registerDocumentService(project, {
    kind: "assembly",
    normalize: normalizeAuthoringAssembly,
    dependencies: assemblyReferences,
    validateReferences: validateAssemblyReferences,
    profile: "right-handed-y-up-shared-asset-hierarchies/1",
  });
  register("node", ["id", "expectedRevision", "node"], (tx, a) => {
    const d = typedDocument(tx, a.id, "assembly", a.expectedRevision),
      nodes = d.content.nodes.filter((n) => n.id !== a.node.id);
    nodes.push(a.node);
    tx.put({ ...d, content: { ...d.content, nodes } }, a.expectedRevision);
    return { id: d.id, nodeId: a.node.id };
  });
  register(
    "duplicate",
    ["id", "expectedRevision", "nodeId", "newId"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "assembly", a.expectedRevision),
        node = d.content.nodes.find((n) => n.id === a.nodeId);
      if (!node || d.content.nodes.some((n) => n.id === a.newId))
        throw error(
          "AUTHORING_INVALID_ASSEMBLY",
          "Missing source or duplicate new node ID.",
        );
      tx.put(
        {
          ...d,
          content: {
            ...d.content,
            nodes: [
              ...d.content.nodes,
              { ...node, id: a.newId, name: `${node.name} copy` },
            ],
          },
        },
        a.expectedRevision,
      );
      return { id: d.id, nodeId: a.newId };
    },
  );
  register("remove-node", ["id", "expectedRevision", "nodeId"], (tx, a) => {
    const d = typedDocument(tx, a.id, "assembly", a.expectedRevision);
    if (!d.content.nodes.some((n) => n.id === a.nodeId))
      throw error("AUTHORING_ELEMENT_MISSING", "Node missing.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          nodes: d.content.nodes.filter((n) => n.id !== a.nodeId),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("scatter", ["id", "expectedRevision", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "assembly", a.expectedRevision),
      result = scatterAuthoringInstances(
        d.content,
        (id) => tx.get(id),
        a.parameters,
      );
    tx.put(
      {
        ...d,
        content: { ...d.content, nodes: [...d.content.nodes, ...result.nodes] },
      },
      a.expectedRevision,
    );
    return {
      id: d.id,
      count: result.nodes.length,
      attempts: result.attempts,
      surfaceArea: result.surfaceArea,
      algorithm: result.algorithm,
    };
  });
  return {
    normalize: normalizeAuthoringAssembly,
    evaluateContent: evaluateAuthoringAssembly,
    evaluate: (id, options) =>
      evaluateAuthoringAssembly(project.getDocument(id).content, options),
  };
}
