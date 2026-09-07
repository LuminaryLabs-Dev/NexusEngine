const text = { type: "string", minLength: 1 },
  number = { type: "number" },
  revision = {
    type: "integer",
    minimum: 0,
    description:
      "Current target revision; 0 only for a document created earlier in this same transaction.",
  };
const tuple = (n) => ({
    type: "array",
    minItems: n,
    maxItems: n,
    items: number,
  }),
  ids = { type: "array", uniqueItems: true, items: text },
  object = { type: "object" };
const requiredByOperation = {
  "mesh.create": ["id", "mesh"],
  "mesh.cube": ["id"],
  "mesh.primitive": ["id", "parameters"],
  "mesh.replace": ["id", "expectedRevision", "mesh"],
  "mesh.transform": ["id", "expectedRevision"],
  "mesh.topology": ["id", "expectedRevision", "parameters"],
  "mesh.attribute": ["id", "expectedRevision", "attribute"],
  "editing.select": ["id", "meshId", "mode", "ids"],
  "editing.object-select": ["id", "assemblyId", "ids"],
  "editing.modify": ["id", "expectedRevision", "action"],
  "workspace.open": ["id", "expectedRevision", "documentId"],
  "workspace.close": ["id", "expectedRevision", "documentId"],
  "curve.point": ["id", "expectedRevision", "point"],
  "curve.sweep": ["id", "outputId"],
  "sculpt.stroke": ["id", "expectedRevision", "parameters"],
  "uv.project": ["id", "expectedRevision"],
  "uv.unwrap": ["id", "expectedRevision"],
  "uv.pack": ["id", "expectedRevision"],
  "uv.transform": ["id", "expectedRevision"],
  "uv.seams": ["id", "expectedRevision", "edges"],
  "paint.fill": ["id", "expectedRevision", "layerId", "color"],
  "paint.stroke": ["id", "expectedRevision", "parameters"],
  "paint.bake": ["id", "expectedRevision", "materialId", "layerId"],
  "paint.bake-normal": ["id", "expectedRevision", "materialId", "layerId"],
  "paint.vertex-color": ["id", "expectedRevision", "values"],
  "rig.bone": ["id", "expectedRevision", "bone"],
  "rig.remove-bone": ["id", "expectedRevision", "boneId"],
  "skin.bind": ["id", "meshId", "rigId"],
  "skin.weights": ["id", "expectedRevision", "values"],
  "skin.paint": ["id", "expectedRevision", "boneId", "stroke"],
  "skin.smooth": ["id", "expectedRevision"],
  "skin.mirror": ["id", "expectedRevision", "parameters"],
  "skin.lock": ["id", "expectedRevision", "boneIds"],
  "animation.shape": ["id", "meshId", "keys"],
  "animation.key": ["id", "expectedRevision", "clipId", "trackId"],
  "animation.retarget": ["id", "outputId", "targetRigId", "mapping"],
  "animation.bake-constraints": ["id", "expectedRevision", "clipId"],
  "animation.bake-morph": ["id", "expectedRevision", "clipId"],
  "assembly.node": ["id", "expectedRevision", "node"],
  "assembly.duplicate": ["id", "expectedRevision", "nodeId", "newId"],
  "assembly.remove-node": ["id", "expectedRevision", "nodeId"],
  "assembly.scatter": ["id", "expectedRevision", "parameters"],
  "domain-composition.node": ["id", "expectedRevision", "node"],
  "domain-composition.remove-node": ["id", "expectedRevision", "nodeId"],
  "modifier.entry": ["id", "expectedRevision", "entry"],
  "modifier.reorder": ["id", "expectedRevision", "order"],
  "modifier.remove": ["id", "expectedRevision", "entryId"],
  "modifier.apply": ["id", "expectedRevision", "meshRevision"],
};
const numericFields = new Set(["size", "strength", "sampleRate", "removeTime"]),
  vectorFields = {
    translation: 3,
    rotation: 4,
    scale: 3,
    pivot: 3,
    color: 4,
    coordinateFrame: 16,
  },
  arrayFields = new Set(["ids", "edges", "boneIds", "order", "keys"]);
