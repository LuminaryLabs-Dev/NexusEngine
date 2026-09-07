import { registerDocumentService } from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  vector,
} from "../contracts/value.js";
export function normalizeAuthoringBrush(c) {
  c = canonical(c);
  requireFields(
    c,
    ["radius", "strength", "spacing", "falloff", "symmetry", "samples"],
    "brush",
  );
  c.radius = requireNumber(c.radius ?? 1, "radius", 1e-6, 1e9);
  c.strength = requireNumber(c.strength ?? 1, "strength", -10, 10);
  c.spacing = requireNumber(c.spacing ?? 0.2, "spacing", 0.001, 1);
  c.falloff ??= "smooth";
  if (!["constant", "linear", "smooth"].includes(c.falloff))
    throw error("AUTHORING_INVALID_BRUSH", "Unknown falloff.");
  c.symmetry ??= [];
  if (
    !Array.isArray(c.symmetry) ||
    new Set(c.symmetry).size !== c.symmetry.length ||
    c.symmetry.some((a) => ![0, 1, 2].includes(a))
  )
    throw error(
      "AUTHORING_INVALID_BRUSH",
      "Symmetry axes must be distinct 0, 1 or 2.",
    );
  if (!Array.isArray(c.samples))
    throw error("AUTHORING_INVALID_BRUSH", "Samples required.");
  requireInteger(c.samples.length, "sample count", 1, 10000);
  c.samples = c.samples.map((s) => {
    requireFields(s, ["position", "pressure"], "sample");
    return {
      position: vector(s.position),
      pressure: requireNumber(s.pressure ?? 1, "pressure", 0, 1),
    };
  });
  return c;
}
export function sampleAuthoringStroke(input) {
  const c = normalizeAuthoringBrush(structuredClone(input)),
    out = [];
  const step = c.radius * c.spacing;
  let last = c.samples[0];
  out.push(last);
  let residual = 0;
  for (const target of c.samples.slice(1)) {
    let start = last;
    const d = target.position.map((n, i) => n - start.position[i]),
      length = Math.hypot(...d);
    let distance = step - residual;
    while (distance <= length + 1e-12) {
      const t = Math.min(1, distance / length);
      out.push({
        position: start.position.map((n, i) => n + d[i] * t),
        pressure: start.pressure + (target.pressure - start.pressure) * t,
      });
      if (out.length > 100000)
        throw error(
          "AUTHORING_STROKE_BUDGET",
          "Resampled stroke exceeds 100000 samples.",
        );
      distance += step;
    }
    residual = (residual + length) % step;
    last = target;
  }
  return out.flatMap((s) => {
    let copies = [s];
    for (const axis of c.symmetry)
      copies = [
        ...copies,
        ...copies
          .filter((v) => Math.abs(v.position[axis]) > 1e-12)
          .map((v) => ({
            ...v,
            position: v.position.map((n, i) => (i === axis ? -n : n)),
          })),
      ];
    return copies;
  });
}
export function brushInfluence(c, s, p, mask = 0) {
  const d = Math.hypot(...p.map((n, i) => n - s.position[i])) / c.radius;
  if (d >= 1) return 0;
  const x = 1 - d,
    f =
      c.falloff === "constant"
        ? 1
        : c.falloff === "linear"
          ? x
          : x * x * (3 - 2 * x);
  return c.strength * s.pressure * f * (1 - Math.max(0, Math.min(1, mask)));
}
export function installAuthoringBrushServices(project) {
  registerDocumentService(project, {
    kind: "brush",
    normalize: normalizeAuthoringBrush,
    profile: "distance-resampled-pressure-symmetry/1",
  });
  return {
    normalize: normalizeAuthoringBrush,
    sample: sampleAuthoringStroke,
    influence: brushInfluence,
  };
}
