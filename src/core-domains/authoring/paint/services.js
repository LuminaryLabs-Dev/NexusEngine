import { compileAuthoringMaterialGraph } from "../material/services.js";
import {
  registerDocumentService,
  typedDocument,
} from "../contracts/services.js";
import {
  authoringError as error,
  requireFields,
  requireNumber,
  vector,
} from "../contracts/value.js";
import {
  normalizeAuthoringImage,
  imagePixel,
  editImagePixels,
  srgbToLinear,
  linearToSrgb,
} from "./image.js";
export function paintAuthoringImage(input, brush, args) {
  requireFields(
    args,
    ["layerId", "stroke", "color", "cloneOffset"],
    "image stroke",
  );
  const c = brush.normalize(structuredClone(args.stroke)),
    samples = brush.sample(c),
    color = vector(args.color ?? [1, 1, 1, 1], 4);
  color.forEach((n) => requireNumber(n, "paint color", 0, 1));
  const offset =
    args.cloneOffset === undefined ? null : vector(args.cloneOffset, 2);
  return editImagePixels(input, args.layerId, ({ get, set }) => {
    for (const s of samples) {
      const minX = Math.max(0, Math.floor(s.position[0] - c.radius)),
        maxX = Math.min(input.width - 1, Math.ceil(s.position[0] + c.radius)),
        minY = Math.max(0, Math.floor(s.position[1] - c.radius)),
        maxY = Math.min(input.height - 1, Math.ceil(s.position[1] + c.radius));
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const amount = Math.max(
            0,
            Math.min(1, brush.influence(c, s, [x + 0.5, y + 0.5, 0])),
          );
          if (!amount) continue;
          const old = get(x, y),
            src = offset
              ? imagePixel(input, x + offset[0], y + offset[1])
              : color,
            a = src[3] * amount,
            alpha = a + old[3] * (1 - a),
            toLinear = (n) =>
              input.colorSpace === "srgb" ? srgbToLinear(n) : n,
            fromLinear = (n) =>
              input.colorSpace === "srgb" ? linearToSrgb(n) : n;
          set(x, y, [
            ...old
              .slice(0, 3)
              .map((n, i) =>
                fromLinear(
                  alpha
                    ? (toLinear(src[i]) * a + toLinear(n) * old[3] * (1 - a)) /
                        alpha
                    : 0,
                ),
              ),
            alpha,
          ]);
        }
    }
  });
}
export function bakeAuthoringImage(
  image,
  material,
  layerId,
  { maxPixels = 1048576 } = {},
) {
  if (!Number.isSafeInteger(maxPixels) || maxPixels < 1 || maxPixels > 16777216)
    throw error(
      "AUTHORING_BAKE_BUDGET",
      "Bake budget must be between 1 and 16M pixels.",
    );
  if (image.width * image.height > maxPixels)
    throw error(
      "AUTHORING_BAKE_BUDGET",
      "Procedural image exceeds this evaluation pixel budget.",
    );
  if (!material.graph)
    throw error(
      "AUTHORING_MATERIAL_GRAPH_MISSING",
      "Material has no procedural graph.",
    );
  const sample = compileAuthoringMaterialGraph(material.graph);
  return editImagePixels(image, layerId, ({ set }) => {
    for (let y = 0; y < image.height; y++)
      for (let x = 0; x < image.width; x++) {
        const p = sample((x + 0.5) / image.width, (y + 0.5) / image.height);
        set(x, y, [
          ...p
            .slice(0, 3)
            .map((n) => (image.colorSpace === "srgb" ? linearToSrgb(n) : n)),
          p[3],
        ]);
      }
  });
}
export function bakeAuthoringNormalImage(
  image,
  material,
  layerId,
  { strength = 0.01 } = {},
) {
  requireNumber(strength, "normal height strength", 0, 10);
  if (image.colorSpace !== "linear")
    throw error(
      "AUTHORING_NORMAL_COLORSPACE",
      "Normal data must use linear color space.",
    );
  if (image.width * image.height > 1048576)
    throw error(
      "AUTHORING_BAKE_BUDGET",
      "Normal bake supports at most 1M pixels.",
    );
  if (!material.graph)
    throw error(
      "AUTHORING_MATERIAL_GRAPH_MISSING",
      "Height bake needs a procedural graph.",
    );
  const sample = compileAuthoringMaterialGraph(material.graph),
    du = 1 / image.width,
    dv = 1 / image.height;
  return editImagePixels(image, layerId, ({ set }) => {
    for (let y = 0; y < image.height; y++)
      for (let x = 0; x < image.width; x++) {
        const u = (x + 0.5) * du,
          v = (y + 0.5) * dv,
          dx = (sample(u + du, v)[0] - sample(u - du, v)[0]) / (2 * du),
          dy = (sample(u, v + dv)[0] - sample(u, v - dv)[0]) / (2 * dv),
          n = [-dx * strength, -dy * strength, 1],
          length = Math.hypot(...n);
        set(x, y, [...n.map((n) => (n / length) * 0.5 + 0.5), 1]);
      }
  });
}
export function installAuthoringPaintServices(project, brush, material) {
  const register = registerDocumentService(project, {
    kind: "image",
    domain: "paint",
    normalize: normalizeAuthoringImage,
    profile: "rgba8-64px-tiles-linear-compositing/1",
  });
  register("fill", ["id", "expectedRevision", "layerId", "color"], (tx, a) => {
    const d = typedDocument(tx, a.id, "image", a.expectedRevision);
    if (!d.content.layers.some((l) => l.id === a.layerId))
      throw error("AUTHORING_ELEMENT_MISSING", "Layer missing.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          layers: d.content.layers.map((l) =>
            l.id === a.layerId ? { ...l, color: a.color, tiles: {} } : l,
          ),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("stroke", ["id", "expectedRevision", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "image", a.expectedRevision),
      result = paintAuthoringImage(d.content, brush, a.parameters);
    tx.put({ ...d, content: result.image }, a.expectedRevision);
    return { id: d.id, dirtyTiles: result.dirtyTiles, chunks: result.chunks };
  });
  register(
    "bake",
    ["id", "expectedRevision", "materialId", "layerId"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "image", a.expectedRevision),
        m = typedDocument(tx, a.materialId, "material");
      if (!m.content.graph)
        throw error(
          "AUTHORING_MATERIAL_GRAPH_MISSING",
          "Material has no procedural graph.",
        );
      if (d.content.width * d.content.height > 1048576)
        throw error(
          "AUTHORING_BAKE_BUDGET",
          "Synchronous procedural bake supports at most 1M pixels; larger jobs require a worker delivery profile.",
        );
      const sample = material.compileGraph(m.content.graph);
      const result = editImagePixels(d.content, a.layerId, ({ set }) => {
        for (let y = 0; y < d.content.height; y++)
          for (let x = 0; x < d.content.width; x++) {
            const p = sample(
              (x + 0.5) / d.content.width,
              (y + 0.5) / d.content.height,
            );
            set(x, y, [
              ...p
                .slice(0, 3)
                .map((n) =>
                  d.content.colorSpace === "srgb" ? linearToSrgb(n) : n,
                ),
              p[3],
            ]);
          }
      });
      tx.put({ ...d, content: result.image }, a.expectedRevision);
      return { id: d.id, dirtyTiles: result.dirtyTiles };
    },
  );
  register(
    "bake-normal",
    ["id", "expectedRevision", "materialId", "layerId", "strength"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "image", a.expectedRevision),
        m = typedDocument(tx, a.materialId, "material"),
        result = bakeAuthoringNormalImage(d.content, m.content, a.layerId, {
          strength: a.strength,
        });
      tx.put({ ...d, content: result.image }, a.expectedRevision);
      return { id: d.id, dirtyTiles: result.dirtyTiles };
    },
  );
  register("vertex-color", ["id", "expectedRevision", "values"], (tx, a) => {
    const d = typedDocument(tx, a.id, "mesh", a.expectedRevision);
    for (const color of Object.values(a.values))
      vector(color, 4).forEach((n) => requireNumber(n, "vertex color", 0, 1));
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          attributes: [
            ...d.content.attributes.filter((v) => v.id !== "color"),
            { id: "color", domain: "vertex", arity: 4, values: a.values },
          ],
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  return {
    bakeImage: bakeAuthoringImage,
    normalizeImage: normalizeAuthoringImage,
    pixel: imagePixel,
    paint: (image, args) => paintAuthoringImage(image, brush, args),
  };
}
