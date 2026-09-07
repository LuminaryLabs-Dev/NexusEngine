import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
  hash,
} from "../contracts/value.js";
export const IMAGE_TILE_SIZE = 64;
export const srgbToLinear = (x) =>
  x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
export const linearToSrgb = (x) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
export function normalizeAuthoringImage(c) {
  c = canonical(c);
  requireFields(c, ["width", "height", "colorSpace", "layers"], "image");
  requireInteger(c.width, "width", 1, 4096);
  requireInteger(c.height, "height", 1, 4096);
  if (!["srgb", "linear"].includes(c.colorSpace))
    throw error(
      "AUTHORING_INVALID_IMAGE",
      "Color space must be srgb or linear.",
    );
  if (!Array.isArray(c.layers) || !c.layers.length || c.layers.length > 16)
    throw error("AUTHORING_INVALID_IMAGE", "Image needs 1–16 layers.");
  const ids = new Set();
  for (const layer of c.layers) {
    requireFields(
      layer,
      ["id", "opacity", "blend", "color", "tiles"],
      "image layer",
    );
    requireText(layer.id, "layer ID");
    if (ids.has(layer.id))
      throw error("AUTHORING_INVALID_IMAGE", "Duplicate layer.");
    ids.add(layer.id);
    requireNumber(layer.opacity, "opacity", 0, 1);
    if (!["normal", "multiply", "add"].includes(layer.blend))
      throw error("AUTHORING_INVALID_IMAGE", "Unsupported blend.");
    vector(layer.color, 4).forEach((n) => requireNumber(n, "color", 0, 1));
    if (
      !layer.tiles ||
      typeof layer.tiles !== "object" ||
      Array.isArray(layer.tiles)
    )
      throw error("AUTHORING_INVALID_IMAGE", "Tiles must be a map.");
    for (const [key, data] of Object.entries(layer.tiles)) {
      if (!/^(0|[1-9][0-9]*):(0|[1-9][0-9]*)$/.test(key))
        throw error("AUTHORING_INVALID_IMAGE", "Invalid tile key.");
      const [x, y] = key.split(":").map(Number);
      if (
        x * 64 >= c.width ||
        y * 64 >= c.height ||
        typeof data !== "string" ||
        data.length !== 64 * 64 * 8 ||
        !/^[0-9a-f]+$/.test(data)
      )
        throw error("AUTHORING_INVALID_IMAGE", "Malformed RGBA8 tile.");
    }
  }
  return c;
}
export function imageLayerPixel(layer, x, y) {
  const data = layer.tiles[`${Math.floor(x / 64)}:${Math.floor(y / 64)}`];
  if (!data) return layer.color;
  const i = ((y % 64) * 64 + (x % 64)) * 8;
  return [0, 2, 4, 6].map(
    (n) => parseInt(data.slice(i + n, i + n + 2), 16) / 255,
  );
}
export function imagePixel(image, x, y) {
  x = Math.max(0, Math.min(image.width - 1, Math.floor(x)));
  y = Math.max(0, Math.min(image.height - 1, Math.floor(y)));
  let out = [0, 0, 0, 0];
  for (const layer of image.layers) {
    const p = imageLayerPixel(layer, x, y),
      src = p
        .slice(0, 3)
        .map((n) => (image.colorSpace === "srgb" ? srgbToLinear(n) : n)),
      a = p[3] * layer.opacity,
      alpha = a + out[3] * (1 - a);
    const blended = src.map((n, i) =>
      layer.blend === "multiply"
        ? n * out[i]
        : layer.blend === "add"
          ? Math.min(1, n + out[i])
          : n,
    );
    out = [
      ...src.map((n, i) =>
        alpha > 0
          ? ((1 - out[3]) * n * a +
              out[3] * ((1 - a) * out[i] + a * blended[i])) /
            alpha
          : 0,
      ),
      alpha,
    ];
  }
  return [
    ...out
      .slice(0, 3)
      .map((n) => (image.colorSpace === "srgb" ? linearToSrgb(n) : n)),
    out[3],
  ];
}
export function editImagePixels(input, layerId, edit) {
  const image = normalizeAuthoringImage(structuredClone(input)),
    layer = image.layers.find((l) => l.id === layerId);
  if (!layer) throw error("AUTHORING_ELEMENT_MISSING", "Image layer missing.");
  const dirty = new Map(),
    toByte = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  const tile = (x, y) => {
    const key = `${Math.floor(x / 64)}:${Math.floor(y / 64)}`;
    if (!dirty.has(key)) {
      const data = layer.tiles[key],
        bytes = new Uint8Array(64 * 64 * 4);
      if (data)
        for (let i = 0; i < bytes.length; i++)
          bytes[i] = parseInt(data.slice(i * 2, i * 2 + 2), 16);
      else
        for (let i = 0; i < bytes.length; i++)
          bytes[i] = toByte(layer.color[i % 4]);
      dirty.set(key, bytes);
    }
    return dirty.get(key);
  };
  const get = (x, y) => {
    const key = `${Math.floor(x / 64)}:${Math.floor(y / 64)}`,
      bytes = dirty.get(key);
    return bytes
      ? Array.from(
          bytes.slice(
            ((y % 64) * 64 + (x % 64)) * 4,
            ((y % 64) * 64 + (x % 64)) * 4 + 4,
          ),
          (n) => n / 255,
        )
      : imageLayerPixel(layer, x, y);
  };
  edit({
    get,
    set(x, y, p) {
      if (
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        x < 0 ||
        y < 0 ||
        x >= image.width ||
        y >= image.height
      )
        throw error("AUTHORING_INVALID_IMAGE", "Pixel out of bounds.");
      const bytes = tile(x, y),
        offset = ((y % 64) * 64 + (x % 64)) * 4;
      vector(p, 4).forEach((n, i) => (bytes[offset + i] = toByte(n)));
    },
  });
  for (const [key, bytes] of dirty)
    layer.tiles[key] = Array.from(bytes, (n) =>
      n.toString(16).padStart(2, "0"),
    ).join("");
  return {
    image,
    dirtyTiles: [...dirty.keys()].sort(),
    chunks: [...dirty.keys()].map((key) => ({
      key,
      hash: hash(layer.tiles[key]),
    })),
  };
}
export function evaluateAuthoringImage(input) {
  const image = normalizeAuthoringImage(structuredClone(input)),
    base = { ...image, layers: image.layers.map((l) => ({ ...l, tiles: {} })) },
    background = imagePixel(base, 0, 0).map((n) =>
      Math.round(Math.max(0, Math.min(1, n)) * 255),
    ),
    keys = new Set(image.layers.flatMap((l) => Object.keys(l.tiles))),
    tiles = Object.create(null);
  for (const key of keys) {
    const [tx, ty] = key.split(":").map(Number),
      bytes = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        const px = tx * 64 + x,
          py = ty * 64 + y,
          p =
            px < image.width && py < image.height
              ? imagePixel(image, px, py).map((n) =>
                  Math.round(Math.max(0, Math.min(1, n)) * 255),
                )
              : background;
        bytes.set(p, (y * 64 + x) * 4);
      }
    tiles[key] = Array.from(bytes, (n) => n.toString(16).padStart(2, "0")).join(
      "",
    );
  }
  return {
    format: "rgba8",
    width: image.width,
    height: image.height,
    colorSpace: image.colorSpace,
    tileSize: 64,
    background,
    tiles,
  };
}