const nested = {
  "mesh.primitive": {
    type: "object",
    required: ["type"],
    additionalProperties: false,
    properties: {
      type: {
        enum: [
          "box",
          "plane",
          "grid",
          "circle",
          "disc",
          "cylinder",
          "cone",
          "sphere",
          "torus",
        ],
      },
      size: { ...number, minimum: 1e-6, maximum: 1e9, default: 2 },
      radius: { ...number, minimum: 1e-6, maximum: 1e9, default: 1 },
      minorRadius: { ...number, minimum: 1e-6, default: 0.35 },
      height: { ...number, minimum: 1e-6, maximum: 1e9, default: 2 },
      segments: { type: "integer", minimum: 3, maximum: 512, default: 32 },
      rings: { type: "integer", minimum: 3, maximum: 512, default: 16 },
      widthSegments: { type: "integer", minimum: 1, maximum: 512, default: 1 },
      depthSegments: { type: "integer", minimum: 1, maximum: 512, default: 1 },
      topRadius: { ...number, minimum: 0, maximum: 1e9 },
    },
  },
  "mesh.topology": {
    type: "object",
    required: ["operation"],
    properties: {
      operation: {
        enum: [
          "delete",
          "extract",
          "duplicate",
          "split",
          "triangulate",
          "weld",
          "fill",
          "extrude",
          "inset",
          "subdivide-edge",
          "bridge",
          "knife",
          "dissolve",
          "loop-cut",
          "bevel",
        ],
      },
      faces: ids,
      edges: ids,
      vertices: ids,
      offset: tuple(3),
      factor: {
        ...number,
        exclusiveMinimum: 0,
        exclusiveMaximum: 1,
        default: 0.8,
      },
      segments: { type: "integer", minimum: 2, maximum: 64 },
      pairs: { type: "array", items: { type: "array", items: text } },
      boundary: ids,
      prefix: text,
      tolerance: { ...number, minimum: 0, default: 1e-6 },
      width: { ...number, minimum: 1e-6, default: 0.1 },
    },
    description:
      "Operation-specific manifold, attribute, convexity and segment limits are enforced by preview before commit.",
  },
  "assembly.scatter": {
    type: "object",
    required: ["surfaceNodeId", "prototypeNodeId", "count", "prefix"],
    additionalProperties: false,
    properties: {
      surfaceNodeId: text,
      prototypeNodeId: text,
      count: { type: "integer", minimum: 1, maximum: 10000 },
      seed: { type: "integer", minimum: 0, maximum: 4294967295, default: 0 },
      prefix: text,
      minDistance: { ...number, minimum: 0, default: 0 },
      normalYMin: { ...number, minimum: -1, maximum: 1, default: -1 },
      offset: { ...number, default: 0 },
      scaleRange: tuple(2),
      densityAttribute: text,
      spacingGroup: text,
    },
  },
  "skin.smooth": {
    type: "object",
    additionalProperties: false,
    properties: {
      vertices: ids,
      iterations: { type: "integer", minimum: 1, maximum: 32, default: 1 },
      factor: { ...number, minimum: 0, maximum: 1, default: 0.5 },
    },
  },
  "skin.mirror": {
    type: "object",
    required: ["boneMap"],
    additionalProperties: false,
    properties: {
      axis: { enum: [0, 1, 2], default: 0 },
      direction: { enum: [-1, 1], default: 1 },
      tolerance: { ...number, minimum: 1e-9, maximum: 1, default: 1e-5 },
      boneMap: { type: "object", additionalProperties: text },
    },
  },
};
export function authoringToolInputSchema(id, fields) {
  const required = (
      id.endsWith(".set")
        ? ["id", "content"]
        : id.endsWith(".delete")
          ? ["id", "expectedRevision"]
          : (requiredByOperation[id] ?? ["id"])
    ).filter((field) => fields.includes(field)),
    properties = Object.fromEntries(
      fields.map((field) => [
        field,
        field === "expectedRevision" || field === "meshRevision"
          ? revision
          : vectorFields[field]
            ? tuple(vectorFields[field])
            : arrayFields.has(field)
              ? field === "keys"
                ? { type: "array", items: object }
                : ids
              : numericFields.has(field)
                ? number
                : field === "proportionalRadius"
                  ? { ...number, minimum: 0 }
                  : field === "parameters"
                    ? (nested[id] ?? {
                        ...object,
                        description: `Parameters for ${id}; call preview to validate its documented profile.`,
                      })
                    : [
                          "content",
                          "mesh",
                          "attribute",
                          "selection",
                          "point",
                          "bone",
                          "node",
                          "entry",
                          "key",
                          "mapping",
                          "values",
                          "stroke",
                          "reference",
                        ].includes(field)
                      ? object
                      : text,
      ]),
    );
  if (properties.mode)
    properties.mode = { enum: ["object", "vertex", "edge", "face"] };
  if (properties.action)
    properties.action = {
      enum: [
        "add",
        "remove",
        "toggle",
        "expand",
        "contract",
        "connected",
        "loop",
        "ring",
      ],
    };
  return { type: "object", additionalProperties: false, required, properties };
}
export function authoringToolOwnership(id) {
  const domain = id.split(".")[0];
  if (id === "curve.sweep")
    return { reads: ["curve"], writes: ["mesh"], atomic: true };
  if (id === "animation.shape")
    return { reads: ["mesh"], writes: ["shape"], atomic: true };
  if (id === "paint.vertex-color")
    return { reads: ["mesh"], writes: ["mesh"], atomic: true };
  if (["mesh", "uv", "sculpt"].includes(domain))
    return { reads: ["mesh"], writes: ["mesh"], atomic: true };
  if (domain === "modifier" && id.endsWith(".apply"))
    return {
      reads: ["modifier", "mesh"],
      writes: ["modifier", "mesh"],
      atomic: true,
    };
  if (domain === "editing")
    return {
      reads: ["mesh", "assembly", "selection", "object-selection"],
      writes:
        id === "editing.object-select" ? ["object-selection"] : ["selection"],
      atomic: true,
    };
  return {
    reads: {
      skin: ["skin", "mesh", "rig"],
      animation: ["animation", "rig", "shape"],
      paint: ["image", "material"],
      assembly: [
        "assembly",
        "mesh",
        "material",
        "rig",
        "skin",
        "shape",
        "animation",
      ],
    }[domain] ?? [domain],
    writes: [domain === "paint" ? "image" : domain],
    atomic: true,
  };
}
